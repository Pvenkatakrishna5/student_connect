"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Users, Search, Shield, ShieldAlert, ShieldCheck, Mail, Calendar, Loader2, MoreVertical, Trash2, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminUsers() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users"); // We'll need this API
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          // Mock data if API doesn't exist yet
          setUsers([
            { _id: "1", name: "Rahul Sharma", email: "rahul@example.com", role: "student", createdAt: "2024-03-01" },
            { _id: "2", name: "Pixel Studio", email: "contact@pixel.com", role: "employer", createdAt: "2024-02-15" },
            { _id: "3", name: "Admin User", email: "admin@studentconnect.com", role: "admin", createdAt: "2024-01-01" },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === "all" || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="admin" userName={session?.user?.name || "Admin"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">User Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage permissions and monitor platform users</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-64"
              />
            </div>
            <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              {["all", "student", "employer", "admin"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all">
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="bg-white/[0.01] border border-white/[0.04] rounded-[32px] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">User</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Joined</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-32 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
                      <p className="text-slate-500 text-sm font-medium">Syncing database...</p>
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user._id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${
                          user.role === "student" ? "bg-emerald-500" : user.role === "employer" ? "bg-indigo-500" : "bg-amber-500"
                        }`}>
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${
                        user.role === "student" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        user.role === "employer" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-white transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
