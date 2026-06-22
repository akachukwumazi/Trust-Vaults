import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDb";
import Vault from "@/models/Vault";
import Activity from "@/models/Activity";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const vaults = await Vault.find({ members: decoded.id })
      .populate("members", "name email")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, vaults }, { status: 200 });
  } catch (error) {
    console.error("Get Vaults Error:", error);
    return NextResponse.json({ error: "Failed to fetch vaults" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const { name, lockUntil } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Vault name is required" },
        { status: 400 }
      );
    }

    // Get token
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Decode token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Generate invite code
    const inviteCode =
      "TV-" +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    const vault = await Vault.create({
      name,
      inviteCode,
      lockUntil,
      owner: decoded.id,
      members: [decoded.id],
    });

    // Log the activity
    await Activity.create({
      user: decoded.id,
      vault: vault._id,
      action: "Created vault",
      type: "vault",
    });

    return NextResponse.json(
      {
        success: true,
        vault,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create vault" },
      { status: 500 }
    );
  }
}