"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SAMPLE_JOBS, TESTIMONIALS, PLATFORM_STATS, JOB_CATEGORY_ICONS } from "@/lib/data";
import { ArrowRight, CheckCircle, Star, Zap, Shield, TrendingUp, ChevronRight, Play, Users, Briefcase, DollarSign, Globe, Award, MousePointer2, Code2, Camera, PenTool, Music, Gamepad2 } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import InstallBanner from "@/components/InstallBanner";
import { TiltCard } from "@/components/ui/TiltCard";

const MARQUEE_CATEGORIES = [
  "Home Tutoring", "Web Development", "Logo Design", "Content Writing",
  "Social Media", "Data Entry", "Event Help", "Video Editing",
  "Photography", "WiFi Setup", "Local Guide", "AI Labeling",
];

const STATS = [
  { label: "Active Students", value: "24k+", icon: <Users className="w-5 h-5" /> },
  { label: "Jobs Posted", value: "8.5k+", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Total Earned", value: "₹4.2Cr", icon: <DollarSign className="w-5 h-5" /> },
  { label: "Partner Brands", value: "450+", icon: <Globe className="w-5 h-5" /> },
];

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 400]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -300]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 250]);
  const rotate1 = useTransform(scrollY, [0, 1000], [0, 45]);
  const rotate2 = useTransform(scrollY, [0, 1000], [0, -45]);
  const scale1 = useTransform(scrollY, [0, 1000], [1, 1.2]);
  const scale2 = useTransform(scrollY, [0, 1000], [1, 0.8]);
  
  const [realJobs, setRealJobs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/jobs?limit=6")
      .then(res => res.json())
      .then(data => setRealJobs(data.jobs || []))
      .catch(console.error);
  }, []);

  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="bg-[#050508] text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-400 overflow-hidden perspective-[2000px]">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-20 bg-[#050508]/60 backdrop-blur-xl border-b border-white/[0.04] transform-gpu">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white drop-shadow-md">StudentConnect</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            {["Opportunities", "Benefits", "Employers", "Pricing"].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/register" className="group relative px-6 py-3 bg-white text-black text-sm font-black rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <span className="relative z-10 flex items-center gap-2">Sign Up <ArrowRight className="w-4 h-4" /></span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 perspective-[1000px]">
        {/* Abstract 3D Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none transform-gpu">
          <motion.div style={{ y: y1, rotateZ: rotate1 }} className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
          <motion.div style={{ y: y2, rotateZ: rotate2 }} className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[100px] mix-blend-screen" />
          <motion.div style={{ y: y3 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_70%)] opacity-30" />
          
          {/* Floating 3D Talent Badges */}
          <motion.div 
            style={{ y: y2, scale: scale1 }}
            className="absolute top-32 left-[15%] w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-3xl shadow-[0_0_50px_rgba(99,102,241,0.3)] rotate-12 flex items-center justify-center transform-gpu"
          >
            <Code2 className="w-10 h-10 text-indigo-400" />
          </motion.div>
          <motion.div 
            style={{ y: y1, scale: scale2 }}
            className="absolute bottom-40 left-[10%] w-32 h-32 rounded-[2rem] bg-amber-500/10 border border-amber-500/30 backdrop-blur-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] -rotate-12 flex items-center justify-center transform-gpu"
          >
            <Camera className="w-12 h-12 text-amber-400" />
          </motion.div>
          <motion.div 
            style={{ y: y2, scale: scale2 }}
            className="absolute top-40 right-[15%] w-28 h-28 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-3xl shadow-[0_0_50px_rgba(16,185,129,0.3)] -rotate-6 flex items-center justify-center transform-gpu"
          >
            <PenTool className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <motion.div 
            style={{ y: y3, scale: scale1 }}
            className="absolute bottom-32 right-[10%] w-24 h-24 rounded-2xl bg-purple-500/10 border border-purple-500/30 backdrop-blur-3xl shadow-[0_0_50px_rgba(168,85,247,0.3)] rotate-[24deg] flex items-center justify-center transform-gpu"
          >
            <Music className="w-10 h-10 text-purple-400" />
          </motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center transform-gpu preserve-3d">
          <TiltCard className="inline-block mx-auto mb-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/[0.1] shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 drop-shadow-md">Monetize Your Skills</span>
            </motion.div>
          </TiltCard>

          <TiltCard className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 40, rotateX: 20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
              className="text-5xl md:text-8xl font-black tracking-tight text-white leading-[1.05] drop-shadow-2xl"
              style={{ transformStyle: "preserve-3d" }}
            >
              Turn Your Talent <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent italic inline-block" style={{ transform: "translateZ(50px)" }}>
                Into Income
              </span>
            </motion.h1>
          </TiltCard>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow-lg"
          >
            Don't let your skills go to waste. Showcase your talent, connect with clients, and start earning money doing what you love on India's premier student marketplace.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <TiltCard className="w-full sm:w-auto h-[64px]">
              <Link href="/register" className="w-full h-full flex items-center justify-center px-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black rounded-2xl text-lg hover:from-emerald-400 hover:to-teal-400 transition-all shadow-[0_0_40px_rgba(16,185,129,0.4)]" style={{ transform: "translateZ(30px)" }}>
                Monetize My Talent
              </Link>
            </TiltCard>
            
            <TiltCard className="w-full sm:w-auto h-[64px]">
              <Link href="/employer/register" className="w-full h-full flex items-center justify-center px-10 bg-black/40 backdrop-blur-xl border border-white/[0.1] text-white font-bold rounded-2xl text-lg hover:bg-white/[0.05] transition-all gap-3 shadow-[0_0_30px_rgba(0,0,0,0.5)]" style={{ transform: "translateZ(20px)" }}>
                <Star className="w-5 h-5 text-indigo-400" /> Hire Top Talent
              </Link>
            </TiltCard>
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE SECTION ── */}
      <div className="py-10 border-y border-white/[0.04] bg-gradient-to-b from-black/50 to-transparent relative z-20">
        <div className="flex overflow-hidden group">
          <div className="flex animate-marquee group-hover:pause gap-12 items-center">
            {[...MARQUEE_CATEGORIES, ...MARQUEE_CATEGORIES].map((cat, i) => (
              <span key={i} className="text-2xl font-black text-slate-600 hover:text-emerald-500 transition-colors whitespace-nowrap uppercase tracking-tighter italic cursor-default">
                {cat} •
              </span>
            ))}
          </div>
        </div>
      </div>





      {/* ── HOW IT WORKS ── */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black text-white mb-6">Simple 4-Step <span className="text-indigo-400 italic">Success</span></h2>
            <p className="text-slate-400">We've streamlined the process so you can focus on working and earning.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            <div className="hidden md:block absolute top-1/4 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            
            {[
              { title: "Onboarding", desc: "Create your profile with skills & college details.", icon: <Award /> },
              { title: "Matching", desc: "Our AI matches you with the best opportunities.", icon: <Zap /> },
              { title: "Execution", desc: "Work on flexible tasks that fit your schedule.", icon: <Briefcase /> },
              { title: "Earnings", desc: "Get paid directly with zero commission on first 3 jobs.", icon: <DollarSign /> },
            ].map((step, i) => (
              <div key={i} className="relative z-10 text-center">
                <div className="w-20 h-20 rounded-[32px] bg-[#111118] border border-white/[0.08] flex items-center justify-center mx-auto mb-8 text-indigo-400 shadow-xl shadow-indigo-500/10">
                  {step.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-3">{step.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                <div className="absolute top-0 right-0 text-6xl font-black text-white/[0.02] -translate-y-1/2 select-none">
                  0{i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[48px] overflow-hidden bg-gradient-to-br from-indigo-600 to-emerald-600 p-12 md:p-24 text-center">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                Ready to Join the <br />
                Future of Student Work?
              </h2>
              <p className="text-lg text-white/70 max-w-xl mx-auto mb-12">
                Join 24,000+ students already earning on StudentConnect. No hidden fees. No experience required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/register" className="w-full sm:w-auto px-12 py-6 bg-white text-black font-black rounded-2xl text-lg hover:scale-105 transition-transform shadow-xl shadow-black/20">
                  Create Free Account
                </Link>
                <Link href="/employer/register" className="w-full sm:w-auto px-12 py-6 bg-transparent border border-white/30 text-white font-bold rounded-2xl text-lg hover:bg-white/10 transition-all">
                  Post a Job Instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      <InstallBanner />
    </div>
  );
}

