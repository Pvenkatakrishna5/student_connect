"use client";
import { useState, useEffect, Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useSession } from "next-auth/react";
import { CreditCard, DollarSign, Loader2, CheckCircle2, AlertCircle, History, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

function BillingContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("success")) {
      setSuccessMsg("Payment successful! Your deposit has been added to your wallet.");
    }
    if (searchParams.get("canceled")) {
      setErrorMsg("Payment was canceled.");
    }
  }, [searchParams]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), description: "Wallet Deposit" }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg(data.error || "Failed to create checkout session");
      }
    } catch (err) {
      setErrorMsg("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="employer" userName={session?.user?.name || "Employer"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Billing & Payments <CreditCard className="w-5 h-5 text-indigo-400" />
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage deposits, transactions, and payouts to students</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <p className="text-sm font-bold">{successMsg}</p>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-bold">{errorMsg}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Wallet Card */}
              <div className="col-span-1 p-8 rounded-[32px] bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-white/[0.04] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center text-indigo-400 mb-6">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Wallet Balance</p>
                  <h2 className="text-5xl font-black text-white">₹0.00</h2>
                </div>
                <div className="mt-8 pt-8 border-t border-white/[0.04]">
                  <p className="text-xs text-slate-500">Available for student payouts</p>
                </div>
              </div>

              {/* Deposit Form */}
              <div className="col-span-2 p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04]">
                <h3 className="text-lg font-bold text-white mb-6">Make a Deposit</h3>
                <form onSubmit={handleDeposit} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-2 block">Amount to Deposit (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                      <input 
                        type="number"
                        min="100"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="5000"
                        className="w-full pl-10 pr-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all text-xl font-bold text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading || !amount || Number(amount) < 100}
                    className="w-full py-4 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                    Proceed to Payment securely via Stripe
                  </button>
                </form>
              </div>
            </div>

            {/* Transaction History */}
            <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <History className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-bold text-white">Transaction History</h3>
              </div>
              
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Receipt className="w-12 h-12 text-white/[0.05] mb-4" />
                <p>No transactions yet</p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default function EmployerBilling() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#050508] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
