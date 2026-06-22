"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JoinVaultPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Enter an invite code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/vault/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteCode: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join vault");
      }

      toast.success(data.message || "Successfully joined vault!");
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
          Join Vault
        </h1>

        <p className="text-center text-white/50 text-sm mt-2">
          Enter your invite code
        </p>

        <form onSubmit={handleJoin} className="mt-8 space-y-4">

          <input
            type="text"
            placeholder="e.g. TV-ABC123"
            className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-yellow-500 text-center tracking-widest uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Joining..." : "Join Vault"}
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
          Need to create one?{" "}
          <Link href="/vault/create" className="text-yellow-400 hover:underline">
            Create Vault
          </Link>
        </p>

      </div>
    </div>
  );
}