"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const TABS = ["accounts", "vaults", "deposits", "withdrawals", "activity"];

const STATUS_STYLES = {
  pending:  "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const TYPE_ICON = { deposit: "💰", withdrawal: "📤", member: "👥", money: "💸", vault: "🔐", file: "📄", other: "📌" };

export default function AdminDashboard() {
  const router = useRouter();

  // ── Stats & core data ──────────────────────────────────────────────
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [stats, setStats]           = useState({ totalUsers: 0, totalVaults: 0, totalBalance: 0, activeLocks: 0, pendingDeposits: 0, pendingWithdrawals: 0 });
  const [users, setUsers]           = useState([]);
  const [vaults, setVaults]         = useState([]);

  // ── Transactions & activity ────────────────────────────────────────
  const [deposits, setDeposits]         = useState([]);
  const [withdrawals, setWithdrawals]   = useState([]);
  const [activities, setActivities]     = useState([]);
  const [txLoading, setTxLoading]       = useState(false);
  const [actLoading, setActLoading]     = useState(false);

  // ── UI state ───────────────────────────────────────────────────────
  const [activeTab, setActiveTab]   = useState("accounts");
  const [search, setSearch]         = useState("");
  const [processingId, setProcessingId] = useState(null);

  // ── Fetch overview stats ───────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/stats");
      if (res.status === 401 || res.status === 403) { router.push("/auth/login"); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load stats");
      setStats(data.stats);
      setUsers(data.users);
      setVaults(data.vaults);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ── Fetch transactions ─────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const res  = await fetch("/api/admin/transactions");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const all = data.transactions || [];
      setDeposits(all.filter((t) => t.type === "deposit"));
      setWithdrawals(all.filter((t) => t.type === "withdrawal"));
    } catch (err) {
      toast.error("Could not load transactions: " + err.message);
    } finally {
      setTxLoading(false);
    }
  }, []);

  // ── Fetch all platform activity ────────────────────────────────────
  const fetchActivity = useCallback(async () => {
    setActLoading(true);
    try {
      const res  = await fetch("/api/admin/activity");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActivities(data.activities || []);
    } catch (err) {
      toast.error("Could not load activity: " + err.message);
    } finally {
      setActLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  // Lazy-load tabs on first switch
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if ((activeTab === "deposits" || activeTab === "withdrawals") && deposits.length === 0 && withdrawals.length === 0) {
      fetchTransactions();
    }
    if (activeTab === "activity" && activities.length === 0) {
      fetchActivity();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Approve / Reject handler ───────────────────────────────────────
  const handleTxAction = async (txId, action) => {
    setProcessingId(txId);
    try {
      const res  = await fetch("/api/admin/transactions", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ transactionId: txId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Transaction ${action}d successfully`);
      // Refresh transactions and stats
      await Promise.all([fetchTransactions(), fetchStats()]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) { toast.success("Logged out"); router.push("/auth/login"); }
  };

  // ── Search helpers ─────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredUsers      = users.filter((u) => [u.name, u.email, u.role].some((f) => f?.toLowerCase().includes(q)));
  const filteredVaults     = vaults.filter((v) => [v.name, v.inviteCode, v.owner?.name, v.owner?.email].some((f) => f?.toLowerCase().includes(q)));
  const filteredDeposits   = deposits.filter((t) => [t.user?.name, t.user?.email, t.vault?.name, t.status, t.method].some((f) => f?.toLowerCase().includes(q)));
  const filteredWithdrawals= withdrawals.filter((t) => [t.user?.name, t.user?.email, t.vault?.name, t.status].some((f) => f?.toLowerCase().includes(q)));
  const filteredActivity   = activities.filter((a) => [a.action, a.vault, a.user?.name].some((f) => f?.toLowerCase().includes(q)));

  // ── Loading / Error screens ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0b0f1a] to-black" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm tracking-widest uppercase">Loading Admin Console…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0b0f1a] to-black" />
        <div className="relative z-10 max-w-md w-full text-center bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-xl font-medium text-white mt-4">System Error</h2>
          <p className="text-red-400 text-sm mt-2">{error}</p>
          <button onClick={() => { setLoading(true); fetchStats(); }} className="mt-6 w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-16">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0b0f1a] to-black" />
      <div className="absolute w-[600px] h-[600px] bg-yellow-500/5 blur-3xl rounded-full top-[-150px] left-[-150px]" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/5 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-8">

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extralight tracking-widest text-white">TrustVault</h1>
              <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium tracking-wider uppercase">
                Admin Portal
              </span>
            </div>
            <p className="text-white/40 text-sm mt-1">Platform analytics and administrative workspace</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/vault")} className="px-4 py-2 border border-white/10 hover:border-white/30 text-white/60 hover:text-white rounded-lg bg-white/5 text-sm font-medium transition">
              Client View
            </button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg text-sm font-medium transition">
              Sign Out
            </button>
          </div>
        </header>

        {/* ── Stat Cards ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
          {[
            { label: "Accounts",    value: stats.totalUsers,          sub: "Registered users" },
            { label: "Vaults",      value: stats.totalVaults,         sub: "Active vaults" },
            { label: "Assets",      value: `₦ ${stats.totalBalance.toLocaleString()}`, sub: "Total balance", gold: true },
            { label: "Time-Locked", value: stats.activeLocks,         sub: "Locked vaults" },
            { label: "Deposits",    value: stats.pendingDeposits,     sub: "Pending approval", badge: stats.pendingDeposits > 0 },
            { label: "Withdrawals", value: stats.pendingWithdrawals,  sub: "Pending approval", badge: stats.pendingWithdrawals > 0 },
          ].map((card) => (
            <div key={card.label} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-yellow-500/20 transition group relative overflow-hidden">
              {card.badge && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              )}
              <p className="text-xs text-white/50 uppercase tracking-widest font-medium">{card.label}</p>
              <h3 className={`text-2xl font-light mt-2 group-hover:scale-105 transition-transform origin-left ${card.gold ? "text-yellow-500" : "text-white"}`}>
                {card.value}
              </h3>
              <p className="text-xs text-white/30 mt-1">{card.sub}</p>
            </div>
          ))}
        </section>

        {/* ── Content Panel ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">

          {/* Tab Bar + Search */}
          <div className="p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex overflow-x-auto gap-2 w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {TABS.map((tab) => {
                const counts = { accounts: users.length, vaults: vaults.length, deposits: deposits.length, withdrawals: withdrawals.length, activity: activities.length };
                const pending = { deposits: stats.pendingDeposits, withdrawals: stats.pendingWithdrawals };
                return (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setSearch(""); }}
                    className={`relative px-4 py-2 text-sm rounded-lg font-medium capitalize transition whitespace-nowrap shrink-0 ${
                      activeTab === tab
                        ? "bg-yellow-500 text-black font-semibold"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab}
                    {counts[tab] > 0 && (
                      <span className={`ml-1.5 text-xs ${activeTab === tab ? "text-black/60" : "text-white/40"}`}>
                        ({counts[tab]})
                      </span>
                    )}
                    {pending[tab] > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder={`Search ${activeTab}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2.5 pl-9 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-yellow-500 text-sm transition"
              />
              <span className="absolute left-3 top-[11px] text-white/30 text-sm">🔍</span>
            </div>
          </div>

          {/* ── ACCOUNTS TAB ── */}
          {activeTab === "accounts" && (
            <div className="overflow-x-auto">
              {filteredUsers.length === 0
                ? <Empty label="No accounts match your search." />
                : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider bg-white/[0.02]">
                        <Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Joined</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-white/[0.02] transition">
                          <td className="py-4 px-6 font-medium text-white">{u.name || "N/A"}</td>
                          <td className="py-4 px-6 text-white/60 font-mono text-xs">{u.email}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${u.role === "admin" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-white/40 text-xs">{fmtDate(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          )}

          {/* ── VAULTS TAB ── */}
          {activeTab === "vaults" && (
            <div className="overflow-x-auto">
              {filteredVaults.length === 0
                ? <Empty label="No vaults match your search." />
                : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider bg-white/[0.02]">
                        <Th>Vault</Th><Th>Code</Th><Th>Owner</Th><Th>Members</Th><Th right>Balance</Th><Th>Status</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredVaults.map((v) => {
                        const locked = v.lockUntil && new Date(v.lockUntil) > new Date();
                        return (
                          <tr key={v._id} className="hover:bg-white/[0.02] transition">
                            <td className="py-4 px-6 font-medium text-white">{v.name}</td>
                            <td className="py-4 px-6"><Code>{v.inviteCode}</Code></td>
                            <td className="py-4 px-6 text-white/60 text-xs font-mono">{v.owner ? `${v.owner.name} (${v.owner.email})` : "—"}</td>
                            <td className="py-4 px-6 text-white/60 text-xs">👥 {v.members?.length || 1}</td>
                            <td className="py-4 px-6 text-right font-mono text-yellow-500">₦ {(v.balance || 0).toLocaleString()}</td>
                            <td className="py-4 px-6">
                              {locked
                                ? <Badge cls="bg-red-500/10 text-red-400 border-red-500/20">🔒 Until {new Date(v.lockUntil).toLocaleDateString()}</Badge>
                                : <Badge cls="bg-green-500/10 text-green-400 border-green-500/20">🔓 Unlocked</Badge>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
            </div>
          )}

          {/* ── DEPOSITS TAB ── */}
          {activeTab === "deposits" && (
            <div className="overflow-x-auto">
              {txLoading
                ? <Spinner label="Loading deposits…" />
                : filteredDeposits.length === 0
                  ? <Empty label="No deposit requests found." />
                  : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider bg-white/[0.02]">
                          <Th>User</Th><Th>Vault</Th><Th>Method</Th><Th right>Amount</Th><Th>Status</Th><Th>Date</Th><Th>Action</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredDeposits.map((t) => (
                          <TxRow key={t._id} tx={t} processingId={processingId} onAction={handleTxAction} />
                        ))}
                      </tbody>
                    </table>
                  )}
            </div>
          )}

          {/* ── WITHDRAWALS TAB ── */}
          {activeTab === "withdrawals" && (
            <div className="overflow-x-auto">
              {txLoading
                ? <Spinner label="Loading withdrawals…" />
                : filteredWithdrawals.length === 0
                  ? <Empty label="No withdrawal requests found." />
                  : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider bg-white/[0.02]">
                          <Th>User</Th><Th>Vault</Th><Th>Method</Th><Th right>Amount</Th><Th>Status</Th><Th>Date</Th><Th>Action</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredWithdrawals.map((t) => (
                          <TxRow key={t._id} tx={t} processingId={processingId} onAction={handleTxAction} />
                        ))}
                      </tbody>
                    </table>
                  )}
            </div>
          )}

          {/* ── ACTIVITY TAB ── */}
          {activeTab === "activity" && (
            <div className="overflow-x-auto">
              {actLoading
                ? <Spinner label="Loading activity…" />
                : filteredActivity.length === 0
                  ? <Empty label="No platform activity yet." />
                  : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider bg-white/[0.02]">
                          <Th>Type</Th><Th>Action</Th><Th>Vault</Th><Th>User</Th><Th>Time</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredActivity.map((a) => (
                          <tr key={a.id} className="hover:bg-white/[0.02] transition">
                            <td className="py-4 px-6 text-lg">{TYPE_ICON[a.type] || "📌"}</td>
                            <td className="py-4 px-6 text-white/80 max-w-xs">{a.action}</td>
                            <td className="py-4 px-6 text-white/50 text-xs">{a.vault || "—"}</td>
                            <td className="py-4 px-6 text-white/50 text-xs">{a.userName || "—"}</td>
                            <td className="py-4 px-6 text-white/40 text-xs whitespace-nowrap">{a.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small reusable sub-components ────────────────────────────────────
function Th({ children, right }) {
  return <th className={`py-4 px-6 font-medium ${right ? "text-right" : ""}`}>{children}</th>;
}
function Badge({ children, cls }) {
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{children}</span>;
}
function Code({ children }) {
  return <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-yellow-500 font-mono text-xs">{children}</span>;
}
function Empty({ label }) {
  return <div className="text-center py-16 text-white/30 text-sm">{label}</div>;
}
function Spinner({ label }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-white/40 text-sm">
      <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      {label}
    </div>
  );
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function TxRow({ tx, processingId, onAction }) {
  const isPending = tx.status === "pending";
  const isProcessing = processingId === tx._id;
  return (
    <tr className="hover:bg-white/[0.02] transition">
      <td className="py-4 px-6">
        <p className="text-white text-sm font-medium">{tx.user?.name || "—"}</p>
        <p className="text-white/40 text-xs font-mono">{tx.user?.email}</p>
      </td>
      <td className="py-4 px-6 text-white/60 text-xs">{tx.vault?.name || "—"}</td>
      <td className="py-4 px-6 text-white/50 text-xs">{tx.method || "—"}</td>
      <td className="py-4 px-6 text-right font-mono text-yellow-500 font-medium">
        ₦ {tx.amount?.toLocaleString()}
      </td>
      <td className="py-4 px-6">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${STATUS_STYLES[tx.status]}`}>
          {tx.status}
        </span>
      </td>
      <td className="py-4 px-6 text-white/40 text-xs whitespace-nowrap">{fmtDate(tx.createdAt)}</td>
      <td className="py-4 px-6">
        {isPending ? (
          <div className="flex gap-2">
            <button
              disabled={isProcessing}
              onClick={() => onAction(tx._id, "approve")}
              className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium transition disabled:opacity-40"
            >
              {isProcessing ? "…" : "Approve"}
            </button>
            <button
              disabled={isProcessing}
              onClick={() => onAction(tx._id, "reject")}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium transition disabled:opacity-40"
            >
              {isProcessing ? "…" : "Reject"}
            </button>
          </div>
        ) : (
          <span className="text-white/20 text-xs">Processed</span>
        )}
      </td>
    </tr>
  );
}
