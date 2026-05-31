"use client";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import { Settings, User, Bell, Shield, Lock, Save } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AgentSettingsPage() {
  const { data: session } = useSession();

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="agent" userName={session?.user?.name || "Agent"} />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Account Settings</h1>
          <p className="text-slate-500">Manage your agent profile and platform preferences.</p>
        </header>

        <div className="max-w-4xl space-y-8">
          {/* Profile Section */}
          <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.04]">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <User className="w-5 h-5 text-amber-400" /> Agent Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Display Name</label>
                <input 
                  defaultValue={session?.user?.name || "Verified Agent"}
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white outline-none focus:border-amber-500/40 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Email Address</label>
                <input 
                  disabled
                  defaultValue={session?.user?.email || "agent@studentconnect.in"}
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-slate-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.04]">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <Bell className="w-5 h-5 text-indigo-400" /> Notifications
            </h2>
            <div className="space-y-4">
              {[
                { label: "New verification requests", enabled: true },
                { label: "Urgent job assignments", enabled: true },
                { label: "System maintenance alerts", enabled: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                  <span className="text-sm text-slate-400">{item.label}</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${item.enabled ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${item.enabled ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleSave}
              className="px-8 py-4 bg-white text-black font-black rounded-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
            >
              <Save className="w-5 h-5" /> Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
