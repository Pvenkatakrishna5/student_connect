"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Briefcase, Search, Filter, Clock, CheckCircle, XCircle, MoreVertical, Eye, Loader2, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminJobs() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs?status=" + (filter === "all" ? "" : filter));
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
  }, [filter]);

  const handleAction = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, rejectionReason: status === "closed" ? rejectionReason : undefined }),
      });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== id));
        setRejectModal(null);
        setRejectionReason("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.employer?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="admin" userName={session?.user?.name || "Admin"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Job Moderation <ShieldCheck className="w-6 h-6 text-amber-500" />
            </h1>
            <p className="text-sm text-slate-500 mt-1">Review and approve job listings across the platform</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search jobs or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-64"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Filters */}
          <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-8 w-fit">
            {["pending", "active", "closed", "all"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              <p className="text-slate-500 font-medium">Fetching job listings...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.01] border border-white/[0.04] rounded-[48px]">
              <div className="w-20 h-20 rounded-[32px] bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500/20" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No jobs to review</h3>
              <p className="text-slate-500">All caught up! There are no jobs in this category currently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 rounded-[32px] bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.08] transition-all group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-2xl">
                          {job.category?.charAt(0) || "💼"}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{job.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">by {job.employer?.companyName || "Unknown Employer"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-white">₹{job.payAmount?.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">{job.payType}</div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 line-clamp-2 mb-6 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex items-center gap-6 mb-8 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {job.category}</span>
                      <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> {job.status}</span>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleAction(job.id, "active")}
                        className="flex-1 py-3 rounded-2xl bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-black border border-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve Listing
                      </button>
                      <button 
                        onClick={() => setRejectModal(job.id)}
                        className="flex-1 py-3 rounded-2xl bg-rose-500/10 text-rose-400 text-xs font-bold hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Reject Post
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
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
              className="w-full max-w-sm bg-[#111118] border border-white/[0.08] rounded-[32px] p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-4">Reject Posting</h2>
              <p className="text-xs text-slate-500 mb-6">Provide a reason for rejection. This will be sent to the employer.</p>
              <textarea 
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={4} 
                placeholder="e.g. Content doesn't meet our guidelines..." 
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/40 transition-all mb-6 text-white placeholder:text-slate-700"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setRejectModal(null)}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleAction(rejectModal, "closed")}
                  className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-400 transition-colors"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
