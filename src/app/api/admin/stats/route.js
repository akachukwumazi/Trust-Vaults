import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDb";
import User from "@/models/User";
import Vault from "@/models/Vault";
import Transaction from "@/models/Transaction";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify admin role
    const requestUser = await User.findById(decoded.id);
    if (!requestUser || requestUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    const vaults = await Vault.find()
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    const totalUsers = users.length;
    const totalVaults = vaults.length;
    const totalBalance = vaults.reduce((sum, v) => sum + (v.balance || 0), 0);
    const activeLocks = vaults.filter(v => v.lockUntil && new Date(v.lockUntil) > new Date()).length;
    const pendingDeposits = await Transaction.countDocuments({ type: "deposit", status: "pending" });
    const pendingWithdrawals = await Transaction.countDocuments({ type: "withdrawal", status: "pending" });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalVaults,
        totalBalance,
        activeLocks,
        pendingDeposits,
        pendingWithdrawals,
      },
      users,
      vaults,
    }, { status: 200 });
  } catch (error) {
    console.error("Admin stats API error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
