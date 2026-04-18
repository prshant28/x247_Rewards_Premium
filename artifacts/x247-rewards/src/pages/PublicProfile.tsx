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
const BADGE_META: Record<string, { emoji: string; label: string; desc: string; color: string }> = {
  "early-adopter":    { emoji: "🚀", label: "Early Adopter",    desc: "Joined during the first wave of X247 members", color: "rgba(139,92,246,0.25)" },
  "streak-master":    { emoji: "🔥", label: "Streak Master",    desc: "Maintained a 30-day continuous entry streak", color: "rgba(249,115,22,0.25)" },
  "first-win":        { emoji: "🏆", label: "First Win",        desc: "Claimed their very first giveaway prize", color: "rgba(234,179,8,0.25)" },
  "social-butterfly": { emoji: "🦋", label: "Social Butterfly", desc: "Referred 5 or more new members to X247", color: "rgba(34,197,94,0.25)" },
  "partner-pro":      { emoji: "⭐", label: "Partner Pro",      desc: "Completed 10+ partner promotional tasks", color: "rgba(59,130,246,0.25)" },
  "community-hero":   { emoji: "🛡️", label: "Community Hero",   desc: "Made significant contributions to the community", color: "rgba(236,72,153,0.25)" },
  "lucky-charm":      { emoji: "🍀", label: "Lucky Charm",      desc: "Won 3 or more giveaways in a row", color: "rgba(16,185,129,0.25)" },
  "mega-streak":      { emoji: "💎", label: "Mega Streak",      desc: "90-day unbroken daily entry streak achieved", color: "rgba(99,102,241,0.25)" },
};

