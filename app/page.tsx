"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SAMPLE_JOBS, TESTIMONIALS, PLATFORM_STATS, JOB_CATEGORY_ICONS } from "@/lib/data";
import { ArrowRight, CheckCircle, Star, Zap, Shield, TrendingUp, ChevronRight, Play, Users, Briefcase, DollarSign, Globe, Award, MousePointer2 } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

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
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="bg-[#050508] text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-400">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-20 bg-[#050508]/60 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">StudentConnect</span>
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
            <Link href="/register" className="group relative px-6 py-3 bg-white text-black text-sm font-black rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95">
              <span className="relative z-10 flex items-center gap-2">Get Started <ArrowRight className="w-4 h-4" /></span>
              <div className="absolute inset-0 bg-emerald-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div style={{ y: y1 }} className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px]" />
          <motion.div style={{ y: y1 }} className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_85%)] opacity-20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live: 2,418 jobs available today</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 leading-[0.95]"
          >
            Unlock Your <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent italic">Financial Freedom</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            India's premier skill-based marketplace for students. Earn while you learn, build your professional portfolio, and gain real-world experience.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="w-full sm:w-auto px-10 py-5 bg-emerald-500 text-black font-black rounded-[20px] text-lg hover:bg-emerald-400 hover:scale-105 transition-all shadow-2xl shadow-emerald-500/20">
              Start Earning Now
            </Link>
            <Link href="/student/jobs" className="w-full sm:w-auto px-10 py-5 bg-white/[0.03] border border-white/[0.08] text-white font-bold rounded-[20px] text-lg hover:bg-white/[0.06] transition-all flex items-center justify-center gap-3">
              <Play className="w-5 h-5 fill-current" /> Watch How it Works
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE SECTION ── */}
      <div className="py-10 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="flex overflow-hidden group">
          <div className="flex animate-marquee group-hover:pause gap-12 items-center">
            {[...MARQUEE_CATEGORIES, ...MARQUEE_CATEGORIES].map((cat, i) => (
              <span key={i} className="text-2xl font-black text-slate-700 hover:text-emerald-500 transition-colors whitespace-nowrap uppercase tracking-tighter italic">
                {cat} •
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS SECTION ── */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-8 rounded-[32px] bg-white/[0.02] border border-white/[0.04] text-center group hover:bg-white/[0.04] transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE JOBS PREVIEW ── */}
      <section className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Fresh Opportunities <br />
                <span className="text-emerald-500 italic">Waiting for You</span>
              </h2>
              <p className="text-slate-400">Apply to high-quality gigs posted by verified local and online businesses.</p>
            </div>
            <Link href="/student/jobs" className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm font-bold text-white hover:bg-white/[0.06] transition-all flex items-center gap-2">
              Browse All Jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SAMPLE_JOBS.slice(0, 6).map((job, i) => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-[32px] bg-[#0A0A0F] border border-white/[0.04] hover:border-emerald-500/40 transition-all relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {JOB_CATEGORY_ICONS[job.category] || "💼"}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-white">₹{job.payAmount}</div>
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{job.payType}</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{job.title}</h3>
                <p className="text-sm text-slate-500 mb-8 line-clamp-2">{job.description}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Shield className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Verified Partner</span>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Quick Apply <MousePointer2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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

      {/* ── FOOTER ── */}
      <footer className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <span className="text-2xl font-black text-white">StudentConnect</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs text-center md:text-left leading-relaxed">
              Empowering Indian students with flexible opportunities and professional growth.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
              <h5 className="text-white font-bold mb-6">Platform</h5>
              <div className="flex flex-col gap-4 text-sm text-slate-500">
                <Link href="/student/jobs">Find Jobs</Link>
                <Link href="/employer/dashboard">Post a Job</Link>
                <Link href="#">How it Works</Link>
              </div>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Company</h5>
              <div className="flex flex-col gap-4 text-sm text-slate-500">
                <Link href="#">About Us</Link>
                <Link href="#">Contact</Link>
                <Link href="#">Privacy Policy</Link>
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h5 className="text-white font-bold mb-6">Social</h5>
              <div className="flex flex-col gap-4 text-sm text-slate-500">
                <Link href="#">Twitter / X</Link>
                <Link href="#">Instagram</Link>
                <Link href="#">LinkedIn</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/[0.04] text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          © 2024 StudentConnect India • All Rights Reserved
        </div>
      </footer>
    </div>
  );
}

