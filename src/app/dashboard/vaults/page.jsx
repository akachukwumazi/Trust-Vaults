"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VaultsPage() {
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

  const totalBalance = vaults.reduce((sum, v) => sum + (v.balance || 0), 0);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Your Vaults</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage, view, and open all your vaults in one place
        </p>
      </div>

      {/* Summary bar */}
      {!loading && !error && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <div className="text-sm text-gray-400">
            Total Vaults:{" "}
            <span className="text-white font-semibold">{vaults.length}</span>
          </div>
          <div className="text-sm text-gray-400">
            Total Balance:{" "}
            <span className="text-indigo-400 font-semibold">
              $ {totalBalance.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/vault/create"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium transition"
            >
              + Create Vault
            </Link>
            <Link
              href="/vault/join"
              className="px-4 py-1.5 border border-gray-700 hover:border-indigo-500 rounded-lg text-xs font-medium text-gray-300 transition"
            >
              Join Vault
            </Link>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse"
            >
              <div className="h-5 bg-gray-800 rounded w-3/4 mb-4" />
              <div className="h-7 bg-gray-800 rounded w-1/2 mb-3" />
              <div className="h-4 bg-gray-800 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-800 rounded w-2/5 mb-4" />
              <div className="h-9 bg-gray-800 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && vaults.length === 0 && (
        <div className="text-center py-20 border border-gray-800 rounded-xl bg-gray-900">
          <p className="text-gray-400 text-lg mb-2">No vaults yet</p>
          <p className="text-gray-600 text-sm mb-6">
            Create a vault or join one with an invite code
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

      {/* Vault Grid */}
      {!loading && !error && vaults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vaults.map((vault) => (
            <Link
              key={vault._id}
              href={`/dashboard/vaults/${vault._id}`}
              className="group bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition cursor-pointer block"
            >
              {/* Name */}
              <h2 className="text-white font-semibold text-lg group-hover:text-indigo-400 transition">
                {vault.name}
              </h2>

              {/* Balance */}
              <p className="text-indigo-400 text-xl font-bold mt-3">
                $ {(vault.balance || 0).toLocaleString()}
              </p>

              {/* Meta */}
              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-400">
                  👥 {vault.members.length} member{vault.members.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {vault.inviteCode}
                </p>
                {vault.lockUntil && (
                  <p className="text-xs text-gray-500">
                    🔒 {new Date(vault.lockUntil).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className="mt-4 w-full py-2 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 transition text-sm font-medium text-center">
                Open Vault
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}