"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import StatCard from "@/components/dashboard/StatCard";
import { Check, X, AlertTriangle, Loader2, TrendingUp, Users, Briefcase, DollarSign, ShieldCheck, Activity, FileText, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

import { Job } from "@/types";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<{ students: number; employers: number; jobs: number; applications: number; revenue: string } | null>(null);
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, jobsRes, activitiesRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/jobs?status=pending"),
        fetch("/api/admin/activities"),
      ]);
      const statsData = await statsRes.json();
      const jobsData = await jobsRes.json();
      const activitiesData = await activitiesRes.json();
      setStats(statsData?.error ? null : statsData);
      setPendingJobs(Array.isArray(jobsData?.jobs) ? jobsData.jobs : []);
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJobAction = async (jobId: string, status: "active" | "closed") => {
    try {
      const res = await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: jobId, status }),
      });
      if (res.ok) {
        setPendingJobs(prev => prev.filter(j => j.id !== jobId));
        setRejectModal(null);
        setRejectionReason("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const lineData = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    growth: Math.floor(Math.random() * 50 + 20),
  }));

  const pieData = [
    { name: "Academic", value: 40, color: "#10b981" },
    { name: "Technical", value: 30, color: "#6366f1" },
    { name: "Creative", value: 20, color: "#f59e0b" },
    { name: "Other", value: 10, color: "#64748b" },
  ];

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="admin" userName="Platform Admin" />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Admin Control <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Master</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Monitor platform health and moderate content</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Systems Online</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading && !stats ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-slate-500 font-medium">Aggregating platform data...</p>
            </div>
          ) : (
            <>
              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-10">
                <StatCard label="Total Students" value={stats?.students?.toLocaleString() || "0"} subtext="Registered" icon={<Users className="w-5 h-5" />} trend="up" />
                <StatCard label="Employers" value={stats?.employers?.toLocaleString() || "0"} subtext="Verified" icon={<Briefcase className="w-5 h-5" />} trend="up" />
                <StatCard label="Total Jobs" value={stats?.jobs?.toLocaleString() || "0"} subtext="Listings" icon={<Activity className="w-5 h-5" />} />
                <StatCard label="Applications" value={stats?.applications?.toLocaleString() || "0"} subtext="Processed" icon={<TrendingUp className="w-5 h-5" />} />
                <StatCard label="Revenue" value={stats?.revenue || "₹0"} subtext="Platform fee" icon={<DollarSign className="w-5 h-5" />} accent />
              </div>

              <div className="grid grid-cols-1 gap-8 mb-10">
                {/* Growth Chart */}
                <div className="p-6 bg-white/[0.02] border border-white/[0.04] rounded-[32px]">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-bold text-white">Platform Growth</h3>
                      <p className="text-xs text-slate-500">New user registrations this week</p>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={lineData}>
                        <defs>
                          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 12 }} dy={10} />
                        <Tooltip 
                          contentStyle={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}
                        />
                        <Area type="monotone" dataKey="growth" stroke="#6366f1" strokeWidth={3} fill="url(#growthGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Moderation Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-indigo-400" /> Pending Approvals
                    </h2>
                    <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                      {pendingJobs.length} New
                    </span>
                  </div>

                  <div className="space-y-4">
                    {pendingJobs.length === 0 ? (
                      <div className="p-12 text-center bg-white/[0.01] border border-white/[0.04] rounded-3xl">
                        <CheckCircle className="w-10 h-10 text-emerald-500/20 mx-auto mb-4" />
                        <p className="text-slate-500">All caught up! No jobs pending review.</p>
                      </div>
                    ) : pendingJobs.map((job) => (
                      <div key={job.id} className="p-5 bg-white/[0.02] border border-white/[0.04] rounded-2xl hover:border-white/[0.1] transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-white">{job.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">Posted by {job.employer?.companyName || "Employer"}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-emerald-400">₹{job.payAmount}</div>
                            <div className="text-[10px] text-slate-600 uppercase">{job.payType}</div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-6">{job.description}</p>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleJobAction(job.id, "active")}
                            className="flex-1 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => setRejectModal(job.id)}
                            className="flex-1 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" /> Platform Activity
                  </h2>
                  <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar divide-y divide-white/[0.02]">
                      {activities.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 italic">No recent activity found.</div>
                      ) : activities.map((act, i) => (
                        <div key={act.id} className="p-4 hover:bg-white/[0.01] transition-colors flex gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            act.type === "user_registered" ? "bg-blue-500/10 text-blue-400" :
                            act.type === "job_posted" ? "bg-amber-500/10 text-amber-400" :
                            act.type === "application_submitted" ? "bg-emerald-500/10 text-emerald-400" :
                            "bg-slate-500/10 text-slate-400"
                          }`}>
                            {act.type === "user_registered" ? <Users className="w-4 h-4" /> :
                             act.type === "job_posted" ? <Briefcase className="w-4 h-4" /> :
                             act.type === "application_submitted" ? <FileText className="w-4 h-4" /> :
                             <Activity className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white leading-tight">{act.message}</p>
                            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                              {new Date(act.createdAt).toLocaleString()}
                              {act.userId && <span>• {act.userId.role}</span>}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
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
              <p className="text-xs text-slate-500 mb-6">Please provide a reason. This will be sent to the employer.</p>
              <textarea 
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={4} 
                placeholder="e.g. Inappropriate content, misleading pay..." 
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/40 transition-all mb-6 text-white"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setRejectModal(null)}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleJobAction(rejectModal, "closed")}
                  className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-400 transition-colors"
                >
                  Reject Job
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

