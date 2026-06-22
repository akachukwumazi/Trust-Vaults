"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch vaults to get accurate stats
  const [vaultsCount, setVaultsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Activities
        const actRes = await fetch("/api/activity");
        if (actRes.status === 401) {
          router.push("/auth/login");
          return;
        }
        const actData = await actRes.json();
        if (!actRes.ok) throw new Error(actData.error || "Failed to load activities");
        setActivities(actData.activities || []);

        // Fetch Vaults for stats
        const vaultRes = await fetch("/api/vault");
        if (vaultRes.ok) {
          const vaultData = await vaultRes.json();
          setVaultsCount(vaultData.vaults?.length || 0);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getIcon = (type) => {
    switch (type) {
      case "money":
        return "💰";
      case "member":
        return "👥";
      case "file":
        return "📁";
      case "vault":
        return "🔐";
      default:
        return "📌";
    }
  };

  // Calculate today's events
  const todaysEvents = activities.filter((act) => {
    // Basic check for things that happened in the last 24h roughly based on our string formatting
    return act.time === "Just now" || act.time.includes("hour") || act.time.includes("min");
  }).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Activity History</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track everything happening across your vaults.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400">Total Activities</p>
          <h2 className="text-2xl font-bold text-white mt-2">
            {loading ? "..." : activities.length}
          </h2>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400">Active Vaults</p>
          <h2 className="text-2xl font-bold text-white mt-2">
            {loading ? "..." : vaultsCount}
          </h2>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400">Today&apos;s Events</p>
          <h2 className="text-2xl font-bold text-white mt-2">
            {loading ? "..." : todaysEvents}
          </h2>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Recent Activities</h2>
        </div>

        <div className="divide-y divide-gray-800">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="p-5 text-red-400 text-sm">{error}</div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No activity recorded yet.
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="p-5 hover:bg-gray-800/40 transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center text-lg shrink-0">
                    {getIcon(activity.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {activity.vault}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 whitespace-nowrap pt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}