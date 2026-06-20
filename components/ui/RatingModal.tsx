"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Sparkles } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number, review: string) => Promise<void>;
  title: string;
  subtitle: string;
  submitLabel?: string;
  accentColor?: "purple" | "emerald" | "indigo" | "amber";
}

const ACCENT = {
  purple: {
    gradient: "from-purple-500 to-indigo-500",
    ring: "focus:ring-purple-500/20 focus:border-purple-500/40",
    btn: "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-purple-500/20",
    icon: "text-purple-400 bg-purple-500/10",
    bar: "from-purple-500 to-indigo-500",
  },
  emerald: {
    gradient: "from-emerald-500 to-teal-500",
    ring: "focus:ring-emerald-500/20 focus:border-emerald-500/40",
    btn: "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20",
    icon: "text-emerald-400 bg-emerald-500/10",
    bar: "from-emerald-500 to-teal-400",
  },
  indigo: {
    gradient: "from-indigo-500 to-blue-500",
    ring: "focus:ring-indigo-500/20 focus:border-indigo-500/40",
    btn: "bg-gradient-to-r from-indigo-500 to-blue-500 shadow-indigo-500/20",
    icon: "text-indigo-400 bg-indigo-500/10",
    bar: "from-indigo-500 to-blue-400",
  },
  amber: {
    gradient: "from-amber-500 to-orange-400",
    ring: "focus:ring-amber-500/20 focus:border-amber-500/40",
    btn: "bg-gradient-to-r from-amber-500 to-orange-400 shadow-amber-500/20",
    icon: "text-amber-400 bg-amber-500/10",
    bar: "from-amber-500 to-orange-400",
  },
};

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

export default function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  submitLabel = "Submit Review",
  accentColor = "purple",
}: RatingModalProps) {
  const [score, setScore] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const accent = ACCENT[accentColor];
  const displayScore = hovered || score;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(score, review);
      setScore(5);
      setReview("");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await onSubmit(0, "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-md bg-[#0A0A0F] border border-white/[0.08] rounded-[40px] p-8 overflow-hidden shadow-2xl"
          >
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accent.bar}`} />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-500 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className={`w-16 h-16 rounded-3xl ${accent.icon} flex items-center justify-center mx-auto mb-4`}>
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-1">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{subtitle}</p>
            </div>

            {/* Stars */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setScore(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-all duration-150 hover:scale-125 active:scale-95"
                  >
                    <Star
                      className={`w-9 h-9 transition-all ${
                        star <= displayScore
                          ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          : "text-slate-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <motion.div
                key={displayScore}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-black text-amber-400 uppercase tracking-widest"
              >
                {LABELS[displayScore]}
              </motion.div>
            </div>

            {/* Review text */}
            <div className="mb-6 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">
                Written Review <span className="text-slate-700 normal-case font-normal">(optional)</span>
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience — quality of work, communication, reliability..."
                rows={3}
                className={`w-full px-5 py-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl ${accent.ring} outline-none text-sm text-white resize-none transition-all placeholder:text-slate-700`}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                disabled={loading}
                className="flex-1 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-sm font-bold text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-50"
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || score === 0}
                className={`flex-[2] py-3.5 rounded-2xl ${accent.btn} text-white font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:scale-100`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Submitting...
                  </span>
                ) : submitLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
