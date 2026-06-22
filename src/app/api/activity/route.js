import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDb";
import Activity from "@/models/Activity";
import Vault from "@/models/Vault";
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

    // Find all vaults the user is a member of
    const userVaults = await Vault.find({ members: decoded.id }).select("_id");
    const vaultIds = userVaults.map((v) => v._id);

    // Fetch activities for these vaults
    const activities = await Activity.find({ vault: { $in: vaultIds } })
      .populate("user", "name")
      .populate("vault", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    // Format for the frontend
    const formattedActivities = activities.map((act) => {
      const timeDiff = new Date() - new Date(act.createdAt);
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      let timeString = "Just now";
      if (days > 0) timeString = `${days} day${days > 1 ? "s" : ""} ago`;
      else if (hours > 0) timeString = `${hours} hour${hours > 1 ? "s" : ""} ago`;
      else if (timeDiff > 60000) {
        const mins = Math.floor(timeDiff / 60000);
        timeString = `${mins} min${mins > 1 ? "s" : ""} ago`;
      }

      // Format the action string correctly based on type
      let displayAction = act.action;
      if (act.type === "vault") {
        displayAction = `${act.vault?.name || "Vault"} created`;
      } else {
        const userName = act.user?.name || "Unknown User";
        displayAction = `${userName} ${act.action.toLowerCase()}`;
      }

      return {
        id: act._id,
        action: displayAction,
        vault: act.vault?.name || "Deleted Vault",
        time: timeString,
        type: act.type,
      };
    });

    return NextResponse.json(
      { success: true, activities: formattedActivities },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Activities Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
