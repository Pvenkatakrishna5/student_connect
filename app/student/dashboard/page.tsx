"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/layout/Shell";
import { useSession } from "next-auth/react";
import { 
  Loader2, 
  TrendingUp, 
  Briefcase, 
  CheckCircle2, 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  Star,
  MapPin,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<{ totalEarned: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [appsRes, jobsRes, earningsRes] = await Promise.all([
          fetch(`/api/applications?studentId=${session.user.id}`),
          fetch(`/api/jobs/recommended?studentId=${session.user.id}`),
          fetch(`/api/student/earnings?studentId=${session.user.id}`),
        ]);
        const appsData = await appsRes.json();
        const jobsData = await jobsRes.json();
        const earnings = await earningsRes.json();
        
        setApplications(Array.isArray(appsData) ? appsData : []);
        setRecommendedJobs(Array.isArray(jobsData) ? jobsData : []);
        setEarningsData(earnings?.error ? null : earnings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session?.user?.id]);

  const stats = [
    { 
      label: "Applications Sent", 
      value: applications.length, 
      icon: <Briefcase className="w-5 h-5 text-indigo-400" />, 
      color: "from-indigo-500/10 to-blue-500/10",
      border: "border-indigo-500/20",
      trend: "+2 this week"
    },
    { 
      label: "Active Reviews", 
      value: applications.filter(a => a.status === "applied").length, 
      icon: <Clock className="w-5 h-5 text-amber-400" />, 
      color: "from-amber-500/10 to-orange-500/10",
      border: "border-amber-500/20",
      trend: "Awaiting response"
    },
    { 
      label: "Total Earnings", 
      value: earningsData?.totalEarned ? `₹${earningsData.totalEarned.toLocaleString()}` : "₹0", 
      icon: <Wallet className="w-5 h-5 text-emerald-400" />, 
      color: "from-emerald-500/10 to-teal-500/10",
      border: "border-emerald-500/20",
      trend: "Paid this month"
    },
    { 
      label: "Success Rate", 
      value: applications.length > 0 ? `${Math.round((applications.filter(a => ["selected", "shortlisted"].includes(a.status)).length / applications.length) * 100)}%` : "0%", 
      icon: <Star className="w-5 h-5 text-rose-400" />, 
      color: "from-rose-500/10 to-pink-500/10",
      border: "border-rose-500/20",
      trend: "Shortlisted/Hired"
    },
  ];

  if (loading) {
    return (
      <Shell title="Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
            <Loader2 className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Welcome back!">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-[32px] bg-gradient-to-br ${stat.color} border ${stat.border} relative overflow-hidden group hover:scale-[1.02] transition-transform`}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md">
                  {stat.icon}
                </div>
                <TrendingUp className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
              </div>
              <div className="mt-6 relative z-10">
                <div className="text-3xl font-black text-white tracking-tight">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider relative z-10">
                <CheckCircle2 className="w-3 h-3" /> {stat.trend}
              </div>
              {/* Decorative elements */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommended Jobs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Recommended for You <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Based on your skills and profile</p>
              </div>
              <Link href="/student/jobs" className="text-xs font-bold text-indigo-400 hover:text-white transition-colors flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {recommendedJobs.length > 0 ? (
                recommendedJobs.slice(0, 4).map((job, i) => (
                  <motion.div
                    key={job.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="p-5 rounded-[24px] bg-white/[0.02] border border-white/[0.04] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg group-hover:scale-110 transition-transform">
                          {job.title?.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{job.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> {job.employer?.companyName || "Company"}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {job.location || "Remote"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-white">₹{job.budget || job.pay}<span className="text-[10px] text-slate-500 font-normal ml-0.5">/hr</span></div>
                        <Link 
                          href={`/student/jobs/${job.id}`}
                          className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Details <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-12 rounded-[32px] bg-white/[0.01] border border-dashed border-white/[0.08] text-center">
                  <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-5 h-5 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500 italic">No recommendations yet. Complete your profile to get matched!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-white">Recent Activity</h3>
            </div>

            <div className="p-6 rounded-[32px] bg-white/[0.01] border border-white/[0.04] relative overflow-hidden">
              <div className="space-y-6 relative z-10">
                {applications.length > 0 ? (
                  applications.slice(0, 5).map((app, i) => (
                    <div key={app.id || i} className="flex gap-4 relative group">
                      {i !== Math.min(applications.length, 5) - 1 && (
                        <div className="absolute left-[13px] top-8 bottom-[-24px] w-0.5 bg-white/[0.04]"></div>
                      )}
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center z-10 border ${
                        app.status === "selected" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" :
                        app.status === "rejected" ? "bg-rose-500/20 border-rose-500/40 text-rose-400" :
                        "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"
                      }`}>
                        {app.status === "selected" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="text-xs font-bold text-white leading-tight">
                          {app.status === "applied" ? "Applied to " : 
                           app.status === "selected" ? "Selected for " : 
                           app.status === "shortlisted" ? "Shortlisted for " : 
                           "Application update: "} 
                          <span className="text-indigo-400">{app.jobId?.title || "Role"}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2 uppercase font-bold tracking-wider">
                          {new Date(app.appliedAt).toLocaleDateString()} • {app.status}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-xs text-slate-600 italic">No activity yet</p>
                  </div>
                )}
              </div>
              {/* Background gradient */}
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Quick Action Card */}
            <div className="p-6 rounded-[32px] bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-500/20 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-lg font-black text-white leading-tight">Ready to earn<br/>more?</h4>
                <p className="text-xs text-emerald-100/60 mt-2 font-medium">Update your skills to unlock premium roles.</p>
                <Link 
                  href="/student/profile" 
                  className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-all shadow-lg"
                >
                  Edit Profile <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <Sparkles className="absolute top-4 right-4 w-12 h-12 text-white/10 group-hover:scale-125 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

