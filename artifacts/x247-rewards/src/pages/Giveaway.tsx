import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Link } from "wouter";
import {
  Trophy, Users, ArrowRight, Gift, Clock, Star,
  Zap, Crown, Target, Search, CheckCircle2, Copy, Shield,
  ExternalLink, Camera, Award, ChevronRight,
  SlidersHorizontal, X, Filter, Calendar, Layers,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getContests, type ContestData } from "@/lib/api";
import SiteFooter from "@/components/SiteFooter";
import CountdownTimer from "@/components/CountdownTimer";
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

/* ─── Filter types ─── */
type StatusFilter = "all" | "active" | "upcoming" | "completed";
type DeadlineFilter = "this-week" | "this-month" | "no-deadline";

interface Filters {
  status: StatusFilter;
  deadline: Set<DeadlineFilter>;
  openOnly: boolean;
  search: string;
}

const defaultFilters: Filters = {
  status: "all",
  deadline: new Set(),
  openOnly: false,
  search: "",
};

function countActiveFilters(f: Filters): number {
  let n = 0;
  if (f.status !== "all") n++;
  n += f.deadline.size;
  if (f.openOnly) n++;
  return n;
}

/* ─── Filter Panel Component ─── */
function FilterPanel({
  filters,
  onChange,
  onClear,
  activeCount,
}: {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  onClear: () => void;
  activeCount: number;
}) {
  const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All contests" },
    { value: "active", label: "Active & open" },
    { value: "upcoming", label: "Coming soon" },
    { value: "completed", label: "Completed / Full" },
  ];

  const DEADLINE_OPTIONS: { value: DeadlineFilter; label: string }[] = [
    { value: "this-week", label: "Ends this week" },
    { value: "this-month", label: "Ends this month" },
    { value: "no-deadline", label: "No deadline" },
  ];

  function toggleDeadline(v: DeadlineFilter) {
    const next = new Set(filters.deadline);
    if (next.has(v)) next.delete(v); else next.add(v);
    onChange({ deadline: next });
  }

  const sep = <div className="h-px my-5" style={{ background: "rgba(255,255,255,0.06)" }} />;

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-display text-foreground/60 tracking-wide">Filters</span>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[10px] text-foreground/35 hover:text-foreground/65 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Status */}
      <div>
        <div className="text-[9px] font-display font-medium uppercase tracking-[0.2em] text-foreground/25 mb-3">Status</div>
        <div className="space-y-1">
          {STATUS_OPTIONS.map((opt) => {
            const active = filters.status === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onChange({ status: opt.value })}
                className="w-full flex items-center gap-2.5 py-1.5 px-1 rounded-lg transition-all text-left group"
                style={{ background: active ? "rgba(255,255,255,0.06)" : "transparent" }}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all"
                  style={{
                    border: `1px solid ${active ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}`,
                    background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  }}
                >
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-white/80" />}
                </div>
                <span
                  className="text-[13px] font-light transition-colors"
                  style={{ color: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {sep}

      {/* Deadline */}
      <div>
        <div className="text-[9px] font-display font-medium uppercase tracking-[0.2em] text-foreground/25 mb-3">Deadline</div>
        <div className="space-y-1">
          {DEADLINE_OPTIONS.map((opt) => {
            const checked = filters.deadline.has(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleDeadline(opt.value)}
                className="w-full flex items-center gap-2.5 py-1.5 px-1 rounded-lg transition-all text-left"
                style={{ background: checked ? "rgba(255,255,255,0.06)" : "transparent" }}
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
                  style={{
                    border: `1px solid ${checked ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}`,
                    background: checked ? "rgba(255,255,255,0.15)" : "transparent",
                  }}
                >
                  {checked && <CheckCircle2 className="w-2.5 h-2.5 text-foreground" />}
                </div>
                <span
                  className="text-[13px] font-light transition-colors"
                  style={{ color: checked ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {sep}

      {/* Availability */}
      <div>
        <div className="text-[9px] font-display font-medium uppercase tracking-[0.2em] text-foreground/25 mb-3">Availability</div>
        <button
          onClick={() => onChange({ openOnly: !filters.openOnly })}
          className="w-full flex items-center gap-2.5 py-1.5 px-1 rounded-lg transition-all text-left"
          style={{ background: filters.openOnly ? "rgba(255,255,255,0.06)" : "transparent" }}
        >
          <div
            className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
            style={{
              border: `1px solid ${filters.openOnly ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}`,
              background: filters.openOnly ? "rgba(255,255,255,0.15)" : "transparent",
            }}
          >
            {filters.openOnly && <CheckCircle2 className="w-2.5 h-2.5 text-foreground" />}
          </div>
          <span
            className="text-[13px] font-light transition-colors"
            style={{ color: filters.openOnly ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}
          >
            Open spots only
          </span>
        </button>
      </div>
    </div>
  );
}

/* ─── Floating particles ─── */
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

/* ─── Status quick-filter chips config ─── */
const STATUS_CHIPS: { value: StatusFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "all", label: "All", icon: Layers },
  { value: "active", label: "Active", icon: Zap },
  { value: "upcoming", label: "Upcoming", icon: Clock },
  { value: "completed", label: "Completed", icon: CheckCircle2 },
];

/* ─── Contest Card (image banner + info, like attached reference) ─── */
const ContestCard = React.memo(function ContestCard({ contest, index }: { contest: ContestData; index: number }) {
  const isUpcoming = contest.status === "upcoming";
  const isFull = contest.isFull;
  const taken = contest.maxSpots - contest.spotsRemaining;
  const percent = Math.min(100, (taken / Math.max(contest.maxSpots, 1)) * 100);

  // Deterministic gradient pair for fallback when no imageUrl
  const seed = (contest.id * 9301 + 49297) % 233280;
  const hueShift = (seed / 233280) * 360;
  const fallbackBg = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), transparent 55%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.10), transparent 60%), linear-gradient(${135 + hueShift / 8}deg, rgba(40,40,46,0.95), rgba(10,10,12,1))`;

  const dateLabel = contest.endsAt
    ? new Date(contest.endsAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "Open";

  // Format compact entry/spots count
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      className="h-full"
    >
      <Link href={isUpcoming ? `/giveaway` : `/giveaway/${contest.slug}`} aria-label={isUpcoming ? `${contest.name} — coming soon` : `Enter ${contest.name}`}>
        <div className={`contest-card-v2 group ${isUpcoming ? "is-upcoming" : ""} ${isFull ? "is-full" : ""} ${contest.imageUrl ? "has-banner" : "no-banner"}`}>
          <div className="contest-card-shine" />

          {/* ── BANNER (only if image exists) ── */}
          {contest.imageUrl ? (
            <div className="contest-card-banner">
              <img
                src={contest.imageUrl}
                alt={contest.name}
                loading="lazy"
                className="contest-card-banner-img"
              />
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
            /* Thin status strip when no image — much more minimal */
            <div className="contest-card-strip">
              <div className="contest-card-strip-icon">
                <Trophy className="w-3.5 h-3.5" />
              </div>
              {!isUpcoming && !isFull && (
                <div className="contest-card-strip-live">
                  <span className="contest-card-banner-pulse" />
                  LIVE
                </div>
              )}
              <div className="contest-card-strip-tag">
                {isUpcoming ? "COMING_SOON" : isFull ? "FULL" : "OPEN_NOW"}
              </div>
            </div>
          )}

          {/* ── BODY ── */}
          <div className="contest-card-body">
            {/* Title + Tagline */}
            <h3 className="contest-card-title">{contest.name}</h3>
            <div className="contest-card-org">
              <Gift className="w-3 h-3 text-foreground/35" />
              <span>{contest.prize}{contest.prizeValue ? ` · ${contest.prizeValue}` : ""}</span>
            </div>

            {/* Status pill row */}
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
                  <Zap className="w-2.5 h-2.5" /> Active
                </span>
              )}
              <span className="contest-card-pill-dot">·</span>
              <span className="contest-card-pill contest-card-pill-meta">
                Online
              </span>
            </div>

            {/* Capacity micro-bar */}
            <div className="contest-card-capacity">
              <div className="contest-card-capacity-track">
                <motion.div
                  className="contest-card-capacity-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            {/* 3-COL FOOTER (Attendees | Register by | Entry) */}
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

            {/* CTA + Countdown row */}
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

/* ─── Active filter chip ─── */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter: ${label}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-display text-foreground/60 transition-all cursor-pointer hover:text-foreground/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
    >
      {label}
      <X className="w-2.5 h-2.5" />
    </button>
  );
}

/* ─── Main Page ─── */
export default function Giveaway() {
  const { data: contests = [], isLoading: loading } = useQuery({
    queryKey: ["contests"],
    queryFn: getContests,
    refetchInterval: 30_000,
    staleTime: 0,
  });

  // Filter state
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  // Advanced filter popover state + click-outside
  const [advFilterOpen, setAdvFilterOpen] = useState(false);
  const advFilterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!advFilterOpen) return;
    function handleClick(e: MouseEvent) {
      if (advFilterRef.current && !advFilterRef.current.contains(e.target as Node)) {
        setAdvFilterOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAdvFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [advFilterOpen]);

  const updateFilters = useCallback((patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearFilters = useCallback(() => setFilters(defaultFilters), []);

  const activeFilterCount = countActiveFilters(filters);
  // "Advanced" count = deadline + openOnly only (status is handled by visible chip bar)
  const advFilterCount = filters.deadline.size + (filters.openOnly ? 1 : 0);

  // Filtered + searched contest list
  const filteredContests = useMemo(() => {
    let list = [...contests];
    const now = new Date();

    // Status filter
    if (filters.status === "active") list = list.filter((c) => c.status === "active" && !c.isFull);
    else if (filters.status === "upcoming") list = list.filter((c) => c.status === "upcoming");
    else if (filters.status === "completed") list = list.filter((c) => c.isFull || c.status === "completed" || c.status === "ended");

    // Open spots only
    if (filters.openOnly) list = list.filter((c) => !c.isFull && c.spotsRemaining > 0);

    // Deadline filter (multi-select OR logic)
    if (filters.deadline.size > 0) {
      list = list.filter((c) => {
        if (!c.endsAt) return filters.deadline.has("no-deadline");
        const endsAt = new Date(c.endsAt);
        const daysLeft = (endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (filters.deadline.has("this-week") && daysLeft >= 0 && daysLeft <= 7) return true;
        if (filters.deadline.has("this-month") && daysLeft >= 0 && daysLeft <= 30) return true;
        if (filters.deadline.has("no-deadline") && !c.endsAt) return true;
        return false;
      });
    }

    // Text search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.prize.toLowerCase().includes(q)
      );
    }

    return list;
  }, [contests, filters]);

  // Summary stats (always from full list)
  const totalSpots = contests.reduce((s, c) => s + c.maxSpots, 0);
  const totalEntries = contests.reduce((s, c) => s + c.totalEntries, 0);
  const activeCount = contests.filter((c) => c.status === "active" && !c.isFull).length;

  // Split filtered list into sections
  const activeContests = filteredContests.filter((c) => c.status === "active" && !c.isFull);
  const upcomingContests = filteredContests.filter((c) => c.status === "upcoming");
  const completedContests = filteredContests.filter((c) => c.isFull || c.status === "completed" || c.status === "ended");

  // Label map for active chip display
  const DEADLINE_LABELS: Record<string, string> = {
    "this-week": "Ends this week",
    "this-month": "Ends this month",
    "no-deadline": "No deadline",
  };
  const STATUS_LABELS: Record<string, string> = {
    active: "Active & open",
    upcoming: "Coming soon",
    completed: "Completed / Full",
  };

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-[70px] pb-16 sm:pb-24">

        {/* ── Section divider ── */}
        <div className="section-divider mx-2 sm:mx-3 md:mx-4 lg:mx-5 mb-4">
          <GlowLine />

          <section className="py-6 sm:py-10 relative">
            <div className="container mx-auto px-4 max-w-6xl">
              
              {/* ── Centered Hero Box (title + stats + entry-check CTA) ── */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="container mx-auto px-4 max-w-3xl pt-8 sm:pt-12 pb-6">
                <div
                  className="relative rounded-[28px] overflow-hidden"
                  style={{
                    background: "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 100%)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset, 0 20px 60px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* Decorative top wash */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-32 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.07) 0%, transparent 70%)" }}
                  />
                  <div className="relative z-[2] px-5 sm:px-9 py-8 sm:py-10 text-center">
                    <div className="glass-pill-badge inline-flex mb-4">

                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-light text-foreground mb-3 leading-[1.1] tracking-tight">Contest Hub</h1>
                    <p className="text-foreground/50 text-xs sm:text-sm font-light leading-relaxed max-w-xl mx-auto tracking-wide mb-7">
                      Choose a contest, complete partner registrations, and enter for a chance to win amazing prizes.
                    </p>

                    {/* Check-entry CTA → separate page */}
                    <Link
                      href="/entry-check"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-[13px] font-display font-light text-foreground/85 transition-all hover:text-foreground"
                      style={{
                        background: "linear-gradient(140deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 100%)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset",
                      }}
                    >
                      <Search className="w-3.5 h-3.5 text-foreground/55" />
                      Check Entry Code
                      <ChevronRight className="w-3.5 h-3.5 text-foreground/45" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* ── Unified Filter Bar (chips + advanced popover, no sidebar) ── */}
              <div className="mb-6 ctx-filterbar">
                {/* Search + Advanced filter button */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none z-[1]" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => updateFilters({ search: e.target.value })}
                      placeholder="Search contests, prizes..."
                      aria-label="Search contests"
                      className="ctx-search-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-light focus:outline-none transition-all text-foreground"
                    />
                  </div>

                  <div className="relative" ref={advFilterRef}>
                    <button
                      type="button"
                      onClick={() => setAdvFilterOpen((v) => !v)}
                      aria-expanded={advFilterOpen}
                      aria-haspopup="dialog"
                      data-active={advFilterCount > 0 ? "true" : "false"}
                      className="ctx-adv-btn flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-display font-light transition-all relative shrink-0"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">More</span>
                      {advFilterCount > 0 && (
                        <span className="ctx-adv-count w-4 h-4 rounded-full text-[9px] font-display flex items-center justify-center">
                          {advFilterCount}
                        </span>
                      )}
                    </button>

                    {/* Advanced filters popover */}
                    <AnimatePresence>
                      {advFilterOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                          role="dialog"
                          aria-label="Advanced filters"
                          className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl p-5 z-30"
                          style={{
                            background: "linear-gradient(160deg, rgba(20,20,24,0.98) 0%, rgba(10,10,12,0.98) 100%)",
                            border: "1px solid rgba(255,255,255,0.10)",
                            boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                          }}
                        >
                          <FilterPanel
                            filters={filters}
                            onChange={updateFilters}
                            onClear={clearFilters}
                            activeCount={activeFilterCount}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Status chips bar — always visible quick toggles */}
                <div
                  role="radiogroup"
                  aria-label="Filter contests by status"
                  className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide"
                >
                  {STATUS_CHIPS.map((chip) => {
                    const active = filters.status === chip.value;
                    const Icon = chip.icon;
                    return (
                      <button
                        key={chip.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-pressed={active}
                        data-active={active ? "true" : "false"}
                        onClick={() => updateFilters({ status: chip.value })}
                        className="ctx-status-chip inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-display font-light transition-all whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                      >
                        <Icon className="w-3 h-3" />
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Main Contest Area (full width, no sidebar) ── */}
              <div className="min-w-0">
                  {/* Active filter chips */}
                  {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {filters.status !== "all" && (
                        <FilterChip
                          label={STATUS_LABELS[filters.status]}
                          onRemove={() => updateFilters({ status: "all" })}
                        />
                      )}
                      {Array.from(filters.deadline).map((d) => (
                        <FilterChip
                          key={d}
                          label={DEADLINE_LABELS[d]}
                          onRemove={() => {
                            const next = new Set(filters.deadline);
                            next.delete(d as DeadlineFilter);
                            updateFilters({ deadline: next });
                          }}
                        />
                      ))}
                      {filters.openOnly && (
                        <FilterChip label="Open spots only" onRemove={() => updateFilters({ openOnly: false })} />
                      )}
                    </div>
                  )}

                  {/* Results count */}
                  {(activeFilterCount > 0 || filters.search) && (
                    <div className="mb-5 text-[11px] text-foreground/30 font-light">
                      {filteredContests.length} contest{filteredContests.length !== 1 ? "s" : ""} match{filteredContests.length === 1 ? "es" : ""} your filters
                    </div>
                  )}

                  {/* Contest cards */}
                  {loading ? (
                    <div className="flex justify-center py-20">
                      <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      {activeContests.length > 0 && (
                        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="mb-12">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/0" />
                            <h2 className="text-base sm:text-lg font-display font-light text-foreground">Active Contests</h2>
                            <span className="text-[10px] text-foreground/25 font-light">{activeContests.length} available</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {activeContests.map((contest, i) => (
                              <ContestCard key={contest.id} contest={contest} index={i + 3} />
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {upcomingContests.length > 0 && (
                        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="mb-12">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/25 to-white/0" />
                            <h2 className="text-base sm:text-lg font-display font-light text-foreground/70">Upcoming</h2>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {upcomingContests.map((contest, i) => (
                              <ContestCard key={contest.id} contest={contest} index={i + 5} />
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {completedContests.length > 0 && (
                        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="mb-12">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/15 to-white/0" />
                            <h2 className="text-base sm:text-lg font-display font-light text-foreground/50">Completed</h2>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {completedContests.map((contest, i) => (
                              <ContestCard key={contest.id} contest={contest} index={i + 7} />
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Empty state */}
                      {filteredContests.length === 0 && !loading && (
                        <div className="text-center py-20">
                          {activeFilterCount > 0 || filters.search ? (
                            <>
                              <Filter className="w-10 h-10 text-foreground/10 mx-auto mb-4" />
                              <h3 className="text-lg font-display font-light text-foreground/40 mb-2">No contests match</h3>
                              <p className="text-sm text-foreground/25 font-light mb-5">Try adjusting your filters or search term</p>
                              <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-light text-foreground/50 hover:text-foreground/75 transition-all"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                              >
                                <X className="w-3.5 h-3.5" />
                                Clear all filters
                              </button>
                            </>
                          ) : (
                            <>
                              <Trophy className="w-12 h-12 text-foreground/15 mx-auto mb-4" />
                              <h3 className="text-xl font-display font-light text-foreground/50 mb-2">No Contests Yet</h3>
                              <p className="text-sm text-foreground/30 font-light">Check back soon for exciting giveaway contests!</p>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
            </div>
          </section>

          <GlowLine />

          {/* ── How to Enter ── */}
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
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block" />
                  Step-by-Step Guide
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-light text-foreground mb-5 tracking-tight">How to Enter</h2>
                <p className="text-foreground/40 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto">
                  Follow each step carefully to enter the giveaway. Complete the full process to confirm your entry.
                </p>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-4 sm:space-y-5">
                {[
                  { step: "01", title: "Register with Partner Link", desc: "Click the provided partner registration link and complete the full registration on the partner profile. Every partner listed here requires registration — make sure it's successfully completed.", icon: <ExternalLink className="w-4 h-4" />, tip: "Required for all partners" },
                  { step: "02", title: "Maximize Your Chances", desc: "Want to increase your winning probability? Register with additional partner links as well. Each completed registration earns you one extra entry into the draw.", icon: <Target className="w-4 h-4" />, tip: "Optional but recommended" },
                  { step: "03", title: "Fill the Entry Form", desc: "Submit the giveaway entry form with all required details as mentioned. Include your name, email, phone, and city. If you have a referral code, enter it during submission.", icon: <Shield className="w-4 h-4" />, tip: null },
                  { step: "04", title: "Upload Screenshot Proof", desc: "Take a screenshot of each completed partner registration and upload it as proof. This is mandatory to verify your entry — one screenshot per partner.", icon: <Camera className="w-4 h-4" />, tip: "Max 10 MB per screenshot" },
                  { step: "05", title: "Get Your Entry Code", desc: "After successful submission, you'll receive a unique entry code (e.g., X247-XXXX-XXXX). Save this code — you'll need it to check your status and claim your prize if you win.", icon: <Copy className="w-4 h-4" />, tip: "Save your code!" },
                  { step: "06", title: "Wait for Winners", desc: "Winners are announced within 24-48 hours after all spots are filled and entries verified. Check the Winners page or use your entry code to see if you've won.", icon: <Award className="w-4 h-4" />, tip: null },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i}>
                    <div className="glass-card p-5 sm:p-6 group">
                      <div className="card-shine" />
                      <div className="relative z-[2] flex gap-4 sm:gap-5">
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-foreground/40 group-hover:text-foreground/60 transition-colors">
                            {item.icon}
                          </div>
                          <span className="text-[9px] font-display font-medium text-foreground/20 uppercase tracking-widest">{item.step}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h4 className="text-sm sm:text-base font-display font-light text-foreground">{item.title}</h4>
                            {item.tip && (
                              <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9px] text-foreground/40 font-light">{item.tip}</span>
                            )}
                          </div>
                          <p className="text-xs text-foreground/35 font-light leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          <GlowLine />

          {/* ── Premium Rewards Visual Showcase ── */}
          <section className="py-6 sm:py-10 relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="glass-card !shadow-none !p-0 overflow-hidden">
                  <div className="rewards-showcase-card relative overflow-hidden">
                    <img
                      src="/images/hero-rewards-visual.png"
                      alt="Premium rewards — trophies, gift cards, and tech prizes"
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
                        <h3 className="text-xl sm:text-3xl md:text-4xl font-display font-light text-white mb-2 tracking-tight leading-tight drop-shadow-lg">Premium Rewards.<br className="hidden sm:block" /> Every Single Day.</h3>
                        <p className="text-sm sm:text-base text-white/80 font-light max-w-md leading-relaxed drop-shadow">Gift cards, tech gadgets, swag kits &amp; cash prizes — drawn daily from all verified entries.</p>
                      </div>
                      <a href="#contests" className="showcase-enter-btn group shrink-0 inline-flex items-center justify-center gap-2 h-12 px-7 rounded-2xl font-medium text-sm tracking-wide transition-all duration-300 bg-white text-black border border-white/20 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap">
                        <span>Browse Contests</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <GlowLine />

          {/* ── Trust section ── */}
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
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block" />
                  Trust & Verification
                </div>
                <h2 className="text-xl sm:text-3xl font-display font-light text-foreground mb-4 tracking-tight">Fair & Transparent</h2>
                <p className="text-foreground/40 text-sm font-light leading-relaxed max-w-xl mx-auto">
                  Every entry is verified manually. Winners are selected randomly and announced transparently.
                </p>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
                {[
                  { name: "SSL Secured", icon: <Shield className="w-5 h-5" /> },
                  { name: "Verified Entries", icon: <CheckCircle2 className="w-5 h-5" /> },
                  { name: "Random Draw", icon: <Star className="w-5 h-5" /> },
                  { name: "Public Winners", icon: <Award className="w-5 h-5" /> },
                ].map((item) => (
                  <motion.div key={item.name} variants={fadeUp}>
                    <div className="glass-card p-4 text-center">
                      <div className="card-shine" />
                      <div className="relative z-[2]">
                        <div className="text-foreground/25 mx-auto mb-2 flex justify-center">{item.icon}</div>
                        <div className="text-[10px] text-foreground/40 font-display uppercase tracking-widest">{item.name}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        </div>

        <SiteFooter />
      </main>

    </div>
  );
}
