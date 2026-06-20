"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import { Shield, Users, Briefcase, CheckCircle, Loader2, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function AgentDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes] = await Promise.all([
          fetch("/api/agent/stats"),
          fetch("/api/agent/activities")
        ]);
        const statsData = await statsRes.json();
        setStats(statsData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#050508] items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="agent" userName={session?.user?.name || "Agent"} />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Agent Control Center</h1>
            <p className="text-slate-500">Monitor platform health and manage verification workflows.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/agent/verify">
              <button className="px-6 py-3 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-all text-sm">
                Start Verifications
              </button>
            </Link>
          </div>
        </header>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { label: "Identity Review", value: stats?.pendingVerifications || 0, icon: Shield, color: "text-amber-400", bg: "bg-amber-500/10", href: "/agent/verify" },
            { label: "Job Approvals", value: stats?.pendingJobs || 0, icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/10", href: "/agent/jobs" }
          ].map((card) => (
            <a key={card.label} href={card.href} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group">
              <div>
                <p className="text-lg font-bold text-white">{card.label}</p>
                <p className="text-xs text-slate-500">{card.value} pending</p>
              </div>
              <card.icon className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
            </a>
          ))}
        </div>

        {/* Guidelines */}
        <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Shield className="w-5 h-5 text-indigo-400" /> Agent Guidelines
          </h2>
          <ul className="space-y-4">
            {[
              "Always verify Aadhaar details manually.",
              "Cross-check student college IDs.",
              "Ensure job descriptions meet safety standards.",
              "Respond to support tickets within 2 hours."
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
