"use client";
import { useState, useEffect } from "react";
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Notification {
  _id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchDirect = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter((n: Notification) => !n.read).length);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDirect();
    const interval = setInterval(fetchDirect, 60000); // Polling every minute
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) return null;

  const markAsRead = async (id?: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, readAll: !id }),
      });
      if (!id) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      } else {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "error": return <XCircle className="w-4 h-4 text-rose-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group"
      >
        <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? "text-emerald-400 animate-pulse" : "text-slate-400 group-hover:text-white"}`} />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[#050508]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 z-50 bg-[#111118] border border-white/[0.08] rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.01]">
                <div>
                  <h3 className="text-lg font-bold text-white">Notifications</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Stay updated with your activities</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAsRead()}
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading && notifications.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <p className="text-xs font-medium">Fetching updates...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center opacity-40">
                    <Bell className="w-12 h-12 mb-4" />
                    <p className="text-sm font-bold">All caught up!</p>
                    <p className="text-xs">No new notifications at the moment.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.02]">
                    {notifications.map((n) => (
                      <div 
                        key={n._id}
                        onClick={() => !n.read && markAsRead(n._id)}
                        className={`p-5 transition-colors group relative cursor-pointer ${n.read ? "bg-transparent" : "bg-emerald-500/[0.02] hover:bg-emerald-500/[0.04]"}`}
                      >
                        {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            n.type === "success" ? "bg-emerald-500/5 border-emerald-500/10" :
                            n.type === "error" ? "bg-rose-500/5 border-rose-500/10" :
                            "bg-blue-500/5 border-blue-500/10"
                          }`}>
                            {getIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-bold truncate ${n.read ? "text-slate-400" : "text-white"}`}>{n.title}</h4>
                              <span className="text-[10px] text-slate-600 font-medium whitespace-nowrap ml-2">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={`text-xs leading-relaxed ${n.read ? "text-slate-500" : "text-slate-400"}`}>
                              {n.message}
                            </p>
                            {n.link && (
                              <Link 
                                href={n.link} 
                                className="mt-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-all group/link"
                                onClick={() => setIsOpen(false)}
                              >
                                View Details <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-white/[0.01] border-t border-white/[0.04] text-center">
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-white transition-colors">
                  View Full History
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
