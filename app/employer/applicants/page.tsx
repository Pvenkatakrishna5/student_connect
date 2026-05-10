"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Search, Filter, Mail, Phone, Calendar, CheckCircle, XCircle, ChevronRight, User, Loader2, ArrowUpRight, MessageSquare, Download, Star, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function EmployerApplicants() {
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [ratingModal, setRatingModal] = useState<{ open: boolean; app: any | null }>({ open: false, app: null });
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchApps = async () => {
      try {
        const res = await fetch(`/api/applications?employerId=${session.user.id}`);
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

  const handleStatusUpdate = async (id: string, status: string, appData?: any) => {
    setProcessingId(id);
    try {
      if (status === "selected") {
        // Trigger Stripe Checkout
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            amount: appData.job.payAmount, 
            description: `Hire for ${appData.job.title}`,
            jobId: appData.job.id,
            applicationId: id
          }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        console.error("Stripe Session Error:", data.error);
      } else {
        const res = await fetch("/api/applications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });
        if (res.ok) {
          setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === "all" || app.status === filter;
    const matchesSearch = 
      app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="employer" userName={session?.user?.name || "Employer"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Applicant Management</h1>
            <p className="text-sm text-slate-500 mt-1">Review and manage candidates for all your jobs</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all w-64"
              />
            </div>
            <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              {["all", "applied", "shortlisted", "selected", "completed", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
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
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-slate-500 font-medium">Loading applicant data...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
              <User className="w-16 h-16 mb-4" />
              <p className="text-lg font-bold">No candidates found</p>
              <p className="text-sm">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredApps.map((app, i) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 bg-white/[0.01] border border-white/[0.04] rounded-[32px] hover:bg-white/[0.02] hover:border-white/[0.08] transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                      {/* Candidate Profile */}
                      <div className="flex items-center gap-4 lg:w-1/3">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/10">
                          {app.student?.name?.[0] || "U"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-lg font-bold text-white truncate flex items-center gap-2">
                            {app.student?.name}
                            {app.student?.isAadhaarVerified && (
                              <span title="Verified Identity">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-0.5">{app.student?.college || "Student"}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button className="text-slate-500 hover:text-white transition-colors"><Mail className="w-4 h-4" /></button>
                            <button className="text-slate-500 hover:text-white transition-colors"><Phone className="w-4 h-4" /></button>
                            <button className="text-slate-500 hover:text-white transition-colors"><MessageSquare className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>

                      {/* Job Info */}
                      <div className="lg:w-1/3 border-l border-white/[0.04] lg:pl-8">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Applying For</p>
                        <h5 className="text-sm font-bold text-white mb-1">{app.job?.title}</h5>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(app.appliedAt).toLocaleDateString()}</span>
                          <span className="px-2 py-0.5 rounded bg-white/5 text-white/60 font-mono">₹{app.job?.payAmount}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:w-1/3 flex items-center justify-end gap-3 border-l border-white/[0.04] lg:pl-8">
                        <div className="flex-1 text-right mr-4 hidden xl:block">
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Status</p>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                            app.status === "selected" ? "text-emerald-400 bg-emerald-500/10" :
                            app.status === "completed" ? "text-purple-400 bg-purple-500/10" :
                            app.status === "rejected" ? "text-rose-400 bg-rose-500/10" :
                            app.status === "shortlisted" ? "text-blue-400 bg-blue-500/10" : "text-slate-400 bg-white/5"
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          {processingId === app.id ? (
                            <div className="p-3"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>
                          ) : (
                            <>
                              {app.status !== "selected" && (
                                <button 
                                  onClick={() => handleStatusUpdate(app.id, "selected", app)}
                                  className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all group"
                                  title="Hire & Pay"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                              )}
                              {app.status === "applied" && (
                                <button 
                                  onClick={() => handleStatusUpdate(app.id, "shortlisted")}
                                  className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all"
                                  title="Shortlist"
                                >
                                  <Star className="w-5 h-5" />
                                </button>
                              )}
                              {app.status === "completed" && (
                                <button 
                                  onClick={() => setRatingModal({ open: true, app })}
                                  className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all animate-pulse"
                                  title="Rate Student"
                                >
                                  <Star className="w-5 h-5 fill-current" />
                                </button>
                              )}
                              <button 
                                onClick={() => router.push(`/employer/messages?userId=${app.student.userId}`)}
                                className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                                title="Chat with Student"
                              >
                                <MessageSquare className="w-5 h-5" />
                              </button>
                              {app.status !== "rejected" && app.status !== "selected" && (
                                <button 
                                  onClick={() => handleStatusUpdate(app.id, "rejected")}
                                  className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              )}
                            </>
                          )}
                          <button className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white transition-all" title="View Profile">
                            <ArrowUpRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Cover Note */}
                    {app.coverNote && (
                      <div className="mt-6 pt-6 border-t border-white/[0.04]">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                          <MessageSquare className="w-3 h-3" /> Candidate Cover Note
                        </p>
                        <p className="text-sm text-slate-400 italic leading-relaxed">
                          "{app.coverNote}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setRatingModal({ open: false, app: null })}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A0A0F] border border-white/[0.08] rounded-[40px] p-10 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
              
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center mx-auto text-purple-400 mb-6">
                  <Star className="w-10 h-10 fill-current" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Rate {ratingModal.app?.student?.name}</h3>
                <p className="text-sm text-slate-500">How was your experience working with this student on the "{ratingModal.app?.job?.title}" project?</p>
              </div>

              <div className="mt-10 flex flex-col items-center gap-8">
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      onClick={() => setRatingScore(star)}
                      className={`p-1 transition-all ${star <= ratingScore ? "text-amber-400 scale-110" : "text-slate-700 hover:text-slate-500"}`}
                    >
                      <Star className={`w-8 h-8 ${star <= ratingScore ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>

                <div className="w-full space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-2">Written Review (Optional)</label>
                  <textarea 
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us about the quality of work, communication, and timeliness..."
                    className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 outline-none text-sm text-white resize-none h-32 transition-all"
                  />
                </div>

                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => setRatingModal({ open: false, app: null })}
                    className="flex-1 py-4 rounded-2xl bg-white/[0.03] text-sm font-bold text-slate-400 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      setLoading(true);
                      const res = await fetch("/api/ratings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          toId: ratingModal.app?.student?.userId,
                          toRole: "student",
                          jobId: ratingModal.app?.job?.id,
                          score: ratingScore,
                          review: reviewText,
                          applicationId: ratingModal.app?.id
                        })
                      });
                      if (res.ok) {
                        setApplications(prev => prev.map(a => a.id === ratingModal.app?.id ? { ...a, status: "hired" } : a)); // Or similar status
                        setRatingModal({ open: false, app: null });
                      }
                      setLoading(false);
                    }}
                    className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-sm hover:scale-[1.02] transition-all shadow-xl shadow-purple-500/20"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
