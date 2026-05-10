"use client";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  accent?: boolean;
  className?: string;
}

export default function StatCard({ label, value, subtext, trend, icon, accent, className }: StatCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden p-6 rounded-[28px] border transition-all duration-300 hover:scale-[1.02]",
      accent 
        ? "bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-400/30 shadow-lg shadow-indigo-500/20" 
        : "bg-white/[0.02] border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.04]",
      className
    )}>
      {/* Decorative Blur */}
      {accent && <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 blur-3xl rounded-full" />}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            accent ? "bg-white/20 text-white" : "bg-white/[0.05] text-slate-400"
          )}>
            {icon}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
              trend === "up" 
                ? (accent ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-400")
                : (accent ? "bg-white/20 text-white" : "bg-rose-500/10 text-rose-400")
            )}>
              {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend === "up" ? "High" : "Low"}
            </div>
          )}
        </div>

        <div className={cn(
          "text-[10px] font-black uppercase tracking-[0.2em] mb-1",
          accent ? "text-white/60" : "text-slate-500"
        )}>
          {label}
        </div>
        
        <div className={cn(
          "text-3xl font-bold tracking-tighter",
          accent ? "text-white" : "text-white"
        )}>
          {value}
        </div>
        
        {subtext && (
          <p className={cn(
            "text-[11px] mt-2 font-medium",
            accent ? "text-white/60" : "text-slate-500"
          )}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card rounded-2xl p-5">
      <div className="skeleton h-3 w-16 rounded mb-3" />
      <div className="skeleton h-7 w-24 rounded-lg mb-2" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  );
}
