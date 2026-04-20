import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Link } from "wouter";
import {
  Trophy, Users, ArrowRight, Gift, Clock, Star, Sparkles,
  Zap, Search, CheckCircle2, ExternalLink, Award, ChevronRight,
  X, Calendar, Layers, TrendingUp, Crown, ShieldCheck, Filter,
  ArrowUpRight, ChevronDown,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getContests, type ContestData } from "@/lib/api";
import SiteFooter from "@/components/SiteFooter";
import CountdownTimer from "@/components/CountdownTimer";
import AnimatedCounter from "@/components/AnimatedCounter";

/* ═══════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════ */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */
const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);

function parsePrizeNumeric(v: string | null): number {
  if (!v) return 0;
  const cleaned = v.replace(/[^\d.]/g, "");
  return Number(cleaned) || 0;
}

type StatusFilter = "all" | "active" | "upcoming" | "completed";
type SortBy = "ending-soon" | "most-popular" | "newest" | "biggest-prize";

const STATUS_CHIPS: { value: StatusFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "all", label: "All", icon: Layers },
  { value: "active", label: "Active", icon: Zap },
  { value: "upcoming", label: "Upcoming", icon: Clock },
  { value: "completed", label: "Closed", icon: CheckCircle2 },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "ending-soon", label: "Ending soon" },
  { value: "most-popular", label: "Most popular" },
  { value: "biggest-prize", label: "Biggest prize" },
  { value: "newest", label: "Newest" },
];

/* ═══════════════════════════════════════════════════
   CONTEST CARD (regular)
   ═══════════════════════════════════════════════════ */
