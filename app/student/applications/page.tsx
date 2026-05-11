"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Search, Filter, Clock, CheckCircle, XCircle, ChevronRight, Briefcase, Building2, MapPin, Loader2, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentApplications() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchApps = async () => {
      try {
        const res = await fetch(`/api/applications?studentId=${session.user.id}`);
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [session?.user?.id]);

  const filteredApps = applications.filter(app => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "selected": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "shortlisted": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "rejected": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "applied": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-white/5 text-slate-400 border-white/10";
    }
  };

  const handleMarkCompleted = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "completed" }),
      });
      if (res.ok) {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, status: "completed" } : app));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="student" userName={session?.user?.name || "Student"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">My Applications</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage your job applications</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              {["all", "applied", "shortlisted", "selected", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
              <p className="text-slate-500 font-medium tracking-tight">Syncing applications...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No applications found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mb-8">
                {filter === "all" 
                  ? "You haven't applied to any jobs yet. Start browsing opportunities now!" 
                  : `No applications with status "${filter}" found.`}
              </p>
              <button className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:scale-105 transition-all">
                Browse Live Jobs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredApps.map((app, i) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="group p-6 bg-white/[0.01] border border-white/[0.04] rounded-3xl hover:bg-white/[0.02] hover:border-white/[0.08] transition-all flex items-center gap-6"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {app.job?.category?.[0] || "💼"}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                          {app.job?.title || "Position Unavailable"}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${getStatusStyle(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {app.job?.employer?.companyName || "Employer"}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {app.job?.location || "Remote"}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-right px-6 border-x border-white/[0.04] hidden md:block">
                      <div className="text-sm font-black text-white">₹{app.job?.payAmount || "0"}</div>
                      <div className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">{app.job?.payType || "Fixed"}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.status === "selected" && (
                        <button 
                          onClick={() => handleMarkCompleted(app.id)}
                          disabled={processingId === app.id}
                          className="px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                        >
                          {processingId === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          Mark Completed
                        </button>
                      )}
                      <button className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
                        <ArrowUpRight className="w-5 h-5" />
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
