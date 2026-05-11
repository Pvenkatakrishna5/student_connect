"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  Wallet, 
  User, 
  MessageSquare, 
  PlusCircle, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Bell, 
  LogOut,
  ClipboardCheck,
  AlertCircle
} from "lucide-react";

export default function Shell({ children, title = "Dashboard" }: { children: React.ReactNode, title?: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return <>{children}</>;

  const role = session.user.role as "student" | "employer" | "admin";
  
  const navs = {
    student: [
      { icon: <Home className="w-4 h-4" />, label: 'Dashboard', href: '/student/dashboard' },
      { icon: <Search className="w-4 h-4" />, label: 'Find Jobs', href: '/student/jobs' },
      { icon: <ClipboardCheck className="w-4 h-4" />, label: 'My Applications', href: '/student/applications' },
      { icon: <Wallet className="w-4 h-4" />, label: 'Earnings', href: '/student/earnings' },
      { icon: <User className="w-4 h-4" />, label: 'My Profile', href: '/student/profile' },
      { icon: <MessageSquare className="w-4 h-4" />, label: 'Messages', href: '/student/messages' },
    ],
    employer: [
      { icon: <Home className="w-4 h-4" />, label: 'Dashboard', href: '/employer/dashboard' },
      { icon: <PlusCircle className="w-4 h-4" />, label: 'Post a Job', href: '/employer/jobs/new' },
      { icon: <Users className="w-4 h-4" />, label: 'Applicants', href: '/employer/applicants' },
      { icon: <BarChart3 className="w-4 h-4" />, label: 'Active Jobs', href: '/employer/jobs' },
      { icon: <MessageSquare className="w-4 h-4" />, label: 'Messages', href: '/employer/messages' },
      { icon: <User className="w-4 h-4" />, label: 'Profile', href: '/employer/profile' },
    ],
    admin: [
      { icon: <Home className="w-4 h-4" />, label: 'Dashboard', href: '/admin/dashboard' },
      { icon: <ShieldCheck className="w-4 h-4" />, label: 'Verify Users', href: '/admin/users' },
      { icon: <ClipboardCheck className="w-4 h-4" />, label: 'Approve Jobs', href: '/admin/jobs' },
      { icon: <AlertCircle className="w-4 h-4" />, label: 'Complaints', href: '/admin/complaints' },
      { icon: <BarChart3 className="w-4 h-4" />, label: 'Analytics', href: '/admin/stats' },
    ]
  };

  const currentNav = navs[role] || navs.student;

  return (
    <div className="shell bg-[#050508]">
      <div className="sidebar bg-[#0A0A0F] border-r border-white/[0.04]">
        <div className="logo-area py-8 px-6 border-none">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-black font-black text-xs">SC</div>
            <div>
              <div className="logo-text text-white font-black tracking-tight">StudentConnect</div>
              <div className="logo-sub text-[9px] text-slate-500 font-bold uppercase tracking-widest">Skill Economy</div>
            </div>
          </div>
        </div>
        
        <div className="role-switch px-6 mb-6">
          <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-black uppercase tracking-widest text-emerald-400 inline-block">
            {role} Portal
          </div>
        </div>

        <div className="nav-section px-4 space-y-1">
          <div className="nav-label text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4 px-2">Navigation</div>
          {currentNav.map(n => {
            const isActive = pathname === n.href || pathname.startsWith(n.href + '/');
            return (
              <Link key={n.href} href={n.href} className={`nav-item flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'text-slate-500 hover:text-white hover:bg-white/[0.02]'}`}>
                <span className={`${isActive ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-300'} transition-colors`}>{n.icon}</span>
                <span className="text-xs font-bold">{n.label}</span>
                {isActive && <div className="ml-auto w-1 h-4 rounded-full bg-emerald-500"></div>}
              </Link>
            );
          })}
        </div>

        <div className="sidebar-footer p-6 mt-auto">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center text-slate-500 group-hover:text-rose-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">Sign Out</div>
              <div className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">End Session</div>
            </div>
          </button>
        </div>
      </div>

      <div className="main bg-[#050508]">
        <header className="h-20 border-b border-white/[0.04] flex items-center justify-between px-8 bg-[#050508]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="page-title text-xl font-bold text-white tracking-tight">{title}</div>
          <div className="topbar-right flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
              <input className="bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500/20 w-48 transition-all" placeholder="Quick Search..." />
            </div>
            <button className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white transition-all relative">
              <Bell className="w-4 h-4" />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[#050508]"></div>
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-black font-black text-xs shadow-lg shadow-emerald-500/20">
              {session.user.name ? session.user.name[0].toUpperCase() : "U"}
            </div>
          </div>
        </header>
        <div className="content overflow-y-auto custom-scrollbar bg-[#050508]">
          {children}
        </div>
      </div>
    </div>
  );
}

