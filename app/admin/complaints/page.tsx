"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { AlertTriangle, Search, Filter, MessageSquare, User, Flag, CheckCircle, Trash2, Loader2, ArrowRight, ShieldAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminComplaints() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for complaints
  const [complaints, setComplaints] = useState([
    { id: "1", type: "job_report", subject: "Misleading pay amount", reporter: "Rahul S.", target: "Graphic Design Intern", status: "open", date: "2024-05-01" },
    { id: "2", type: "user_report", subject: "Inappropriate communication", reporter: "Pixel Studio", target: "Amit K.", status: "resolved", date: "2024-04-28" },
    { id: "3", type: "payment_issue", subject: "Payment not received", reporter: "Sneha P.", target: "Tech Solutions", status: "open", date: "2024-05-02" },
  ]);

  const resolveComplaint = (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: "resolved" } : c));
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="admin" userName={session?.user?.name || "Admin"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Complaints & Support <ShieldAlert className="w-6 h-6 text-rose-500" />
            </h1>
            <p className="text-sm text-slate-500 mt-1">Resolve platform disputes and user reports</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 w-64"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Active Filters:</span>
                <button className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase border border-rose-500/20">All Types</button>
                <button className="px-3 py-1 rounded-lg bg-white/[0.03] text-slate-500 text-[10px] font-black uppercase border border-white/[0.06]">Pending Only</button>
              </div>
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                {complaints.filter(c => c.status === "open").length} Critical Issues
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {complaints.map((complaint) => (
                <div 
                  key={complaint.id}
                  className={`group p-6 rounded-[32px] bg-white/[0.01] border transition-all flex items-center gap-6 ${
                    complaint.status === "open" ? "border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/[0.01]" : "border-white/[0.04] opacity-60"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    complaint.status === "open" ? "bg-rose-500/10 text-rose-500" : "bg-white/[0.03] text-slate-600"
                  }`}>
                    {complaint.type === "job_report" ? <Flag className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors truncate">{complaint.subject}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${
                        complaint.status === "open" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {complaint.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Reporter: {complaint.reporter}</span>
                      <span className="flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> Target: {complaint.target}</span>
                      <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> {complaint.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {complaint.status === "open" && (
                      <button 
                        onClick={() => resolveComplaint(complaint.id)}
                        className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all"
                        title="Mark as Resolved"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-white transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-12 text-center rounded-[48px] bg-white/[0.01] border border-white/[0.04] border-dashed">
              <p className="text-slate-600 text-sm italic">End of support queue. Stay vigilant!</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
