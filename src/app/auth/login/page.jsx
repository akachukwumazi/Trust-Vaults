"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      toast.success(data.message || "Login successful");
      
      if (data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/vault");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0b0f1a] to-black" />

      <div className="relative z-10 w-[90%] max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">

        <h1 className="text-3xl text-white text-center font-light tracking-widest">
          TrustVault
        </h1>

        <p className="text-center text-white/50 text-sm mt-2">
          Welcome back
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-yellow-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-yellow-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-yellow-400 hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}