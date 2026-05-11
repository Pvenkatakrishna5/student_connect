"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { ShieldCheck, Upload, CheckCircle2, Loader2, AlertCircle, Lock, User, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifyPage() {
  const { data: session } = useSession();
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

  useEffect(() => {
    // Check if user is already verified
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.isAadhaarVerified) {
          setIsAlreadyVerified(true);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    if (session?.user) fetchProfile();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (aadhaarNumber.replace(/\s/g, '').length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setLoading(true);

    try {
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await fetch("/api/student/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          aadhaarNumber: aadhaarNumber.replace(/\s/g, ''),
          documentUrl: "simulated_url" 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    // Format as XXXX XXXX XXXX
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setAadhaarNumber(formatted);
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="student" userName={session?.user?.name || "Student"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Identity Verification <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </h1>
            <p className="text-sm text-slate-500 mt-1">Complete your e-KYC to build trust with employers</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto pb-20">
            <AnimatePresence mode="wait">
              {isAlreadyVerified || success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 rounded-[40px] bg-emerald-500/10 border border-emerald-500/20 text-center space-y-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Identity Verified</h2>
                  <p className="text-emerald-200 max-w-md mx-auto">
                    Your profile now has a verified badge. This significantly increases your chances of getting hired for premium part-time roles.
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Info Banner */}
                  <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex gap-4">
                    <Lock className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-bold mb-1">Bank-Grade Security</h4>
                      <p className="text-sm text-indigo-200">Your documents are encrypted end-to-end and stored securely. We only use this information to verify your identity and never share it with third parties.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-8">
                    {error && (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Aadhaar Number</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input 
                            required
                            type="text"
                            value={aadhaarNumber}
                            onChange={handleAadhaarChange}
                            placeholder="0000 0000 0000"
                            className="w-full pl-12 pr-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all text-lg tracking-widest text-white font-mono placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Upload Document (Front & Back)</label>
                        <div className="relative group cursor-pointer">
                          <input 
                            type="file" 
                            accept="image/*,.pdf"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            required
                          />
                          <div className={`p-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center transition-all ${file ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/[0.02] border-white/[0.1] group-hover:bg-white/[0.04] group-hover:border-emerald-500/40'}`}>
                            {file ? (
                              <>
                                <FileText className="w-8 h-8 text-emerald-400 mb-3" />
                                <p className="text-sm font-bold text-emerald-300">{file.name}</p>
                                <p className="text-xs text-emerald-500/70 mt-1">Ready to upload</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-slate-500 mb-3 group-hover:text-emerald-400 transition-colors" />
                                <p className="text-sm font-bold text-white mb-1">Click to upload or drag and drop</p>
                                <p className="text-xs text-slate-500">SVG, PNG, JPG or PDF (max. 5MB)</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading || !file || aadhaarNumber.length < 14}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Processing Verification...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" /> Verify Identity
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
