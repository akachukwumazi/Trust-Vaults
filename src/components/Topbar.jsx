"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Topbar({ setSidebarOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user) setUser({ name: data.user.name, email: data.user.email });
      })
      .catch(() => {});
  }, []);

  const getTitle = () => {
    if (pathname.includes("vaults")) return "Your Vaults";
    if (pathname.includes("activity")) return "Activity";
    if (pathname.includes("settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">

      {/* Left section with Hamburger and Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen && setSidebarOpen(true)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900 hover:bg-gray-800 transition border border-gray-800 text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div>
        <h2 className="text-lg font-semibold text-white">
          {getTitle()}
        </h2>
        <p className="text-xs text-gray-500">
          Manage your secure workspace
        </p>
      </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 md:gap-4">

        {/* Notification */}
        <button
          onClick={() => router.push("/dashboard/activity")}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900 hover:bg-gray-800 transition border border-gray-800 shrink-0"
        >
          🔔
        </button>

        {/* New Vault Button */}
        <Link
          href="/vault/create"
          className="px-3 md:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 transition rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 whitespace-nowrap shrink-0"
        >
          <span className="hidden sm:inline">+ New Vault</span>
          <span className="sm:hidden">+ New</span>
        </Link>

        {/* Profile */}
        <div
          onClick={() => router.push("/dashboard/settings")}
          className="flex items-center gap-2 pl-2 md:pl-4 border-l border-gray-800 cursor-pointer hover:opacity-80 transition"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
          </div>

          <div className="leading-tight hidden sm:block">
            <p className="text-sm text-white">{user.name || "Loading..."}</p>
            <p className="text-xs text-gray-500">{user.email || ""}</p>
          </div>
        </div>

      </div>
    </header>
  );
}