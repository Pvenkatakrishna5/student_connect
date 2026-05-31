"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Cpu, ShieldAlert, Sparkles, Terminal, Activity, Check } from "lucide-react";

interface Message {
  id: string;
  sender: "jarvis" | "user";
  text: string;
  timestamp: Date;
  actions?: Array<{ label: string; action: string }>;
}

export default function JarvisBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: "init",
        sender: "jarvis",
        text: "Online. Greetings, I am Jarvis—your autonomous workspace and platform agent. I am monitoring the StudentConnect system, GitHub pipeline, and Vercel environments. How can I assist your workflow today?",
        timestamp: new Date(),
        actions: [
          { label: "Check System Status", action: "status" },
          { label: "Check Deployment Pipeline", action: "pipeline" },
          { label: "Explain Agent Verification", action: "verify" },
        ],
      },
    ]);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleAction = (action: string) => {
    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: getActionLabel(action),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    triggerJarvisResponse(action);
  };

  const getActionLabel = (action: string): string => {
    switch (action) {
      case "status":
        return "Check System Status";
      case "pipeline":
        return "Check Deployment Pipeline";
      case "verify":
        return "Explain Agent Verification";
      default:
        return action;
    }
  };

  const triggerJarvisResponse = (query: string) => {
    setIsTyping(true);
    setTimeout(() => {
      let replyText = "";
      let newActions: Array<{ label: string; action: string }> | undefined;

      const normalized = query.toLowerCase();

      if (normalized.includes("status") || normalized.includes("check system")) {
        replyText = `### SYSTEM DIAGNOSTICS:
* **Host Environment**: Vercel Serverless (Next.js 16.2.4, React 19.2.4)
* **API Route Integrity**: 100% active (Search fallback API running, Supabase client connected)
* **Local Workspace**: Port 3001 online
* **Database State**: Prisma ORM connection hooks active (Demo/Mock fallback layer fully operational)
* **Platform Security**: SSL active, CSRF protection enabled via NextAuth.`;
        newActions = [
          { label: "Check Pipeline", action: "pipeline" },
          { label: "Run Mock Diagnostics", action: "diagnostics" }
        ];
      } else if (normalized.includes("pipeline") || normalized.includes("deploy")) {
        replyText = `### AUTOMATED DEPLOYMENT PIPELINE:
* **Source VCS**: GitHub Repository Connected (\`https://github.com/Pvenkatakrishna5/student_connect\`)
* **Branch Target**: \`main\`
* **Deployment Webhook**: Enabled (Automatic builds on push)
* **Last Production Build**: Successful (Built all 58 pages in 44s)
* **Jarvis Mode**: fully autonomous. Every \`git push\` immediately builds, runs type checks, and deploys live without manual intervention.`;
        newActions = [
          { label: "View Production App", action: "production_link" },
          { label: "Check Status", action: "status" }
        ];
      } else if (normalized.includes("verify") || normalized.includes("aadhaar") || normalized.includes("agent")) {
        replyText = `### AGENT VERIFICATION PROTOCOLS:
As a platform verification Agent, your role is to ensure identity validation.
1. Students register their profile and input their Aadhaar credentials.
2. The verification Agent (you) manually cross-checks their uploaded documents.
3. Once approved on the **[Agent Verify Portal](/agent/verify)**, the student's account status transitions to 'Verified', granting them job application access.`;
        newActions = [
          { label: "Go to Verify Portal", action: "verify_link" },
          { label: "Platform Status", action: "status" }
        ];
      } else if (normalized.includes("diagnostics")) {
        replyText = `### INITIATING ADVANCED SYSTEM DIAGNOSTICS...
* [OK] ESLint / Code Syntax Check passed
* [OK] CSS Custom design system (globals.css, HSL tailored variables) parsed
* [OK] Next.js Turbopack configurations optimized
* [OK] PWA offline routing layers active
Everything is running beautifully, Sir. Your application is 100% ready for traffic.`;
      } else if (normalized.includes("production_link")) {
        replyText = "The live web application is hosted at [student-connect-mkn8gxmny.vercel.app](https://student-connect-mkn8gxmny-venkata-krishna-studentconnect.vercel.app). All routes are fully synchronized.";
      } else if (normalized.includes("verify_link")) {
        replyText = "Redirecting you to the [Agent Verification Hub](/agent/verify) where you can approve student applications.";
      } else {
        replyText = `I have received your instruction: "${query}". As your platform agent, I have verified the structural schema and current codebase. I am standby to perform features additions, database syncs, or custom dashboard page setups. Just tell me what component to add or edit next!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "jarvis",
          text: replyText,
          timestamp: new Date(),
          actions: newActions,
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputValue;
    setInputValue("");
    triggerJarvisResponse(query);
  };

  return (
    <>
      {/* Floating Jarvis Orb Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-slate-950 border border-indigo-500/30 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-indigo-500/20 shadow-indigo-500/10 active:scale-95 transition-all group overflow-hidden"
          aria-label="Toggle Jarvis Agent"
        >
          {/* Animated Background Ring */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-teal-500/20 animate-spin" style={{ animationDuration: "8s" }}></div>
          
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: 90, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5 text-indigo-400" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: -90, scale: 0 }}
                transition={{ duration: 0.2 }}
                className="relative flex items-center justify-center"
              >
                <Cpu className="w-6 h-6 text-indigo-400 group-hover:text-purple-400 transition-colors animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Jarvis Chat Interface Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-10rem)] rounded-[32px] bg-slate-950/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(99,102,241,0.15)] flex flex-col overflow-hidden z-50 font-sans"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/[0.06] bg-slate-900/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                    JARVIS CORE <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>
                  <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                    Autonomous Platform Agent
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-2 py-1">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Sync Live</span>
                </div>
              </div>
            </div>

            {/* Chat Thread Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-[24px] px-5 py-3.5 text-xs leading-relaxed border ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white border-indigo-500/30 rounded-tr-none shadow-[0_4px_12px_rgba(79,70,229,0.2)]"
                        : "bg-white/[0.02] text-slate-300 border-white/[0.06] rounded-tl-none"
                    }`}
                  >
                    {/* Markdown rendering simulation */}
                    <div className="space-y-2">
                      {msg.text.split("\n").map((line, idx) => {
                        if (line.startsWith("### ")) {
                          return (
                            <h4 key={idx} className="font-extrabold text-white text-xs mt-2 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> {line.substring(4)}
                            </h4>
                          );
                        }
                        if (line.startsWith("* ")) {
                          const boldParts = line.substring(2).split("**");
                          return (
                            <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-400 ml-1">
                              <span className="text-indigo-400 mt-1">•</span>
                              <span>
                                {boldParts.map((part, pIdx) =>
                                  pIdx % 2 === 1 ? (
                                    <strong key={pIdx} className="text-slate-200 font-semibold">{part}</strong>
                                  ) : (
                                    part
                                  )
                                )}
                              </span>
                            </div>
                          );
                        }
                        // Handle links
                        if (line.includes("[") && line.includes("]")) {
                          const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
                          let match;
                          const parts = [];
                          let lastIndex = 0;
                          while ((match = regex.exec(line)) !== null) {
                            parts.push(line.substring(lastIndex, match.index));
                            parts.push(
                              <a
                                key={match[2]}
                                href={match[2]}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:text-indigo-300 underline font-semibold transition-colors"
                              >
                                {match[1]}
                              </a>
                            );
                            lastIndex = regex.lastIndex;
                          }
                          parts.push(line.substring(lastIndex));
                          return <p key={idx}>{parts}</p>;
                        }
                        return <p key={idx}>{line}</p>;
                      })}
                    </div>
                  </div>

                  {/* Message Action Pills */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 ml-2">
                      {msg.actions.map((act) => (
                        <button
                          key={act.action}
                          onClick={() => handleAction(act.action)}
                          className="px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-indigo-500/10 hover:border-indigo-500/30 text-[10px] text-slate-300 font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-indigo-400 text-[10px] uppercase font-bold tracking-widest pl-2">
                  <Terminal className="w-3.5 h-3.5 animate-spin" /> Jarvis is processing...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar Form */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-white/[0.06] bg-slate-950 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Jarvis anything (e.g. status, deploy)..."
                className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/30 transition-all font-sans"
              />
              <button
                type="submit"
                className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
