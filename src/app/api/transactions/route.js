import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDb";
import Transaction from "@/models/Transaction";
import Vault from "@/models/Vault";
import Activity from "@/models/Activity";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// POST /api/transactions — User submits a deposit or withdrawal request
export async function POST(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { vaultId, type, amount, method, note } = await req.json();

    if (!vaultId || !type || !amount) {
      return NextResponse.json({ error: "vaultId, type, and amount are required" }, { status: 400 });
    }
    if (!["deposit", "withdrawal"].includes(type)) {
      return NextResponse.json({ error: "type must be deposit or withdrawal" }, { status: 400 });
    }
    if (Number(amount) <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    // Ensure user is a member of this vault
    const vault = await Vault.findOne({ _id: vaultId, members: decoded.id });
    if (!vault) {
      return NextResponse.json({ error: "Vault not found or access denied" }, { status: 404 });
    }

    // For withdrawals, check sufficient balance
    if (type === "withdrawal" && Number(amount) > vault.balance) {
      return NextResponse.json({ error: "Insufficient vault balance" }, { status: 400 });
    }

    const tx = await Transaction.create({
      user: decoded.id,
      vault: vaultId,
      type,
      amount: Number(amount),
      method: method || "Unknown",
      note: note || "",
      status: "pending",
    });

    await Activity.create({
      user: decoded.id,
      vault: vaultId,
      action: `Submitted a ${type} request of ₦${Number(amount).toLocaleString()}`,
      type: "money",
    });

    return NextResponse.json({ success: true, transaction: tx }, { status: 201 });
  } catch (error) {
    console.error("Transaction POST error:", error);
    return NextResponse.json({ error: "Failed to submit transaction" }, { status: 500 });
  }
}

// GET /api/transactions — User fetches their own transactions
export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const transactions = await Transaction.find({ user: decoded.id })
      .populate("vault", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, transactions }, { status: 200 });
  } catch (error) {
    console.error("Transaction GET error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