const TIER_META: Record<string, { icon: React.FC<{ className?: string }>; label: string; glow: string }> = {
  free:   { icon: Zap,     label: "Member",        glow: "rgba(255,255,255,0.08)" },
  silver: { icon: Star,    label: "Silver Member", glow: "rgba(192,192,220,0.18)" },
  gold:   { icon: Crown,   label: "Gold Member",   glow: "rgba(212,175,55,0.22)" },
  black:  { icon: Diamond, label: "Black Elite",   glow: "rgba(120,120,160,0.28)" },
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

/* ─── Trading Card (compact stylized profile card) ─── */
function TradingCard({
  initials, fullName, tier, tierLabel, followers, badges, onShare, copied,
}: {
  initials: string; fullName: string; tier: string; tierLabel: string;
  followers: number; badges: number; onShare: () => void; copied: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateY: -10 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="pub2-tcard"
    >
      <div className="pub2-tcard-shine" />
      <div className="pub2-tcard-inner">
        <div className="pub2-tcard-tier-pill" data-tier={tier}>{tierLabel.split(" ")[0].toUpperCase()}</div>
        <div className="pub2-tcard-grid" />
        <div className="pub2-tcard-avatar-area">
          <span className="pub2-tcard-initials">{initials}</span>
          <div className="pub2-tcard-corner pub2-tcard-corner-tl" />
          <div className="pub2-tcard-corner pub2-tcard-corner-tr" />
          <div className="pub2-tcard-corner pub2-tcard-corner-bl" />
          <div className="pub2-tcard-corner pub2-tcard-corner-br" />
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

/* ─── Activity Heatmap (GitHub-style contribution grid) ─── */
function ActivityHeatmap({ seed = 1, daysActive = 0 }: { seed?: number; daysActive?: number }) {
  const WEEKS = 14;
  const DAYS = 7;
  // Deterministic pseudo-random pattern from seed
  const rand = (i: number) => {
    const x = Math.sin((i + 1) * (seed + 13)) * 10000;
    return x - Math.floor(x);
  };
  const cells: number[] = [];
  let activeCount = 0;
  for (let i = 0; i < WEEKS * DAYS; i++) {
    const r = rand(i);
    let level = 0;
    if (r > 0.92) level = 4;
    else if (r > 0.82) level = 3;
    else if (r > 0.68) level = 2;
    else if (r > 0.50) level = 1;
    cells.push(level);
    if (level > 0) activeCount++;
  }
  // Cap by daysActive when provided (turn off late cells if too many)
  if (daysActive > 0 && activeCount > daysActive) {
    let toRemove = activeCount - daysActive;
    for (let i = cells.length - 1; i >= 0 && toRemove > 0; i--) {
      if (cells[i] > 0) { cells[i] = 0; toRemove--; }
    }
  }
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const now = new Date();
  const monthLabel = months[now.getMonth()];
  const prevLabel  = months[(now.getMonth() + 11) % 12];

  return (
    <div className="pub2-heatmap">
      <div className="pub2-heatmap-months">
        <span>{prevLabel}</span>
        <span>{monthLabel}</span>
      </div>
      <div className="pub2-heatmap-grid" style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
        {Array.from({ length: WEEKS }).map((_, w) => (
          <div key={w} className="pub2-heatmap-col">
            {Array.from({ length: DAYS }).map((_, d) => {
              const idx = w * DAYS + d;
              const lvl = cells[idx];
              return (
                <motion.div
                  key={d}
                  className={`pub2-heatmap-cell pub2-heatmap-l${lvl}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.004, duration: 0.3 }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="pub2-heatmap-legend">
        <span>Less</span>
        <div className="pub2-heatmap-cell pub2-heatmap-l0" />
        <div className="pub2-heatmap-cell pub2-heatmap-l1" />
        <div className="pub2-heatmap-cell pub2-heatmap-l2" />
        <div className="pub2-heatmap-cell pub2-heatmap-l3" />
        <div className="pub2-heatmap-cell pub2-heatmap-l4" />
        <span>More</span>
      </div>
    </div>
  );
}

/* ─── 3D tilt card ─── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 20 });
  const sry = useSpring(ry, { stiffness: 150, damping: 20 });
  return (
    <motion.div
      ref={ref}
      style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d", perspective: 900 }}
      onMouseMove={e => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        rx.set(((e.clientY - r.top) / r.height - 0.5) * 14);
        ry.set(-((e.clientX - r.left) / r.width - 0.5) * 14);
      }}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Badge flip card ─── */
function BadgeFlipCard({ badgeId, earned = true }: { badgeId: string; earned?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const meta = BADGE_META[badgeId];
  if (!meta) return null;
  return (
    <div
      className="pub-flip-wrapper"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div className={`pub-flip-inner ${flipped ? "pub-flip-inner--flipped" : ""} ${!earned ? "pub-flip-locked" : ""}`}>
        {/* Front */}
        <div className="pub-flip-front" style={{ "--badge-glow": earned ? meta.color : "rgba(255,255,255,0.03)" } as React.CSSProperties}>
          <div className="pub-flip-emoji">{meta.emoji}</div>
          <div className="pub-flip-label">{meta.label}</div>
        </div>
        {/* Back */}
        <div className="pub-flip-back">
          <div className="pub-flip-back-emoji">{meta.emoji}</div>
          <div className="pub-flip-back-desc">{meta.desc}</div>
          {!earned && (
            <div className="pub-flip-back-locked">
              <Lock className="w-3 h-3" /> Locked
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Floating particle dots ─── */
function HeroParticles() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    dur: Math.random() * 6 + 4,
    delay: Math.random() * 4,
  }));
  return (
    <div className="pub-particles" aria-hidden>
      {particles.map(p => (
        <div
          key={p.id}
          className="pub-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── fade-up variant ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
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

  /* Mouse parallax for hero orbs */
  const heroRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const orb1x = useTransform(smx, [-1, 1], [-28, 28]);
  const orb1y = useTransform(smy, [-1, 1], [-18, 18]);
  const orb2x = useTransform(smx, [-1, 1], [22, -22]);
  const orb2y = useTransform(smy, [-1, 1], [14, -14]);

  const handleHeroMouse = useCallback((e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }, [mx, my]);

  /* Hero scroll parallax */
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.3]);

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
  const tierGlow = TIER_META[tier]?.glow ?? "rgba(255,255,255,0.08)";
  const earnedBadges: string[] = (profile?.badges ?? []).filter((b: string) => BADGE_META[b]);
  const featuredBadge = profile?.selectedBadge && BADGE_META[profile.selectedBadge]
    ? profile.selectedBadge
    : earnedBadges[0] ?? null;
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
          <motion.div
            className="w-8 h-8 border border-white/15 border-t-white/50 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
          />
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

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="noise-overlay" />

      {/* HERO REMOVED — trading card in sidebar covers identity */}
      <div className="pub2-hero-spacer" />
      {false && (
      <motion.div
        ref={heroRef}
        className="pub2-hero"
      >
        <div className="pub2-hero-inner">
          <motion.div
            className="pub2-hero-content"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {/* Avatar */}
            <motion.div variants={fadeUp} custom={1}>
              <TiltCard className="pub2-avatar-wrap">
                <div className="pub2-avatar-glow" style={{ "--tier-glow": tierGlow } as React.CSSProperties} />
                <div className="pub2-avatar-ring" />
                <div className="pub2-avatar-ring pub2-avatar-ring-2" />
                <div className="pub2-avatar">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="pub2-avatar-initials">{getInitials(profile.fullName)}</span>
                  )}
                </div>
                {profile.isVerified && (
                  <div className="pub2-avatar-verified">
                    <BadgeCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </TiltCard>
            </motion.div>

            {/* Name */}
            <motion.div variants={fadeUp} custom={2} className="pub2-identity">
              <h1 className="pub2-name">{profile.fullName}</h1>
              {profile.bio && (
                <p className="pub2-bio-hero">{profile.bio}</p>
              )}

              {/* Tier pill + meta pills */}
              <div className="pub2-meta-row">
                {tier !== "free" && (
                  <span className="pub2-tier-pill">
                    <TierIcon className="w-3 h-3" />
                    {tierLabel}
                  </span>
                )}
                {profile.city && (
                  <span className="pub2-pill">
                    <MapPin className="w-3 h-3" />
                    {profile.city}
                  </span>
                )}
                <span className="pub2-pill">
                  <Calendar className="w-3 h-3" />
                  Since {new Date(profile.memberSince).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </span>
              </div>
            </motion.div>

            {/* Quick stats in hero */}
            <motion.div variants={fadeUp} custom={3} className="pub2-hero-stats">
              {[
                { v: followersCount,                       l: "Followers" },
                { v: followingCount,                       l: "Following" },
                { v: profile.stats?.contestsJoined ?? 0,  l: "Contests" },
                { v: earnedBadges.length,                  l: "Badges" },
              ].map(s => (
                <div key={s.l} className="pub2-hero-stat">
                  <div className="pub2-hero-stat-val"><AnimatedNumber value={s.v} /></div>
                  <div className="pub2-hero-stat-lbl">{s.l}</div>
                </div>
              ))}
            </motion.div>

            {/* Action buttons */}
            <motion.div variants={fadeUp} custom={4} className="pub2-action-row">
              {/* Follow / Unfollow — hidden for own profile */}
              {!profile.isOwnProfile && (
                <motion.button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={isFollowing ? "pub2-unfollow-btn" : "pub2-follow-btn"}
                  whileTap={{ scale: 0.96 }}
                >
                  <AnimatePresence mode="wait">
                    {followLoading ? (
                      <motion.span key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                        <motion.span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full block" animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 0.8 }} />
                      </motion.span>
                    ) : isFollowing ? (
                      <motion.span key="unfollow" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                        <UserMinus className="w-3.5 h-3.5" /> Following
                      </motion.span>
                    ) : (
                      <motion.span key="follow" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5" /> Follow
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}

              {/* Share */}
              <button onClick={share} className="pub2-share-btn">
                <AnimatePresence mode="wait">
                  {copied
                    ? <motion.span key="ok" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </motion.span>
                    : <motion.span key="sh" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </motion.span>
                  }
                </AnimatePresence>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      )}

      {/* ══════════ BODY ══════════ */}
      <div className="pub2-body">
       <div className="pub2-frame">
        <div className="pub2-frame-glow" />
        <div className="pub2-frame-grid" />
        <div className="pub2-frame-corner pub2-frame-corner-tl" />
        <div className="pub2-frame-corner pub2-frame-corner-tr" />
        <div className="pub2-frame-corner pub2-frame-corner-bl" />
        <div className="pub2-frame-corner pub2-frame-corner-br" />
       <div className="pub2-body-grid">

        {/* ── LEFT COLUMN (sticky on desktop) ── */}
        <aside className="pub2-side">
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

          {/* Quick info chips below trading card */}
          <div className="pub2-side-info">
            {profile.city && (
              <div className="pub2-side-info-row">
                <MapPin className="w-3.5 h-3.5 text-white/40" />
                <span>{profile.city}</span>
              </div>
            )}
            <div className="pub2-side-info-row">
              <Calendar className="w-3.5 h-3.5 text-white/40" />
              <span>Member since {new Date(profile.memberSince).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
            </div>
            <div className="pub2-side-info-row">
              <Globe className="w-3.5 h-3.5 text-white/40" />
              <span className="truncate">x247.app/profile/{profile.profileSlug}</span>
            </div>
          </div>
        </aside>

        {/* ── RIGHT COLUMN (main content) ── */}
        <div className="pub2-main">

        {/* ── Bio (only if present) ── */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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

        {/* ── Level / XP Progress ── */}
        {(() => {
          const entries = profile.stats?.entries ?? 0;
          const days = profile.stats?.daysActive ?? 0;
          const xp = entries * 10 + earnedBadges.length * 100 + days * 5;
          const level = Math.max(1, Math.floor(xp / 500) + 1);
          const xpInLevel = xp % 500;
          const pct = Math.min(100, Math.round((xpInLevel / 500) * 100));
          const nextNeeded = 500 - xpInLevel;
          return (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="pub2-card pub2-level-card"
            >
              <div className="pub2-card-head">
                <Sparkles className="w-3.5 h-3.5 text-white/30" />
                <span className="pub2-card-title">Level & Progress</span>
                <span className="pub2-card-count">LVL {level}</span>
              </div>
              <div className="pub2-level-body">
                <div className="pub2-level-hero">
                  <div className="pub2-level-num-wrap">
                    <div className="pub2-level-ring" />
                    <div className="pub2-level-num">{level}</div>
                    <div className="pub2-level-lbl">LEVEL</div>
                  </div>
                  <div className="pub2-level-meta">
                    <div className="pub2-level-xp">
                      <AnimatedNumber value={xp} /> <span className="pub2-level-xp-unit">XP</span>
                    </div>
                    <div className="pub2-level-next">
                      {nextNeeded} XP to Level {level + 1}
                    </div>
                    <div className="pub2-level-bar">
                      <motion.div
                        className="pub2-level-bar-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                      />
                      <div className="pub2-level-bar-shine" />
                    </div>
                    <div className="pub2-level-pct">{pct}% complete</div>
                  </div>
                </div>
                <div className="pub2-level-breakdown">
                  <div className="pub2-level-chip">
                    <Ticket className="w-3 h-3" />
                    <span>{entries} entries</span>
                    <span className="pub2-level-chip-xp">+{entries * 10}</span>
                  </div>
                  <div className="pub2-level-chip">
                    <Award className="w-3 h-3" />
                    <span>{earnedBadges.length} badges</span>
                    <span className="pub2-level-chip-xp">+{earnedBadges.length * 100}</span>
                  </div>
                  <div className="pub2-level-chip">
                    <Flame className="w-3 h-3" />
                    <span>{days} days</span>
                    <span className="pub2-level-chip-xp">+{days * 5}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* ── Featured Badge (large showcase) ── */}
        {featuredBadge && BADGE_META[featuredBadge] && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="pub2-card"
          >
            <div className="pub2-card-head">
              <Trophy className="w-3.5 h-3.5 text-white/30" />
              <span className="pub2-card-title">Featured Achievement</span>
            </div>
            <div className="pub2-feat-badge" style={{ "--badge-glow": BADGE_META[featuredBadge].color } as React.CSSProperties}>
              <div className="pub2-feat-badge-glow" />
              <div className="pub2-feat-badge-emoji">{BADGE_META[featuredBadge].emoji}</div>
              <div className="pub2-feat-badge-info">
                <div className="pub2-feat-badge-name">{BADGE_META[featuredBadge].label}</div>
                <div className="pub2-feat-badge-desc">{BADGE_META[featuredBadge].desc}</div>
                <div className="pub2-feat-badge-earned">
                  <BadgeCheck className="w-3 h-3" /> Earned
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="pub2-stats-grid"
        >
          {[
            { icon: Ticket, label: "Total Entries",   value: profile.stats?.entries ?? 0,        delay: 0 },
            { icon: Target, label: "Contests Joined", value: profile.stats?.contestsJoined ?? 0, delay: 80 },
            { icon: Award,  label: "Badges Earned",   value: earnedBadges.length,                 delay: 160 },
            { icon: Flame,  label: "Days Active",     value: profile.stats?.daysActive ?? 0,      delay: 240 },
          ].map(s => (
            <motion.div
              key={s.label}
              className="pub2-stat-card"
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <div className="pub2-stat-icon"><s.icon className="w-3.5 h-3.5" /></div>
              <div className="pub2-stat-val"><AnimatedNumber value={s.value} delay={s.delay} /></div>
              <div className="pub2-stat-lbl">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Badges Wall ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="pub2-card"
        >
          <div className="pub2-card-head">
            <Award className="w-3.5 h-3.5 text-white/30" />
            <span className="pub2-card-title">Badges & Achievements</span>
            {earnedBadges.length > 0 && (
              <span className="pub2-card-count">{earnedBadges.length}</span>
            )}
          </div>
          <p className="text-[11px] text-white/25 font-light mb-4 leading-relaxed">
            Hover a badge to learn more. Keep participating to unlock more.
          </p>
          <div className="pub2-badges-grid">
            {allBadgeSlots.map((b, i) => (
              <motion.div
                key={b + i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <BadgeFlipCard badgeId={b} earned={earnedBadges.includes(b)} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Activity Heatmap (last 14 weeks) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
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
                <motion.div
                  key={`${c.contestId}-${i}`}
                  className="pub2-timeline-row"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="pub2-timeline-line" />
                  <div className="pub2-timeline-dot">
                    <Ticket className="w-2.5 h-2.5" />
                  </div>
                  <div className="pub2-timeline-content">
                    <div className="pub2-timeline-title">Entered a giveaway</div>
                    <div className="pub2-timeline-sub">Contest #{c.contestId}</div>
                  </div>
                  <div className="pub2-timeline-badge">
                    {c.entries} {c.entries === 1 ? "entry" : "entries"}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Profile URL Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
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

        {/* ── Join X247 CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
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

        </div>{/* /pub2-main */}
       </div>{/* /pub2-body-grid */}
       </div>{/* /pub2-frame */}
      </div>

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Giveaway", href: "/giveaway" },
        { label: "Account", href: "/account" },
      ]} />
    </div>
  );
}
