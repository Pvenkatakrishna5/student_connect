"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import { Briefcase, Search, Loader2, Clock, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AgentJobsPage() {
  const { data: session } = useSession();
  const [pending, setPending] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{ id: string, title: string } | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetch("/api/agent/jobs")
      .then(res => res.json())
      .then(data => {
        setPending(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredJobs = pending.filter(j => 
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.employer?.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (jobId: string, action: "approve" | "reject", rejectReason?: string) => {
    setProcessing(jobId);
    try {
      const res = await fetch("/api/agent/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, action, reason: rejectReason }),
      });
      if (res.ok) {
        toast.success(action === "approve" ? "Job approved and live" : "Job rejected");
        setPending(pending.filter(p => p.id !== jobId));
        if (action === "reject") {
          setRejectionModal(null);
          setReason("");
        }
      } else {
        toast.error("Action failed");
      }
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="agent" userName={session?.user?.name || "Agent"} />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Job Approvals</h1>
              <p className="text-slate-500">Review and approve job postings from employers.</p>
            </div>
          </div>
          <div className="relative max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs..."
              className="pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm outline-none focus:border-amber-500/40 transition-all w-64"
            />
          </div>
        </header>

        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading pending jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-20 text-center opacity-30 border-2 border-dashed border-white/5 rounded-[40px]">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <p className="text-xl font-bold">No Pending Jobs</p>
            <p className="text-sm">All job postings are currently active or processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 bg-white/[0.02] border border-white/[0.04] rounded-[32px] hover:border-white/[0.08] transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                    <div className="flex gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/10">
                        {job.employer?.logo ? (
                          <img src={job.employer.logo} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <Briefcase className="w-8 h-8" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
                        <p className="text-sm text-slate-400 mb-4">{job.employer?.companyName} • {job.location}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skillsRequired?.map((skill: string) => (
                            <span key={skill} className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold">
                            <IndianRupee className="w-4 h-4" />
                            {job.payAmount.toLocaleString()} / {job.payType}
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="w-4 h-4" />
                            Posted {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col items-center lg:items-end gap-3 shrink-0">
                      <button 
                        onClick={() => handleAction(job.id, "approve")}
                        disabled={processing === job.id}
                        className="w-full lg:w-48 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                      >
                        {processing === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve Job"}
                      </button>
                      <button 
                        onClick={() => handleAction(job.id, "reject")}
                        disabled={processing === job.id}
                        className="w-full lg:w-48 py-4 rounded-2xl bg-rose-500/10 text-rose-500 font-black uppercase tracking-widest text-xs hover:bg-rose-500 hover:text-black transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/[0.04]">
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
