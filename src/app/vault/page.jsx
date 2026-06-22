"use client";

import Link from "next/link";

export default function VaultSelectionPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-black relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0b0f1a] to-black" />

      {/* Glow effects */}
      <div className="absolute w-[500px] h-[500px] bg-yellow-500/10 blur-3xl rounded-full top-[-200px] left-[-200px]" />
      <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-3xl rounded-full bottom-[-200px] right-[-200px]" />

      {/* Top Right Skip */}
      <div className="absolute top-6 right-6 z-20">
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm text-white/50 hover:text-white transition border border-white/10 hover:border-white/30 rounded-lg backdrop-blur-md bg-white/5"
        >
          Skip to Dashboard
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center w-[90%] max-w-4xl">

        <h1 className="text-3xl md:text-4xl font-light text-white tracking-widest">
          TrustVault
        </h1>

        <p className="text-white/50 mt-3 text-sm md:text-base">
          Choose how you want to continue
        </p>

        {/* Cards */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">

          {/* CREATE VAULT */}
          <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-yellow-500/40 transition group">

            <h2 className="text-2xl text-white font-light">
              Create Vault
            </h2>

            <p className="text-white/50 mt-3 text-sm">
              Start a new shared savings vault with your partner and set your financial goal.
            </p>

            <Link
              href="/vault/create"
              className="inline-block mt-6 px-6 py-3 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition group-hover:scale-105"
            >
              Create Vault
            </Link>

          </div>

          {/* JOIN VAULT */}
          <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-yellow-500/40 transition group">

            <h2 className="text-2xl text-white font-light">
              Join Vault
            </h2>

            <p className="text-white/50 mt-3 text-sm">
              Enter an invite code shared by your partner to join an existing vault.
            </p>

            <Link
              href="/vault/join"
              className="inline-block mt-6 px-6 py-3 rounded-lg border border-white/20 text-white hover:border-yellow-500 hover:text-yellow-400 transition group-hover:scale-105"
            >
              Join Vault
            </Link>

          </div>

        </div>

        {/* Footer note */}
        <p className="text-white/30 text-xs mt-10">
          Secure • Private • Partner-based savings system
        </p>

      </div>
    </div>
  );
}