"use client";
import { useState, useEffect, Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import JobCard from "@/components/jobs/JobCard";
import { Search, Filter, SlidersHorizontal, Loader2, Sparkles, X, ChevronDown, MapPin, DollarSign, Briefcase } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

function SearchContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [showFilters, setShowFilters] = useState(false);
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPay, setMinPay] = useState(searchParams.get("minPay") || "0");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (category !== "All") params.append("category", category);
      if (location) params.append("location", location);
      if (minPay !== "0") params.append("minPay", minPay);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (category !== "All") params.append("category", category);
    if (location) params.append("location", location);
    if (minPay !== "0") params.append("minPay", minPay);
    router.push(`/student/search?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen bg-[#050508] text-slate-200">
      <Sidebar role="student" userName={session?.user?.name || "Student"} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Search Header */}
        <header className="sticky top-0 z-30 px-8 py-8 border-b border-white/[0.04] bg-[#050508]/80 backdrop-blur-xl">
          <form onSubmit={handleSearch} className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by title, skills, or description..." 
                className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all outline-none"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-4 rounded-2xl border transition-all flex items-center gap-3 font-bold text-sm ${
                  showFilters ? "bg-emerald-500 text-black border-emerald-500" : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <button 
                type="submit"
                className="px-10 py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="max-w-5xl mx-auto pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1 flex items-center gap-2">
                      <Briefcase className="w-3 h-3" /> Category
                    </label>
                    <select 
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111118] border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-emerald-500/40"
                    >
                      <option>All</option>
                      <option>Tutoring</option>
                      <option>Technical</option>
                      <option>Creative</option>
                      <option>Data Entry</option>
                      <option>Event Management</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Location
                    </label>
                    <input 
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Bangalore, Remote"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1 flex items-center gap-2">
                      <DollarSign className="w-3 h-3" /> Minimum Pay
                    </label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="0" 
                        max="5000" 
                        step="100"
                        value={minPay}
                        onChange={e => setMinPay(e.target.value)}
                        className="flex-1 accent-emerald-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm font-bold text-white min-w-[60px]">₹{minPay}+</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                {loading ? "Searching..." : `${jobs.length} Results Found`}
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </h2>
              {jobs.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  Sort by: <span className="text-white flex items-center gap-1 cursor-pointer">Relevance <ChevronDown className="w-4 h-4" /></span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="text-slate-500 font-medium">Scanning for the best opportunities...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 rounded-[32px] bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-8">
                  <Search className="w-10 h-10 text-slate-700" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">No matches found</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">Try adjusting your filters or search terms. Maybe search for broader skills or categories.</p>
                <button 
                  onClick={() => { setQuery(""); setCategory("All"); setLocation(""); setMinPay("0"); }}
                  className="px-8 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white font-bold text-sm hover:bg-white/[0.08] transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {jobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#050508] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
