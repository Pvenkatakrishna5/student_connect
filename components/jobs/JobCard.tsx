"use client";
import Link from "next/link";
import { Bookmark, MapPin, Clock, Star, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn, timeAgo } from "@/lib/utils";
import { JOB_CATEGORY_ICONS } from "@/lib/data";

interface JobCardProps {
  job: {
    id: string; title: string; description: string; category: string;
    payType: string; payAmount: number; duration: string; location: string;
    isRemote: boolean; skillsRequired: string[]; status?: string;
    applicantsCount: number; spotsAvailable: number;
    employer: { companyName: string; city: string; rating: number; isVerifiedBusiness: boolean; };
    createdAt: string;
  };
  compact?: boolean;
  showApplyButton?: boolean;
  onApply?: (jobId: string) => void;
}

function formatPay(payType: string, payAmount: number): string {
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  const map: Record<string, string> = {
    hourly: `${fmt(payAmount)}/hr`, monthly: `${fmt(payAmount)}/mo`,
    fixed: `${fmt(payAmount)}`, "per-word": `₹${payAmount}/word`, "per-day": `${fmt(payAmount)}/day`,
  };
  return map[payType] || fmt(payAmount);
}

export default function JobCard({ job, compact, showApplyButton = true, onApply }: JobCardProps) {
  const [saved, setSaved] = useState(false);
  const icon = JOB_CATEGORY_ICONS[job.category] || "💼";
  const payDisplay = formatPay(job.payType, job.payAmount);
  const jobId = job.id;
  const employer = job.employer || {};

  return (
    <div className={cn(
      "group relative overflow-hidden bg-white/[0.02] border border-white/[0.04] rounded-[32px] p-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.1] hover:translate-y-[-4px]",
      compact ? "p-4" : "p-6"
    )}>
      {/* Background glow on hover */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.05] flex items-center justify-center text-xl shadow-inner shadow-white/5">
            {icon}
          </div>
          <div className="min-w-0">
            <Link href={`/student/jobs/${jobId}`}>
              <h3 className={cn(
                "font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors truncate",
                compact ? "text-sm" : "text-lg"
              )}>
                {job.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 font-medium truncate">{employer.companyName || "Employer"}</span>
              {employer.isVerifiedBusiness && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-black uppercase text-emerald-400 tracking-tighter">Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
            saved 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10" 
              : "bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.08]"
          )}
        >
          <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
        </button>
      </div>

      {/* Description */}
      {!compact && (
        <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-2 relative z-10">
          {job.description}
        </p>
      )}

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-6 relative z-10">
        {job.skillsRequired?.slice(0, 3).map(skill => (
          <span key={skill} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/[0.03] text-slate-400 border border-white/[0.05] group-hover:border-white/[0.1] transition-colors">
            {skill}
          </span>
        ))}
        {job.skillsRequired?.length > 3 && (
          <span className="text-[10px] font-bold text-slate-600 flex items-center px-1">
            +{job.skillsRequired.length - 3}
          </span>
        )}
      </div>

      {/* Meta Row */}
      <div className="flex items-center gap-4 mb-6 flex-wrap relative z-10">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-emerald-500/60" />
          {job.isRemote ? "Remote" : job.location}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-amber-500/60" />
          {job.duration || "Short-term"}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Star className="w-3.5 h-3.5 text-rose-500/60" />
          {employer.rating || "4.5"}
        </div>
        <div className="ml-auto text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          {timeAgo(job.createdAt)}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="flex items-center justify-between pt-5 border-t border-white/[0.04] relative z-10">
        <div>
          <div className="text-2xl font-bold text-white tracking-tighter">
            {payDisplay.split("/")[0]}<span className="text-xs text-slate-500 font-normal tracking-normal">{payDisplay.includes("/") ? `/${payDisplay.split("/")[1]}` : ""}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
            {job.applicantsCount || 0} applied · {job.spotsAvailable || 1} spot{job.spotsAvailable !== 1 ? "s" : ""}
          </div>
        </div>
        {showApplyButton && (
          <button 
            onClick={() => onApply?.(jobId)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            Apply <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="job-card p-5">
      <div className="flex gap-3 mb-3">
        <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1"><div className="skeleton h-4 rounded-lg mb-2 w-3/4" /><div className="skeleton h-3 rounded-lg w-1/2" /></div>
      </div>
      <div className="skeleton h-3 rounded-lg mb-2 w-full" /><div className="skeleton h-3 rounded-lg mb-3 w-5/6" />
      <div className="flex gap-2 mb-3"><div className="skeleton h-5 rounded-lg w-16" /><div className="skeleton h-5 rounded-lg w-20" /></div>
      <div className="flex justify-between items-center"><div className="skeleton h-6 rounded-lg w-24" /><div className="skeleton h-9 rounded-xl w-20" /></div>
    </div>
  );
}
