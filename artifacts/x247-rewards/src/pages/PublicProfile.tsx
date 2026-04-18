import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "wouter";
import {
  motion, AnimatePresence,
  useMotionValue, useSpring,
  useScroll, useTransform, useInView,
} from "framer-motion";
import SiteFooter from "@/components/SiteFooter";
import { getPublicProfile, followUser, unfollowUser } from "@/lib/api";
import {
  Calendar, Shield, MapPin, Share2, Copy, Check, Sparkles,
  Trophy, Ticket, BadgeCheck, Crown, Diamond, Zap,
  Users, ArrowRight, ExternalLink, Award, Target, Flame,
  Star, Quote, Globe, Lock, UserPlus, UserMinus,
} from "lucide-react";

/* ─── Badge metadata ─── */
const BADGE_META: Record<string, { emoji: string; label: string; desc: string; color: string; accent: string }> = {
  "early-adopter":    { emoji: "🚀", label: "Early Adopter",    desc: "Joined during the first wave of X247 members",   color: "rgba(139,92,246,0.20)", accent: "#8b5cf6" },
  "streak-master":    { emoji: "🔥", label: "Streak Master",    desc: "Maintained a 30-day continuous entry streak",    color: "rgba(249,115,22,0.20)", accent: "#f97316" },
  "first-win":        { emoji: "🏆", label: "First Win",        desc: "Claimed their very first giveaway prize",        color: "rgba(234,179,8,0.20)",  accent: "#eab308" },
  "social-butterfly": { emoji: "🦋", label: "Social Butterfly", desc: "Referred 5 or more new members to X247",         color: "rgba(34,197,94,0.20)",  accent: "#22c55e" },
  "partner-pro":      { emoji: "⭐", label: "Partner Pro",      desc: "Completed 10+ partner promotional tasks",        color: "rgba(59,130,246,0.20)", accent: "#3b82f6" },
  "community-hero":   { emoji: "🛡️", label: "Community Hero",   desc: "Made significant contributions to the community", color: "rgba(236,72,153,0.20)", accent: "#ec4899" },
  "lucky-charm":      { emoji: "🍀", label: "Lucky Charm",      desc: "Won 3 or more giveaways in a row",               color: "rgba(16,185,129,0.20)", accent: "#10b981" },
  "mega-streak":      { emoji: "💎", label: "Mega Streak",      desc: "90-day unbroken daily entry streak achieved",    color: "rgba(99,102,241,0.20)", accent: "#6366f1" },
};

const TIER_META: Record<string, { icon: React.FC<{ className?: string }>; label: string; glow: string; ring: string }> = {
  free:   { icon: Zap,     label: "Member",        glow: "rgba(255,255,255,0.06)", ring: "rgba(255,255,255,0.10)" },
  silver: { icon: Star,    label: "Silver Member", glow: "rgba(192,192,220,0.14)", ring: "rgba(192,192,220,0.30)" },
  gold:   { icon: Crown,   label: "Gold Member",   glow: "rgba(212,175,55,0.18)",  ring: "rgba(212,175,55,0.45)"  },
  black:  { icon: Diamond, label: "Black Elite",   glow: "rgba(120,120,160,0.22)", ring: "rgba(180,180,200,0.35)" },
};

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ─── Animated number counter ─── */
function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => {
      let start = 0;
      const total = Math.max(value, 1);
      const step = Math.max(1, Math.ceil(total / 40));
      const iv = setInterval(() => {
        start += step;
        if (start >= value) { setDisplay(value); clearInterval(iv); }
        else setDisplay(start);
      }, 22);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, inView, delay]);
  return <span ref={ref}>{display.toLocaleString()}</span>;
}

