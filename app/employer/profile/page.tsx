"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Building2, Mail, Globe, MapPin, Pencil, Camera, Loader2, Save, Plus, X, Briefcase, ShieldCheck, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function EmployerProfile() {
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#050508]">
        <Sidebar role="employer" userName={session?.user?.name || "Employer"} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="employer" userName={profile?.companyName || profile?.name || "Employer"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Company Profile</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your brand presence and company details</p>
          </div>
          
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">Cancel</button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <Save className="w-4 h-4" /> Save Changes
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
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Company Hero */}
            <div className="relative p-10 rounded-[48px] bg-gradient-to-br from-indigo-600/10 to-blue-600/10 border border-white/[0.04] overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verified Business</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[40px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                    <Building2 className="w-16 h-16 text-indigo-400" />
                  </div>
                  <button className="absolute bottom-[-10px] right-[-10px] p-3 rounded-2xl bg-[#050508] border border-white/[0.08] text-indigo-400 hover:scale-110 transition-transform shadow-xl">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="text-center md:text-left">
                  {isEditing ? (
                    <input 
                      value={editedProfile?.companyName || ""}
                      onChange={e => setEditedProfile({...editedProfile, companyName: e.target.value})}
                      className="text-4xl font-black text-white bg-transparent border-b-2 border-indigo-500/50 outline-none mb-2 w-full max-w-md"
                    />
                  ) : (
                    <h2 className="text-4xl font-black text-white mb-2">{profile?.companyName || profile?.name}</h2>
                  )}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-indigo-400" /> {profile?.email}</span>
                    <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-emerald-400" /> 
                      {isEditing ? (
                        <input 
                          value={editedProfile?.website || ""}
                          onChange={e => setEditedProfile({...editedProfile, website: e.target.value})}
                          placeholder="Website"
                          className="bg-transparent border-b border-white/20 outline-none text-white text-xs py-1"
                        />
                      ) : (
                        profile?.website || "website.com"
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
                        profile?.city || "Bangalore, India"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* About Company */}
              <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-indigo-400" /> About Company
                </h3>
                {isEditing ? (
                  <textarea 
                    value={editedProfile?.description || ""}
                    onChange={e => setEditedProfile({...editedProfile, description: e.target.value})}
                    className="w-full h-32 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    placeholder="Tell students about your company and mission..."
                  />
                ) : (
                  <p className="text-sm text-slate-500 leading-relaxed italic">
                    "{profile?.description || "A leading innovation hub providing opportunities for young talent to excel in tech and design."}"
                  </p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-400" /> Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-xl font-black text-white">{profile?.activeJobs || "0"}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Jobs</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-xl font-black text-white">{profile?.hiredStudents || "0"}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Hired Students</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Job Posts */}
            <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.04] space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-amber-400" /> Recent Job Posts
                </h3>
                <button className="text-xs font-bold text-indigo-400 hover:text-white transition-colors">View All</button>
              </div>
              
              <div className="space-y-4">
                {(profile?.recentJobs || []).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No job posts yet.</p>
                ) : profile.recentJobs.map((job: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] group hover:border-white/[0.08] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-slate-600">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{job.title}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Posted {job.timeAgo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-400">₹{job.payAmount}</div>
                      <div className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">{job.payType}</div>
                    </div>
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
