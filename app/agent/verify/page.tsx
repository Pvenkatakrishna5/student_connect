"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import { Shield, FileText, Loader2, Search, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AgentVerifyPage() {
  const { data: session } = useSession();
  const [pending, setPending] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{ id: string, name: string } | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetch("/api/agent/verifications")
      .then(res => res.json())
      .then(data => {
        setPending(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredStudents = pending.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.aadhaarNumber?.includes(search)
  );

  const handleAction = async (studentId: string, action: "approve" | "reject", rejectReason?: string) => {
    setProcessing(studentId);
    try {
      const res = await fetch("/api/agent/verifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action, reason: rejectReason }),
      });
      if (res.ok) {
        toast.success(action === "approve" ? "Student verified successfully" : "Verification rejected");
        setPending(pending.filter(p => p.id !== studentId));
        if (action === "reject") {
          setRejectionModal(null);
          setReason("");
        }
      } else {
        toast.error("Action failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="agent" userName={session?.user?.name || "Agent"} />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Verification Queue</h1>
          <p className="text-slate-500">Manual review for Aadhaar identity submissions.</p>
        </header>

        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or Aadhaar..."
              className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm outline-none focus:border-amber-500/40 transition-all"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {filteredStudents.length} Pending Requests
          </div>
        </div>

        <div className="p-4">
            {loading ? (
              <div className="p-20 text-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-500">Loading requests...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-20 text-center opacity-30">
                <Shield className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <p className="text-xl font-bold">Verification Queue Empty</p>
                <p className="text-sm">All pending requests have been processed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredStudents.map((student) => (
                    <motion.div
                      key={student.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-6 rounded-[32px] bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.08] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-xl font-black text-slate-500 border border-white/5 overflow-hidden">
                          {student.profileImage ? (
                            <img src={student.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            student.name[0]
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{student.name}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 uppercase tracking-wider mt-1">
                            <span>{student.college}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-amber-400 font-bold">{student.aadhaarNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleAction(student.id, "reject")}
                          disabled={processing === student.id}
                          className="flex-1 lg:flex-none px-6 py-3 rounded-2xl bg-rose-500/10 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-black transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleAction(student.id, "approve")}
                          disabled={processing === student.id}
                          className="flex-1 lg:flex-none px-8 py-3 rounded-2xl bg-amber-500 text-black text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {processing === student.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>Verify Identity</>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        {/* Info Box */}
        <div className="mt-8 p-6 rounded-[32px] bg-amber-500/5 border border-amber-500/10 flex gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-500 mb-1">Identity Verification Policy</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Before verifying, ensure the student's name matches their official Aadhaar records. 
              Incorrect verifications may lead to account suspension. Use the 'Reject' option if details are suspicious or mismatched.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
