"use client";
import { useState, useEffect, Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useSession } from "next-auth/react";
import { MessageSquare, AlertTriangle, ShieldCheck, Send, Loader2, Info, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

function SupportPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [issueType, setIssueType] = useState("payment");
  const [description, setDescription] = useState("");

  useEffect(() => {
    // Check for query params
    const reason = searchParams.get("reason");
    const job = searchParams.get("job");
    const employer = searchParams.get("employer");

    if (reason) setIssueType(reason);
    if (job && employer) {
      setDescription(`Reporting an issue with project "${job}" from employer "${employer}". \n\nDetails: `);
    }

    // Find the admin to message
    const fetchAdmin = async () => {
      try {
        const res = await fetch("/api/admin/support");
        const data = await res.json();
        if (data.adminId) setAdminId(data.adminId);
      } catch (err) {
        console.error("Failed to find admin", err);
      }
    };
    fetchAdmin();
  }, [searchParams]);

  const handleContactAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId || !description.trim()) return;

    setLoading(true);
    try {
      const message = `[ISSUE: ${issueType.toUpperCase()}] ${description}`;
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: adminId, content: message }),
      });

      if (res.ok) {
        // Redirect to messages with the admin selected
        router.push(`/student/messages?userId=${adminId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="student" userName={session?.user?.name || "Student"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Help & Support <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </h1>
            <p className="text-sm text-slate-500 mt-1">We're here to ensure your work and payments are safe</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Warning Banner */}
            <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex gap-4">
              <AlertTriangle className="w-6 h-6 text-indigo-400 flex-shrink-0" />
              <div>
                <h4 className="text-white font-bold mb-1">Payment Protection</h4>
                <p className="text-sm text-indigo-200 leading-relaxed">
                  Always use StudentConnect for payments. If an employer asks you to pay outside the platform or refuses to pay for completed work, report it immediately.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* FAQ/Info */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                  <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Common Issues</h5>
                  <div className="space-y-3">
                    <button onClick={() => setIssueType("payment")} className={`w-full text-left p-3 rounded-xl text-xs transition-all ${issueType === 'payment' ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/[0.03] text-slate-400'}`}>Employer hasn't paid</button>
                    <button onClick={() => setIssueType("harassment")} className={`w-full text-left p-3 rounded-xl text-xs transition-all ${issueType === 'harassment' ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/[0.03] text-slate-400'}`}>Unprofessional behavior</button>
                    <button onClick={() => setIssueType("technical")} className={`w-full text-left p-3 rounded-xl text-xs transition-all ${issueType === 'technical' ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/[0.03] text-slate-400'}`}>Technical platform issue</button>
                    <button onClick={() => setIssueType("other")} className={`w-full text-left p-3 rounded-xl text-xs transition-all ${issueType === 'other' ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/[0.03] text-slate-400'}`}>Something else</button>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-4">
                  <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-emerald-200/60 leading-relaxed uppercase font-bold tracking-widest">
                    Admins usually respond within 2-4 hours during business days.
                  </p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="md:col-span-2">
                <form onSubmit={handleContactAdmin} className="p-8 rounded-[40px] bg-white/[0.01] border border-white/[0.04] space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Describe the problem</label>
                    <textarea 
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={8}
                      placeholder="Please provide details including the job title and employer name..."
                      className="w-full px-6 py-5 bg-white/[0.02] border border-white/[0.06] rounded-3xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all text-sm text-white placeholder:text-slate-700 resize-none leading-relaxed"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading || !adminId}
                    className="w-full py-5 rounded-2xl bg-indigo-500 text-white font-black text-sm hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5" /> Start Support Chat <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#050508] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    }>
      <SupportPageContent />
    </Suspense>
  );
}
