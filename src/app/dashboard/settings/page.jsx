"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.status === 401) { router.push("/auth/login"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data?.user) setUser({ name: data.user.name, email: data.user.email });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/auth/login");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account and application preferences.
        </p>
      </div>

      {/* Profile */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-5">Profile Information</h2>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-11 bg-gray-800 rounded-lg" />
            <div className="h-11 bg-gray-800 rounded-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                value={user.name}
                readOnly
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none cursor-not-allowed opacity-70"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email Address</label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none cursor-not-allowed opacity-70"
              />
            </div>
          </div>
        )}
      </section>

      {/* Security */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-5">Security</h2>
        <div className="space-y-4">
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="w-full text-left bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 hover:border-indigo-500 transition text-gray-300 text-sm font-medium"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="bg-gray-950 border border-gray-700 rounded-lg p-5 space-y-4">
              <h3 className="text-white text-sm font-medium border-b border-gray-800 pb-2 mb-3">Change Your Password</h3>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Previous Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 transition rounded-lg text-white text-sm font-medium disabled:opacity-50"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  disabled={changingPassword}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-800 hover:bg-gray-700 transition rounded-lg text-white text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Preferences */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-5">Preferences</h2>
        <div className="flex justify-between items-center bg-gray-950 px-4 py-3 rounded-lg border border-gray-800">
          <span className="text-gray-300 text-sm font-medium">Dark Mode</span>
          <input type="checkbox" defaultChecked className="accent-indigo-500 w-4 h-4 cursor-pointer" />
        </div>
      </section>

      {/* Logout */}
      <section className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Logging out will end your current session.
        </p>
        <button
          onClick={handleLogout}
          className="w-full sm:w-auto px-5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition text-sm font-medium"
        >
          Log Out
        </button>
      </section>

    </div>
  );
}