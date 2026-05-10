"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Settings, Shield, Bell, Database, Lock, Globe, Save, Loader2, Sparkles, Activity, Server, Cpu } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function AdminSettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="admin" userName={session?.user?.name || "Admin"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              System Settings <Settings className="w-5 h-5 text-amber-500" />
            </h1>
            <p className="text-sm text-slate-500 mt-1">Configure global platform parameters and security</p>
          </div>
          
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {success ? "Config Saved!" : "Apply Changes"}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Database", val: "Optimal", icon: <Database className="w-4 h-4" />, color: "text-emerald-400" },
                { label: "API Latency", val: "24ms", icon: <Activity className="w-4 h-4" />, color: "text-blue-400" },
                { label: "Server Load", val: "12%", icon: <Server className="w-4 h-4" />, color: "text-amber-400" },
              ].map(stat => (
                <div key={stat.label} className="p-6 rounded-3xl bg-white/[0.01] border border-white/[0.04] space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    {stat.icon} {stat.label}
                  </div>
                  <div className={`text-xl font-black ${stat.color}`}>{stat.val}</div>
                </div>
              ))}
            </div>

            {/* General Config */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <Globe className="w-5 h-5 text-amber-500" /> Platform Configuration
              </h3>
              <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Service Fee (%)</label>
                    <input type="number" defaultValue="5" className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Verification Requirement</label>
                    <select className="w-full px-5 py-4 bg-[#111118] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-white appearance-none">
                      <option>Email Only</option>
                      <option>Document Upload</option>
                      <option>Manual Review</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <p className="text-sm font-bold text-white">Auto-approve Reputable Employers</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Bypass moderation for employers with &gt;4.5 rating</p>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-amber-500/20 relative cursor-pointer border border-amber-500/40">
                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-amber-500 transition-all" />
                  </div>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <Shield className="w-5 h-5 text-rose-500" /> Global Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "IP Rate Limiting", desc: "Protect against DDoS attacks", active: true },
                  { label: "Admin MFA", desc: "Require 2FA for all admin staff", active: true },
                  { label: "Activity Logging", desc: "Track all admin interventions", active: true },
                  { label: "Strict Mode", desc: "Block risky automated scripts", active: false },
                ].map(item => (
                  <div key={item.label} className="p-6 rounded-3xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-between group hover:border-white/[0.08] transition-all">
                    <div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer border transition-all ${item.active ? "bg-amber-500/20 border-amber-500/40" : "bg-white/5 border-white/10"}`}>
                      <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all ${item.active ? "right-0.5 bg-amber-500" : "left-0.5 bg-slate-600"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Advanced Support */}
            <div className="p-10 rounded-[48px] bg-gradient-to-br from-amber-500/10 to-transparent border border-white/[0.04] relative overflow-hidden">
               <Cpu className="absolute -bottom-4 -right-4 w-32 h-32 text-amber-500/5" />
               <h4 className="text-xl font-bold text-white mb-2">Platform Engine v2.4.0</h4>
               <p className="text-sm text-slate-500 mb-8 max-w-lg">Advanced configuration for the StudentConnect core engine. Modify these settings only if you are aware of the system impact.</p>
               <div className="flex gap-4">
                  <button className="px-6 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Maintenance Mode</button>
                  <button className="px-6 py-2.5 rounded-xl bg-white/[0.05] text-white text-[10px] font-black uppercase tracking-widest border border-white/[0.1] hover:bg-white/[0.1] transition-all">Flush Redis Cache</button>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
