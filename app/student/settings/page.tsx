"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Settings, Lock, Bell, Shield, Trash2, Loader2, Save, Moon, Globe, HelpCircle, User, Mail, Smartphone, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentSettings() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      });
    }
  }, [session]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
      });
      
      if (res.ok) {
        await update({ name: formData.name });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="student" userName={session?.user?.name || "Student"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Settings <Settings className="w-5 h-5 text-slate-500" />
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage your account preferences and security</p>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (success ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
            {success ? "Saved!" : (loading ? "Saving..." : "Save Changes")}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* Account Information */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <User className="w-5 h-5 text-emerald-400" /> Account Information
              </h3>
              <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-12 pr-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all text-sm text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      disabled
                      value={formData.email}
                      className="w-full pl-12 pr-5 py-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-400" /> Security & Privacy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-between group hover:border-white/[0.08] transition-all">
                  <div>
                    <p className="text-sm font-bold text-white">Two-Factor Auth</p>
                    <p className="text-[10px] text-slate-500 mt-1">Secure your login with 2FA</p>
                  </div>
                  <button className="px-4 py-1.5 rounded-lg bg-white/[0.05] text-[10px] font-bold text-slate-400 hover:text-white transition-all border border-white/[0.05]">Enable</button>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-between group hover:border-white/[0.08] transition-all">
                  <div>
                    <p className="text-sm font-bold text-white">Password</p>
                    <p className="text-[10px] text-slate-500 mt-1">Last changed 3 months ago</p>
                  </div>
                  <button className="px-4 py-1.5 rounded-lg bg-white/[0.05] text-[10px] font-bold text-slate-400 hover:text-white transition-all border border-white/[0.05]">Change</button>
                </div>
              </div>
            </section>

            {/* Notification Preferences */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <Bell className="w-5 h-5 text-indigo-400" /> Notification Channels
              </h3>
              <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-4">
                {[
                  { key: 'email', label: "Email Notifications", desc: "Job alerts and application status", icon: <Mail className="w-4 h-4" /> },
                  { key: 'push', label: "Push Notifications", desc: "Real-time dashboard updates", icon: <Globe className="w-4 h-4" /> },
                  { key: 'sms', label: "SMS Alerts", desc: "Urgent messages for job matches", icon: <Smartphone className="w-4 h-4" /> },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between py-3 border-b border-white/[0.02] last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-slate-500">
                        {pref.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{pref.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{pref.desc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFormData({
                        ...formData, 
                        notifications: { ...formData.notifications, [pref.key]: !formData.notifications[pref.key as keyof typeof formData.notifications] }
                      })}
                      className={`w-12 h-6 rounded-full transition-all relative border ${
                        formData.notifications[pref.key as keyof typeof formData.notifications] 
                          ? "bg-emerald-500/20 border-emerald-500/40" 
                          : "bg-white/[0.05] border-white/[0.1]"
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                        formData.notifications[pref.key as keyof typeof formData.notifications] 
                          ? "right-1 bg-emerald-400 shadow-sm shadow-emerald-500/50" 
                          : "left-1 bg-slate-600"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Support & Danger Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 rounded-[40px] bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/[0.04] space-y-4 relative overflow-hidden">
                 <HelpCircle className="absolute -bottom-4 -right-4 w-24 h-24 text-indigo-500/5" />
                 <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Support Center</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Need help with your account? Our support team is available 24/7 to assist you.</p>
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-white transition-all pt-2">Contact Support →</button>
              </div>

              <div className="p-10 rounded-[40px] bg-rose-500/[0.02] border border-rose-500/10 space-y-4 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Danger Zone</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Permanently delete your account and data. This action cannot be undone.</p>
                <button className="px-6 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">Deactivate Account</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
