"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { User, Mail, BookOpen, MapPin, Award, Pencil, Camera, Loader2, Save, Plus, X, Briefcase, GraduationCap, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function StudentProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setProfile(data);
        setEditedProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session?.user?.id]);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProfile),
      });
      
      if (res.ok) {
        const updated = await res.json();
        setProfile({ ...profile, ...updated });
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addSkill = (skill: string) => {
    if (!skill || editedProfile?.skills?.includes(skill)) return;
    setEditedProfile({
      ...editedProfile,
      skills: [...(editedProfile?.skills || []), skill]
    });
  };

  const removeSkill = (skill: string) => {
    setEditedProfile({
      ...editedProfile,
      skills: editedProfile?.skills?.filter((s: string) => s !== skill)
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#050508]">
        <Sidebar role="student" userName={session?.user?.name || "Student"} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="student" userName={profile?.name || "Student"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">My Professional Profile</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your identity and skills across the platform</p>
          </div>
          
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs font-bold hover:bg-white/[0.08] transition-all flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Profile Hero */}
            <div className="relative p-10 rounded-[48px] bg-gradient-to-br from-indigo-600/20 to-emerald-600/20 border border-white/[0.04] overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <div className="text-right">
                  <div className="text-2xl font-black text-white">
                    {Math.round(((profile?.bio ? 1 : 0) + (profile?.skills?.length > 0 ? 1 : 0) + (profile?.college ? 1 : 0) + (profile?.city ? 1 : 0) + 1) / 5 * 100)}%
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Completion</div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-emerald-500/20">
                    {profile?.name?.[0] || "U"}
                  </div>
                  <button className="absolute bottom-[-10px] right-[-10px] p-3 rounded-2xl bg-[#050508] border border-white/[0.08] text-emerald-400 hover:scale-110 transition-transform shadow-xl">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="text-center md:text-left">
                  {isEditing ? (
                    <input 
                      value={editedProfile?.name || ""}
                      onChange={e => setEditedProfile({...editedProfile, name: e.target.value})}
                      className="text-4xl font-black text-white bg-transparent border-b-2 border-emerald-500/50 outline-none mb-2 w-full max-w-md"
                    />
                  ) : (
                    <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                      <h2 className="text-4xl font-black text-white">{profile?.name}</h2>
                      {profile?.isAadhaarVerified && (
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                          <ShieldCheck className="w-4 h-4" /> Verified
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-emerald-400" /> {profile?.email}</span>
                    <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-indigo-400" /> 
                      {isEditing ? (
                        <input 
                          value={editedProfile?.college || ""}
                          onChange={e => setEditedProfile({...editedProfile, college: e.target.value})}
                          placeholder="University/College"
                          className="bg-transparent border-b border-white/20 outline-none text-white text-xs py-1"
                        />
                      ) : (
                        profile?.college || "Set your college"
                      )}
                    </span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-400" /> 
                      {isEditing ? (
                        <input 
                          value={editedProfile?.city || ""}
                          onChange={e => setEditedProfile({...editedProfile, city: e.target.value})}
                          placeholder="City"
                          className="bg-transparent border-b border-white/20 outline-none text-white text-xs py-1"
                        />
                      ) : (
                        profile?.city || "Location"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bio & Intro */}
              <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <User className="w-5 h-5 text-emerald-400" /> About Me
                </h3>
                {isEditing ? (
                  <textarea 
                    value={editedProfile?.bio || ""}
                    onChange={e => setEditedProfile({...editedProfile, bio: e.target.value})}
                    className="w-full h-32 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="Tell employers about yourself, your goals and what you enjoy doing..."
                  />
                ) : (
                  <p className="text-sm text-slate-500 leading-relaxed italic">
                    {profile?.bio || "\"I am a student looking to apply my skills to real-world projects.\""}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-6">
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
                    <div className="flex items-center gap-2">
                      <input 
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                        placeholder="Type & Enter"
                        className="w-24 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[10px] outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Experience or Projects */}
            <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-amber-400" /> Projects & Experience
                </h3>
                <button className="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {(profile?.projects || [1]).map((project: any, i: number) => (
                  <div key={i} className="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] group hover:border-white/[0.08] transition-all">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center text-slate-600">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold mb-1">{project.title || "Untitled Project"}</h4>
                      <p className="text-xs text-slate-500">{project.description || "Project description goes here..."}</p>
                      <div className="mt-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-700">
                        <span>{project.tag || "Student"}</span>
                        <span>•</span>
                        <span>{project.tech || "Portfolio"}</span>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-white transition-all">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
