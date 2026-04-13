import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Trophy, Sparkles, Users, ArrowRight, Gift, Clock, Star,
  Zap, Crown, Target, Search, CheckCircle2, Copy
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import { getContests, checkEntryCode, type ContestData } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

function ContestCard({ contest, index }: { contest: ContestData; index: number }) {
  const spotsPercent = ((contest.maxSpots - contest.spotsRemaining) / contest.maxSpots) * 100;
  const isUpcoming = contest.status === "upcoming";
  const isFull = contest.isFull;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <Link href={isUpcoming ? "#" : `/giveaway/${contest.slug}`}>
        <div className={`glass-card overflow-hidden group cursor-pointer transition-all duration-300 ${isUpcoming ? "opacity-60" : ""} ${isFull ? "opacity-70" : ""}`}>
          <div className="card-shine" />

          <div className="relative z-[2] p-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {isUpcoming ? (
                  <div className="premium-badge !text-[9px]" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Clock className="w-2.5 h-2.5 mr-1" />
                    Coming Soon
                  </div>
                ) : isFull ? (
                  <div className="premium-badge !text-[9px]" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                    Full
                  </div>
                ) : (
                  <div className="premium-badge premium-badge-hot !text-[9px]">
                    <Zap className="w-2.5 h-2.5 mr-1" />
                    Live
                  </div>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white/40" />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-display font-light text-white mb-2">{contest.name}</h3>
            <p className="text-xs text-white/35 font-light leading-relaxed mb-4 line-clamp-2">{contest.description}</p>

            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <Gift className="w-4 h-4 text-white/50 shrink-0" />
              <div>
                <div className="text-sm font-display font-light text-white">{contest.prize}</div>
                {contest.prizeValue && (
                  <div className="text-[10px] text-white/30 font-light">Worth {contest.prizeValue}</div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-white/30 font-display uppercase tracking-widest">Spots Filled</span>
                <span className="text-xs text-white/50 font-light">{contest.totalEntries}/{contest.maxSpots}</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${spotsPercent}%`,
                    background: isFull
                      ? "rgba(255,255,255,0.2)"
                      : "linear-gradient(90deg, rgba(120, 30, 40, 0.8), rgba(180, 40, 50, 0.6))",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-white/25" />
                  <span className="text-[10px] text-white/30 font-light">{contest.spotsRemaining} left</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-white/25" />
                  <span className="text-[10px] text-white/30 font-light">{contest.maxSpots} max</span>
                </div>
              </div>
              {!isUpcoming && !isFull && (
                <div className="flex items-center gap-1 text-xs text-white/40 group-hover:text-white/60 transition-colors">
                  <span className="font-light">Enter</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Giveaway() {
  const [contests, setContests] = useState<ContestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checkError, setCheckError] = useState("");

  useEffect(() => {
    getContests().then((data) => {
      setContests(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCheckCode = async () => {
    if (!searchCode.trim()) return;
    setChecking(true);
    setCheckError("");
    setCheckResult(null);
    const result = await checkEntryCode(searchCode.trim());
    if (result.found) {
      setCheckResult(result.entry);
    } else {
      setCheckError(result.error || "Entry code not found");
    }
    setChecking(false);
  };

  const activeContests = contests.filter(c => c.status === "active" && !c.isFull);
  const upcomingContests = contests.filter(c => c.status === "upcoming");
  const completedContests = contests.filter(c => c.isFull || c.status === "completed");

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <SiteNav activePage="giveaway" />

      <main className="relative z-10 pt-28 pb-20 sm:pt-36 sm:pb-32">
        <div className="container mx-auto px-4 max-w-5xl">

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] mb-4">
              <Crown className="w-3 h-3 text-white/40" />
              <span className="text-[10px] text-white/40 font-display uppercase tracking-widest">Daily Prize Draws</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-extralight text-white mb-4 tracking-tight">
              Contest Hub
            </h1>
            <p className="text-sm sm:text-base text-white/35 font-light max-w-xl mx-auto leading-relaxed">
              Choose a contest, complete partner registrations, and enter for a chance to win amazing prizes. Each contest has limited spots — act fast!
            </p>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="mb-10">
            <div className="glass-card p-4 sm:p-5">
              <div className="card-shine" />
              <div className="relative z-[2]">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-white/30" />
                  <span className="text-sm font-display font-light text-white">Check Entry Code</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    placeholder="X247-XXXX-XXXX"
                    className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-white/20 font-mono focus:outline-none focus:border-white/[0.12]"
                    onKeyDown={(e) => e.key === "Enter" && handleCheckCode()}
                  />
                  <button
                    onClick={handleCheckCode}
                    disabled={checking || !searchCode.trim()}
                    className="px-5 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white/70 font-light hover:bg-white/[0.08] transition-all disabled:opacity-30"
                  >
                    {checking ? "..." : "Check"}
                  </button>
                </div>
                {checkError && (
                  <p className="text-xs text-red-400/60 font-light mt-2">{checkError}</p>
                )}
                {checkResult && (
                  <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white/50" />
                      <span className="text-xs text-white/60 font-light">Entry Found</span>
                    </div>
                    <div className="text-xs text-white/40 font-light space-y-0.5">
                      <p>Code: <span className="text-white/60 font-mono">{checkResult.entryCode}</span></p>
                      <p>Name: <span className="text-white/60">{checkResult.fullName}</span></p>
                      <p>Entries: <span className="text-white/60">{checkResult.entryCount}</span></p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeContests.length > 0 && (
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-red-500/60 to-red-500/0" />
                    <h2 className="text-lg sm:text-xl font-display font-light text-white">Active Contests</h2>
                    <span className="text-[10px] text-white/25 font-light">{activeContests.length} available</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeContests.map((contest, i) => (
                      <ContestCard key={contest.id} contest={contest} index={i + 3} />
                    ))}
                  </div>
                </motion.div>
              )}

              {upcomingContests.length > 0 && (
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/30 to-white/0" />
                    <h2 className="text-lg sm:text-xl font-display font-light text-white">Upcoming</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingContests.map((contest, i) => (
                      <ContestCard key={contest.id} contest={contest} index={i + 5} />
                    ))}
                  </div>
                </motion.div>
              )}

              {completedContests.length > 0 && (
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/15 to-white/0" />
                    <h2 className="text-lg sm:text-xl font-display font-light text-white/60">Completed</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedContests.map((contest, i) => (
                      <ContestCard key={contest.id} contest={contest} index={i + 7} />
                    ))}
                  </div>
                </motion.div>
              )}

              {contests.length === 0 && (
                <div className="text-center py-20">
                  <Trophy className="w-12 h-12 text-white/15 mx-auto mb-4" />
                  <h3 className="text-xl font-display font-light text-white/50 mb-2">No Contests Yet</h3>
                  <p className="text-sm text-white/30 font-light">Check back soon for exciting giveaway contests!</p>
                </div>
              )}
            </>
          )}

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8} className="mt-12">
            <div className="glass-card p-6 sm:p-8">
              <div className="card-shine" />
              <div className="relative z-[2] text-center">
                <h3 className="text-lg sm:text-xl font-display font-light text-white mb-3">How It Works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                  {[
                    { icon: <Star className="w-5 h-5" />, title: "Choose a Contest", desc: "Pick from active contests with prizes you want to win" },
                    { icon: <Sparkles className="w-5 h-5" />, title: "Complete Registrations", desc: "Register with partner platforms and upload screenshot proof" },
                    { icon: <Trophy className="w-5 h-5" />, title: "Win Prizes", desc: "Each registration = 1 entry. More entries = higher chances!" },
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3 text-white/40">
                        {step.icon}
                      </div>
                      <h4 className="text-sm font-display font-light text-white mb-1">{step.title}</h4>
                      <p className="text-[11px] text-white/30 font-light leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <footer className="bg-black pt-0 pb-8 sm:pb-12 relative">
        <div className="footer-gradient-line mb-12 sm:mb-16" />
        <div className="container mx-auto px-4 sm:px-6">
          <div className="border-t border-white/[0.04] pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs font-light text-white/20">
              <p>&copy; 2026 X247 Rewards Protocol. All rights reserved.</p>
              <div className="flex gap-5">
                <Link href="/" className="hover:text-white/40 transition-colors duration-300">Home</Link>
                <Link href="/partners" className="hover:text-white/40 transition-colors duration-300">Partners</Link>
                <Link href="/winners" className="hover:text-white/40 transition-colors duration-300">Winners</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
