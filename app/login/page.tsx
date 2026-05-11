"use client";
import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRight, Loader2, Zap, ShieldCheck, Sparkles, Briefcase } from "lucide-react";

const ROLES = [
  {
    id: "student",
    title: "Student Login",
    desc: "Access your student dashboard to find jobs, apply, and track earnings.",
    icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
    email: "arjun@iitm.ac.in",
    pass: "demo1234",
    path: "/student/dashboard",
    color: "from-emerald-500/20 to-teal-500/5",
    border: "border-emerald-500/30",
    hover: "hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
  },
  {
    id: "employer",
    title: "Employer Login",
    desc: "Post jobs, manage applicants, and hire top student talent.",
    icon: <Briefcase className="w-6 h-6 text-indigo-400" />,
    email: "suresh@creativeedge.in",
    pass: "demo1234",
    path: "/employer/dashboard",
    color: "from-indigo-500/20 to-blue-500/5",
    border: "border-indigo-500/30",
    hover: "hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
  },
  {
    id: "admin",
    title: "Admin Login",
    desc: "Manage platform operations, users, and approve jobs.",
    icon: <ShieldCheck className="w-6 h-6 text-rose-400" />,
    email: "admin@studentconnect.in",
    pass: "admin1234",
    path: "/admin/dashboard",
    color: "from-rose-500/20 to-orange-500/5",
    border: "border-rose-500/30",
    hover: "hover:border-rose-400 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]"
  }
];

function LoginForm() {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleRoleLogin(role: string, email: string, pass: string, redirectPath: string) {
    setLoadingRole(role);
    setError("");
    
    const res = await signIn("credentials", { email, password: pass, redirect: false });
    
    if (res?.error) { 
      setLoadingRole(null);
      setError("Failed to login. Please check configuration."); 
      return; 
    }
    
    router.push(redirectPath);
  }

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">Choose Your Path</h1>
        <p className="text-slate-400 text-sm">Select your role to instantly access your dedicated workspace.</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold text-center flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="space-y-4">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => handleRoleLogin(r.id, r.email, r.pass, r.path)}
            disabled={loadingRole !== null}
            className={`w-full p-6 text-left rounded-3xl border bg-gradient-to-br ${r.color} ${r.border} ${r.hover} transition-all duration-300 group relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 text-white">
              {r.icon}
            </div>
            
            <div className="relative z-10 flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
                {loadingRole === r.id ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : r.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">{r.title}</h3>
                <p className="text-sm text-slate-400 max-w-[280px]">{r.desc}</p>
              </div>
            </div>
            <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Access</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-slate-500 pt-4">
        New to the community?{" "}
        <Link href="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">Join here</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[#050508]">
      {/* Left Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-16 relative overflow-hidden bg-[#0A0A0F] border-r border-white/[0.04]">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 z-0">
          <Image src="/3d-bg.png" alt="3D Background" fill className="object-cover" priority />
        </div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
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
          <div>
            <h2 className="text-6xl font-black text-white leading-[0.95] tracking-tighter mb-8">
              The Future of <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent italic">Student Work.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-md mb-12 leading-relaxed">
              Access India's premier skill-based marketplace. Secure high-quality gigs and build your professional legacy.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { icon: <Zap className="w-4 h-4" />, text: "Real-time AI matching algorithm" },
              { icon: <ShieldCheck className="w-4 h-4" />, text: "Direct employer-student payouts" },
              { icon: <Sparkles className="w-4 h-4" />, text: "Verified professional portfolios" },
            ].map((item, i) => (
              <div 
                key={i}
                className="flex items-center gap-3 text-sm text-slate-500"
              >
                <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-emerald-400">
                  {item.icon}
                </div>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-10 border-t border-white/[0.04]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
            Trusted by students at IIT, NIT, BITS & top universities
          </p>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <Suspense fallback={<div className="flex items-center gap-3 text-slate-500 font-bold"><Loader2 className="w-5 h-5 animate-spin" /> Syncing...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
