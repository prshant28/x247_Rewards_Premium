import React, { useEffect, useRef, useState } from "react";
import BorderGlow from "@/components/BorderGlow";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Gift,
  Users,
  ShieldCheck,
  CheckCircle2,
  Star,
  BarChart3,
  TrendingUp,
  Trophy,
  Sparkles,
  SlidersHorizontal,
  Clock,
  Flame,
  Lock,
  Ticket,
  Hourglass,
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getContests, type ContestData } from "@/lib/api";
import SiteFooter from "@/components/SiteFooter";
import CountdownTimer from "@/components/CountdownTimer";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const verifiedBy = [
  { name: "SSL Secured", icon: <ShieldCheck className="w-5 h-5" /> },
  { name: "Verified Brands", icon: <CheckCircle2 className="w-5 h-5" /> },
  { name: "Real Winners", icon: <Users className="w-5 h-5" /> },
  { name: "Daily Audited", icon: <BarChart3 className="w-5 h-5" /> },
];

function formatINR(value: string | null): string {
  if (!value) return "TBA";
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return value;
  return `₹${num.toLocaleString("en-IN")}`;
}

function getContestStatusMeta(contest: ContestData): {
  label: string;
  category: string;
  isLive: boolean;
  isClosed: boolean;
  badge: string | null;
} {
  const status = (contest.status || "").toLowerCase();
  const isClosed = status === "closed" || status === "ended" || status === "completed" || contest.isFull;
  const isUpcoming = status === "upcoming" || status === "draft" || status === "scheduled";
  const isLive = !isClosed && !isUpcoming;
  return {
    label: isClosed ? "Closed" : isUpcoming ? "Upcoming" : "Live Now",
    category: isClosed ? "Closed Contest" : isUpcoming ? "Upcoming Contest" : "Open Contest",
    isLive,
    isClosed,
    badge: isLive && contest.spotsRemaining > 0 && contest.spotsRemaining <= 10 ? "Almost Full" : null,
  };
}

