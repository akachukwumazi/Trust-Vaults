import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDb";
import Vault from "@/models/Vault";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find vault and populate members
    const vault = await Vault.findById(id)
      .populate("members", "name email")
      .populate("owner", "name email");

    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    // Ensure the requesting user is a member
    const isMember = vault.members.some(
      (m) => m._id.toString() === decoded.id
    );

    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true, vault }, { status: 200 });
  } catch (error) {
    console.error("Get Vault Error:", error);
    return NextResponse.json({ error: "Failed to fetch vault" }, { status: 500 });
  }
}
