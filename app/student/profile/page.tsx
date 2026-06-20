"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import RatingModal from "@/components/ui/RatingModal";
import {
  User, Mail, BookOpen, MapPin, Award, Pencil, Camera, Loader2,
  Save, Plus, X, Briefcase, GraduationCap, ShieldCheck, Star,
  Upload, Phone, CheckCircle2, Circle, Link as LinkIcon, Sparkles
} from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ── Profile completeness helpers ───────────────────────────────
function computeScore(p: any): { score: number; items: { label: string; done: boolean; href?: string }[] } {
  if (!p) return { score: 0, items: [] };
  const items = [
    { label: "Full name",           done: !!p.name,                           href: undefined },
    { label: "Bio / About me",      done: !!p.bio && p.bio.length > 20,       href: undefined },
    { label: "College",             done: !!p.college,                        href: undefined },
    { label: "City / Location",     done: !!p.city,                           href: undefined },
    { label: "Phone number",        done: !!p.phone,                          href: undefined },
    { label: "3+ skills added",     done: (p.skills?.length || 0) >= 3,       href: undefined },
    { label: "Aadhaar verified",    done: !!p.isAadhaarVerified,              href: "/student/verify" },
  ];
  const done = items.filter((i) => i.done).length;
  return { score: Math.round((done / items.length) * 100), items };
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 71 ? "#10b981" : score >= 41 ? "#f59e0b" : "#f43f5e";
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
      <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
      <circle
        cx="45" cy="45" r={radius} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease, stroke 0.3s" }}
      />
    </svg>
  );
}

