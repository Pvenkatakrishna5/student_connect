"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Bell, Search, ChevronDown } from "lucide-react";

interface NavbarProps {
  role?: "student" | "employer" | "admin" | null;
  userName?: string;
}

export default function Navbar({ role, userName }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Browse Jobs", href: "/student/jobs" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "For Employers", href: "/#employers" },
    { label: "About", href: "/#about" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16"
        style={{
          background: "rgba(10,10,15,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
              style={{ background: "linear-gradient(135deg,#6C63FF,#00D9A3)" }}>
              SC
            </div>
            <span className="font-syne font-bold text-lg hidden sm:block" style={{ color: "#F0F0FF" }}>
              StudentConnect
            </span>
          </Link>

          {/* Desktop Nav */}
          {!role && (
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href}
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: "#8B8BA8" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* Search bar (dashboard) */}
          {role && (
            <div className="flex-1 max-w-md hidden md:flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{ background: "rgba(28,28,40,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#4A4A6A" }} />
              <input
                type="text"
                placeholder="Search jobs, skills, employers..."
                className="bg-transparent text-sm outline-none flex-1 placeholder:text-text-disabled"
                style={{ color: "#F0F0FF" }}
              />
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {role ? (
              <>
                {/* Notification bell */}
                <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-bg-tertiary"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Bell className="w-4 h-4" style={{ color: "#8B8BA8" }} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                    style={{ background: "#FF4D6D" }} />
                </button>

                {/* User menu */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-bg-tertiary transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: "linear-gradient(135deg,#6C63FF,#00D9A3)" }}>
                    {userName?.[0] || "U"}
                  </div>
                  <span className="text-sm font-medium hidden sm:block" style={{ color: "#F0F0FF" }}>
                    {userName?.split(" ")[0] || "User"}
                  </span>
                  <ChevronDown className="w-3 h-3" style={{ color: "#8B8BA8" }} />
                </div>
              </>
            ) : (
              <>
                <Link href="/login"
                  className="text-sm px-4 py-2 rounded-xl transition-colors hidden sm:block"
                  style={{ color: "#8B8BA8" }}>
                  Log in
                </Link>
                <Link href="/register"
                  className="text-sm px-4 py-2 rounded-xl font-semibold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#6C63FF,#5A52E8)", color: "#fff" }}>
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t" style={{ background: "rgba(10,10,15,0.97)", borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href}
                  className="text-sm py-2" style={{ color: "#8B8BA8" }}
                  onClick={() => setMobileOpen(false)}>
                  {l.label}
                </Link>
              ))}
              {!role && (
                <div className="flex gap-3 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <Link href="/login" className="flex-1 text-center py-2 rounded-xl text-sm"
                    style={{ border: "1px solid rgba(255,255,255,0.06)", color: "#8B8BA8" }}>
                    Log in
                  </Link>
                  <Link href="/register" className="flex-1 text-center py-2 rounded-xl text-sm font-semibold"
                    style={{ background: "#6C63FF", color: "#fff" }}>
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
