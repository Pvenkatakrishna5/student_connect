"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { ArrowLeft, Save, Loader2, Sparkles, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { JOB_CATEGORIES, CITIES } from "@/lib/utils";

export default function NewJobPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    isRemote: false,
    payType: "fixed",
    payAmount: "",
    duration: "",
    startDate: "",
    spotsAvailable: 1,
    skillsRequired: [] as string[],
  });

  const [skillInput, setSkillInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          employerId: session.user.id,
          payAmount: Number(formData.payAmount),
          spotsAvailable: Number(formData.spotsAvailable),
        }),
      });
      
      if (res.ok) {
        router.push("/employer/jobs");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to post job");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput && !formData.skillsRequired.includes(skillInput)) {
      setFormData({
        ...formData,
        skillsRequired: [...formData.skillsRequired, skillInput]
      });
      setSkillInput("");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="employer" userName={session?.user?.name || "Employer"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/[0.05] text-slate-400 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                Post Opportunity <Sparkles className="w-5 h-5 text-indigo-400" />
              </h1>
              <p className="text-sm text-slate-500 mt-1">Fill in the details to find your perfect student match</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-20">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Basic Info */}
            <section className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-2">
                <Info className="w-5 h-5 text-indigo-400" /> Basic Information
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Job Title</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Graphic Design Assistant, Social Media Intern..."
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all text-sm text-white placeholder:text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Category</label>
                    <select 
                      required
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-5 py-4 bg-[#111118] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all text-sm text-white appearance-none"
                    >
                      <option value="">Select Category</option>
                      {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Location</label>
                    <select 
                      required
                      disabled={formData.isRemote}
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="w-full px-5 py-4 bg-[#111118] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all text-sm text-white appearance-none disabled:opacity-50"
                    >
                      <option value="">Select City</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <input 
                    type="checkbox"
                    id="remote"
                    checked={formData.isRemote}
                    onChange={e => setFormData({...formData, isRemote: e.target.checked, location: e.target.checked ? "Remote" : ""})}
                    className="w-5 h-5 rounded-lg border-white/20 bg-transparent text-indigo-500 focus:ring-indigo-500/20"
                  />
                  <label htmlFor="remote" className="text-sm text-slate-400 cursor-pointer">This is a fully remote position</label>
                </div>
              </div>
            </section>

            {/* Compensation & Duration */}
            <section className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Compensation & Schedule
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Pay Type</label>
                  <select 
                    value={formData.payType}
                    onChange={e => setFormData({...formData, payType: e.target.value})}
                    className="w-full px-5 py-4 bg-[#111118] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all text-sm text-white appearance-none"
                  >
                    <option value="fixed">Fixed Budget</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="monthly">Monthly Stipend</option>
                    <option value="per-word">Per Word</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Amount (₹)</label>
                  <input 
                    required
                    type="number"
                    value={formData.payAmount}
                    onChange={e => setFormData({...formData, payAmount: e.target.value})}
                    placeholder="e.g. 5000"
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all text-sm text-white placeholder:text-slate-700 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Duration</label>
                  <input 
                    required
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g. 2 weeks, 3 months..."
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all text-sm text-white placeholder:text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Open Spots</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={formData.spotsAvailable}
                    onChange={e => setFormData({...formData, spotsAvailable: Number(e.target.value)})}
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all text-sm text-white"
                  />
                </div>
              </div>
            </section>

            {/* Description & Skills */}
            <section className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Requirements & Details
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Job Description</label>
                  <textarea 
                    required
                    rows={6}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the tasks, responsibilities and what you're looking for in a student..."
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all text-sm text-white placeholder:text-slate-700 resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Skills Required</label>
                  <div className="flex gap-2">
                    <input 
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="e.g. React, Python, Canva..."
                      className="flex-1 px-5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm text-white"
                    />
                    <button 
                      type="button"
                      onClick={addSkill}
                      className="px-6 py-3 bg-white/[0.05] rounded-xl text-xs font-bold hover:bg-white/[0.1] transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skillsRequired.map(skill => (
                      <span key={skill} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                        {skill}
                        <button type="button" onClick={() => setFormData({...formData, skillsRequired: formData.skillsRequired.filter(s => s !== skill)})} className="hover:text-white transition-colors">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="flex items-center gap-4 pt-6">
              <button 
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:text-white transition-colors"
              >
                Discard Draft
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] py-4 rounded-2xl text-sm font-bold bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? "Posting Job..." : "Post Job Opportunity"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
