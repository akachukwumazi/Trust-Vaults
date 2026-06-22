import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDb";
import Vault from "@/models/Vault";
import Activity from "@/models/Activity";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    await connectDB();

    const { inviteCode } = await req.json();

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Get token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find vault by invite code
    const vault = await Vault.findOne({ inviteCode: inviteCode.trim().toUpperCase() });

    if (!vault) {
      return NextResponse.json(
        { error: "Invalid invite code. Vault not found." },
        { status: 404 }
      );
    }

    // Prevent joining a vault you already belong to
    const alreadyMember = vault.members.some(
      (memberId) => memberId.toString() === decoded.id
    );

    if (alreadyMember) {
      return NextResponse.json(
        { error: "You are already a member of this vault" },
        { status: 409 }
      );
    }

    // Add user to members
    vault.members.push(decoded.id);
    await vault.save();

    // Log the activity
    await Activity.create({
      user: decoded.id,
      vault: vault._id,
      action: "Joined the vault",
      type: "member",
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully joined "${vault.name}"`,
        vault: {
          id: vault._id,
          name: vault.name,
          inviteCode: vault.inviteCode,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Join Vault Error:", error);

    return NextResponse.json(
      { error: "Failed to join vault" },
      { status: 500 }
    );
  }
}