// ── Star display helper ────────────────────────────────────────
function StarRow({ score, size = "sm" }: { score: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= Math.round(score) ? "text-amber-400 fill-amber-400" : "text-slate-700"}`}
        />
      ))}
    </div>
  );
}

export default function StudentProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingModal, setRatingModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile
  useEffect(() => {
    if (!session?.user?.id) return;
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const d = await res.json();
        setProfile(d);
        setEditedProfile(d);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
  }, [session?.user?.id]);

  // Fetch reviews
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/ratings?userId=${session.user.id}`)
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setReviews(d) : null)
      .catch(() => {});
  }, [session?.user?.id]);

  const { score, items } = computeScore(profile);

  // Camera helpers
  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(ms);
      if (videoRef.current) videoRef.current.srcObject = ms;
    } catch {
      alert("Camera access denied."); setIsCameraOpen(false);
    }
  };
  const closeCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null); setIsCameraOpen(false);
  };
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx?.drawImage(videoRef.current, 0, 0);
    const img = canvasRef.current.toDataURL("image/jpeg", 0.8);
    setEditedProfile((p: any) => ({ ...p, profileImage: img }));
    setProfile((p: any) => ({ ...p, profileImage: img }));
    setIsEditing(true);
    closeCamera();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProfile),
      });
      if (res.ok) {
        const upd = await res.json();
        setProfile((p: any) => ({ ...p, ...upd }));
        setIsEditing(false);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const addSkill = (skill: string) => {
    if (!skill || editedProfile?.skills?.includes(skill)) return;
    setEditedProfile((p: any) => ({ ...p, skills: [...(p?.skills || []), skill] }));
  };
  const removeSkill = (skill: string) =>
    setEditedProfile((p: any) => ({ ...p, skills: p.skills.filter((s: string) => s !== skill) }));

  if (loading) return (
    <div className="flex min-h-screen bg-[#050508]">
      <Sidebar role="student" userName={session?.user?.name || "Student"} />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    </div>
  );

  const scoreColor = score >= 71 ? "text-emerald-400" : score >= 41 ? "text-amber-400" : "text-rose-400";
  const scoreBg = score >= 71 ? "bg-emerald-500/10 border-emerald-500/20" : score >= 41 ? "bg-amber-500/10 border-amber-500/20" : "bg-rose-500/10 border-rose-500/20";

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="student" userName={profile?.name || "Student"} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">My Professional Profile</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your identity, skills and reputation</p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs font-bold hover:bg-white/[0.08] transition-all flex items-center gap-2">
                <Pencil className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">

            {/* ── Hero + Completeness ───────────────────────────────── */}
            <div className="relative p-10 rounded-[48px] bg-gradient-to-br from-indigo-600/20 to-emerald-600/20 border border-white/[0.04] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.05),transparent)]" />

              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                {/* Avatar */}
                <div className="relative group flex-shrink-0">
                  <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-emerald-500/20 overflow-hidden">
                    {(isEditing ? editedProfile?.profileImage : profile?.profileImage) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={isEditing ? editedProfile?.profileImage : profile?.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (profile?.name?.[0] || "U")}
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    <button onClick={openCamera} className="p-2.5 rounded-2xl bg-[#050508] border border-white/[0.08] text-emerald-400 hover:scale-110 transition-transform shadow-xl z-10" title="Take photo">
                      <Camera className="w-4 h-4" />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-2xl bg-[#050508] border border-white/[0.08] text-indigo-400 hover:scale-110 transition-transform shadow-xl z-10" title="Upload photo">
                      <Upload className="w-4 h-4" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = ev => {
                          const img = ev.target?.result as string;
                          setEditedProfile((p: any) => ({ ...p, profileImage: img }));
                          setProfile((p: any) => ({ ...p, profileImage: img }));
                          setIsEditing(true);
                        };
                        reader.readAsDataURL(f);
                      }}
                    />
                  </div>
                </div>

                {/* Name & info */}
                <div className="text-center md:text-left flex-1">
                  {isEditing ? (
                    <input value={editedProfile?.name || ""} onChange={e => setEditedProfile((p: any) => ({ ...p, name: e.target.value }))}
                      className="text-4xl font-black text-white bg-transparent border-b-2 border-emerald-500/50 outline-none mb-2 w-full max-w-md" />
                  ) : (
                    <div className="flex items-center gap-3 mb-2 justify-center md:justify-start flex-wrap">
                      <h2 className="text-4xl font-black text-white">{profile?.name}</h2>
                      {profile?.isAadhaarVerified && (
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" /> Verified
                        </div>
                      )}
                      {profile?.rating > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-amber-400 text-xs font-bold">{profile.rating.toFixed(1)}</span>
                          <span className="text-slate-500 text-[10px]">({profile.totalRatings})</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-400 mt-2">
                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-emerald-400" /> {profile?.email}</span>
                    <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-indigo-400" />
                      {isEditing ? <input value={editedProfile?.college || ""} onChange={e => setEditedProfile((p: any) => ({ ...p, college: e.target.value }))} placeholder="University" className="bg-transparent border-b border-white/20 outline-none text-white text-xs py-1 w-36" /> : (profile?.college || "Set your college")}
                    </span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-400" />
                      {isEditing ? <input value={editedProfile?.city || ""} onChange={e => setEditedProfile((p: any) => ({ ...p, city: e.target.value }))} placeholder="City" className="bg-transparent border-b border-white/20 outline-none text-white text-xs py-1 w-24" /> : (profile?.city || "Location")}
                    </span>
                    <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-amber-400" />
                      {isEditing ? <input value={editedProfile?.phone || ""} onChange={e => setEditedProfile((p: any) => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="bg-transparent border-b border-white/20 outline-none text-white text-xs py-1 w-28" /> : (profile?.phone || "Add phone")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Profile Completeness Card ─────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-6 rounded-[32px] border ${scoreBg} relative overflow-hidden`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Ring */}
                <div className="relative flex-shrink-0">
                  <ScoreRing score={score} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
                    <div className={`text-xl font-black ${scoreColor}`}>{score}%</div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className={`w-4 h-4 ${scoreColor}`} />
                    <h3 className="text-base font-bold text-white">
                      {score >= 71 ? "Strong profile! 🎉" : score >= 41 ? "Getting there — keep going!" : "Complete your profile to get hired"}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    {items.map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        {item.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-700 flex-shrink-0" />
                        )}
                        {!item.done && item.href ? (
                          <Link href={item.href} className="text-xs text-indigo-400 hover:text-white underline transition-colors">{item.label}</Link>
                        ) : (
                          <span className={`text-xs ${item.done ? "text-slate-400 line-through" : "text-slate-500"}`}>{item.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${score >= 71 ? "bg-emerald-500" : score >= 41 ? "bg-amber-500" : "bg-rose-500"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </motion.div>

            {/* ── Bio & Skills ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bio */}
              <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <User className="w-5 h-5 text-emerald-400" /> About Me
                </h3>
                {isEditing ? (
                  <textarea value={editedProfile?.bio || ""} onChange={e => setEditedProfile((p: any) => ({ ...p, bio: e.target.value }))}
                    className="w-full h-32 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                    placeholder="Tell employers about yourself, your goals and what you enjoy doing..." />
                ) : (
                  <p className="text-sm text-slate-500 leading-relaxed italic">
                    {profile?.bio || "\"Add a bio to stand out to employers.\""}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <Award className="w-5 h-5 text-indigo-400" /> Core Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(isEditing ? editedProfile?.skills : profile?.skills)?.map((skill: string) => (
                    <div key={skill} className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center gap-2">
                      {skill}
                      {isEditing && <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeSkill(skill)} />}
                    </div>
                  ))}
                  {isEditing && (
                    <input
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addSkill((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ""; }
                      }}
                      placeholder="Type & Enter"
                      className="w-28 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[10px] outline-none"
                    />
                  )}
                  {!isEditing && (!profile?.skills || profile.skills.length === 0) && (
                    <span className="text-xs text-slate-600 italic">No skills added yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Resume Link ───────────────────────────────────────── */}
            <div className="p-6 rounded-[32px] bg-white/[0.01] border border-white/[0.04] flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Resume / CV</p>
                {isEditing ? (
                  <input value={editedProfile?.resumeUrl || ""} onChange={e => setEditedProfile((p: any) => ({ ...p, resumeUrl: e.target.value }))}
                    placeholder="Paste Google Drive / PDF link..."
                    className="w-full bg-transparent border-b border-white/10 outline-none text-white text-sm py-1" />
                ) : profile?.resumeUrl ? (
                  <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 hover:text-white flex items-center gap-2 transition-colors">
                    <LinkIcon className="w-4 h-4" /> View Resume
                  </a>
                ) : (
                  <span className="text-sm text-slate-600 italic">No resume linked — click Edit to add one</span>
                )}
              </div>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="p-2 rounded-xl bg-white/[0.04] text-slate-500 hover:text-white transition-all">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* ── Projects & Experience ─────────────────────────────── */}
            <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-amber-400" /> Projects & Experience
                </h3>
                <button className="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {(profile?.projects || [{ title: "Sample Project", description: "Add your first project from the edit button above.", tag: "Student", tech: "Portfolio" }])
                  .map((project: any, i: number) => (
                    <div key={i} className="flex gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] group hover:border-white/[0.08] transition-all">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold mb-1">{project.title || "Untitled Project"}</h4>
                        <p className="text-xs text-slate-500">{project.description || "Project description..."}</p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-700">
                          <span>{project.tag || "Student"}</span><span>•</span><span>{project.tech || "Portfolio"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* ── Reviews from Employers ────────────────────────────── */}
            <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Reviews & Ratings
                  </h3>
                  {profile?.rating > 0 && (
                    <div className="flex items-center gap-3 mt-2">
                      <StarRow score={profile.rating} size="lg" />
                      <span className="text-2xl font-black text-white">{profile.rating.toFixed(1)}</span>
                      <span className="text-slate-500 text-sm">({profile.totalRatings} review{profile.totalRatings !== 1 ? "s" : ""})</span>
                    </div>
                  )}
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center opacity-40">
                  <Star className="w-10 h-10 mb-3 text-slate-600" />
                  <p className="text-sm font-bold text-slate-500">No reviews yet</p>
                  <p className="text-xs text-slate-600 mt-1">Complete jobs to earn employer reviews</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r: any) => {
                    const reviewerName = r.from?.employer?.companyName || r.from?.student?.name || r.from?.email || "Anonymous";
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm">
                              {reviewerName[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{reviewerName}</p>
                              {r.job?.title && <p className="text-[10px] text-slate-500">{r.job.title}</p>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <StarRow score={r.score} />
                            <span className="text-[10px] text-slate-600">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                          </div>
                        </div>
                        {r.review && <p className="mt-3 text-xs text-slate-400 leading-relaxed italic">"{r.review}"</p>}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#0A0A0F] border border-white/[0.08] rounded-[40px] p-8 overflow-hidden shadow-2xl"
            >
              <button onClick={closeCamera} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 text-white z-10">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white mb-6">Take a Photo</h3>
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-6">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <button onClick={captureImage} className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-emerald-500/20">
                Capture Photo
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Self-rating modal (placeholder) */}
      <RatingModal
        isOpen={ratingModal}
        onClose={() => setRatingModal(false)}
        onSubmit={async () => setRatingModal(false)}
        title="Rate Your Experience"
        subtitle="How has your experience on StudentConnect been so far?"
        accentColor="emerald"
      />
    </div>
  );
}
