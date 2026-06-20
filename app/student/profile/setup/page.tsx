"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, GraduationCap, Briefcase, ArrowRight, ArrowLeft, Check, Loader2,
  Zap, Camera, Phone, MapPin, Calendar, Award, BookOpen, Upload, FileText, X, Plus
} from "lucide-react";
import { SKILLS_LIST, CITIES } from "@/lib/utils";

const SETUP_STEPS = ["Personal", "Academic", "Professional"];
const GENDERS = ["Male", "Female", "Non-Binary", "Prefer not to say"];
const DEGREES = ["B.Tech", "B.E.", "B.Sc", "B.Com", "B.A.", "BBA", "BCA", "M.Tech", "M.E.", "M.Sc", "MBA", "MCA", "Ph.D", "Other"];

export default function StudentProfileSetup() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    // Personal
    name: "",
    phone: "",
    dob: "",
    gender: "",
    city: "",
    bio: "",
    // Academic
    college: "",
    branch: "",
    degree: "",
    year: "",
    cgpa: "",
    // Professional
    skills: [] as string[],
    certifications: [] as { title: string; issuer: string; year: string }[],
    projects: [] as { title: string; description: string; tech: string }[],
    resumeUrl: "",
  });

  const [newCert, setNewCert] = useState({ title: "", issuer: "", year: "" });
  const [newProject, setNewProject] = useState({ title: "", description: "", tech: "" });
  const [showAddCert, setShowAddCert] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);

  // Fetch existing profile data
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "student") {
      router.push("/employer/profile/setup");
      return;
    }

    async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          // If profile is already completed, redirect to dashboard
          if (data.profileCompleted) {
            router.push("/student/dashboard");
            return;
          }
          setForm(prev => ({
            ...prev,
            name: data.name || "",
            phone: data.phone || "",
            dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
            gender: data.gender || "",
            city: data.city || "",
            bio: data.bio || "",
            college: data.college || "",
            branch: data.branch || "",
            degree: data.degree || "",
            year: data.year || "",
            cgpa: data.cgpa ? String(data.cgpa) : "",
            skills: data.skills || [],
            certifications: Array.isArray(data.certifications) ? data.certifications : [],
            projects: Array.isArray(data.projects) ? data.projects : [],
            resumeUrl: data.resumeUrl || "",
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
  function toggleSkill(s: string) { set("skills", form.skills.includes(s) ? form.skills.filter(x => x !== s) : [...form.skills, s]); }

  function addCertification() {
    if (!newCert.title) return;
    set("certifications", [...form.certifications, { ...newCert }]);
    setNewCert({ title: "", issuer: "", year: "" });
    setShowAddCert(false);
  }

  function removeCertification(index: number) {
    set("certifications", form.certifications.filter((_, i) => i !== index));
  }

  function addProject() {
    if (!newProject.title) return;
    set("projects", [...form.projects, { ...newProject }]);
    setNewProject({ title: "", description: "", tech: "" });
    setShowAddProject(false);
  }

  function removeProject(index: number) {
    set("projects", form.projects.filter((_, i) => i !== index));
  }

  async function handleSave(goToDashboard = false) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        city: form.city,
        bio: form.bio,
        college: form.college,
        branch: form.branch,
        degree: form.degree,
        year: form.year,
        cgpa: form.cgpa ? parseFloat(form.cgpa) : 0,
        skills: form.skills,
        certifications: form.certifications,
        projects: form.projects,
        resumeUrl: form.resumeUrl,
      };

      if (form.dob) {
        payload.dob = new Date(form.dob).toISOString();
      }

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
        router.push("/student/dashboard");
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
          <p className="text-sm text-slate-500 font-bold">Loading your profile...</p>
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
            <h1 className="text-4xl font-black text-white tracking-tight">Complete Your Profile</h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Help employers understand your strengths. A complete profile gets up to <span className="text-emerald-400 font-bold">4× more responses</span>.</p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-3">
            {SETUP_STEPS.map((s, i) => {
              const icons = [<User key="u" className="w-4 h-4" />, <GraduationCap key="g" className="w-4 h-4" />, <Briefcase key="b" className="w-4 h-4" />];
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
              {/* Step 0: Personal Information */}
              {step === 0 && (
                <div className="space-y-6 p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04]">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3"><User className="w-5 h-5 text-emerald-400" /> Personal Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={labelCls}>Full Name <span className="text-rose-400">*</span></label>
                      <input className={inputCls} placeholder="Arjun Kumar" value={form.name} onChange={e => set("name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Phone Number</label>
                      <input className={inputCls} placeholder="+91 9876543210" value={form.phone} onChange={e => set("phone", e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={labelCls}>Date of Birth</label>
                      <input type="date" className={inputCls} value={form.dob} onChange={e => set("dob", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Gender</label>
                      <select className={inputCls} value={form.gender} onChange={e => set("gender", e.target.value)}>
                        <option value="">Select</option>
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>Location</label>
                    <select className={inputCls} value={form.city} onChange={e => set("city", e.target.value)}>
                      <option value="">Select city</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>Bio / About Me</label>
                    <textarea
                      className={`${inputCls} min-h-[120px] resize-none`}
                      placeholder="Tell employers about yourself, your goals and what you enjoy doing..."
                      value={form.bio}
                      onChange={e => set("bio", e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-8 py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-all flex items-center gap-3 shadow-xl shadow-emerald-500/10"
                    >
                      Academic Details <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Academic Information */}
              {step === 1 && (
                <div className="space-y-6 p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04]">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3"><GraduationCap className="w-5 h-5 text-indigo-400" /> Academic Information</h3>

                  <div className="space-y-2">
                    <label className={labelCls}>College / University Name</label>
                    <input className={inputCls} placeholder="IIT Madras" value={form.college} onChange={e => set("college", e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={labelCls}>Department / Branch</label>
                      <input className={inputCls} placeholder="Computer Science" value={form.branch} onChange={e => set("branch", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Degree</label>
                      <select className={inputCls} value={form.degree} onChange={e => set("degree", e.target.value)}>
                        <option value="">Select Degree</option>
                        {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={labelCls}>Year of Study</label>
                      <select className={inputCls} value={form.year} onChange={e => set("year", e.target.value)}>
                        <option value="">Select</option>
                        {["1st Year", "2nd Year", "3rd Year", "4th Year", "PG"].map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>CGPA</label>
                      <input type="number" step="0.01" min="0" max="10" className={inputCls} placeholder="8.5" value={form.cgpa} onChange={e => set("cgpa", e.target.value)} />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => setStep(0)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="button" onClick={() => setStep(2)} className="flex-[2] py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10">
                      Professional Info <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Professional Information */}
              {step === 2 && (
                <div className="space-y-8">
                  {/* Skills */}
                  <div className="space-y-5 p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04]">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3"><Award className="w-5 h-5 text-amber-400" /> Skills</h3>
                    <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
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
                  </div>

                  {/* Certifications */}
                  <div className="space-y-5 p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-3"><FileText className="w-5 h-5 text-cyan-400" /> Certifications</h3>
                      <button type="button" onClick={() => setShowAddCert(!showAddCert)} className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {form.certifications.map((cert, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] group">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{cert.title}</p>
                          <p className="text-xs text-slate-500">{cert.issuer} {cert.year && `• ${cert.year}`}</p>
                        </div>
                        <button type="button" onClick={() => removeCertification(i)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-rose-400 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <AnimatePresence>
                      {showAddCert && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                          <input className={inputCls} placeholder="Certification Title (e.g., AWS Cloud Practitioner)" value={newCert.title} onChange={e => setNewCert({ ...newCert, title: e.target.value })} />
                          <div className="grid grid-cols-2 gap-3">
                            <input className={inputCls} placeholder="Issuer (e.g., AWS)" value={newCert.issuer} onChange={e => setNewCert({ ...newCert, issuer: e.target.value })} />
                            <input className={inputCls} placeholder="Year (e.g., 2024)" value={newCert.year} onChange={e => setNewCert({ ...newCert, year: e.target.value })} />
                          </div>
                          <button type="button" onClick={addCertification} className="w-full py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500 hover:text-black transition-all">
                            Add Certification
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Projects */}
                  <div className="space-y-5 p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-3"><BookOpen className="w-5 h-5 text-violet-400" /> Projects</h3>
                      <button type="button" onClick={() => setShowAddProject(!showAddProject)} className="p-2 rounded-xl bg-violet-500/10 text-violet-400 hover:bg-violet-500 hover:text-black transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {form.projects.map((proj, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] group">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-violet-400 mt-0.5">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{proj.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{proj.description}</p>
                          {proj.tech && <p className="text-[10px] font-bold text-violet-400 mt-2">{proj.tech}</p>}
                        </div>
                        <button type="button" onClick={() => removeProject(i)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-rose-400 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <AnimatePresence>
                      {showAddProject && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                          <input className={inputCls} placeholder="Project Title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
                          <textarea className={`${inputCls} min-h-[80px] resize-none`} placeholder="Brief description of the project..." value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
                          <input className={inputCls} placeholder="Technologies used (e.g., React, Node.js, MongoDB)" value={newProject.tech} onChange={e => setNewProject({ ...newProject, tech: e.target.value })} />
                          <button type="button" onClick={addProject} className="w-full py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold hover:bg-violet-500 hover:text-black transition-all">
                            Add Project
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Resume URL */}
                  <div className="space-y-3 p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04]">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3"><Upload className="w-5 h-5 text-rose-400" /> Resume</h3>
                    <div className="space-y-2">
                      <label className={labelCls}>Resume Link (Google Drive, Dropbox, etc.)</label>
                      <input className={inputCls} placeholder="https://drive.google.com/your-resume" value={form.resumeUrl} onChange={e => set("resumeUrl", e.target.value)} />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave(true)}
                      disabled={saving}
                      className="flex-[2] py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Setup & Go to Dashboard <Check className="w-4 h-4" /></>}
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
              onClick={() => {
                handleSave(true);
              }}
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
