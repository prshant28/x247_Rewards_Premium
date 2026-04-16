import React, { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Link } from "wouter";
import {
  Trophy, Sparkles, Users, ArrowRight, Gift, Clock, Star,
  Zap, Crown, Target, Search, CheckCircle2, Copy, Shield,
  ExternalLink, Camera, Award, ChevronRight, Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getContests, checkEntryCode, type ContestData } from "@/lib/api";
import SiteFooter from "@/components/SiteFooter";
import BorderGlow from "@/components/BorderGlow";
import CountdownTimer from "@/components/CountdownTimer";
import ConfettiEffect from "@/components/ConfettiEffect";
import AnimatedCounter from "@/components/AnimatedCounter";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="floating-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 8}s`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
          }}
        />
      ))}
    </div>
  );
}

function GlowLine() {
  return (
    <div className="section-glow-line">
      <div className="section-glow-line-inner" />
    </div>
  );
}

function ContestCard({ contest, index }: { contest: ContestData; index: number }) {
  const spotsPercent = ((contest.maxSpots - contest.spotsRemaining) / contest.maxSpots) * 100;
  const isUpcoming = contest.status === "upcoming";
  const isFull = contest.isFull;

  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible">
      <Link href={isUpcoming ? `/giveaway` : `/giveaway/${contest.slug}`} aria-label={isUpcoming ? `${contest.name} — coming soon` : `Enter ${contest.name}`}>
        <div className={`contest-card group ${isUpcoming ? "contest-card-upcoming" : ""} ${isFull ? "contest-card-full" : ""}`}>
          <div className="contest-card-glow" />
          <div className="contest-card-shine" />

          <div className="contest-card-inner">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                {isUpcoming ? (
                  <div className="contest-badge contest-badge-upcoming">
                    <Clock className="w-3 h-3" />
                    <span>Coming Soon</span>
                  </div>
                ) : isFull ? (
                  <div className="contest-badge contest-badge-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Full</span>
                  </div>
                ) : (
                  <div className="contest-badge contest-badge-live">
                    <span className="contest-badge-pulse" />
                    <Zap className="w-3 h-3" />
                    <span>Live</span>
                  </div>
                )}
              </div>
              <div className="contest-icon-box">
                <Trophy className="w-5 h-5 text-white/30" />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-display font-medium text-white mb-1.5 tracking-tight leading-tight">{contest.name}</h3>
            <p className="text-[11px] text-white/30 font-light leading-relaxed mb-5 line-clamp-2">{contest.description}</p>

            <div className="contest-prize-box">
              <div className="contest-prize-icon">
                <Gift className="w-4 h-4 text-white/40" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-display font-light text-white">{contest.prize}</div>
                {contest.prizeValue && (
                  <div className="text-[9px] text-white/25 font-light mt-0.5">Worth {contest.prizeValue}</div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-white/10" />
            </div>

            <div className="contest-progress">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[9px] text-white/25 font-display uppercase tracking-[0.15em]">Capacity</span>
                <span className="text-[11px] text-white/45 font-light font-mono">{contest.totalEntries}<span className="text-white/15"> / </span>{contest.maxSpots}</span>
              </div>
              <div className="contest-progress-track">
                <motion.div
                  className="contest-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${spotsPercent}%` }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="contest-footer">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-white/20" />
                  <span className="text-[10px] text-white/25 font-light">{contest.spotsRemaining} spots left</span>
                </div>
                {contest.endsAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-white/20" />
                    <CountdownTimer endsAt={contest.endsAt} compact />
                  </div>
                )}
              </div>
              {!isUpcoming && !isFull && (
                <div className="contest-enter-btn">
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
  const { data: contests = [], isLoading: loading } = useQuery({
    queryKey: ["contests"],
    queryFn: getContests,
    refetchInterval: 30_000,
    staleTime: 0,
  });
  const [searchCode, setSearchCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checkError, setCheckError] = useState("");
  const [confettiActive, setConfettiActive] = useState(false);

  const handleCheckCode = async () => {
    if (!searchCode.trim()) return;
    setChecking(true);
    setCheckError("");
    setCheckResult(null);
    setConfettiActive(false);
    const result = await checkEntryCode(searchCode.trim());
    if (result.found) {
      setCheckResult(result.entry);
      setConfettiActive(true);
    } else {
      setCheckError(result.error || "Entry code not found");
    }
    setChecking(false);
  };

  const activeContests = contests.filter(c => c.status === "active" && !c.isFull);
  const upcomingContests = contests.filter(c => c.status === "upcoming");
  const completedContests = contests.filter(c => c.isFull || c.status === "completed");
  const totalSpots = contests.reduce((s, c) => s + c.maxSpots, 0);
  const totalEntries = contests.reduce((s, c) => s + c.totalEntries, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-28 pb-20 sm:pt-36 sm:pb-32">
        <div className="container mx-auto px-4 max-w-5xl">

          <section className="relative mb-12 sm:mb-16">
            <FloatingParticles />
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-16 sm:mb-24">
              <div className="glass-pill-badge mb-6">
                <Crown className="w-3 h-3 text-white/50 mr-2" />
                Daily Prize Draws
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight">
                Contest Hub
              </h1>
              <p className="text-white/50 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
                Choose a contest, complete partner registrations, and enter for a chance to win amazing prizes. Each contest has limited spots — act fast!
              </p>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                  { label: "Active", value: activeContests.length, icon: <Zap className="w-4 h-4" /> },
                  { label: "Total Spots", value: totalSpots, icon: <Users className="w-4 h-4" /> },
                  { label: "Entries", value: totalEntries, icon: <Trophy className="w-4 h-4" /> },
                  { label: "Contests", value: contests.length, icon: <Target className="w-4 h-4" /> },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card p-4 text-center">
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <div className="text-white/30 mx-auto mb-2 flex justify-center">{stat.icon}</div>
                      <AnimatedCounter value={stat.value} className="text-xl sm:text-2xl font-display font-light text-white" />
                      <div className="text-[9px] text-white/25 uppercase tracking-widest font-display mt-1">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

        </div>

        <div className="section-divider mx-2 sm:mx-3 md:mx-4 lg:mx-5 mb-8">
          <GlowLine />

          <section className="py-14 sm:py-20 relative">
            <div className="container mx-auto px-4 max-w-5xl">

              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1.5} className="mb-10">
                <div className="glass-card p-5 sm:p-6 relative overflow-hidden">
                  <div className="card-shine" />
                  <ConfettiEffect active={confettiActive} />
                  <div className="relative z-[2]">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                        <Search className="w-4 h-4 text-white/40" />
                      </div>
                      <span className="text-sm font-display font-light text-white">Check Entry Code</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                        placeholder="X247-XXXX-XXXX"
                        aria-label="Entry code"
                        className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-white/20 font-mono focus:outline-none focus:border-white/[0.12] transition-colors"
                        onKeyDown={(e) => e.key === "Enter" && handleCheckCode()}
                      />
                      <button
                        onClick={handleCheckCode}
                        disabled={checking || !searchCode.trim()}
                        aria-label={checking ? "Checking entry code" : "Check entry code"}
                        className="px-5 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white/70 font-light hover:bg-white/[0.08] transition-all disabled:opacity-30"
                      >
                        {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
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
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/0" />
                        <h2 className="text-lg sm:text-xl font-display font-light text-white">Active Contests</h2>
                        <span className="text-[10px] text-white/25 font-light">{activeContests.length} available</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {activeContests.map((contest, i) => (
                          <ContestCard key={contest.id} contest={contest} index={i + 3} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {upcomingContests.length > 0 && (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/25 to-white/0" />
                        <h2 className="text-lg sm:text-xl font-display font-light text-white/70">Upcoming</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {upcomingContests.map((contest, i) => (
                          <ContestCard key={contest.id} contest={contest} index={i + 5} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {completedContests.length > 0 && (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/15 to-white/0" />
                        <h2 className="text-lg sm:text-xl font-display font-light text-white/50">Completed</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            </div>
          </section>

          <GlowLine />

          <section className="py-16 sm:py-24 relative">
            <FloatingParticles />
            <div className="container mx-auto px-4 max-w-4xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
                custom={0}
                className="text-center mb-14 sm:mb-20"
              >
                <div className="glass-pill-badge mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                  Step-by-Step Guide
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-light text-white mb-5 tracking-tight">
                  How to Enter
                </h2>
                <p className="text-white/40 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto">
                  Follow each step carefully to enter the giveaway. Complete the full process to confirm your entry.
                </p>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-4 sm:space-y-5">
                {[
                  {
                    step: "01",
                    title: "Register with Partner Link",
                    desc: "Click the provided partner registration link and complete the full registration on the partner profile. Every partner listed here requires registration — make sure it's successfully completed.",
                    icon: <ExternalLink className="w-4 h-4" />,
                    tip: "Required for all partners",
                  },
                  {
                    step: "02",
                    title: "Maximize Your Chances",
                    desc: "Want to increase your winning probability? Register with additional partner links as well. Each completed registration earns you one extra entry into the draw.",
                    icon: <Target className="w-4 h-4" />,
                    tip: "Optional but recommended",
                  },
                  {
                    step: "03",
                    title: "Fill the Entry Form",
                    desc: "Submit the giveaway entry form with all required details as mentioned. Include your name, email, phone, and city. If you have a referral code, enter it during submission.",
                    icon: <Shield className="w-4 h-4" />,
                    tip: null,
                  },
                  {
                    step: "04",
                    title: "Upload Screenshot Proof",
                    desc: "Take a screenshot of each completed partner registration and upload it as proof. This is mandatory to verify your entry — one screenshot per partner.",
                    icon: <Camera className="w-4 h-4" />,
                    tip: "Max 10 MB per screenshot",
                  },
                  {
                    step: "05",
                    title: "Get Your Entry Code",
                    desc: "After successful submission, you'll receive a unique entry code (e.g., X247-XXXX-XXXX). Save this code — you'll need it to check your status and claim your prize if you win.",
                    icon: <Copy className="w-4 h-4" />,
                    tip: "Save your code!",
                  },
                  {
                    step: "06",
                    title: "Wait for Winners",
                    desc: "Winners are announced within 24-48 hours after all spots are filled and entries verified. Check the Winners page or use your entry code to see if you've won.",
                    icon: <Award className="w-4 h-4" />,
                    tip: null,
                  },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i}>
                    <div className="glass-card p-5 sm:p-6 group">
                      <div className="card-shine" />
                      <div className="relative z-[2] flex gap-4 sm:gap-5">
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 group-hover:text-white/60 transition-colors">
                            {item.icon}
                          </div>
                          <span className="text-[9px] font-display font-medium text-white/20 uppercase tracking-widest">{item.step}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h4 className="text-sm sm:text-base font-display font-light text-white">{item.title}</h4>
                            {item.tip && (
                              <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9px] text-white/40 font-light">{item.tip}</span>
                            )}
                          </div>
                          <p className="text-xs text-white/35 font-light leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          <GlowLine />

          <section className="py-14 sm:py-20">
            <div className="container mx-auto px-4 max-w-4xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={0}
                className="text-center mb-10"
              >
                <div className="glass-pill-badge mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                  Trust & Verification
                </div>
                <h2 className="text-xl sm:text-3xl font-display font-light text-white mb-4 tracking-tight">
                  Fair & Transparent
                </h2>
                <p className="text-white/40 text-sm font-light leading-relaxed max-w-xl mx-auto">
                  Every entry is verified manually. Winners are selected randomly and announced transparently.
                </p>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
                {[
                  { name: "SSL Secured", icon: <Shield className="w-5 h-5" /> },
                  { name: "Verified Entries", icon: <CheckCircle2 className="w-5 h-5" /> },
                  { name: "Real Winners", icon: <Trophy className="w-5 h-5" /> },
                  { name: "Daily Audited", icon: <Target className="w-5 h-5" /> },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i}>
                    <div className="glass-card p-5 text-center group">
                      <div className="card-shine" />
                      <div className="relative z-[2]">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-white/40 group-hover:text-white/60 transition-colors">
                          {item.icon}
                        </div>
                        <h4 className="text-xs sm:text-sm font-display font-light text-white/60">{item.name}</h4>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
                <div className="glass-card p-6 sm:p-8 text-center">
                  <div className="card-top-accent" />
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <h3 className="text-lg sm:text-xl font-display font-light text-white mb-3">Ready to Win?</h3>
                    <p className="text-white/40 text-sm font-light leading-relaxed max-w-md mx-auto mb-6">
                      Register with our partners, submit your entry, and get a chance to win real prizes — every single day.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <BorderGlow as={Link} href="/partners" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group w-full sm:w-auto">
                        <span className="relative z-[2]">View Partners</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                      </BorderGlow>
                      <BorderGlow as={Link} href="/winners" borderRadius={16} glowRadius={20} cardBg="rgba(10,10,10,0.6)" className="premium-btn premium-btn-lg premium-btn-ghost glass-btn-effect group w-full sm:w-auto">
                        <span className="relative z-[2]">Past Winners</span>
                      </BorderGlow>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

        </div>

      </main>

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Partners", href: "/partners" },
        { label: "Winners", href: "/winners" },
      ]} />
    </div>
  );
}
