"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";

export default function VaultPage() {
  const { vaultsId } = useParams();
  const router = useRouter();

  const [vault, setVault]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Withdrawal
  const [showWithdraw, setShowWithdraw]   = useState(false);
  const [withdrawAmt, setWithdrawAmt]     = useState("");
  const [withdrawNote, setWithdrawNote]   = useState("");
  const [withdrawing, setWithdrawing]     = useState(false);

  useEffect(() => {
    if (!vaultsId) return;

    const fetchVault = async () => {
      try {
        const res = await fetch(`/api/vault/${vaultsId}`);

        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load vault");
        }

        setVault(data.vault);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVault();
  }, [vaultsId, router]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/3" />
        <div className="h-4 bg-gray-800 rounded w-1/2" />
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="h-4 bg-gray-800 rounded w-1/4 mb-4" />
          <div className="h-10 bg-gray-800 rounded w-1/3" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-11 w-full sm:w-28 bg-gray-800 rounded-lg" />
          <div className="h-11 w-full sm:w-28 bg-gray-800 rounded-lg" />
          <div className="h-11 w-full sm:w-36 bg-gray-800 rounded-lg" />
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-5 text-sm">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          ← Go back
        </button>
      </div>
    );
  }

  /* ── Vault not found ── */
  if (!vault) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Vault not found</p>
        <Link
          href="/dashboard/vaults"
          className="mt-4 inline-block text-indigo-400 hover:underline text-sm"
        >
          ← Back to vaults
        </Link>
      </div>
    );
  }

  const handleWithdraw = async () => {
    if (!withdrawAmt || Number(withdrawAmt) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setWithdrawing(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vaultId: vaultsId,
          type: "withdrawal",
          amount: Number(withdrawAmt),
          method: "Bank Transfer",
          note: withdrawNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Withdrawal request submitted. Awaiting admin approval.");
      setWithdrawAmt("");
      setWithdrawNote("");
      setShowWithdraw(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  /* ── Vault detail ── */
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-white break-words">{vault.name}</h1>
          <p className="text-gray-500 mt-1">Manage your vault and track activity</p>
        </div>
        <Link
          href="/dashboard/vaults"
          className="text-sm text-gray-500 hover:text-white transition mt-1"
        >
          ← All Vaults
        </Link>
      </div>

      {/* Balance Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p className="text-gray-400">Current Balance</p>

        <h2 className="text-4xl font-bold text-indigo-400 mt-2">
          $ {(vault.balance || 0).toLocaleString()}
        </h2>

        <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-500">
          <span>👥 {vault.members.length} member{vault.members.length !== 1 ? "s" : ""}</span>
          <span>
            🔑 Invite code:{" "}
            <span className="text-yellow-400 font-mono">{vault.inviteCode}</span>
          </span>
          {vault.lockUntil && (
            <span>
              🔒 Locked until {new Date(vault.lockUntil).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Members</h3>
        <div className="space-y-2">
          {vault.members.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded-lg px-4 py-3"
            >
              <div>
                <p className="text-white text-sm font-medium">{member.name}</p>
                <p className="text-gray-500 text-xs">{member.email}</p>
              </div>
              {vault.owner?._id === member._id && (
                <span className="text-xs text-yellow-400 border border-yellow-400/30 px-2 py-0.5 rounded-full">
                  Owner
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/dashboard/vaults/${vaultsId}/deposit`}
          className="w-full sm:w-auto px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition text-sm font-medium text-center"
        >
          💰 Deposit
        </Link>

        <button
          onClick={() => {
            if (vault.lockUntil && new Date(vault.lockUntil) > new Date()) {
              toast.error("Not due yet! Vault is currently locked.");
              return;
            }
            setShowWithdraw((v) => !v);
          }}
          className="w-full sm:w-auto px-5 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm font-medium text-center"
        >
          📤 {showWithdraw ? "Cancel Withdraw" : "Withdraw"}
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(vault.inviteCode);
            toast.success("Invitation code copied!");
          }}
          className="w-full sm:w-auto px-5 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm font-medium text-center"
        >
          📋 Copy Invite Code
        </button>
      </div>

      {/* Withdrawal Form (inline) */}
      {showWithdraw && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Request Withdrawal</h3>
          <p className="text-gray-500 text-sm">
            Your request will be reviewed and approved by the admin before funds are released.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Amount ($)</label>
              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={withdrawAmt}
                onChange={(e) => setWithdrawAmt(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Note (optional)</label>
              <input
                type="text"
                placeholder="Reason or bank details"
                value={withdrawNote}
                onChange={(e) => setWithdrawNote(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-white"
              />
            </div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-400">
            ⚠️ Available balance: ${(vault.balance || 0).toLocaleString()}
          </div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawing ? "Submitting…" : "Submit Withdrawal Request"}
          </button>
        </div>
      )}

      {/* Invitation Code */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white">Invitation Code</h3>
        <p className="text-gray-400 text-sm mt-2">Share this code with others to invite them to this vault</p>
        <div className="mt-4 bg-gray-950 border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="break-all text-sm font-mono text-indigo-400">
            {vault.inviteCode}
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(vault.inviteCode);
              toast.success("Invitation code copied!");
            }}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition whitespace-nowrap"
          >
            Copy Code
          </button>
        </div>
      </div>

    </div>
  );
}