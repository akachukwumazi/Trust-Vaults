"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateVaultPage() {
  const router = useRouter();

  const [vaultName, setVaultName] = useState("");
  const [lockUntil, setLockUntil] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!vaultName || !lockUntil) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/vault", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: vaultName,
          lockUntil,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create vault");
      }

      toast.success(
        `Vault created! Invite code: ${data.vault.inviteCode}`,
        { autoClose: 6000 }
      );
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0b0f1a] to-black" />

      <div className="relative z-10 w-[90%] max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">

        <h1 className="text-3xl text-white text-center font-light tracking-widest">
          Create Vault
        </h1>

        <p className="text-center text-white/50 text-sm mt-2">
          Set up a shared savings vault
        </p>

        <form onSubmit={handleCreate} className="mt-8 space-y-4">

          <input
            type="text"
            placeholder="Vault Name"
            className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-yellow-500"
            value={vaultName}
            onChange={(e) => setVaultName(e.target.value)}
          />

          <div className="space-y-1">
            <label className="text-white/50 text-xs pl-1">Lock Until</label>
            <input
              type="date"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-yellow-500"
              value={lockUntil}
              onChange={(e) => setLockUntil(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Vault..." : "Create Vault"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full p-3 rounded-lg border border-white/20 text-white font-medium hover:bg-white/10 transition"
          >
            Skip to Dashboard
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-6">
          Want to join instead?{" "}
          <Link href="/vault/join" className="text-yellow-400 hover:underline">
            Join Vault
          </Link>
        </p>

      </div>
    </div>
  );
}