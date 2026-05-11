"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Plus, Search, Filter, Clock, CheckCircle, XCircle, MoreVertical, Pencil, Trash2, Eye, Loader2, Sparkles, AlertCircle, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ManageJobs() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchJobs = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?employerId=${session.user.id}`);
      const data = await res.json();
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [session?.user?.id]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || job.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "pending": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "closed": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "bg-white/5 text-slate-400 border-white/10";
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="employer" userName={session?.user?.name || "Employer"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Manage Job Posts <Sparkles className="w-5 h-5 text-indigo-400" />
            </h1>
            <p className="text-sm text-slate-500 mt-1">Create, edit and monitor your active listings</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/employer/jobs/new">
              <button className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                <Plus className="w-4 h-4" /> Post New Job
              </button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] focus-within:border-indigo-500/40 transition-all">
              <Search className="w-4 h-4 text-slate-500" />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search your jobs..."
                className="bg-transparent text-sm outline-none flex-1 text-white placeholder:text-slate-600"
              />
            </div>
            
            <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-x-auto no-scrollbar">
              {["all", "active", "pending", "closed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    filter === f ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-slate-500 font-medium">Loading your listings...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.01] border border-white/[0.04] rounded-[48px]">
              <div className="w-20 h-20 rounded-[32px] bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mb-8">
                {search || filter !== "all" 
                  ? "No results match your current search or filters." 
                  : "You haven't posted any jobs yet. Start hiring top student talent today!"}
              </p>
              {!search && filter === "all" && (
                <Link href="/employer/jobs/new">
                  <button className="px-8 py-3 rounded-2xl bg-indigo-500 text-white font-black text-sm hover:scale-105 transition-all shadow-xl shadow-indigo-500/20">
                    Create First Post
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group p-6 bg-white/[0.01] border border-white/[0.04] rounded-[32px] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all flex items-center gap-6"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform border border-white/[0.04]">
                      {job.category?.charAt(0) || "💼"}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {job.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {job.applicantsCount || 0} Applicants</span>
                        <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> 24 Views</span>
                      </div>
                    </div>

                    <div className="text-right px-6 border-x border-white/[0.04] hidden md:block">
                      <div className="text-sm font-black text-white">₹{job.payAmount?.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">{job.payType}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/employer/applicants?jobId=${job.id}`}>
                        <button className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all" title="View Applicants">
                          <Users className="w-5 h-5" />
                        </button>
                      </Link>
                      <button className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all" title="Edit Job">
                        <Pencil className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
