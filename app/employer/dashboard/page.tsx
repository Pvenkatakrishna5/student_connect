"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import StatCard from "@/components/dashboard/StatCard";
import { Check, X, Plus, Loader2, Users, Briefcase, Star, TrendingUp, Search, Filter, ExternalLink, Mail, Phone, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

import { Job, Application } from "@/types";

export default function EmployerDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"jobs" | "applicants">("jobs");
  const [postModal, setPostModal] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    payAmount: "",
    payType: "fixed",
    skillsRequired: "",
    description: "",
    category: "Academic",
    location: "Remote",
    isRemote: true,
  });

  const fetchData = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetch(`/api/jobs?employerId=${session.user.id}`),
        fetch(`/api/applications?employerId=${session.user.id}`),
      ]);
      const jobsData = await jobsRes.json();
      const appsData = await appsRes.json();
      setJobs(Array.isArray(jobsData?.jobs) ? jobsData.jobs : []);
      setApplicants(Array.isArray(appsData) ? appsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session?.user?.id]);

  const handlePostJob = async () => {
    if (!session?.user?.id) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          employerId: session.user.id,
          skillsRequired: formData.skillsRequired.split(",").map(s => s.trim()).filter(s => s),
          payAmount: Number(formData.payAmount),
        }),
      });
      if (res.ok) {
        setPostModal(false);
        fetchData();
        setFormData({
          title: "",
          payAmount: "",
          payType: "fixed",
          skillsRequired: "",
          description: "",
          category: "Academic",
          location: "Remote",
          isRemote: true,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateAppStatus = async (appId: string, newStatus: Application["status"]) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
      if (res.ok) {
        setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredJobs = jobs.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredApps = applicants.filter(a => 
    a.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.student?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="employer" userName={session?.user?.name || "Employer"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Dashboard <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Employer</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage your workforce and job listings</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search jobs or applicants..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 w-64 transition-all"
              />
            </div>
            <button 
              onClick={() => setPostModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Post New Job
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard label="Active Jobs" value={jobs.length.toString()} subtext="Open for applications" icon={<Briefcase className="w-5 h-5" />} trend="up" />
            <StatCard label="Total Applicants" value={applicants.length.toString()} subtext="Across all postings" icon={<Users className="w-5 h-5" />} trend="up" />
            <StatCard label="Shortlisted" value={applicants.filter(a => a.status === "shortlisted").length.toString()} subtext="High potential" icon={<Star className="w-5 h-5" />} accent />
            <StatCard label="Hiring Rate" value="78%" subtext="Successful fills" icon={<TrendingUp className="w-5 h-5" />} />
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-8 border-b border-white/[0.04] mb-8">
            <button 
              onClick={() => setActiveTab("jobs")}
              className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === "jobs" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
            >
              My Listings
              {activeTab === "jobs" && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981]" />}
            </button>
            <button 
              onClick={() => setActiveTab("applicants")}
              className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === "applicants" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
            >
              Applications
              {activeTab === "applicants" && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981]" />}
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
              <p className="text-slate-500 font-medium">Fetching dashboard data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "jobs" ? (
                <motion.div 
                  key="jobs-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-4"
                >
                  {filteredJobs.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white/[0.02] rounded-3xl border border-white/[0.04]">
                      <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400">No jobs found matching your criteria</p>
                    </div>
                  ) : filteredJobs.map((job) => (
                    <div key={job.id} className="p-6 bg-white/[0.02] border border-white/[0.04] rounded-3xl hover:bg-white/[0.04] transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{job.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-400 border border-white/[0.05]">{job.category}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" /> {job.applicantsCount || 0} Applicants</span>
                          </div>
                        </div>
                        <div className={`text-xs font-bold px-3 py-1 rounded-full ${job.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"}`}>
                          {job.status.toUpperCase()}
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-6">{job.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                        <div className="text-lg font-mono font-bold text-white">
                          ₹{job.payAmount}<span className="text-xs text-slate-500 font-normal">/{job.payType}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 transition-colors">
                            <Filter className="w-4 h-4" />
                          </button>
                          <button className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 text-xs font-bold transition-all border border-transparent hover:border-emerald-500/20">
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="apps-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {filteredApps.length === 0 ? (
                    <div className="py-20 text-center bg-white/[0.02] rounded-3xl border border-white/[0.04]">
                      <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400">No applications received yet</p>
                    </div>
                  ) : filteredApps.map((app) => (
                    <div key={app.id} className="p-5 bg-white/[0.02] border border-white/[0.04] rounded-2xl hover:border-white/[0.08] transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center border border-white/[0.06]">
                            <span className="text-lg font-bold text-emerald-400">{app.student?.name?.charAt(0)}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-white flex items-center gap-2">
                              {app.student?.name} 
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase tracking-tighter">Verified</span>
                            </h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {app.student?.skills?.slice(0, 3).map((skill: string) => (
                                <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.05]">
                                  {skill}
                                </span>
                              ))}
                              {app.student?.skills && app.student.skills.length > 3 && (
                                <span className="text-[9px] text-slate-500">+{app.student.skills.length - 3} more</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-1">Applied for <span className="text-emerald-400/80">{app.job?.title}</span></p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(app.appliedAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {app.student?.user?.email || "N/A"}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {app.status === "applied" && (
                              <>
                                <button 
                                  onClick={() => updateAppStatus(app.id, "shortlisted")}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                                >
                                  Shortlist
                                </button>
                                <button 
                                  onClick={() => updateAppStatus(app.id, "rejected")}
                                  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {app.status === "shortlisted" && (
                              <>
                                <button 
                                  onClick={() => updateAppStatus(app.id, "selected")}
                                  className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all"
                                >
                                  Select for Hire
                                </button>
                                <button 
                                  onClick={() => updateAppStatus(app.id, "rejected")}
                                  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {app.status !== "applied" && app.status !== "shortlisted" && (
                              <span className={`text-[10px] font-black px-3 py-1 rounded-md tracking-widest uppercase ${
                                app.status === "selected" ? "bg-blue-500/20 text-blue-400" : 
                                app.status === "rejected" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-slate-400"
                              }`}>
                                {app.status}
                              </span>
                            )}
                            <button className="p-2 rounded-lg bg-white/[0.04] text-slate-500 hover:text-white transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Post Job Modal */}
      <AnimatePresence>
        {postModal && (
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
              className="w-full max-w-2xl bg-[#111118] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-2xl shadow-emerald-500/5"
            >
              <div className="flex items-center justify-between p-8 border-b border-white/[0.04]">
                <div>
                  <h2 className="text-2xl font-bold text-white">Create New Opportunity</h2>
                  <p className="text-sm text-slate-500 mt-1">Fill in the details for your job posting</p>
                </div>
                <button onClick={() => setPostModal(false)} className="p-2 rounded-full hover:bg-white/[0.05] text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Job Title</label>
                    <input 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      placeholder="e.g. Graphic Designer for Social Media"
                      className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Category</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-5 py-3.5 bg-[#1a1a24] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all appearance-none"
                    >
                      {["Academic", "Technical", "Creative", "Events", "Delivery"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Pay Type</label>
                    <select 
                      value={formData.payType} 
                      onChange={e => setFormData({...formData, payType: e.target.value})}
                      className="w-full px-5 py-3.5 bg-[#1a1a24] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all appearance-none"
                    >
                      {["fixed", "hourly", "monthly", "per-day", "per-word"].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Pay Amount (₹)</label>
                    <input 
                      type="number"
                      value={formData.payAmount} 
                      onChange={e => setFormData({...formData, payAmount: e.target.value})}
                      placeholder="500"
                      className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Location</label>
                    <input 
                      value={formData.location} 
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g. Remote or City Name"
                      className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Skills Required (Comma separated)</label>
                    <input 
                      value={formData.skillsRequired} 
                      onChange={e => setFormData({...formData, skillsRequired: e.target.value})}
                      placeholder="Photoshop, Illustrator, Canva"
                      className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Description</label>
                    <textarea 
                      rows={4}
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="What needs to be done?"
                      className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/[0.04] bg-white/[0.01] flex gap-4">
                <button 
                  onClick={() => setPostModal(false)}
                  className="flex-1 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handlePostJob}
                  disabled={submitting || !formData.title || !formData.payAmount}
                  className="flex-[2] py-4 rounded-2xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {submitting ? "Publishing listing..." : "Publish Job Post"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
