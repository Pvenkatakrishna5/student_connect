"use client";

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({ percent, size = 80, strokeWidth = 6, label, sublabel }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5B4FE9" />
              <stop offset="100%" stopColor="#00C896" />
            </linearGradient>
          </defs>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#EEF0F8" strokeWidth={strokeWidth} />
          <circle cx={center} cy={center} r={radius} fill="none" stroke="url(#ringGrad)" strokeWidth={strokeWidth}
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            className="progress-ring-circle" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-syne font-bold text-sm" style={{ color: "#12101F" }}>{percent}%</span>
        </div>
      </div>
      {label && <div className="text-xs font-semibold" style={{ color: "#12101F" }}>{label}</div>}
      {sublabel && <div className="text-xs text-center" style={{ color: "#A8A8C0" }}>{sublabel}</div>}
    </div>
  );
}
