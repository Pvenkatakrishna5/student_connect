"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  User, 
  MessageSquare,
  Search,
  PlusCircle,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  role: "student" | "employer" | "admin" | "agent";
}

export default function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();

  const studentLinks = [
    { href: "/student/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/student/search", icon: Search, label: "Search" },
    { href: "/student/applications", icon: FileText, label: "Applied" },
    { href: "/student/messages", icon: MessageSquare, label: "Chat" },
    { href: "/student/profile", icon: User, label: "Profile" },
  ];

  const employerLinks = [
    { href: "/employer/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/employer/jobs", icon: Briefcase, label: "My Jobs" },
    { href: "/employer/jobs/new", icon: PlusCircle, label: "Post" },
    { href: "/employer/messages", icon: MessageSquare, label: "Chat" },
    { href: "/employer/profile", icon: User, label: "Profile" },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Stats" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/jobs", icon: Briefcase, label: "Review" },
    { href: "/admin/settings", icon: User, label: "Settings" },
  ];

  const agentLinks = [
    { href: "/agent/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/agent/verify", icon: FileText, label: "Verify" },
    { href: "/agent/jobs", icon: Briefcase, label: "Jobs" },
  ];

  const links = role === "student" ? studentLinks : role === "employer" ? employerLinks : role === "admin" ? adminLinks : agentLinks;
  const activeColor = role === "student" ? "text-emerald-400" : role === "employer" ? "text-indigo-400" : role === "admin" ? "text-amber-400" : "text-amber-400";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-[#050508]/80 backdrop-blur-2xl border-t border-white/[0.04]">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center gap-1.5 px-3 py-2 relative">
              <link.icon className={cn(
                "w-5 h-5 transition-all duration-300",
                active ? `${activeColor} scale-110` : "text-slate-500"
              )} />
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-widest",
                active ? activeColor : "text-slate-600"
              )}>
                {link.label}
              </span>
              {active && (
                <div className={cn(
                  "absolute -bottom-1 w-1 h-1 rounded-full",
                  role === "student" ? "bg-emerald-400" : role === "employer" ? "bg-indigo-400" : "bg-amber-400"
                )} />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
