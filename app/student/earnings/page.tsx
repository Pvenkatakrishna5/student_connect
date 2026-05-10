"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import StatCard from "@/components/dashboard/StatCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight, Loader2, Calendar, Briefcase, Building2, AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function EarningsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchEarnings = async () => {
      try {
        const res = await fetch(`/api/student/earnings?studentId=${session.user.id}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#050508]">
        <Sidebar role="student" userName={session?.user?.name || "Student"} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  const earningsData = data?.monthlyEarnings || [];
  const payments = data?.payments || [];

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="student" userName={session?.user?.name || "Student"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Financial Overview <DollarSign className="w-6 h-6 text-emerald-400" />
            </h1>
            <p className="text-sm text-slate-500 mt-1">Track your income and payment history</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
              Download Statement
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard label="Total Earned" value={`₹${data?.totalEarned?.toLocaleString() || "0"}`} subtext="Lifetime income" icon={<DollarSign className="w-5 h-5" />} trend="up" accent />
            <StatCard label="Pending" value={`₹${data?.pendingEarned?.toLocaleString() || "0"}`} subtext="Awaiting completion" icon={<Clock className="w-5 h-5" />} />
            <StatCard label="Avg. per Job" value={`₹${data?.totalEarned > 0 ? Math.round(data.totalEarned / data.completedJobs).toLocaleString() : "0"}`} subtext="Earning potential" icon={<TrendingUp className="w-5 h-5" />} />
            <StatCard label="Completed Jobs" value={data?.completedJobs?.toString() || "0"} subtext="Successfully paid" icon={<CheckCircle className="w-5 h-5" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Area */}
            <div className="lg:col-span-2 p-8 bg-white/[0.02] border border-white/[0.04] rounded-[32px]">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-bold text-white">Earnings Growth</h3>
                  <p className="text-sm text-slate-500 mt-1">Monthly breakdown of your student income</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white">₹{data?.totalEarned?.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Current Year</div>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsData}>
                    <defs>
                      <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                    <Tooltip 
                      contentStyle={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", color: "#fff" }}
                      itemStyle={{ color: "#10b981" }}
                      cursor={{ stroke: "rgba(16,185,129,0.2)", strokeWidth: 2 }}
                    />
                    <Area type="monotone" dataKey="earned" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#earningsGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="p-8 bg-white/[0.02] border border-white/[0.04] rounded-[32px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-white">Recent Payments</h3>
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>

              <div className="space-y-6 flex-1">
                {payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <Clock className="w-12 h-12 mb-4" />
                    <p className="text-sm">No payment history found yet.</p>
                  </div>
                ) : payments.map((p: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="group relative pl-6 border-l border-white/[0.06] pb-2"
                  >
                    <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{p.job}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {p.employer}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-emerald-400">₹{p.amount?.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-600 mt-0.5">{p.date}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button className="mt-8 w-full py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2">
                View Full History <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Detailed Transactions Table */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" /> Transaction Details
            </h3>
            <div className="overflow-hidden rounded-[24px] border border-white/[0.04] bg-white/[0.01]">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.04]">
                    <th className="px-6 py-4 font-semibold text-slate-400">Project / Job</th>
                    <th className="px-6 py-4 font-semibold text-slate-400">Employer</th>
                    <th className="px-6 py-4 font-semibold text-slate-400">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-400">Amount</th>
                    <th className="px-6 py-4 font-semibold text-slate-400">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {payments.map((p: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-bold text-white">{p.job}</td>
                      <td className="px-6 py-4 text-slate-400">{p.employer}</td>
                      <td className="px-6 py-4 text-slate-500">{p.date}</td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-400">₹{p.amount?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          p.status === "paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => router.push(`/student/support?reason=payment&job=${p.job}&employer=${p.employer}`)}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                          title="Report Issue"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

