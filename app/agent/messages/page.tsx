"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useSession } from "next-auth/react";
import { Send, User as UserIcon, Loader2, Search, MoreVertical, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function AgentMessagesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChatRef = useRef<any>(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    fetchConversations().then((convs) => {
      const userId = searchParams.get("userId");
      if (userId && convs) {
        const chat = convs.find((c: any) => c.otherId === userId);
        if (chat) handleSelectChat(chat);
      }
    });
  }, [searchParams]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('realtime_agent_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'Message',
        filter: `receiverId=eq.${session.user.id}`
      }, (payload) => {
        const newMsg = payload.new;
        if (activeChatRef.current && newMsg.senderId === activeChatRef.current.otherId) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      const convList = Array.isArray(data) ? data : [];
      setConversations(convList);
      return convList;
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherId: string) => {
    try {
      const res = await fetch(`/api/messages?userId=${otherId}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectChat = (conv: any) => {
    setActiveChat(conv);
    fetchMessages(conv.otherId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const msgText = newMessage.trim();
    setNewMessage("");

    const tempMsg = {
      id: Date.now().toString(),
      senderId: session?.user?.id,
      receiverId: activeChat.otherId,
      content: msgText,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeChat.otherId, content: msgText }),
      });
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="agent" userName={session?.user?.name || "Agent"} />
      
      <div className="flex-1 flex flex-col md:flex-row min-w-0 h-screen overflow-hidden">
        <div className="w-full md:w-96 border-r border-white/[0.04] flex flex-col bg-[#050508]/50 backdrop-blur-3xl">
          <div className="p-8 border-b border-white/[0.04]">
            <h2 className="text-2xl font-black text-white mb-6 tracking-tighter">Support Inbox</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="w-full pl-11 pr-4 py-3.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl text-sm focus:outline-none focus:border-amber-500/40 transition-all text-white placeholder:text-slate-600"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Syncing Inbox</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <MessageSquare className="w-10 h-10 mx-auto mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.otherId} 
                  onClick={() => handleSelectChat(conv)}
                  className={`p-4 rounded-[24px] cursor-pointer transition-all flex items-center gap-4 relative group ${activeChat?.otherId === conv.otherId ? 'bg-white/[0.06] border border-white/[0.04] shadow-xl' : 'hover:bg-white/[0.02] border border-transparent'}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-white/[0.04] flex items-center justify-center text-white flex-shrink-0 relative">
                    <UserIcon className="w-5 h-5 text-amber-400" />
                    {conv.isRead === false && conv.senderId !== session?.user?.id && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-[#050508] shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">{conv.user?.name || "Partner"}</h4>
                      <span className="text-[10px] text-slate-500 font-medium">{new Date(conv.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className={`text-xs truncate ${conv.isRead === false && conv.senderId !== session?.user?.id ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#08080C] relative">
          <AnimatePresence mode="wait">
            {activeChat ? (
              <motion.div 
                key={activeChat.otherId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                <div className="p-6 md:px-10 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl flex justify-between items-center z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-amber-500/20">
                      {activeChat.user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white leading-tight">{activeChat.user?.name || "Contact"}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80">{activeChat.user?.role || "User"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-white transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === session?.user?.id;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        key={msg.id || idx} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] md:max-w-[60%] p-5 rounded-[28px] shadow-2xl ${isMe ? 'bg-amber-500 text-black rounded-br-none shadow-amber-500/10' : 'bg-white/[0.03] border border-white/[0.06] text-slate-200 rounded-bl-none shadow-black/40'}`}>
                          <p className="text-[15px] leading-relaxed font-medium">{msg.content}</p>
                          <div className={`flex items-center gap-2 mt-3 ${isMe ? 'justify-end text-black/40' : 'text-slate-600'}`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-6 md:p-8 bg-[#050508]/80 backdrop-blur-2xl border-t border-white/[0.04]">
                  <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a response..." 
                      className="flex-1 px-6 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-sm focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 text-white placeholder-slate-600 transition-all outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-4 bg-amber-500 text-black rounded-2xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-20 disabled:grayscale flex items-center justify-center"
                    >
                      <Send className="w-5 h-5 fill-current" />
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-10 text-center">
                <div className="w-24 h-24 rounded-[40px] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-8 shadow-2xl">
                  <MessageSquare className="w-10 h-10 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Support Inbox</h3>
                <p className="text-sm max-w-xs leading-relaxed opacity-60 font-medium">Coordinate with students and employers to resolve platform issues and verify details.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function AgentMessages() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#050508] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    }>
      <AgentMessagesContent />
    </Suspense>
  );
}