function parsePrize(prize: string): string[] {
  return prize
    .split(/[|•\n;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2)
    .slice(0, 5);
}

function ContestCard({ contest }: { contest: ContestData }) {
  const meta = getContestStatusMeta(contest);
  const prizeItems = parsePrize(contest.prize);
  const filled = Math.max(0, contest.maxSpots - contest.spotsRemaining);
  const fillPct = contest.maxSpots > 0 ? Math.min(100, Math.round((filled / contest.maxSpots) * 100)) : 0;

  const cardContent = (
    <div className="glass-card p-6 sm:p-8 group relative overflow-hidden h-full">
      <div className="card-top-accent" />
      <div className="card-shine" />

      {meta.isClosed && (
        <>
          <div className="absolute inset-0 z-[3] bg-black/30 backdrop-blur-[1px] rounded-[24px] pointer-events-none" />
          <div className="absolute top-4 right-4 z-[4] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 border border-white/[0.1] backdrop-blur-sm">
            <Lock className="w-3 h-3 text-foreground/40" />
            <span className="text-[10px] font-display font-light text-foreground/50 uppercase tracking-widest">Closed</span>
          </div>
        </>
      )}

      <div className="relative z-[2] flex flex-col h-full">
        <div className="flex items-start justify-between mb-5">
          <BorderGlow
            borderRadius={14}
            glowRadius={12}
            cardBg="rgba(255,255,255,0.05)"
            className="icon-circle w-14 h-14"
          >
            <Trophy className="w-6 h-6" />
          </BorderGlow>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {meta.isLive && (
              <div className="premium-badge premium-badge-hot !text-[9px]">
                <Flame className="w-2.5 h-2.5 mr-1" />
                {meta.label}
              </div>
            )}
            {meta.badge && (
              <div
                className="premium-badge !text-[9px]"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.03) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Star className="w-2.5 h-2.5 mr-1 text-foreground/40" />
                <span className="text-foreground/65">{meta.badge}</span>
              </div>
            )}
          </div>
        </div>

        <span className="text-[10px] font-display font-medium text-foreground/30 uppercase tracking-[0.15em] mb-1">
          {meta.category}
        </span>
        <h3 className="text-xl sm:text-2xl font-display font-light text-foreground mb-2">{contest.name}</h3>
        <p className="text-foreground/40 font-light text-xs sm:text-sm leading-relaxed mb-4">{contest.description}</p>

        {prizeItems.length > 0 && (
          <div className="mb-3">
            <p className="text-[9px] font-display uppercase tracking-[0.18em] text-foreground/25 mb-2">What You'll Win</p>
            <div className="grid grid-cols-1 gap-1.5">
              {prizeItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                >
                  <Gift className="w-3 h-3 text-foreground/50 shrink-0" />
                  <span className="text-[11px] text-foreground/55 font-light leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
          <span className="text-[11px] text-foreground/50 font-light">
            Prize value <strong className="text-foreground/70 font-medium">{formatINR(contest.prizeValue)}</strong>
          </span>
        </div>

        {contest.maxSpots > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-display uppercase tracking-[0.18em] text-foreground/30">Capacity</span>
              <span className="text-[10px] text-foreground/45 font-display">
                {filled} / {contest.maxSpots}
              </span>
            </div>
            <div className="w-full h-[3px] rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground/40 transition-all duration-700"
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>
        )}

        {meta.isLive && contest.endsAt && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-5">
            <Hourglass className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
            <CountdownTimer endsAt={contest.endsAt} />
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm font-display font-light text-foreground">{contest.totalEntries || 0}</div>
                <div className="text-[9px] text-foreground/25 uppercase tracking-widest">Entries</div>
              </div>
              <div className="w-px h-6 bg-white/[0.06]" />
              <div>
                <div className="text-sm font-display font-light text-foreground">{contest.spotsRemaining}</div>
                <div className="text-[9px] text-foreground/25 uppercase tracking-widest">Spots Left</div>
              </div>
            </div>
            {meta.isLive && (
              <div className="flex items-center text-foreground/30 group-hover:text-foreground/60 transition-colors text-xs font-display">
                <span>Enter Now</span>
                <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (meta.isLive) {
    return (
      <Link href={`/giveaway/${contest.slug}`} className="block">
        {cardContent}
      </Link>
    );
  }
  return cardContent;
}

export default function Giveaway() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const { data: apiContests, isLoading } = useQuery({
    queryKey: ["contests"],
    queryFn: getContests,
    staleTime: 30_000,
  });

  const allContests: ContestData[] = React.useMemo(
    () => (Array.isArray(apiContests) ? apiContests : []),
    [apiContests],
  );

  const counts = React.useMemo(() => {
    let live = 0;
    let upcoming = 0;
    let closed = 0;
    let totalEntries = 0;
    let totalPrizePool = 0;
    for (const c of allContests) {
      const meta = getContestStatusMeta(c);
      if (meta.isLive) live++;
      else if (meta.isClosed) closed++;
      else upcoming++;
      totalEntries += c.totalEntries || 0;
      const v = Number(c.prizeValue || 0);
      if (Number.isFinite(v)) totalPrizePool += v;
    }
    return { live, upcoming, closed, totalEntries, totalPrizePool, total: allContests.length };
  }, [allContests]);

  const filterOptions = React.useMemo(() => {
    const opts: string[] = ["All"];
    if (counts.live > 0) opts.push("Active");
    if (counts.upcoming > 0) opts.push("Upcoming");
    if (counts.closed > 0) opts.push("Closed");
    return opts;
  }, [counts]);

  const filteredContests = React.useMemo(() => {
    if (activeFilter === "All") return allContests;
    return allContests.filter((c) => {
      const meta = getContestStatusMeta(c);
      if (activeFilter === "Active") return meta.isLive;
      if (activeFilter === "Upcoming") return !meta.isLive && !meta.isClosed;
      if (activeFilter === "Closed") return meta.isClosed;
      return true;
    });
  }, [allContests, activeFilter]);

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-[70px] pb-20 sm:pb-32">
        {/* ── Giveaway Hero ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="text-center py-20 sm:py-28 px-4"
        >
          <div className="glass-pill-badge inline-flex mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block" />
            Live Giveaways
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-light text-foreground mb-5 leading-tight tracking-tight">
            Win Premium Prizes
          </h1>
          <p className="text-foreground/45 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto tracking-wide">
            Verified brand giveaways drawn daily. Enter the contests below — every completed registration boosts
            your chances. Transparent draws, real winners.
          </p>
        </motion.div>

        <div className="container mx-auto px-4 max-w-6xl">
          {/* ── Stats Strip ── */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10 sm:mb-14">
            <div className="glass-card p-4 sm:p-5">
              <div className="card-top-accent" />
              <div className="relative z-[2] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-foreground/40" />
                  <span className="text-sm text-foreground/50 font-light">Giveaway Stats</span>
                </div>
                <div className="flex items-center gap-6 sm:gap-10">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-display font-light text-foreground">
                      {formatINR(String(counts.totalPrizePool))}
                    </div>
                    <div className="text-[10px] text-foreground/30 uppercase tracking-widest font-display">
                      Prize Pool
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-display font-light text-foreground">{counts.live}</div>
                    <div className="text-[10px] text-foreground/30 uppercase tracking-widest font-display">Live Now</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-display font-light text-foreground">
                      {counts.totalEntries}
                    </div>
                    <div className="text-[10px] text-foreground/30 uppercase tracking-widest font-display">Entries</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Filter Bar ── */}
          {!isLoading && filterOptions.length > 1 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mb-8 sm:mb-10 ctx-filterbar"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 mr-1 text-foreground/45">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase tracking-widest font-display">Filter</span>
                </div>
                {filterOptions.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    data-active={activeFilter === filter ? "true" : "false"}
                    className="ctx-status-chip px-4 py-1.5 rounded-full text-[11px] font-display font-light tracking-wide transition-all"
                  >
                    {filter === "Active" && <span className="mr-1 opacity-60">●</span>}
                    {filter}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Contest Grid ── */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : filteredContests.length === 0 ? (
            <div className="glass-card p-10 sm:p-14 text-center mb-16 sm:mb-24">
              <div className="card-top-accent" />
              <div className="relative z-[2]">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-5 text-foreground/40">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-display font-light text-foreground mb-2">
                  No contests in this view
                </h3>
                <p className="text-foreground/40 font-light text-sm leading-relaxed max-w-md mx-auto">
                  Check back soon — new giveaways drop every week. Tap "All" to see everything available right now.
                </p>
              </div>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-16 sm:mb-24"
            >
              {filteredContests.map((contest) => (
                <motion.div key={contest.slug || contest.id} variants={fadeUp}>
                  <ContestCard contest={contest} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── Premium Rewards Visual Showcase ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16 sm:mb-24"
          >
            <div className="glass-card !shadow-none !p-0 overflow-hidden">
              <div className="rewards-showcase-card relative overflow-hidden">
                <img
                  src="/images/hero-rewards-visual.png"
                  alt="Premium prizes — trophies, gift cards, and tech rewards"
                  className="w-full object-cover"
                  style={{ maxHeight: 420, objectPosition: "center 30%" }}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/60 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
                  <div>
                    <div className="glass-pill-badge mb-3 inline-flex w-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/80 mr-2 inline-block animate-pulse" />
                      Real Prizes. Daily Draws.
                    </div>
                    <h3 className="text-xl sm:text-3xl md:text-4xl font-display font-light text-white mb-2 tracking-tight leading-tight drop-shadow-lg">
                      Boost Your Chances.
                      <br className="hidden sm:block" /> Register With Partners.
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 font-light max-w-md leading-relaxed drop-shadow">
                      Each completed partner registration adds extra entries to the daily draw — more entries, better
                      odds.
                    </p>
                  </div>
                  <Link
                    href="/partners"
                    className="showcase-enter-btn group shrink-0 inline-flex items-center justify-center gap-2 h-12 px-7 rounded-2xl font-medium text-sm tracking-wide transition-all duration-300 bg-white text-black border border-white/20 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                  >
                    <span>View Partners</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Trust & Verified ── */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-16 sm:mb-24">
            <div className="text-center mb-10 sm:mb-14">
              <div className="glass-pill-badge mb-6 mx-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Trust & Security
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-display font-light mb-4 text-foreground tracking-tight">
                Fair Draws. Real Winners.
              </h2>
              <p className="text-foreground/40 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto tracking-wide">
                Every contest on X247 is audited end-to-end — entries are tracked transparently, draws are recorded,
                and winners are announced publicly.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {verifiedBy.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="glass-card p-5 sm:p-6 text-center group">
                    <div className="card-top-accent" />
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-foreground/50 group-hover:text-foreground/70 transition-colors">
                        {item.icon}
                      </div>
                      <h4 className="text-sm font-display font-light text-foreground/70">{item.name}</h4>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Final CTA ── */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="glass-card p-6 sm:p-10 text-center">
              <div className="card-top-accent" />
              <div className="card-shine" />
              <div className="relative z-[2]">
                <h3 className="text-xl sm:text-2xl font-display font-light text-foreground mb-4">How To Enter</h3>
                <p className="text-foreground/40 font-light text-sm leading-relaxed max-w-xl mx-auto mb-8">
                  Pick a live contest above → tap Enter Now → complete the partner registration. Your entry is
                  confirmed instantly. Already entered? Check your code below.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <BorderGlow
                    as={Link}
                    href="/entry-check"
                    borderRadius={16}
                    glowRadius={20}
                    cardBg="rgba(6,6,6,0.95)"
                    className="premium-btn premium-btn-lg glass-btn-effect group"
                  >
                    <Ticket className="w-4 h-4 mr-2 relative z-[2]" />
                    <span className="relative z-[2]">Check Entry Code</span>
                  </BorderGlow>
                  <BorderGlow
                    as={Link}
                    href="/partners"
                    borderRadius={16}
                    glowRadius={20}
                    cardBg="rgba(10,10,10,0.6)"
                    className="premium-btn premium-btn-lg premium-btn-ghost glass-btn-effect group"
                  >
                    <span className="relative z-[2]">View Partners</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                  </BorderGlow>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <SiteFooter
        links={[
          { label: "Home", href: "/" },
          { label: "Partners", href: "/partners" },
        ]}
      />
    </div>
  );
}
