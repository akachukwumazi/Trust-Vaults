"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVaults = async () => {
      try {
        const res = await fetch("/api/vault");
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load vaults");
        setVaults(data.vaults);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVaults();
  }, [router]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back 👋</h1>
        <p className="text-gray-500 text-sm mt-1">
          Here&apos;s an overview of your vaults and their current status
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Your Vaults</h2>
        {!loading && (
          <p className="text-sm text-gray-500">
            Total vaults: {vaults.length}
          </p>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse"
            >
              <div className="h-5 bg-gray-800 rounded w-3/4 mb-4" />
              <div className="h-8 bg-gray-800 rounded w-1/2 mb-3" />
              <div className="h-4 bg-gray-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && vaults.length === 0 && (
        <div className="text-center py-16 border border-gray-800 rounded-xl bg-gray-900">
          <p className="text-gray-400 text-lg mb-4">No vaults yet</p>
          <p className="text-gray-600 text-sm mb-6">
            Create or join a vault to get started
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/vault/create"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-sm font-medium"
            >
              Create Vault
            </Link>
            <Link
              href="/vault/join"
              className="px-5 py-2 rounded-lg border border-gray-700 hover:border-indigo-500 transition text-sm font-medium text-gray-300"
            >
              Join Vault
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && vaults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vaults.map((vault) => (
            <div
              key={vault._id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-indigo-500 transition"
            >
              <h3 className="text-white font-semibold text-lg">{vault.name}</h3>

              <p className="text-indigo-400 text-2xl font-bold mt-3">
                ₦ {vault.balance.toLocaleString()}
              </p>

              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-400">
                  👥 {vault.members.length} member{vault.members.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-gray-500">
                  Code: <span className="text-yellow-500 font-mono">{vault.inviteCode}</span>
                </p>
                {vault.lockUntil && (
                  <p className="text-xs text-gray-500">
                    🔒 Locked until:{" "}
                    {new Date(vault.lockUntil).toLocaleDateString()}
                  </p>
                )}
              </div>

              <Link
                href={`/dashboard/vaults/${vault._id}`}
                className="block mt-4 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-sm font-medium text-center"
              >
                Open Vault
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}