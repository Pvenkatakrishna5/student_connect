"use client";
import { useState, useEffect } from "react";
import { Smartphone, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if we are on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShow(true);
      });

      // Show even if beforeinstallprompt doesn't fire (for some browsers)
      // but only after a short delay
      setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches) {
          setShow(true);
        }
      }, 3000);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instructions for iOS
      alert("To install StudentConnect:\n1. Open Share Menu\n2. Scroll down and tap 'Add to Home Screen'");
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[60] md:hidden"
        >
          <div className="bg-[#111118] border border-emerald-500/30 rounded-3xl p-4 shadow-[0_20px_50px_rgba(16,185,129,0.2)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white leading-tight">Install StudentConnect</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Better experience on mobile</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleInstall}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
              >
                Install
              </button>
              <button 
                onClick={() => setShow(false)}
                className="p-2.5 rounded-xl bg-white/[0.05] text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
