"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Settings, Lock, Bell, Shield, Trash2, Loader2, Save, Building2, CreditCard, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function EmployerSettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="employer" userName={session?.user?.name || "Employer"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Platform Configuration</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your business settings and workspace</p>
          </div>
          <button className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Billing & Plans */}
            <section className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Enterprise Plan</h3>
                </div>
                <p className="text-sm text-slate-500">Your next billing date is June 12, 2024. Manage your subscription and invoices.</p>
              </div>
              <button className="px-8 py-3 rounded-2xl bg-white text-black font-black text-xs hover:bg-slate-200 transition-all">Manage Billing</button>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Security Section */}
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <Lock className="w-5 h-5 text-indigo-400" /> Security
                </h3>
                <div className="space-y-4">
                  <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">SSO Authentication</p>
                      <p className="text-xs text-slate-500 mt-1">Single Sign-On for your team.</p>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-white/[0.05] relative border border-white/[0.08]">
                      <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-slate-600" />
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">IP Whitelisting</p>
                      <p className="text-xs text-slate-500 mt-1">Restrict access to specific IPs.</p>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">Configure</button>
                  </div>
                </div>
              </section>

              {/* Team Settings */}
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-400" /> Team Members
                </h3>
                <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/[0.04] space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800" />
                      <p className="text-sm font-bold text-white text-xs">Suresh Kumar (Admin)</p>
                    </div>
                    <span className="text-[10px] text-slate-600 font-bold uppercase">Owner</span>
                  </div>
                  <button className="w-full py-2.5 rounded-xl border border-dashed border-white/[0.1] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-white/[0.2] transition-all">
                    + Invite Member
                  </button>
                </div>
              </section>
            </div>

            {/* Danger Zone */}
            <section className="p-8 rounded-[32px] bg-rose-500/[0.02] border border-rose-500/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">Deactivate Business Profile</h4>
              </div>
              <p className="text-sm text-slate-500">This will hide your company profile and all active job postings. You can reactivate at any time within 30 days.</p>
              <button className="px-6 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">Deactivate Account</button>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
