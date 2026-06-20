"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, User, ShieldCheck, ArrowRight, ArrowLeft, Check, Loader2,
  Zap, Globe, MapPin, Phone, Mail, FileText, Upload, Clock, AlertTriangle
} from "lucide-react";
import { CITIES } from "@/lib/utils";

const SETUP_STEPS = ["Company", "Contact", "Verification"];
const INDUSTRY_TYPES = [
  "Information Technology", "Education", "Healthcare", "Finance", "E-Commerce",
  "Marketing & Advertising", "Media & Entertainment", "Manufacturing",
  "Retail", "Food & Beverage", "Logistics", "Real Estate",
  "Consulting", "Legal", "Non-Profit", "Startup", "Other"
];
const COMPANY_SIZES = [
  "1-10 employees", "11-50 employees", "51-200 employees",
  "201-500 employees", "501-1000 employees", "1000+ employees"
];

export default function EmployerProfileSetup() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    // Company Info
    companyName: "",
    description: "",
    industryType: "",
    website: "",
    companyAddress: "",
    city: "",
    companySize: "",
    // Contact Info
    contactName: "",
    hrDesignation: "",
    phone: "",
    // Verification
    businessRegNo: "",
    gstNo: "",
    verificationDocUrl: "",
  });

  // Fetch existing profile data
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "employer") {
      router.push("/student/profile/setup");
      return;
    }

    async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.profileCompleted) {
            router.push("/employer/dashboard");
            return;
          }
          setForm(prev => ({
            ...prev,
            companyName: data.companyName || "",
            description: data.description || "",
            industryType: data.industryType || "",
            website: data.website || "",
            companyAddress: data.companyAddress || "",
            city: data.city || "",
            companySize: data.companySize || "",
            contactName: data.contactName || "",
            hrDesignation: data.hrDesignation || "",
            phone: data.phone || "",
            businessRegNo: data.businessRegNo || "",
            gstNo: data.gstNo || "",
            verificationDocUrl: data.verificationDocUrl || "",
          }));
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [session, status, router]);

  function set(field: string, val: unknown) { setForm(f => ({ ...f, [field]: val })); }

  async function handleSave(goToDashboard = false) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload: Record<string, unknown> = { ...form };

      if (goToDashboard) {
        payload.profileCompleted = true;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save profile");
        setSaving(false);
        return;
      }

      if (goToDashboard) {
        router.push("/employer/dashboard");
        router.refresh();
      } else {
        setSuccess("Progress saved!");
        setTimeout(() => setSuccess(""), 2000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const labelCls = "text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 block mb-2";
  const inputCls = "w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all outline-none placeholder:text-slate-700";

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-sm text-slate-500 font-bold">Loading company profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-black">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">StudentConnect</span>
        </div>
        <div className="flex items-center gap-4">
          {success && (
            <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> {success}
            </motion.span>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs font-bold hover:bg-white/[0.08] transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Draft"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center py-12 px-6 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-8">
          {/* Title */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-black text-white tracking-tight">Setup Your Company Profile</h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Complete your company details to start posting jobs. Your account will be <span className="text-amber-400 font-bold">reviewed by admin</span> before activation.</p>
          </div>

          {/* Pending notice */}
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-400">Admin Approval Required</p>
              <p className="text-xs text-slate-500 mt-1">After completing your profile, your account will be reviewed by our admin team. Only approved employers can post jobs, view applicants, and chat with students.</p>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-3">
            {SETUP_STEPS.map((s, i) => {
              const icons = [<Building2 key="b" className="w-4 h-4" />, <User key="u" className="w-4 h-4" />, <ShieldCheck key="s" className="w-4 h-4" />];
              const isActive = i === step;
              const isDone = i < step;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                    isActive
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5"
                      : isDone
                        ? "bg-white/[0.02] border-emerald-500/20 text-emerald-600"
                        : "bg-white/[0.01] border-white/[0.04] text-slate-700 hover:border-white/[0.08]"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : icons[i]}
                  {s}
                </button>
              );
            })}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
            {SETUP_STEPS.map((_, i) => (
              <div key={i} className={`flex-1 h-full transition-all duration-500 ${i <= step ? "bg-emerald-500" : "bg-transparent"}`} />
            ))}
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center">{error}</div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 0: Company Information */}
              {step === 0 && (
                <div className="space-y-6 p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04]">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3"><Building2 className="w-5 h-5 text-emerald-400" /> Company Information</h3>

                  <div className="space-y-2">
                    <label className={labelCls}>Company Name <span className="text-rose-400">*</span></label>
                    <input className={inputCls} placeholder="Acme Technologies Pvt. Ltd." value={form.companyName} onChange={e => set("companyName", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>Company Description</label>
                    <textarea
                      className={`${inputCls} min-h-[120px] resize-none`}
                      placeholder="Tell students about your company, mission, culture, and what makes you unique..."
                      value={form.description}
                      onChange={e => set("description", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={labelCls}>Industry Type</label>
                      <select className={inputCls} value={form.industryType} onChange={e => set("industryType", e.target.value)}>
                        <option value="">Select Industry</option>
                        {INDUSTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Company Size</label>
                      <select className={inputCls} value={form.companySize} onChange={e => set("companySize", e.target.value)}>
                        <option value="">Select</option>
                        {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>Website</label>
                    <input className={inputCls} placeholder="https://www.company.com" value={form.website} onChange={e => set("website", e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={labelCls}>Company Address</label>
                      <input className={inputCls} placeholder="123 Tech Park, Whitefield" value={form.companyAddress} onChange={e => set("companyAddress", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>City</label>
                      <select className={inputCls} value={form.city} onChange={e => set("city", e.target.value)}>
                        <option value="">Select city</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-8 py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-all flex items-center gap-3 shadow-xl shadow-emerald-500/10"
                    >
                      Contact Details <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Contact Information */}
              {step === 1 && (
                <div className="space-y-6 p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04]">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3"><User className="w-5 h-5 text-indigo-400" /> Contact Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={labelCls}>HR / Recruiter Name <span className="text-rose-400">*</span></label>
                      <input className={inputCls} placeholder="Suresh Kumar" value={form.contactName} onChange={e => set("contactName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Designation</label>
                      <input className={inputCls} placeholder="HR Manager" value={form.hrDesignation} onChange={e => set("hrDesignation", e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>Phone Number</label>
                    <input className={inputCls} placeholder="+91 9876543210" value={form.phone} onChange={e => set("phone", e.target.value)} />
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex items-start gap-3">
                    <Mail className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500">Official email is already linked from your registration: <span className="text-white font-bold">{session?.user?.email}</span></p>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => setStep(0)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="button" onClick={() => setStep(2)} className="flex-[2] py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10">
                      Verification <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Verification Information */}
              {step === 2 && (
                <div className="space-y-6 p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04]">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-amber-400" /> Verification Information</h3>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Providing verification details helps us confirm your business faster. This information is kept confidential and only used for admin review.
                  </p>

                  <div className="space-y-2">
                    <label className={labelCls}>Business Registration Number</label>
                    <input className={inputCls} placeholder="e.g., U72200KA2020PTC123456" value={form.businessRegNo} onChange={e => set("businessRegNo", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>GST Number <span className="text-slate-700">(Optional)</span></label>
                    <input className={inputCls} placeholder="e.g., 29AABCU9603R1ZM" value={form.gstNo} onChange={e => set("gstNo", e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>Company Verification Document Link</label>
                    <input className={inputCls} placeholder="https://drive.google.com/your-document" value={form.verificationDocUrl} onChange={e => set("verificationDocUrl", e.target.value)} />
                    <p className="text-[10px] text-slate-700 px-1">Upload your business registration certificate, incorporation document, or letterhead to Google Drive / Dropbox and paste the link here.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        After submission, your profile will be reviewed by our admin team. You&apos;ll receive a notification once your account is approved. Only approved employers can:
                      </p>
                      <ul className="text-xs text-slate-500 mt-2 space-y-1 list-disc list-inside">
                        <li>Post job vacancies</li>
                        <li>View student applicants</li>
                        <li>Chat with students</li>
                        <li>Schedule interviews</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave(true)}
                      disabled={saving}
                      className="flex-[2] py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit for Review <Check className="w-4 h-4" /></>}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Skip option */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors font-bold"
            >
              Skip for now & go to dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
