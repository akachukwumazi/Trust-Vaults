import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDb";
import Activity from "@/models/Activity";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const requestUser = await User.findById(decoded.id);
    if (!requestUser || requestUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch ALL platform activity, most recent first
    const rawActivities = await Activity.find()
      .populate("user", "name email")
      .populate("vault", "name")
      .sort({ createdAt: -1 })
      .limit(200);

    const activities = rawActivities.map((act) => {
      const timeDiff = Date.now() - new Date(act.createdAt).getTime();
      const mins  = Math.floor(timeDiff / 60000);
      const hours = Math.floor(mins / 60);
      const days  = Math.floor(hours / 24);
      let time = "Just now";
      if (days > 0)        time = `${days}d ago`;
      else if (hours > 0)  time = `${hours}h ago`;
      else if (mins > 0)   time = `${mins}m ago`;

      return {
        id:       act._id,
        type:     act.type,
        action:   act.action,
        vault:    act.vault?.name || "Deleted Vault",
        userName: act.user?.name  || "Unknown",
        time,
      };
    });

    return NextResponse.json({ success: true, activities }, { status: 200 });
  } catch (error) {
    console.error("Admin activity GET error:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
