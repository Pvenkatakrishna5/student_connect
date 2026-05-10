"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Shell({ children, title = "Dashboard" }: { children: React.ReactNode, title?: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return <>{children}</>;

  const role = session.user.role as "student" | "employer" | "admin";
  
  const navs = {
    student: [
      { icon: '🏠', label: 'Dashboard', href: '/student/dashboard' },
      { icon: '🔍', label: 'Find Jobs', href: '/student/jobs' },
      { icon: '📋', label: 'My Applications', href: '/student/applications' },
      { icon: '💰', label: 'Earnings', href: '/student/earnings' },
      { icon: '👤', label: 'My Profile', href: '/student/profile' },
      { icon: '💬', label: 'Messages', href: '/student/messages' },
    ],
    employer: [
      { icon: '🏠', label: 'Dashboard', href: '/employer/dashboard' },
      { icon: '📝', label: 'Post a Job', href: '/employer/jobs/new' },
      { icon: '👥', label: 'Applicants', href: '/employer/applicants' },
      { icon: '📈', label: 'Active Jobs', href: '/employer/jobs' },
      { icon: '💬', label: 'Messages', href: '/employer/messages' },
    ],
    admin: [
      { icon: '🏠', label: 'Dashboard', href: '/admin/dashboard' },
      { icon: '✅', label: 'Verify Users', href: '/admin/users' },
      { icon: '📝', label: 'Approve Jobs', href: '/admin/jobs' },
      { icon: '📢', label: 'Complaints', href: '/admin/complaints' },
      { icon: '📈', label: 'Analytics', href: '/admin/stats' },
    ]
  };

  const currentNav = navs[role] || navs.student;

  return (
    <div className="shell">
      <div className="sidebar">
        <div className="logo-area">
          <div className="logo-text">StudentConnect</div>
          <div className="logo-sub">Skill-Based Job Platform</div>
        </div>
        
        <div className="role-switch">
          <div className="role-btn active" style={{ textTransform: 'capitalize', cursor: 'default' }}>
            {role === 'student' ? '📚 Student' : role === 'employer' ? '💼 Employer' : '⚙️ Admin'}
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-label">Menu</div>
          {currentNav.map(n => {
            const isActive = pathname === n.href || pathname.startsWith(n.href + '/');
            return (
              <Link key={n.href} href={n.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">{n.icon}</span>{n.label}
              </Link>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="user-pill cursor-pointer" onClick={() => signOut({ callbackUrl: '/' })}>
            <div className="user-av">
              {session.user.name ? session.user.name[0].toUpperCase() : "U"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name truncate">{session.user.name || "User"}</div>
              <div className="user-role">Logout</div>
            </div>
          </div>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="page-title">{title}</div>
          <div className="topbar-right">
            <input className="search-top" placeholder="🔍 Search..." />
            <div className="notif-btn">
              🔔<div className="notif-dot"></div>
            </div>
          </div>
        </div>
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