/* ─── Trading Card (premium collectible card — no corner arcs) ─── */
function TradingCard({
  initials, fullName, tier, tierLabel, followers, badges, onShare, copied,
}: {
  initials: string; fullName: string; tier: string; tierLabel: string;
  followers: number; badges: number; onShare: () => void; copied: boolean;
}) {
  const tierRing = TIER_META[tier]?.ring ?? "rgba(255,255,255,0.10)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateY: -8 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="pub2-tcard"
    >
      <div className="pub2-tcard-shine" />

      {/* Avatar art area */}
      <div className="pub2-tcard-inner">
        <div className="pub2-tcard-tier-pill" data-tier={tier}>{tierLabel.split(" ")[0].toUpperCase()}</div>
        <div className="pub2-tcard-grid" />

        {/* Crosshair reticle — no corner arcs */}
        <div className="pub2-tcard-reticle" aria-hidden>
          <div className="pub2-tcard-reticle-h" />
          <div className="pub2-tcard-reticle-v" />
          <div className="pub2-tcard-reticle-dot pub2-tcard-rd-c" />
        </div>

        <div className="pub2-tcard-avatar-area">
          {/* Glow ring around initials */}
          <div className="pub2-tcard-initials-ring" style={{ "--tier-ring": tierRing } as React.CSSProperties} />
          <span className="pub2-tcard-initials">{initials}</span>
        </div>
      </div>

      <div className="pub2-tcard-name-row">
        <span className="pub2-tcard-name">{fullName}</span>
        <BadgeCheck className="pub2-tcard-check" />
      </div>

      <div className="pub2-tcard-foot">
        <div className="pub2-tcard-stat" title="Followers">
          <Users className="w-3.5 h-3.5" />
          <span>{followers}</span>
        </div>
        <div className="pub2-tcard-stat" title="Badges">
          <Trophy className="w-3.5 h-3.5" />
          <span>{badges}</span>
        </div>
        <button onClick={onShare} className="pub2-tcard-share">
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Copied
              </motion.span>
            ) : (
              <motion.span key="sh" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> Share
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Activity Heatmap ─── */
function ActivityHeatmap({ seed = 1, daysActive = 0 }: { seed?: number; daysActive?: number }) {
  const WEEKS = 14; const DAYS = 7;
  const rand = (i: number) => { const x = Math.sin((i + 1) * (seed + 13)) * 10000; return x - Math.floor(x); };
  const cells: number[] = [];
  let activeCount = 0;
  for (let i = 0; i < WEEKS * DAYS; i++) {
    const r = rand(i);
    let level = 0;
    if (r > 0.92) level = 4; else if (r > 0.82) level = 3; else if (r > 0.68) level = 2; else if (r > 0.50) level = 1;
    cells.push(level);
    if (level > 0) activeCount++;
  }
  if (daysActive > 0 && activeCount > daysActive) {
    let toRemove = activeCount - daysActive;
    for (let i = cells.length - 1; i >= 0 && toRemove > 0; i--) { if (cells[i] > 0) { cells[i] = 0; toRemove--; } }
  }
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const now = new Date();
  const monthLabel = months[now.getMonth()]; const prevLabel = months[(now.getMonth() + 11) % 12];
  return (
    <div className="pub2-heatmap">
      <div className="pub2-heatmap-months"><span>{prevLabel}</span><span>{monthLabel}</span></div>
      <div className="pub2-heatmap-grid" style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
        {Array.from({ length: WEEKS }).map((_, w) => (
          <div key={w} className="pub2-heatmap-col">
            {Array.from({ length: DAYS }).map((_, d) => {
              const idx = w * DAYS + d; const lvl = cells[idx];
              return (
                <motion.div key={d} className={`pub2-heatmap-cell pub2-heatmap-l${lvl}`}
                  initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: idx * 0.004, duration: 0.3 }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="pub2-heatmap-legend">
        <span>Less</span>
        {[0,1,2,3,4].map(l => <div key={l} className={`pub2-heatmap-cell pub2-heatmap-l${l}`} />)}
        <span>More</span>
      </div>
    </div>
  );
}

/* ─── 3D tilt card ─── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0); const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 20 });
  const sry = useSpring(ry, { stiffness: 150, damping: 20 });
  return (
    <motion.div ref={ref} style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d", perspective: 900 }}
      onMouseMove={e => { if (!ref.current) return; const r = ref.current.getBoundingClientRect(); rx.set(((e.clientY - r.top) / r.height - 0.5) * 14); ry.set(-((e.clientX - r.left) / r.width - 0.5) * 14); }}
      onMouseLeave={() => { rx.set(0); ry.set(0); }} className={className}
    >{children}</motion.div>
  );
}

/* ─── Badge flip card — premium version ─── */
function BadgeFlipCard({ badgeId, earned = true }: { badgeId: string; earned?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const meta = BADGE_META[badgeId];
  if (!meta) return null;
  return (
    <div className="pub-flip-wrapper" onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)}>
      <div className={`pub-flip-inner ${flipped ? "pub-flip-inner--flipped" : ""} ${!earned ? "pub-flip-locked" : ""}`}>
        <div className="pub-flip-front" style={{ "--badge-glow": earned ? meta.color : "rgba(255,255,255,0.03)", "--badge-accent": earned ? meta.accent : "rgba(255,255,255,0.10)" } as React.CSSProperties}>
          {earned && <div className="pub-flip-front-glow" />}
          <div className="pub-flip-emoji">{meta.emoji}</div>
          <div className="pub-flip-label">{meta.label}</div>
          {earned && <div className="pub-flip-earned-dot" />}
        </div>
        <div className="pub-flip-back" style={{ "--badge-glow": earned ? meta.color : "rgba(255,255,255,0.03)" } as React.CSSProperties}>
          <div className="pub-flip-back-emoji">{meta.emoji}</div>
          <div className="pub-flip-back-name">{meta.label}</div>
          <div className="pub-flip-back-desc">{meta.desc}</div>
          {earned ? (
            <div className="pub-flip-back-status pub-flip-back-status--earned"><BadgeCheck className="w-3 h-3" /> Earned</div>
          ) : (
            <div className="pub-flip-back-status pub-flip-back-status--locked"><Lock className="w-3 h-3" /> Locked</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── fade-up variant ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }),
};

/* ═══════════════════════════════ MAIN ═══════════════════════════════ */
export default function PublicProfile() {
  const params = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getPublicProfile(params.slug);
      if (data) {
        setProfile(data);
        setIsFollowing(data.isFollowing ?? false);
        setFollowersCount(data.followersCount ?? 0);
        setFollowingCount(data.followingCount ?? 0);
      } else setNotFound(true);
      setLoading(false);
    })();
  }, [params.slug]);

  const handleFollow = async () => {
    const token = localStorage.getItem("user_token");
    if (!token) { window.location.href = "/account"; return; }
    if (followLoading) return;
    setFollowLoading(true);
    if (isFollowing) {
      const res = await unfollowUser(params.slug);
      if (res.success) { setIsFollowing(false); setFollowersCount(c => Math.max(0, c - 1)); }
    } else {
      const res = await followUser(params.slug);
      if (res.success) { setIsFollowing(true); setFollowersCount(c => c + 1); }
    }
    setFollowLoading(false);
  };

  const share = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: `${profile?.fullName} on X247`, url }).catch(() => {});
    else navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200); });
  };

  const tier = profile?.membershipTier ?? "free";
  const TierIcon = TIER_META[tier]?.icon ?? Zap;
  const tierLabel = TIER_META[tier]?.label ?? "Member";
  const tierGlow = TIER_META[tier]?.glow ?? "rgba(255,255,255,0.06)";
  const tierRing = TIER_META[tier]?.ring ?? "rgba(255,255,255,0.10)";
  const earnedBadges: string[] = (profile?.badges ?? []).filter((b: string) => BADGE_META[b]);
  const featuredBadge = profile?.selectedBadge && BADGE_META[profile.selectedBadge]
    ? profile.selectedBadge : earnedBadges[0] ?? null;
  const allBadgeSlots = [
    ...earnedBadges,
    ...Object.keys(BADGE_META).filter(k => !earnedBadges.includes(k)).slice(0, Math.max(0, 4 - earnedBadges.length)),
  ];

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="noise-overlay" />
        <div className="flex flex-col items-center gap-4">
          <motion.div className="w-8 h-8 border border-white/15 border-t-white/50 rounded-full"
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} />
          <span className="text-[11px] text-white/20 font-light tracking-widest uppercase">Loading profile</span>
        </div>
      </div>
    );
  }

  /* ─── Not Found ─── */
  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="noise-overlay" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-6">
            <Shield className="w-7 h-7 text-white/20" />
          </div>
          <h1 className="text-xl font-display font-light text-white mb-2">Profile Not Found</h1>
          <p className="text-sm text-white/30 font-light mb-6 leading-relaxed">This profile is private or doesn't exist yet.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white/60 hover:text-white/90 transition-all">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  const xp = (profile.stats?.entries ?? 0) * 10 + earnedBadges.length * 100 + (profile.stats?.daysActive ?? 0) * 5;
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const xpInLevel = xp % 500;
  const levelPct = Math.min(100, Math.round((xpInLevel / 500) * 100));
  const nextNeeded = 500 - xpInLevel;

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-20 sm:pt-24 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* ══ PROFILE IDENTITY HEADER BAND ══ */}
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="prof-id-band pub2-card mb-4 sm:mb-5"
          >
            {/* Decorative scan-line */}
            <div className="prof-id-band-scanline" aria-hidden />
            <div className="prof-id-band-grid" aria-hidden />

            <div className="prof-id-band-inner">
              {/* Avatar circle */}
              <div className="prof-id-avatar-wrap">
                <div className="prof-id-avatar-glow" style={{ "--tier-glow": tierGlow } as React.CSSProperties} />
                <div className="prof-id-avatar-ring" style={{ "--tier-ring": tierRing } as React.CSSProperties} />
                <div className="prof-id-avatar">
                  <span className="prof-id-avatar-initials">{getInitials(profile.fullName)}</span>
                </div>
                <div className="prof-id-avatar-verified">
                  <BadgeCheck className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Identity info */}
              <div className="prof-id-info">
                <div className="prof-id-name-row">
                  <h1 className="prof-id-name">{profile.fullName}</h1>
                  <span className="prof-id-tier-pill" data-tier={tier}>
                    <TierIcon className="w-3 h-3" />
                    {tierLabel}
                  </span>
                </div>
                <div className="prof-id-meta">
                  {profile.city && (
                    <span className="prof-id-meta-chip">
                      <MapPin className="w-3 h-3" /> {profile.city}
                    </span>
                  )}
                  <span className="prof-id-meta-chip">
                    <Calendar className="w-3 h-3" />
                    Since {new Date(profile.memberSince).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </span>
                  <span className="prof-id-meta-chip">
                    <Globe className="w-3 h-3" /> x247.app/profile/{profile.profileSlug}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="prof-id-actions">
                {!profile.isOwnProfile && (
                  <motion.button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={isFollowing ? "prof-id-unfollow-btn" : "prof-id-follow-btn"}
                    whileTap={{ scale: 0.96 }}
                  >
                    <AnimatePresence mode="wait">
                      {followLoading ? (
                        <motion.span key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                          <motion.span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full block" animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 0.8 }} />
                        </motion.span>
                      ) : isFollowing ? (
                        <motion.span key="unf" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                          <UserMinus className="w-3.5 h-3.5" /> Following
                        </motion.span>
                      ) : (
                        <motion.span key="fol" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                          <UserPlus className="w-3.5 h-3.5" /> Follow
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )}
                <button onClick={share} className="prof-id-share-btn">
                  <AnimatePresence mode="wait">
                    {copied
                      ? <motion.span key="c" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Copied</motion.span>
                      : <motion.span key="s" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> Share</motion.span>
                    }
                  </AnimatePresence>
                </button>
              </div>
            </div>

            {/* Stats strip at bottom of band */}
            <div className="prof-id-stats-strip">
              {[
                { val: followersCount,                       lbl: "Followers" },
                { val: followingCount,                       lbl: "Following" },
                { val: profile.stats?.contestsJoined ?? 0,  lbl: "Contests"  },
                { val: earnedBadges.length,                  lbl: "Badges"    },
                { val: level,                                lbl: "Level"     },
              ].map((s, i) => (
                <div key={s.lbl} className="prof-id-stat">
                  <div className="prof-id-stat-val"><AnimatedNumber value={s.val} delay={i * 60} /></div>
                  <div className="prof-id-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section divider */}
          <div className="section-divider mb-4 sm:mb-5" />

          {/* ══ TWO-COLUMN GRID ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr] gap-4 sm:gap-5">

            {/* ── LEFT COLUMN (sticky) ── */}
            <aside className="lg:sticky lg:top-24 lg:self-start space-y-5">
              <TradingCard
                initials={getInitials(profile.fullName)}
                fullName={profile.fullName}
                tier={tier}
                tierLabel={tierLabel}
                followers={followersCount}
                badges={earnedBadges.length}
                onShare={share}
                copied={copied}
              />

              {/* Level badge (sidebar) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="pub2-card"
              >
                <div className="pub2-card-head">
                  <Sparkles className="w-3.5 h-3.5 text-white/30" />
                  <span className="pub2-card-title">Level & XP</span>
                  <span className="pub2-card-count">LVL {level}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="pub2-level-num-wrap pub2-level-num-wrap--sm">
                    <div className="pub2-level-ring" />
                    <div className="pub2-level-num">{level}</div>
                    <div className="pub2-level-lbl">LEVEL</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="pub2-level-xp"><AnimatedNumber value={xp} /> <span className="pub2-level-xp-unit">XP</span></div>
                    <div className="pub2-level-next">{nextNeeded} XP to Level {level + 1}</div>
                    <div className="pub2-level-bar mt-2">
                      <motion.div className="pub2-level-bar-fill"
                        initial={{ width: 0 }} whileInView={{ width: `${levelPct}%` }}
                        viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }} />
                      <div className="pub2-level-bar-shine" />
                    </div>
                    <div className="pub2-level-pct">{levelPct}% complete</div>
                  </div>
                </div>
              </motion.div>

              {/* Bio (if present) — on sidebar for compact layout */}
              {profile.bio && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                  className="pub2-card"
                >
                  <div className="pub2-card-head">
                    <Quote className="w-3.5 h-3.5 text-white/30" />
                    <span className="pub2-card-title">About</span>
                  </div>
                  <blockquote className="pub2-bio-block">
                    <span className="pub2-bio-quote">"</span>
                    {profile.bio}
                    <span className="pub2-bio-quote">"</span>
                  </blockquote>
                </motion.div>
              )}
            </aside>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-4 sm:space-y-5 min-w-0">

              {/* ── Featured Badge ── */}
              {featuredBadge && BADGE_META[featuredBadge] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="pub2-card pub2-feat-outer"
                  style={{ "--badge-glow": BADGE_META[featuredBadge].color, "--badge-accent": BADGE_META[featuredBadge].accent } as React.CSSProperties}
                >
                  <div className="pub2-feat-ambient" />
                  <div className="pub2-card-head">
                    <Trophy className="w-3.5 h-3.5 text-white/30" />
                    <span className="pub2-card-title">Featured Achievement</span>
                  </div>
                  <div className="pub2-feat-badge-v2">
                    <div className="pub2-feat-badge-v2-glow" />
                    <div className="pub2-feat-badge-v2-icon">
                      <span className="pub2-feat-badge-v2-emoji">{BADGE_META[featuredBadge].emoji}</span>
                    </div>
                    <div className="pub2-feat-badge-v2-info">
                      <div className="pub2-feat-badge-v2-name">{BADGE_META[featuredBadge].label}</div>
                      <div className="pub2-feat-badge-v2-desc">{BADGE_META[featuredBadge].desc}</div>
                      <div className="pub2-feat-badge-v2-earned">
                        <BadgeCheck className="w-3.5 h-3.5" /> <span>Earned</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Stats 4-grid ── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
                className="pub2-stats-grid"
              >
                {[
                  { icon: Ticket, label: "Total Entries",   value: profile.stats?.entries ?? 0,        delay: 0   },
                  { icon: Target, label: "Contests Joined", value: profile.stats?.contestsJoined ?? 0, delay: 80  },
                  { icon: Award,  label: "Badges Earned",   value: earnedBadges.length,                 delay: 160 },
                  { icon: Flame,  label: "Days Active",     value: profile.stats?.daysActive ?? 0,      delay: 240 },
                ].map(s => (
                  <motion.div key={s.label} className="pub2-stat-card" whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                    <div className="pub2-stat-icon"><s.icon className="w-3.5 h-3.5" /></div>
                    <div className="pub2-stat-val"><AnimatedNumber value={s.value} delay={s.delay} /></div>
                    <div className="pub2-stat-lbl">{s.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* ── Badges Wall ── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                className="pub2-card"
              >
                <div className="pub2-card-head">
                  <Award className="w-3.5 h-3.5 text-white/30" />
                  <span className="pub2-card-title">Badges & Achievements</span>
                  {earnedBadges.length > 0 && <span className="pub2-card-count">{earnedBadges.length}</span>}
                </div>
                <p className="text-[11px] text-white/25 font-light mb-4 leading-relaxed">
                  Hover a badge to learn more. Keep participating to unlock more.
                </p>
                <div className="pub2-badges-grid">
                  {allBadgeSlots.map((b, i) => (
                    <motion.div key={b + i}
                      initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <BadgeFlipCard badgeId={b} earned={earnedBadges.includes(b)} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* ── Activity Heatmap ── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
                className="pub2-card"
              >
                <div className="pub2-card-head">
                  <Flame className="w-3.5 h-3.5 text-white/30" />
                  <span className="pub2-card-title">Activity Map</span>
                  <span className="pub2-card-count">{profile.stats?.daysActive ?? 0}d</span>
                </div>
                <p className="text-[11px] text-white/25 font-light mb-4 leading-relaxed">
                  Last 14 weeks of giveaway activity. Brighter cells = more entries.
                </p>
                <ActivityHeatmap
                  seed={(profile.fullName?.length ?? 1) * 7 + (profile.profileSlug?.length ?? 1)}
                  daysActive={profile.stats?.daysActive ?? 0}
                />
              </motion.div>

              {/* ── Contest Activity ── */}
              {profile.recentContests && profile.recentContests.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                  className="pub2-card"
                >
                  <div className="pub2-card-head">
                    <Zap className="w-3.5 h-3.5 text-white/30" />
                    <span className="pub2-card-title">Contest Activity</span>
                  </div>
                  <div className="pub2-timeline">
                    {profile.recentContests.map((c: any, i: number) => (
                      <motion.div key={`${c.contestId}-${i}`} className="pub2-timeline-row"
                        initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                      >
                        <div className="pub2-timeline-dot" />
                        <div className="pub2-timeline-info">
                          <div className="pub2-timeline-name">{c.contestName ?? "Giveaway"}</div>
                          <div className="pub2-timeline-meta">
                            {c.entries} {c.entries === 1 ? "entry" : "entries"} ·{" "}
                            {new Date(c.enteredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </div>
                        </div>
                        {c.won && (
                          <div className="pub2-timeline-win"><Trophy className="w-3 h-3" /> Won</div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Public Profile URL ── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="pub2-card"
              >
                <div className="pub2-card-head">
                  <ExternalLink className="w-3.5 h-3.5 text-white/30" />
                  <span className="pub2-card-title">Public Profile URL</span>
                </div>
                <div className="pub2-url-row">
                  <code className="pub2-url-code">x247.app/profile/{profile.profileSlug}</code>
                  <button onClick={share} className="pub2-url-btn">
                    <AnimatePresence mode="wait">
                      {copied
                        ? <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Check className="w-3.5 h-3.5" /></motion.span>
                        : <motion.span key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Copy className="w-3.5 h-3.5" /></motion.span>
                      }
                    </AnimatePresence>
                  </button>
                </div>
              </motion.div>

              {/* ── Join CTA ── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="pub2-cta"
              >
                <div className="pub2-cta-glow" />
                <div className="pub2-cta-grid" />
                <div className="relative z-[2] flex flex-col items-center gap-5 text-center">
                  <div className="pub2-cta-chip">
                    <Sparkles className="w-3 h-3" />
                    Free to join · No credit card
                  </div>
                  <div>
                    <h3 className="pub2-cta-title">Win Daily Prizes with {profile.fullName?.split(" ")[0]}</h3>
                    <p className="pub2-cta-sub">Join X247 and enter daily giveaways. Zero cost. Real prizes. Every day.</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    <Link href="/account" className="pub2-cta-primary">
                      <Sparkles className="w-3.5 h-3.5" />
                      Create Free Account
                    </Link>
                    <Link href="/giveaway" className="pub2-cta-ghost">
                      Browse Giveaways
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="pub2-cta-trust">
                    <Users className="w-3 h-3 opacity-25" />
                    <span>10,000+ members</span>
                    <span className="opacity-20">·</span>
                    <span>Daily prizes</span>
                    <span className="opacity-20">·</span>
                    <span>Real winners every day</span>
                  </div>
                </div>
              </motion.div>

            </div>{/* /right column */}
          </div>{/* /grid */}
        </div>{/* /container */}
      </main>

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Giveaway", href: "/giveaway" },
        { label: "Account", href: "/account" },
      ]} />
    </div>
  );
}
