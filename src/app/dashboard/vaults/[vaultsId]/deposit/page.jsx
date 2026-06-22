"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

const CURRENCY_OPTIONS = [
  { name: "USDT (TRC20)", address: "ygggyg4ry372wghedvddgeydgee37" },
  { name: "BTC",          address: "t5ih5t478rrjendeudg3e2398eorehfu" },
  { name: "ETH",          address: "it95t58turfefwejijjew0w0wweberf94" },
  { name: "ADA",          address: "uti5ht58t98tu484rr04r9409545856578" },
];

export default function DepositPage() {
  const { vaultsId } = useParams();
  const router = useRouter();

  const [vaultName, setVaultName] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(CURRENCY_OPTIONS[0].name);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCY_OPTIONS[0]);
  const [copied, setCopied] = useState(false);

  // Fetch vault name for display
  useEffect(() => {
    if (!vaultsId) return;
    fetch(`/api/vault/${vaultsId}`)
      .then((r) => {
        if (r.status === 401) { router.push("/auth/login"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data?.vault) setVaultName(data.vault.name);
      })
      .catch(() => {});
  }, [vaultsId, router]);

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedCurrency.address);
    setCopied(true);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMethodChange = (e) => {
    const chosen = e.target.value;
    setMethod(chosen);
    setSelectedCurrency(CURRENCY_OPTIONS.find((o) => o.name === chosen));
  };

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid deposit amount");
      return;
    }
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vaultId: vaultsId,
          type: "deposit",
          amount: Number(amount),
          method,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      toast.success(`Deposit request of ₦${Number(amount).toLocaleString()} via ${method} submitted. Awaiting admin approval.`, { autoClose: 5000 });
      setAmount("");
    } catch (err) {
      toast.error(err.message || "Failed to submit deposit");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 text-white">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Deposit Funds</h1>
          {vaultName && (
            <p className="text-gray-400 mt-1 text-sm">
              Vault: <span className="text-indigo-400 font-medium">{vaultName}</span>
            </p>
          )}
        </div>
        <Link
          href={`/dashboard/vaults/${vaultsId}`}
          className="text-sm text-gray-500 hover:text-white transition mt-1"
        >
          ← Back to Vault
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-8 space-y-6">

        {/* Amount + Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Amount</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              min="0"
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Payment Method</label>
            <select
              value={method}
              onChange={handleMethodChange}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-white"
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.name} value={opt.name}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Wallet Address */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Deposit Address</label>
          <div className="bg-gray-950 border border-gray-700 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
            <p className="flex-1 text-indigo-400 break-all text-sm font-mono">
              {selectedCurrency.address}
            </p>
            <button
              onClick={copyAddress}
              className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition"
            >
              {copied ? "✓ Copied" : "Copy Address"}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
          <h3 className="font-semibold mb-3">How to Deposit</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>1. Enter the amount you intend to deposit.</li>
            <li>2. Select your payment method and copy the wallet address.</li>
            <li>3. Send funds from your external wallet.</li>
            <li>4. Click &quot;I Have Sent Payment&quot; to submit your request.</li>
            <li>5. Your deposit will appear as pending until verified by the team.</li>
          </ul>
        </div>

        {/* Deposit Summary */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Vault</p>
            <p className="font-semibold text-indigo-400">{vaultName || vaultsId}</p>
          </div>
          {amount && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Amount</p>
              <p className="font-semibold text-white">{Number(amount).toLocaleString()} {method.split(" ")[0]}</p>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition font-medium"
        >
          I Have Sent Payment
        </button>
      </div>
    </div>
  );
}
