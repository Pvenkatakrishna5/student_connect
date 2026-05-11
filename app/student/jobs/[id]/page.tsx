"use client";
import { use, useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { JOB_CATEGORY_ICONS } from "@/lib/data";
import { MapPin, Clock, Calendar, Users, Star, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import JobCard from "@/components/jobs/JobCard";
import { useSession } from "next-auth/react";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error("Job not found");
        const data = await res.json();
        setJob(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!session?.user?.id) {
      setError("Please login to apply");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: id,
          studentId: session.user.id,
          coverNote,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to apply");
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#0A0A0F" }}>
      <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#6C63FF" }} />
    </div>
  );

  if (error || !job) return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center" style={{ background: "#0A0A0F" }}>
      <div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: "#F0F0FF" }}>{error || "Job not found"}</h1>
        <Link href="/student/jobs" className="btn-primary px-6 py-2">Back to Jobs</Link>
      </div>
    </div>
  );

  const payDisplay = job.payType === "hourly" ? `₹${job.payAmount}/hr`
    : job.payType === "monthly" ? `₹${job.payAmount}/month`
    : job.payType === "per-word" ? `₹${job.payAmount}/word`
    : job.payType === "per-day" ? `₹${job.payAmount}/day`
    : `₹${job.payAmount} fixed`;

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="student" userName={session?.user?.name || "Student"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Link href="/student/jobs" className="p-2 rounded-xl hover:bg-white/[0.05] text-slate-400 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">{job.title}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span>{job.employer?.companyName}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.isRemote ? "Remote" : job.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="text-right mr-4">
                <div className="text-lg font-black text-emerald-400">{payDisplay}</div>
                <div className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">{job.payType} Budget</div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Main Content */}
              <div className="p-10 rounded-[48px] bg-white/[0.01] border border-white/[0.04] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <div className="text-8xl font-black">{JOB_CATEGORY_ICONS[job.category] || "💼"}</div>
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { icon: <MapPin className="w-4 h-4 text-rose-400" />, label: "Location", val: job.isRemote ? "Remote" : job.location },
                      { icon: <Clock className="w-4 h-4 text-amber-400" />, label: "Duration", val: job.duration },
                      { icon: <Calendar className="w-4 h-4 text-indigo-400" />, label: "Start Date", val: job.startDate || "Immediate" },
                      { icon: <Users className="w-4 h-4 text-emerald-400" />, label: "Openings", val: `${job.spotsAvailable} Spots` },
                    ].map(m => (
                      <div key={m.label} className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{m.icon} {m.label}</div>
                        <div className="text-sm font-bold text-white">{m.val}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">About the Role</h3>
                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">Skills & Requirements</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skillsRequired.map((s: string) => (
                        <span key={s} className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Section */}
              <div className="p-8 rounded-[40px] bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10">
                {submitted ? (
                  <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Application Submitted!</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">The employer has been notified. You can track this in your applications dashboard.</p>
                    <Link href="/student/applications" className="inline-block px-6 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:scale-105 transition-transform">
                      Track Application
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">Apply for this position</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        <Users className="w-3 h-3" /> {job.applicantsCount} already applied
                      </div>
                    </div>
                    
                    <textarea 
                      value={coverNote} 
                      onChange={e => setCoverNote(e.target.value)} 
                      rows={4}
                      placeholder="Why are you a great fit for this role? (Optional)"
                      className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all text-sm text-white placeholder:text-slate-700 resize-none"
                    />

                    <button 
                      onClick={handleApply}
                      disabled={submitting}
                      className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm uppercase tracking-widest hover:scale-[1.01] transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Application"}
                    </button>
                    {error && <p className="text-center text-xs text-rose-500 font-bold">{error}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Employer Information</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-xl">
                    🏢
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{job.employer?.companyName}</h4>
                    <p className="text-xs text-slate-500">{job.employer?.city || job.location}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.04]">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold">{job.employer?.rating || "4.8"}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Employer Rating</span>
                </div>
                <button className="w-full py-3 rounded-xl bg-white/[0.04] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all">
                  View Company Profile
                </button>
              </div>

              <div className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-600/10 to-transparent border border-white/[0.04] space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Secure Payments</h4>
                <p className="text-xs text-slate-500 leading-relaxed">All payments are handled through our secure platform. 100% protection for students.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