const ContestCard = React.memo(function ContestCard({ contest, index }: { contest: ContestData; index: number }) {
  const isUpcoming = contest.status === "upcoming";
  const isFull = contest.isFull;
  const taken = contest.maxSpots - contest.spotsRemaining;
  const percent = Math.min(100, (taken / Math.max(contest.maxSpots, 1)) * 100);

  const seed = (contest.id * 9301 + 49297) % 233280;
  const hueShift = (seed / 233280) * 360;
  const fallbackBg = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), transparent 55%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.10), transparent 60%), linear-gradient(${135 + hueShift / 8}deg, rgba(40,40,46,0.95), rgba(10,10,12,1))`;

  const dateLabel = contest.endsAt
    ? new Date(contest.endsAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "Open";

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      className="h-full"
    >
      <Link href={`/giveaway/${contest.slug}`} aria-label={isUpcoming ? `${contest.name} — coming soon` : `Enter ${contest.name}`}>
        <div className={`contest-card-v2 group ${isUpcoming ? "is-upcoming" : ""} ${isFull ? "is-full" : ""} ${contest.imageUrl ? "has-banner" : "no-banner"}`}>
          <div className="contest-card-shine" />

          {contest.imageUrl ? (
            <div className="contest-card-banner">
              <img src={contest.imageUrl} alt={contest.name} loading="lazy" className="contest-card-banner-img" />
              <div className="contest-card-banner-tag">
                {isUpcoming ? "COMING_SOON" : isFull ? "FULL" : "OPEN_NOW"}
              </div>
              {!isUpcoming && !isFull && (
                <div className="contest-card-banner-live">
                  <span className="contest-card-banner-pulse" />
                  LIVE
                </div>
              )}
            </div>
          ) : (
            <div className="contest-card-hero" style={{ background: fallbackBg }}>
              <div className="contest-card-hero-glow" aria-hidden />
              <div className="contest-card-hero-grid" aria-hidden />
              {!isUpcoming && !isFull && (
                <div className="contest-card-hero-live">
                  <span className="contest-card-banner-pulse" />
                  LIVE
                </div>
              )}
              <div className="contest-card-hero-tag">
                {isUpcoming ? "COMING_SOON" : isFull ? "FULL" : "OPEN_NOW"}
              </div>
              <div className="contest-card-hero-initial" aria-hidden>
                {contest.name.trim().charAt(0).toUpperCase() || "X"}
              </div>
              <div className="contest-card-hero-trophy" aria-hidden>
                <Trophy className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          <div className="contest-card-body">
            <h3 className="contest-card-title">{contest.name}</h3>
            <div className="contest-card-org">
              <Gift className="w-3 h-3 text-foreground/35" />
              <span>{contest.prize}</span>
            </div>

            <div className="contest-card-status-row">
              {isUpcoming ? (
                <span className="contest-card-pill contest-card-pill-muted">
                  <Clock className="w-2.5 h-2.5" /> Upcoming
                </span>
              ) : isFull ? (
                <span className="contest-card-pill contest-card-pill-muted">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Closed
                </span>
              ) : (
                <span className="contest-card-pill contest-card-pill-active">
                  <span className="contest-card-pill-live-dot" aria-hidden />
                  Live Now
                </span>
              )}
              <span className="contest-card-pill-dot">·</span>
              <span className="contest-card-pill contest-card-pill-meta">Online</span>
              {contest.prizeValue && !isUpcoming && (
                <span className="contest-card-pill-prize" title="Prize value">{contest.prizeValue}</span>
              )}
            </div>

            <div className="contest-card-capacity">
              <div className="contest-card-capacity-head">
                <span className="contest-card-capacity-label">{Math.round(percent)}% claimed</span>
                <span className="contest-card-capacity-spots">{fmt(taken)} / {fmt(contest.maxSpots)} spots</span>
              </div>
              <div className="contest-card-capacity-track">
                <motion.div
                  className="contest-card-capacity-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="contest-card-meta-grid">
              <div className="contest-card-meta-cell">
                <div className="contest-card-meta-label">Attendees</div>
                <div className="contest-card-meta-value">
                  <div className="contest-card-avatars">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="contest-card-avatar"
                        style={{ background: `linear-gradient(135deg, rgba(255,255,255,${0.18 - i * 0.04}), rgba(255,255,255,${0.06 - i * 0.015}))` }}
                      />
                    ))}
                  </div>
                  <span className="contest-card-meta-num">{fmt(contest.totalEntries)}</span>
                </div>
              </div>
              <div className="contest-card-meta-cell contest-card-meta-cell-divider">
                <div className="contest-card-meta-label">{contest.endsAt ? "Ends by" : "Open"}</div>
                <div className="contest-card-meta-value">
                  <Calendar className="w-3 h-3 text-foreground/35" />
                  <span className="contest-card-meta-num">{dateLabel}</span>
                </div>
              </div>
              <div className="contest-card-meta-cell">
                <div className="contest-card-meta-label">Spots Left</div>
                <div className="contest-card-meta-value">
                  <Users className="w-3 h-3 text-foreground/35" />
                  <span className="contest-card-meta-num">{fmt(contest.spotsRemaining)}</span>
                </div>
              </div>
            </div>

            {!isUpcoming && !isFull && (
              <div className="contest-card-cta-row">
                {contest.endsAt && (
                  <div className="contest-card-countdown">
                    <Clock className="w-3 h-3 text-foreground/30" />
                    <CountdownTimer endsAt={contest.endsAt} compact />
                  </div>
                )}
                <div className="contest-card-cta">
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

/* ═══════════════════════════════════════════════════
   FEATURED SPOTLIGHT CARD (large, editorial)
   ═══════════════════════════════════════════════════ */
function FeaturedSpotlight({ contest }: { contest: ContestData }) {
  const taken = contest.maxSpots - contest.spotsRemaining;
  const percent = Math.min(100, (taken / Math.max(contest.maxSpots, 1)) * 100);
  const seed = (contest.id * 9301 + 49297) % 233280;
  const hueShift = (seed / 233280) * 360;
  const heroBg = `radial-gradient(circle at 25% 25%, hsl(var(--foreground) / 0.18), transparent 55%), radial-gradient(circle at 80% 70%, hsl(var(--foreground) / 0.08), transparent 60%), linear-gradient(${135 + hueShift / 8}deg, hsl(var(--foreground) / 0.06), hsl(var(--background)))`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="gv-featured"
    >
      <Link href={`/giveaway/${contest.slug}`} aria-label={`Enter featured contest ${contest.name}`}>
        <div className="gv-featured-card group">
          <div className="gv-featured-shine" />
          <div className="gv-featured-grid">
            {/* Visual */}
            <div className="gv-featured-visual" style={{ background: contest.imageUrl ? undefined : heroBg }}>
              {contest.imageUrl ? (
                <img src={contest.imageUrl} alt={contest.name} className="gv-featured-img" />
              ) : (
                <>
                  <div className="gv-featured-glow" aria-hidden />
                  <div className="gv-featured-grid-tex" aria-hidden />
                  <div className="gv-featured-initial" aria-hidden>
                    {contest.name.trim().charAt(0).toUpperCase() || "X"}
                  </div>
                </>
              )}
              <div className="gv-featured-tag-row">
                <span className="gv-featured-live">
                  <span className="contest-card-banner-pulse" />
                  LIVE NOW
                </span>
                <span className="gv-featured-spotlight">
                  <Crown className="w-3 h-3" />
                  Spotlight
                </span>
              </div>
              <div className="gv-featured-trophy"><Trophy className="w-4 h-4" /></div>
            </div>

            {/* Info */}
            <div className="gv-featured-info">
              <div className="gv-featured-eyebrow">
                <Sparkles className="w-3 h-3" />
                Featured Contest
              </div>
              <h2 className="gv-featured-title">{contest.name}</h2>
              <p className="gv-featured-desc">{contest.description}</p>

              <div className="gv-featured-stats">
                <div className="gv-featured-stat">
                  <div className="gv-featured-stat-label">Prize</div>
                  <div className="gv-featured-stat-value">{contest.prizeValue || contest.prize}</div>
                </div>
                <div className="gv-featured-stat">
                  <div className="gv-featured-stat-label">Entries</div>
                  <div className="gv-featured-stat-value">{fmt(contest.totalEntries)}</div>
                </div>
                <div className="gv-featured-stat">
                  <div className="gv-featured-stat-label">Spots Left</div>
                  <div className="gv-featured-stat-value">{fmt(contest.spotsRemaining)}</div>
                </div>
              </div>

              <div className="gv-featured-progress">
                <div className="gv-featured-progress-head">
                  <span>{Math.round(percent)}% claimed</span>
                  <span>{fmt(taken)} / {fmt(contest.maxSpots)}</span>
                </div>
                <div className="gv-featured-progress-track">
                  <motion.div
                    className="gv-featured-progress-fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              <div className="gv-featured-foot">
                {contest.endsAt && (
                  <div className="gv-featured-countdown">
                    <Clock className="w-3.5 h-3.5" />
                    <CountdownTimer endsAt={contest.endsAt} compact />
                  </div>
                )}
                <div className="gv-featured-cta">
                  <span>Enter Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   SKELETON CARD
   ═══════════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div className="gv-skeleton">
      <div className="gv-skeleton-banner" />
      <div className="gv-skeleton-body">
        <div className="gv-skeleton-line gv-skeleton-line--lg" />
        <div className="gv-skeleton-line gv-skeleton-line--md" />
        <div className="gv-skeleton-pills">
          <div className="gv-skeleton-pill" />
          <div className="gv-skeleton-pill" />
        </div>
        <div className="gv-skeleton-bar" />
        <div className="gv-skeleton-grid">
          <div className="gv-skeleton-cell" />
          <div className="gv-skeleton-cell" />
          <div className="gv-skeleton-cell" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function Giveaway() {
  const { data: contests = [], isLoading } = useQuery({
    queryKey: ["contests"],
    queryFn: getContests,
  });

  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("ending-soon");
  const [sortOpen, setSortOpen] = useState(false);
  const [stickyOn, setStickyOn] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  /* Detect sticky state for shadow */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => setStickyOn(e.intersectionRatio < 1),
      { threshold: [1] }
    );
    const sentinel = document.getElementById("gv-filter-sentinel");
    if (sentinel) obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  /* Close sort dropdown on outside click */
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  /* ── DERIVED DATA ── */
  const live = useMemo(() => contests.filter(c => c.status === "active" && !c.isFull), [contests]);
  const upcoming = useMemo(() => contests.filter(c => c.status === "upcoming"), [contests]);
  const closed = useMemo(() => contests.filter(c => c.status === "completed" || c.isFull), [contests]);

  const totalPrizePool = useMemo(
    () => contests.reduce((sum, c) => sum + parsePrizeNumeric(c.prizeValue), 0),
    [contests]
  );
  const totalEntries = useMemo(
    () => contests.reduce((sum, c) => sum + c.totalEntries, 0),
    [contests]
  );
  const totalLive = live.length;
  const totalContests = contests.length;

  /* Featured = highest prize value among live (or first live) */
  const featured = useMemo(() => {
    if (live.length === 0) return null;
    return [...live].sort((a, b) => parsePrizeNumeric(b.prizeValue) - parsePrizeNumeric(a.prizeValue))[0];
  }, [live]);

  /* Search + status filter applied to all */
  const filtered = useMemo(() => {
    let list = [...contests];
    if (status === "active") list = list.filter(c => c.status === "active" && !c.isFull);
    else if (status === "upcoming") list = list.filter(c => c.status === "upcoming");
    else if (status === "completed") list = list.filter(c => c.status === "completed" || c.isFull);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.prize.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case "ending-soon": {
          const aTime = a.endsAt ? new Date(a.endsAt).getTime() : Infinity;
          const bTime = b.endsAt ? new Date(b.endsAt).getTime() : Infinity;
          return aTime - bTime;
        }
        case "most-popular":
          return b.totalEntries - a.totalEntries;
        case "biggest-prize":
          return parsePrizeNumeric(b.prizeValue) - parsePrizeNumeric(a.prizeValue);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return list;
  }, [contests, status, search, sortBy]);

  /* When status='all' and no search → split into sections; otherwise show flat */
  const showSectioned = status === "all" && !search.trim();

  const liveSorted = useMemo(() => {
    return showSectioned
      ? filtered.filter(c => c.status === "active" && !c.isFull && (!featured || c.id !== featured.id))
      : [];
  }, [filtered, showSectioned, featured]);

  const upcomingSorted = useMemo(
    () => (showSectioned ? filtered.filter(c => c.status === "upcoming") : []),
    [filtered, showSectioned]
  );

  const closedSorted = useMemo(
    () => (showSectioned ? filtered.filter(c => c.status === "completed" || c.isFull) : []),
    [filtered, showSectioned]
  );

  const clearAll = useCallback(() => {
    setStatus("all");
    setSearch("");
    setSortBy("ending-soon");
  }, []);

  const sortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? "Sort";

  return (
    <div className="gv-page">
      {/* ── HERO ────────────────────────────────────── */}
      <section className="gv-hero">
        <div className="gv-hero-bg-grid" aria-hidden />
        <div className="gv-hero-radial" aria-hidden />
        <div className="gv-hero-orb gv-hero-orb-1" aria-hidden />
        <div className="gv-hero-orb gv-hero-orb-2" aria-hidden />

        <div className="container mx-auto px-4 max-w-6xl relative z-[2]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center"
          >
            <motion.div variants={fadeUp} className="gv-hero-eyebrow">
              <Sparkles className="w-3 h-3" />
              Contest Hub
              <span className="gv-hero-eyebrow-dot" />
              {totalLive > 0 ? `${totalLive} live now` : "Curated weekly"}
            </motion.div>

            <motion.h1 variants={fadeUp} className="gv-hero-title">
              Win prizes worth<br />
              <span className="gv-hero-title-accent">a lifetime.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="gv-hero-sub">
              Premium giveaways from verified brands. Complete a few partner steps,
              earn entries, and win curated prizes — straight from the source.
            </motion.p>

            <motion.div variants={fadeUp} className="gv-hero-ctas">
              <button
                onClick={() => {
                  document.getElementById("gv-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="gv-hero-cta gv-hero-cta-primary"
              >
                Browse Active
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link href="/entry-check" className="gv-hero-cta gv-hero-cta-ghost">
                <ShieldCheck className="w-4 h-4" />
                Check Entry Code
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────────── */}
      <section className="gv-stats-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="gv-stats"
          >
            {[
              { label: "Total Prize Pool", value: totalPrizePool, prefix: "₹", suffix: "" },
              { label: "Live Contests", value: totalLive, prefix: "", suffix: "" },
              { label: "Total Entries", value: totalEntries, prefix: "", suffix: "" },
              { label: "All-Time Contests", value: totalContests, prefix: "", suffix: "" },
            ].map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} custom={i} className="gv-stat">
                <div className="gv-stat-label">{s.label}</div>
                <div className="gv-stat-value">
                  <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} duration={1.6} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STICKY FILTER BAR ─────────────────────── */}
      <div id="gv-filter-sentinel" aria-hidden />
      <div className={`gv-filter-bar-wrap ${stickyOn ? "is-stuck" : ""}`} ref={filterBarRef}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="gv-filter-bar">
            {/* Search */}
            <div className="gv-search">
              <Search className="w-4 h-4 gv-search-icon" />
              <input
                type="text"
                placeholder="Search contests, prizes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") setSearch(""); }}
                className="gv-search-input"
                aria-label="Search contests by name, prize, or description"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="gv-search-clear"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status chips */}
            <div className="gv-chips">
              {STATUS_CHIPS.map((chip) => {
                const Icon = chip.icon;
                const active = status === chip.value;
                const count =
                  chip.value === "all" ? totalContests :
                  chip.value === "active" ? totalLive :
                  chip.value === "upcoming" ? upcoming.length :
                  closed.length;
                return (
                  <button
                    key={chip.value}
                    onClick={() => setStatus(chip.value)}
                    className={`gv-chip ${active ? "is-active" : ""}`}
                    aria-pressed={active}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{chip.label}</span>
                    <span className="gv-chip-count">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <div className="gv-sort" ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="gv-sort-btn"
                aria-expanded={sortOpen}
                aria-haspopup="listbox"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{sortLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="gv-sort-menu"
                    role="listbox"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                        className={`gv-sort-item ${sortBy === opt.value ? "is-active" : ""}`}
                        role="option"
                        aria-selected={sortBy === opt.value}
                      >
                        {opt.label}
                        {sortBy === opt.value && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────── */}
      <section className="gv-main" id="gv-grid">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Loading */}
          {isLoading && (
            <div className="gv-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="gv-empty"
            >
              <div className="gv-empty-icon">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="gv-empty-title">No contests match your filters</h3>
              <p className="gv-empty-desc">
                Try a different search or clear filters to see everything that's live.
              </p>
              <button onClick={clearAll} className="gv-empty-cta">
                Clear all filters
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* Sectioned view (status=all, no search) */}
          {!isLoading && filtered.length > 0 && showSectioned && (
            <>
              {featured && (
                <div className="gv-block">
                  <div className="gv-block-head">
                    <div className="gv-block-eyebrow">
                      <Crown className="w-3 h-3" />
                      Spotlight
                    </div>
                    <h2 className="gv-block-title">Featured contest</h2>
                  </div>
                  <FeaturedSpotlight contest={featured} />
                </div>
              )}

              {liveSorted.length > 0 && (
                <div className="gv-block">
                  <div className="gv-block-head">
                    <div className="gv-block-eyebrow">
                      <Zap className="w-3 h-3" />
                      Live now
                    </div>
                    <h2 className="gv-block-title">
                      Active contests
                      <span className="gv-block-count">{liveSorted.length}</span>
                    </h2>
                  </div>
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={stagger}
                    className="gv-grid"
                  >
                    {liveSorted.map((c, i) => <ContestCard key={c.id} contest={c} index={i} />)}
                  </motion.div>
                </div>
              )}

              {upcomingSorted.length > 0 && (
                <div className="gv-block">
                  <div className="gv-block-head">
                    <div className="gv-block-eyebrow">
                      <Clock className="w-3 h-3" />
                      Coming soon
                    </div>
                    <h2 className="gv-block-title">
                      Upcoming
                      <span className="gv-block-count">{upcomingSorted.length}</span>
                    </h2>
                  </div>
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={stagger}
                    className="gv-grid"
                  >
                    {upcomingSorted.map((c, i) => <ContestCard key={c.id} contest={c} index={i} />)}
                  </motion.div>
                </div>
              )}

              {closedSorted.length > 0 && (
                <div className="gv-block">
                  <div className="gv-block-head">
                    <div className="gv-block-eyebrow">
                      <CheckCircle2 className="w-3 h-3" />
                      Hall of fame
                    </div>
                    <h2 className="gv-block-title">
                      Closed contests
                      <span className="gv-block-count">{closedSorted.length}</span>
                    </h2>
                  </div>
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={stagger}
                    className="gv-grid"
                  >
                    {closedSorted.map((c, i) => <ContestCard key={c.id} contest={c} index={i} />)}
                  </motion.div>
                </div>
              )}
            </>
          )}

          {/* Flat view (filter or search active) */}
          {!isLoading && filtered.length > 0 && !showSectioned && (
            <div className="gv-block">
              <div className="gv-block-head">
                <div className="gv-block-eyebrow">
                  <TrendingUp className="w-3 h-3" />
                  Results
                </div>
                <h2 className="gv-block-title">
                  {filtered.length} {filtered.length === 1 ? "contest" : "contests"}
                  {search && <> matching "<span className="gv-block-q">{search}</span>"</>}
                </h2>
              </div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="gv-grid"
              >
                {filtered.map((c, i) => <ContestCard key={c.id} contest={c} index={i} />)}
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS MINI ─────────────────────── */}
      <section className="gv-steps-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="gv-steps-head">
            <div className="gv-steps-eyebrow">How it works</div>
            <h2 className="gv-steps-title">Three steps. One winner.</h2>
          </div>
          <div className="gv-steps-grid">
            {[
              { num: "01", icon: Search, title: "Pick a contest", desc: "Browse curated giveaways from verified brands. Filter by prize, deadline, or popularity." },
              { num: "02", icon: ShieldCheck, title: "Complete partner steps", desc: "Each contest has a few quick partner registrations. Verified brands fund every prize pool." },
              { num: "03", icon: Trophy, title: "Get your entry & win", desc: "Auto-generated entry code locks you in. Winners drawn fairly and announced publicly." },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="gv-step"
              >
                <div className="gv-step-num">{s.num}</div>
                <div className="gv-step-icon"><s.icon className="w-5 h-5" /></div>
                <h3 className="gv-step-title">{s.title}</h3>
                <p className="gv-step-desc">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────── */}
      <section className="gv-cta-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="gv-cta-card"
          >
            <div className="gv-cta-shine" />
            <div className="gv-cta-content">
              <div className="gv-cta-eyebrow">
                <Star className="w-3 h-3" />
                Premium membership
              </div>
              <h2 className="gv-cta-title">Multiply your odds. Unlock every prize.</h2>
              <p className="gv-cta-desc">
                Members get bonus entries, exclusive contests, and priority access to limited drops.
              </p>
              <div className="gv-cta-buttons">
                <Link href="/pricing" className="gv-cta-primary">
                  See membership tiers
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link href="/how-it-works" className="gv-cta-ghost">
                  How X247 works
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
