import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDb";
import Transaction from "@/models/Transaction";
import Vault from "@/models/Vault";
import Activity from "@/models/Activity";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Helper: verify admin from token
async function verifyAdmin(cookieStore) {
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "admin") return null;
    return user;
  } catch {
    return null;
  }
}

// GET /api/admin/transactions — fetch all transactions
export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const admin = await verifyAdmin(cookieStore);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const transactions = await Transaction.find()
      .populate("user", "name email")
      .populate("vault", "name inviteCode")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, transactions }, { status: 200 });
  } catch (error) {
    console.error("Admin transactions GET error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

// PATCH /api/admin/transactions — approve or reject a transaction
export async function PATCH(req) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const admin = await verifyAdmin(cookieStore);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { transactionId, action } = await req.json(); // action: "approve" | "reject"

    if (!transactionId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "transactionId and valid action required" }, { status: 400 });
    }

    const tx = await Transaction.findById(transactionId).populate("vault");
    if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    if (tx.status !== "pending") {
      return NextResponse.json({ error: "Transaction already processed" }, { status: 400 });
    }

    if (action === "approve") {
      tx.status = "approved";
      await tx.save();

      // Update vault balance
      const vault = await Vault.findById(tx.vault._id);
      if (vault) {
        if (tx.type === "deposit") {
          vault.balance = (vault.balance || 0) + tx.amount;
        } else if (tx.type === "withdrawal") {
          vault.balance = Math.max(0, (vault.balance || 0) - tx.amount);
        }
        await vault.save();
      }

      // Log activity
      const actionMessage = tx.type === "deposit"
        ? `🏦 Your deposit of ₦${tx.amount.toLocaleString()} has been confirmed`
        : `Admin approved ${tx.type} of ₦${tx.amount.toLocaleString()}`;

      await Activity.create({
        user: tx.user,
        vault: tx.vault._id,
        action: actionMessage,
        type: "money",
      });
    } else {
      tx.status = "rejected";
      await tx.save();

      await Activity.create({
        user: tx.user,
        vault: tx.vault._id,
        action: `Admin rejected ${tx.type} of ₦${tx.amount.toLocaleString()}`,
        type: "money",
      });
    }

    return NextResponse.json({ success: true, transaction: tx }, { status: 200 });
  } catch (error) {
    console.error("Admin transactions PATCH error:", error);
    return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 });
  }
}
