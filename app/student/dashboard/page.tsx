"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/layout/Shell";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<any>(null);
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

  const stats = {
    applied: applications.length,
    inReview: applications.filter(a => a.status === "applied").length,
    selected: applications.filter(a => a.status === "selected" || a.status === "shortlisted").length,
    earnings: earningsData?.totalEarned ? `₹${earningsData.totalEarned.toLocaleString()}` : "₹0",
  };

  if (loading) {
    return (
      <Shell title="Dashboard">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e0f5ef" }}>📋</div>
          <div className="stat-val">{stats.applied}</div>
          <div className="stat-lbl">Applications Sent</div>
          <div className="stat-trend trend-up">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#eff6ff" }}>💬</div>
          <div className="stat-val">{stats.inReview}</div>
          <div className="stat-lbl">In Review</div>
          <div className="stat-trend trend-up">Awaiting response</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fffbeb" }}>💰</div>
          <div className="stat-val">{stats.earnings}</div>
          <div className="stat-lbl">Total Earned</div>
          <div className="stat-trend trend-up">Paid this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ede9ff" }}>⭐</div>
          <div className="stat-val">{stats.selected}</div>
          <div className="stat-lbl">Success Rate</div>
          <div className="stat-trend trend-up">Shortlisted/Hired</div>
        </div>
      </div>
      
      <div className="two-col">
        <div className="card">
          <div className="sec-hd">
            <div className="sec-title">Recommended Jobs</div>
            <a href="/student/jobs" className="sec-link">View all</a>
          </div>
          {recommendedJobs.slice(0, 3).map((j, i) => (
            <div key={j._id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="jc-logo" style={{ background: "#e0f5ef", color: "#0d7a5a", width: "30px", height: "30px", fontSize: "10px" }}>
                  {j.title?.slice(0, 2).toUpperCase() || "JB"}
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 500 }}>{j.title}</div>
                  <div style={{ fontSize: "10px", color: "var(--text2)" }}>{j.employerId?.companyName || "Company"} · ₹{j.budget || j.pay}/hr</div>
                </div>
              </div>
              <span className={`badge badge-${j.locationType?.toLowerCase() === "remote" ? "remote" : "local"}`}>{j.locationType || "Remote"}</span>
            </div>
          ))}
          {recommendedJobs.length === 0 && (
            <div style={{ fontSize: "12px", color: "var(--text3)", textAlign: "center", padding: "20px 0" }}>No recommendations yet</div>
          )}
        </div>
        
        <div className="card">
          <div className="sec-hd">
            <div className="sec-title">Recent Activity</div>
          </div>
          {applications.slice(0, 4).map((a, i) => (
            <div key={a._id || i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "#e0f5ef", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>📤</div>
              <div>
                <div style={{ fontSize: "12px" }}>Applied to {a.jobId?.title || "a job"}</div>
                <div style={{ fontSize: "10px", color: "var(--text3)" }}>{new Date(a.appliedAt).toLocaleDateString()} · {a.status}</div>
              </div>
            </div>
          ))}
          {applications.length === 0 && (
            <div style={{ fontSize: "12px", color: "var(--text3)", textAlign: "center", padding: "20px 0" }}>No activity yet</div>
          )}
        </div>
      </div>
    </Shell>
  );
}
