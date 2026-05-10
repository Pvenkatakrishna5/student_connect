"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRight, ArrowLeft, Check, Loader2, Zap, ShieldCheck, Mail, Building2, User, BookOpen, MapPin, Award, Calendar } from "lucide-react";
import { SKILLS_LIST, CITIES, AVAILABILITY_DAYS, AVAILABILITY_SLOTS } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Role = "student" | "employer";
const STEPS = ["Basics", "Academic", "Skills", "Schedule"];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", aadhaarNumber: "", password: "",
    college: "", branch: "", year: "", city: "",
    companyName: "", contactName: "",
    skills: [] as string[],
    availability: {} as Record<string, string[]>,
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let interval: any;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  function set(field: string, val: unknown) { setForm(f => ({ ...f, [field]: val })); }
  function toggleSkill(s: string) { set("skills", form.skills.includes(s) ? form.skills.filter(x => x !== s) : [...form.skills, s]); }
  function toggleAvail(day: string, slot: string) {
    const current = form.availability[day] || [];
    const updated = current.includes(slot) ? current.filter(s => s !== slot) : [...current, slot];
    set("availability", { ...form.availability, [day]: updated });
  }

  async function sendOtp() {
    if (!form.phone) { setError("Please enter your mobile number first"); return; }
    setIsSending(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
      });
      if (res.ok) { setOtpSent(true); setTimer(60); setError(""); }
    } catch { setError("Failed to send OTP"); }
    finally { setIsSending(false); }
  }

  async function verifyOtp() {
    setIsSending(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, code: otpCode }),
      });
      if (res.ok) {
        setIsVerified(true);
        setOtpSent(false);
        setStep(1);
        setError("");
      } else {
        setError("Invalid or expired OTP");
      }
    } catch { setError("Verification failed"); }
    finally { setIsSending(false); }
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push(role === "employer" ? "/employer/dashboard" : "/student/dashboard");
    } catch { setError("Something went wrong. Please try again."); setLoading(false); }
  }

  const labelCls = "text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 block mb-2";
  const inputCls = "w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all outline-none placeholder:text-slate-700";

  return (
    <div className="min-h-screen flex bg-[#050508]">
      {/* Left Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[40%] p-16 relative overflow-hidden bg-[#0A0A0F] border-r border-white/[0.04]">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[80px]" />
        </div>

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-black">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">StudentConnect</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-6">
            Build your professional <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent italic">identity.</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-sm mb-12">
            The most powerful marketplace for students in India. Verified profiles get 4× more opportunities.
          </p>
          
          <div className="flex items-center gap-4 p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.04]">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0F] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">U{i}</div>
              ))}
            </div>
            <p className="text-xs text-slate-500"><span className="text-white font-bold">2,418+</span> students joined this week</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Verification
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <Check className="w-4 h-4 text-indigo-500" /> Skill Matching
          </div>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 overflow-y-auto">
        <div className="w-full max-w-xl space-y-10">
          <header className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black text-white">Create Account</h1>
              <div className="flex p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                {(["student", "employer"] as Role[]).map(r => (
                  <button 
                    key={r} 
                    type="button"
                    onClick={() => { setRole(r); setStep(0); }}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      role === r ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {role === "student" && (
              <div className="flex items-center gap-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                {STEPS.map((_, i) => (
                  <div key={i} className={`flex-1 h-full transition-all duration-500 ${i <= step ? "bg-emerald-500" : "bg-transparent"}`} />
                ))}
              </div>
            )}
          </header>
          <form 
            onSubmit={(e) => { e.preventDefault(); if (role === "employer" || step === 3) handleSubmit(); }}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key={role + (role === "student" ? step : "")}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {error && <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">{error}</div>}

                {/* Employer Form */}
                {role === "employer" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className={labelCls}>Company Name</label>
                        <input className={inputCls} placeholder="CreativeEdge Studio" value={form.companyName} onChange={e => set("companyName", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className={labelCls}>Contact Person</label>
                        <input className={inputCls} placeholder="Suresh Kumar" value={form.contactName} onChange={e => set("contactName", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Email Address</label>
                      <input type="email" className={inputCls} placeholder="suresh@company.in" value={form.email} onChange={e => set("email", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className={labelCls}>Phone Number</label>
                        <input className={inputCls} placeholder="+91 9876543210" value={form.phone} onChange={e => set("phone", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className={labelCls}>Primary City</label>
                        <select className={inputCls} value={form.city} onChange={e => set("city", e.target.value)}>
                          <option value="">Select city</option>
                          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Account Password</label>
                      <input type="password" className={inputCls} placeholder="Min 8 characters" value={form.password} onChange={e => set("password", e.target.value)} />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Employer Workspace <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                )}

                {/* Student Step 0 — Basics */}
                {role === "student" && step === 0 && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className={labelCls}>Full Legal Name</label>
                      <input className={inputCls} placeholder="Arjun Kumar" value={form.name} onChange={e => set("name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Student Email</label>
                      <input type="email" className={inputCls} placeholder="arjun@iitm.ac.in" value={form.email} onChange={e => set("email", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className={labelCls}>Mobile Contact</label>
                        <input className={inputCls} placeholder="+91 9876543210" value={form.phone} onChange={e => set("phone", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className={labelCls}>Aadhaar Number (12 Digits)</label>
                        <input 
                          className={inputCls} 
                          placeholder="0000 0000 0000" 
                          maxLength={14}
                          value={form.aadhaarNumber} 
                          onChange={e => {
                            let v = e.target.value.replace(/\D/g, '');
                            if (v.length > 12) v = v.slice(0, 12);
                            const formatted = v.replace(/(\d{4})/g, '$1 ').trim();
                            set("aadhaarNumber", formatted);
                          }} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Password</label>
                      <input type="password" className={inputCls} placeholder="Min 8 characters" value={form.password} onChange={e => set("password", e.target.value)} />
                    </div>
                    {isVerified ? (
                      <button type="button" onClick={() => setStep(1)} className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10">
                        Next Step <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={sendOtp} 
                        disabled={isSending}
                        className="w-full py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white font-black text-sm hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-3 shadow-xl"
                      >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Mobile Number <ShieldCheck className="w-4 h-4" /></>}
                      </button>
                    )}
                  </div>
                )}

                {/* Student Step 1 — Academic */}
                {role === "student" && step === 1 && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className={labelCls}>College / University Name</label>
                      <input className={inputCls} placeholder="IIT Madras" value={form.college} onChange={e => set("college", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className={labelCls}>Major / Branch</label>
                        <input className={inputCls} placeholder="Computer Science" value={form.branch} onChange={e => set("branch", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className={labelCls}>Academic Year</label>
                        <select className={inputCls} value={form.year} onChange={e => set("year", e.target.value)}>
                          <option value="">Select</option>
                          {["1st Year", "2nd Year", "3rd Year", "4th Year", "PG"].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Current City</label>
                      <select className={inputCls} value={form.city} onChange={e => set("city", e.target.value)}>
                        <option value="">Select city</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setStep(0)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button type="button" onClick={() => setStep(2)} className="flex-[2] py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10">
                        Skills Profile <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Student Step 2 — Skills */}
                {role === "student" && step === 2 && (
                  <div className="space-y-6">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Select your core competencies</p>
                    <div className="flex flex-wrap gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {SKILLS_LIST.map(s => {
                        const selected = form.skills.includes(s);
                        return (
                          <button 
                            key={s} 
                            type="button"
                            onClick={() => toggleSkill(s)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              selected 
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" 
                                : "bg-white/[0.02] border-white/[0.06] text-slate-600 hover:border-white/[0.1] hover:text-slate-400"
                            }`}
                          >
                            {selected && <Check className="inline-block w-3 h-3 mr-1" />} {s}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button type="button" onClick={() => setStep(3)} className="flex-[2] py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10">
                        Work Schedule <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Student Step 3 — Schedule */}
                {role === "student" && step === 3 && (
                  <div className="space-y-6">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Define your availability</p>
                    <div className="overflow-x-auto rounded-3xl border border-white/[0.04] bg-white/[0.01]">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/[0.04]">
                            <th className="p-4 text-[10px] font-black uppercase text-slate-600">Day</th>
                            {AVAILABILITY_SLOTS.map(slot => (
                              <th key={slot} className="p-4 text-[10px] font-black uppercase text-slate-600 text-center">{slot}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {AVAILABILITY_DAYS.map(day => (
                            <tr key={day}>
                              <td className="p-4 text-xs font-bold text-white">{day}</td>
                              {AVAILABILITY_SLOTS.map(slot => {
                                const checked = (form.availability[day] || []).includes(slot);
                                return (
                                  <td key={slot} className="p-2">
                                    <button 
                                      type="button"
                                      onClick={() => toggleAvail(day, slot)}
                                      className={`w-full py-2 rounded-lg text-[10px] font-black transition-all ${
                                        checked ? "bg-emerald-500 text-black" : "bg-white/[0.03] text-slate-700 hover:bg-white/[0.05]"
                                      }`}
                                    >
                                      {checked ? "YES" : "—"}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-[2] py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finalize & Register <Check className="w-4 h-4" /></>}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already part of the network?{" "}
            <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">Sign in here</Link>
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      <AnimatePresence>
        {otpSent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOtpSent(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0A0A0F] border border-white/[0.08] rounded-[40px] p-10 overflow-hidden shadow-2xl text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400 mb-8">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Verify Phone</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                We've sent a 6-digit code to <span className="text-white font-bold">{form.phone}</span>. Please enter it below.
              </p>

              <div className="space-y-6">
                <input 
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  className="w-full text-center text-3xl font-black tracking-[0.5em] py-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none text-white transition-all"
                />

                <div className="flex flex-col gap-4">
                  <button 
                    type="button"
                    onClick={verifyOtp}
                    disabled={isSending || otpCode.length < 6}
                    className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-30"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Proceed"}
                  </button>

                  <div className="text-xs text-slate-600 font-bold">
                    {timer > 0 ? (
                      <span>Resend code in <span className="text-white">{timer}s</span></span>
                    ) : (
                      <button type="button" onClick={sendOtp} className="text-emerald-400 hover:text-emerald-300 transition-all underline">Resend OTP Now</button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

