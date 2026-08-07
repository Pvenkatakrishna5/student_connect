"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Loader2, Search, CheckCircle, ShieldCheck, MapPin, XCircle, AlertCircle } from "lucide-react";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      setVerifyingId(id);
      const res = await fetch(`/api/admin/applications/${id}/verify`, { method: "PATCH" });
      if (!res.ok) throw new Error("Verification failed");
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, isAdminVerified: true } : app
      ));
    } catch (err: any) {
      alert(err.message || "Failed to verify application");
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredApps = applications.filter(app => {
    const search = searchTerm.toLowerCase();
    return (
      app.student?.name?.toLowerCase().includes(search) ||
      app.job?.title?.toLowerCase().includes(search) ||
      app.employer?.companyName?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="admin" userName="Platform Admin" />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Application Verification
            </h1>
            <p className="text-sm text-slate-500 mt-1">Review and approve student job applications</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] p-4 rounded-3xl border border-white/[0.04]">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search by student, job, or company..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-sm text-white outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                  {applications.filter(a => !a.isAdminVerified).length} Pending Review
                </span>
                <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  {applications.filter(a => a.isAdminVerified).length} Verified
                </span>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-bold">{error}</p>
                <button onClick={fetchApplications} className="ml-auto px-3 py-1 bg-white/[0.05] rounded-lg text-xs hover:bg-white/[0.1]">Retry</button>
              </div>
            )}

            {/* List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-500 text-sm">Loading applications...</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.01] border border-white/[0.04] rounded-[32px]">
                <CheckCircle className="w-12 h-12 text-emerald-500/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Applications Found</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">There are currently no job applications matching your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredApps.map((app) => (
                  <div key={app.id} className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-3xl hover:border-white/[0.1] transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                    
                    {/* Student Info */}
                    <div className="flex items-center gap-4 flex-[1.5] min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/[0.05] shrink-0">
                        {app.student?.profileImage ? (
                          <img src={app.student.profileImage} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span className="font-black text-indigo-400">{app.student?.name?.[0] || "?"}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white truncate">{app.student?.name || "Unknown Student"}</h4>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-2 mt-1">
                          {app.student?.college} • {app.student?.city}
                        </p>
                      </div>
                    </div>

                    {/* Job Info */}
                    <div className="flex-[2] min-w-0">
                      <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Applying For</p>
                        <h5 className="font-bold text-emerald-400 text-sm truncate">{app.job?.title}</h5>
                        <p className="text-xs text-slate-400 truncate mt-1">at {app.employer?.companyName}</p>
                      </div>
                    </div>

                    {/* Status & Action */}
                    <div className="flex flex-col items-end gap-3 flex-1">
                      {app.isAdminVerified ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Pending</span>
                        </div>
                      )}
                      
                      {!app.isAdminVerified && (
                        <button
                          onClick={() => handleVerify(app.id)}
                          disabled={verifyingId === app.id}
                          className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-black hover:bg-indigo-400 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                          {verifyingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Verify & Accept</>}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
