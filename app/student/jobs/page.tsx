"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import JobCard, { JobCardSkeleton } from "@/components/jobs/JobCard";
import { JOB_CATEGORIES, CITIES } from "@/lib/utils";
import { Search, X, Filter, MapPin, Briefcase, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

import { Job } from "@/types";

export default function JobsPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (location) query.set("location", location);
      if (remoteOnly) query.set("remote", "true");
      
      const res = await fetch(`/api/jobs?${query.toString()}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchJobs, 500);
    return () => clearTimeout(debounce);
  }, [search, location, remoteOnly]);

  const handleApply = async () => {
    if (!session?.user?.id || !applyJobId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: applyJobId,
          studentId: session.user.id,
          coverNote,
        }),
      });
      if (res.ok) {
        setApplyJobId(null);
        setCoverNote("");
        // Refresh jobs to update applicant count or status
        fetchJobs();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to apply");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const activeChips = [
    ...(search ? [{ label: `"${search}"`, clear: () => setSearch("") }] : []),
    ...(location ? [{ label: location, clear: () => setLocation("") }] : []),
    ...(remoteOnly ? [{ label: "Remote only", clear: () => setRemoteOnly(false) }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="student" userName={session?.user?.name || "Student"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Modern Search Header */}
        <header className="sticky top-0 z-30 px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  Find Opportunities <Sparkles className="w-5 h-5 text-emerald-400" />
                </h1>
                <p className="text-sm text-slate-500 mt-1">Discover jobs tailored to your student schedule</p>
              </div>
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-medium text-slate-400">
                <MapPin className="w-3.5 h-3.5" /> Showing jobs in {location || "All Locations"}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] focus-within:border-emerald-500/40 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                <Search className="w-4 h-4 text-slate-500" />
                <input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Search by title, skills or keywords..." 
                  className="bg-transparent text-sm outline-none flex-1 text-white placeholder:text-slate-600"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  className="px-4 py-3 rounded-2xl bg-[#111118] border border-white/[0.06] text-sm outline-none text-slate-400 hover:text-white transition-colors cursor-pointer appearance-none min-w-[140px]"
                >
                  <option value="">Locations</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <button 
                  onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all border ${
                    remoteOnly 
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                      : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:border-white/[0.12]"
                  }`}
                >
                  Remote
                </button>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mr-1">Active Filters:</span>
                {activeChips.map((chip, i) => (
                  <button 
                    key={i} 
                    onClick={chip.clear} 
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all"
                  >
                    {chip.label}
                    <X className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
                <button 
                  onClick={() => { setSearch(""); setLocation(""); setRemoteOnly(false); }} 
                  className="text-[11px] font-bold text-slate-500 hover:text-white px-2 py-1 transition-colors"
                >
                  Reset all
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Recommended Jobs</h2>
              <p className="text-sm text-slate-500">Based on your skills and preferences</p>
            </div>
            <div className="text-xs font-mono text-slate-600">
              {jobs.length} Opportunities Found
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <JobCardSkeleton key={i} />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No jobs match your search</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Try broadening your filters or searching for different keywords to see more results.</p>
              <button 
                onClick={() => { setSearch(""); setLocation(""); setRemoteOnly(false); }}
                className="mt-8 px-6 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {jobs.map(job => (
                <JobCard 
                  key={job.id || job._id} 
                  job={job} 
                  onApply={setApplyJobId} 
                />
              ))}
            </motion.div>
          )}
        </main>
      </div>

      {/* Modern Application Modal */}
      <AnimatePresence>
        {applyJobId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#111118] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Apply for Role</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Applying for <span className="text-emerald-400 font-semibold">{jobs.find(j => (j.id || j._id) === applyJobId)?.title}</span>
                    </p>
                  </div>
                  <button onClick={() => setApplyJobId(null)} className="p-2 rounded-full hover:bg-white/[0.05] text-slate-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Great choice! Your profile, skills, and past ratings will be sent to the employer automatically. Add a note to stand out!
                  </p>
                </div>

                <div className="space-y-2 mb-8">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block px-1">Cover Note (Optional)</label>
                  <textarea 
                    value={coverNote}
                    onChange={e => setCoverNote(e.target.value)}
                    placeholder="Briefly explain why you're a good fit..." 
                    rows={5} 
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all resize-none text-sm text-white placeholder:text-slate-700"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setApplyJobId(null)} 
                    className="flex-1 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleApply}
                    disabled={submitting}
                    className="flex-[2] py-4 rounded-2xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Application"}
                    {!submitting && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
