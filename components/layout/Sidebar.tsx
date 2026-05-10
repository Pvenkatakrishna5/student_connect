"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Briefcase, FileText, DollarSign, User, Bell,
  Settings, LogOut, ChevronLeft, ChevronRight, Users, Shield,
  BarChart3, AlertTriangle, ScrollText, Building2, UserCheck, Menu, X, Sparkles, Zap, ShieldCheck, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import NotificationCenter from "@/components/dashboard/NotificationCenter";

interface SidebarProps {
  role: "student" | "employer" | "admin";
  userName?: string;
}

const studentLinks = [
  { href: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/student/jobs", icon: Briefcase, label: "Browse Jobs" },
  { href: "/student/applications", icon: FileText, label: "Applications" },
  { href: "/student/earnings", icon: DollarSign, label: "Earnings" },
  { href: "/student/profile", icon: User, label: "My Profile" },
  { href: "/student/messages", icon: MessageSquare, label: "Messages" },
  { href: "/student/support", icon: Shield, label: "Help & Support" },
  { href: "/student/settings", icon: Settings, label: "Settings" },
];
const employerLinks = [
  { href: "/employer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/employer/jobs", icon: Briefcase, label: "Manage Jobs" },
  { href: "/employer/billing", icon: DollarSign, label: "Billing & Payments" },
  { href: "/employer/applicants", icon: Users, label: "Applicants" },
  { href: "/employer/messages", icon: MessageSquare, label: "Messages" },
  { href: "/employer/profile", icon: Building2, label: "Company Profile" },
  { href: "/employer/settings", icon: Settings, label: "Settings" },
];
const adminLinks = [
  { href: "/admin/dashboard", icon: BarChart3, label: "Analytics" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/jobs", icon: Briefcase, label: "Job Approvals" },
  { href: "/admin/complaints", icon: AlertTriangle, label: "Complaints" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];


export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = role === "student" ? studentLinks : role === "employer" ? employerLinks : adminLinks;

  const activeColor = role === "student" ? "text-emerald-400" : role === "employer" ? "text-indigo-400" : "text-amber-400";
  const activeBg = role === "student" ? "bg-emerald-500/5" : role === "employer" ? "bg-indigo-500/5" : "bg-amber-500/5";
  const activeBorder = role === "student" ? "border-emerald-500/20" : role === "employer" ? "border-indigo-500/20" : "border-amber-500/20";

  const Content = () => (
    <div className="flex flex-col h-full bg-[#050508] border-r border-white/[0.04]">
      {/* Logo & Alerts */}
      <div className="px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-white">StudentConnect</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{role}</span>
            </div>
          )}
        </Link>
        {!collapsed && <NotificationCenter />}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {links.map(link => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <div className={cn(
                "group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 border border-transparent",
                active ? `${activeBg} ${activeBorder} ${activeColor}` : "text-slate-400 hover:bg-white/[0.02] hover:text-slate-200"
              )}>
                <link.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", active ? activeColor : "text-slate-500")} />
                {!collapsed && <span className="text-sm font-bold tracking-tight">{link.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 space-y-2 mt-auto">
        {!collapsed && (
          <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.04] mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-white uppercase">
                {userName?.[0] || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{userName || "User"}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{role}</p>
              </div>
            </div>
            <Link href={role === "student" ? "/student/profile" : "/employer/profile"} className="block">
              <button className="w-full py-2.5 rounded-xl bg-white/[0.04] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all">
                View Profile
              </button>
            </Link>
          </div>
        )}

        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          {!collapsed && <span className="text-sm font-bold">Logout</span>}
        </button>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex w-full items-center justify-center py-4 text-slate-600 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button 
        className="fixed top-6 left-6 z-50 md:hidden p-3 rounded-2xl bg-[#111118] border border-white/[0.08] text-white shadow-2xl"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {mobileOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-full z-40 transition-all duration-500 ease-in-out",
        collapsed ? "w-20" : "w-72",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <Content />
      </aside>

      <div className={cn("hidden md:block transition-all duration-500", collapsed ? "w-20" : "w-72")} />
    </>
  );
}

