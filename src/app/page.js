"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 4000); // start fade at 4s

    const timer2 = setTimeout(() => {
      router.push("/auth/login");
    }, 5000); // redirect at 5s

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-black overflow-hidden relative">

      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0b0f1a] to-black" />
      <div className="absolute w-[600px] h-[600px] bg-yellow-500/10 blur-3xl rounded-full top-[-200px] left-[-200px]" />
      <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-3xl rounded-full bottom-[-200px] right-[-200px]" />

      {/* Center Card */}
      <div
        className={`relative z-10 text-center px-10 py-12 rounded-2xl border border-white/10
        bg-white/5 backdrop-blur-xl transition-all duration-1000
        ${fadeOut ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
      >

        <h1 className="text-4xl md:text-5xl font-light tracking-widest text-white">
          TrustVault
        </h1>

        <p className="mt-4 text-sm text-white/60 tracking-wide">
          Secure Joint Crypto Savings Built on Trust
        </p>

        {/* subtle loading line */}
        <div className="mt-8 h-[2px] w-full bg-white/10 overflow-hidden rounded-full">
          <div className="h-full w-1/2 bg-yellow-500 animate-pulse" />
        </div>

        <p className="mt-4 text-xs text-white/40">
          Initializing secure vault...
        </p>

      </div>
    </div>
  );
}
