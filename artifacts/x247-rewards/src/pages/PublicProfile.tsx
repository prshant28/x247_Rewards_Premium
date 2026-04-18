import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import SiteFooter from "@/components/SiteFooter";
import { getPublicProfile } from "@/lib/api";
import {
  Calendar, Shield, MapPin, Share2, Copy, Check, Sparkles,
  Trophy, Ticket, BadgeCheck, Crown, Diamond, Zap,
  Users, ArrowRight, ExternalLink, Award, Target, Flame,
  Star,
} from "lucide-react";

const BADGE_META: Record<string, { emoji: string; label: string; desc: string }> = {
  "early-adopter":    { emoji: "🚀", label: "Early Adopter",    desc: "Joined during the first wave" },
  "streak-master":    { emoji: "🔥", label: "Streak Master",    desc: "Maintained a 30-day entry streak" },
  "first-win":        { emoji: "🏆", label: "First Win",        desc: "Won their first giveaway" },
  "social-butterfly": { emoji: "🦋", label: "Social Butterfly", desc: "Referred 5+ new members" },
  "partner-pro":      { emoji: "⭐", label: "Partner Pro",      desc: "Completed 10+ partner tasks" },
  "community-hero":   { emoji: "🛡️", label: "Community Hero",   desc: "Contributed to the community" },
  "lucky-charm":      { emoji: "🍀", label: "Lucky Charm",      desc: "Won 3+ consecutive giveaways" },
  "mega-streak":      { emoji: "💎", label: "Mega Streak",      desc: "90-day unbroken entry streak" },
};

const TIER_META: Record<string, { icon: React.FC<{ className?: string }>; label: string }> = {
  free:   { icon: Zap,     label: "Member"        },
  silver: { icon: Star,    label: "Silver Member" },
  gold:   { icon: Crown,   label: "Gold Member"   },
  black:  { icon: Diamond, label: "Black Elite"   },
};

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const total = Math.max(value, 1);
    const step = Math.max(1, Math.ceil(total / 35));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 28);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 18 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18 });
  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    rx.set(((e.clientY - r.top) / r.height - 0.5) * 10);
    ry.set(-((e.clientX - r.left) / r.width - 0.5) * 10);
  };
  return (
    <motion.div
      ref={ref}
      style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d", perspective: 1000 }}
      onMouseMove={handleMove}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function PublicProfile() {
  const params = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getPublicProfile(params.slug);
      if (data) setProfile(data);
      else setNotFound(true);
      setLoading(false);
    })();
  }, [params.slug]);

  const share = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${profile?.fullName} on X247`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

  const tier = profile?.membershipTier ?? "free";
  const TierIcon = TIER_META[tier]?.icon ?? Zap;
  const tierLabel = TIER_META[tier]?.label ?? "Member";
  const earnedBadges = (profile?.badges ?? []).filter((b: string) => BADGE_META[b]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pb-24 pt-28 sm:pt-32">
        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
              <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
              <span className="text-[11px] text-white/20 font-light tracking-widest uppercase">Loading profile</span>
            </div>
          </div>
        ) : notFound ? (
          <div className="flex justify-center items-center min-h-screen px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-6">
                <Shield className="w-7 h-7 text-white/20" />
              </div>
              <h1 className="text-xl font-display font-light text-white mb-2">Profile Not Found</h1>
              <p className="text-sm text-white/30 font-light mb-6 leading-relaxed">This profile is private or doesn't exist yet.</p>
              <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white/60 hover:text-white/90 transition-all">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Home
              </Link>
            </motion.div>
          </div>
        ) : (
          <>
            {/* ─── HERO ─── */}
            <div className="pub-hero">
              <div className="pub-hero-grid" />
              <div className="pub-hero-glow" />
              <div className="pub-hero-orb-1" />
              <div className="pub-hero-orb-2" />

              <div className="pub-hero-inner">
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="pub-hero-content">

                  {/* Avatar card */}
                  <TiltCard className="pub-avatar-tilt">
                    <div className="pub-avatar-card">
                      <div className="pub-avatar-card-shine" />
                      <div className="pub-avatar-ring" />
                      <div className="pub-avatar">
                        {profile.avatarUrl ? (
                          <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="pub-avatar-initials">{getInitials(profile.fullName)}</span>
                        )}
                      </div>
                    </div>
                  </TiltCard>

                  {/* Identity */}
                  <div className="pub-identity">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <h1 className="pub-name">{profile.fullName}</h1>
                      {profile.isVerified && (
                        <span className="pub-verified" title="Verified">
                          <BadgeCheck className="w-5 h-5" />
                        </span>
                      )}
                    </div>

                    {profile.bio && <p className="pub-bio">{profile.bio}</p>}

                    <div className="pub-meta-row">
                      {profile.city && (
                        <span className="pub-meta-pill">
                          <MapPin className="w-3 h-3" />
                          {profile.city}
                        </span>
                      )}
                      <span className="pub-meta-pill">
                        <Calendar className="w-3 h-3" />
                        Since {new Date(profile.memberSince).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                      </span>
                      {tier !== "free" && (
                        <span className="pub-meta-pill pub-meta-pill-tier">
                          <TierIcon className="w-3 h-3" />
                          {tierLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Share button */}
                  <button onClick={share} className="pub-share-btn">
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.span key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </motion.span>
                      ) : (
                        <motion.span key="share" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5" /> Share Profile
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              </div>
            </div>

            {/* ─── BODY ─── */}
            <div className="pub-body">

              {/* Stats */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="pub-stats-grid">
                {[
                  { icon: Ticket, label: "Entries",         value: profile.stats?.entries ?? 0 },
                  { icon: Target, label: "Contests",        value: profile.stats?.contestsJoined ?? 0 },
                  { icon: Award,  label: "Badges",          value: profile.stats?.badgesEarned ?? 0 },
                  { icon: Flame,  label: "Days Active",     value: profile.stats?.daysActive ?? 0 },
                ].map((s, i) => (
                  <div key={s.label} className="pub-stat-card">
                    <div className="pub-stat-icon"><s.icon className="w-3.5 h-3.5" /></div>
                    <div className="pub-stat-val"><AnimatedNumber value={s.value} /></div>
                    <div className="pub-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Badges */}
              {earnedBadges.length > 0 && (
                <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={2} className="pub-section">
                  <div className="pub-section-hd">
                    <Trophy className="w-4 h-4 text-white/30" />
                    <h2 className="pub-section-title">Badges & Achievements</h2>
                    <span className="pub-section-count">{earnedBadges.length}</span>
                  </div>
                  <div className="pub-badges-grid">
                    {earnedBadges.map((b: string, i: number) => {
                      const meta = BADGE_META[b];
                      return (
                        <motion.div key={b} variants={fadeUp} custom={3 + i} className="pub-badge-card">
                          <div className="pub-badge-emoji">{meta.emoji}</div>
                          <div className="pub-badge-name">{meta.label}</div>
                          <div className="pub-badge-desc">{meta.desc}</div>
                        </motion.div>
                      );
                    })}
                    {/* locked placeholders */}
                    {Array.from({ length: Math.max(0, 4 - earnedBadges.length) }).map((_, i) => (
                      <div key={`lock-${i}`} className="pub-badge-card pub-badge-locked">
                        <div className="pub-badge-emoji opacity-20">🔒</div>
                        <div className="pub-badge-name opacity-20">Locked</div>
                        <div className="pub-badge-desc opacity-15">Keep participating</div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Recent Activity */}
              {profile.recentContests && profile.recentContests.length > 0 && (
                <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={4} className="pub-section">
                  <div className="pub-section-hd">
                    <Zap className="w-4 h-4 text-white/30" />
                    <h2 className="pub-section-title">Contest Activity</h2>
                  </div>
                  <div className="pub-activity-list">
                    {profile.recentContests.map((c: any, i: number) => (
                      <motion.div key={`${c.contestId}-${i}`} variants={fadeUp} custom={5 + i} className="pub-activity-row">
                        <div className="pub-activity-dot" />
                        <div className="pub-activity-info">
                          <span className="pub-activity-text">Entered a giveaway</span>
                          <span className="pub-activity-sub">Contest #{c.contestId}</span>
                        </div>
                        <div className="pub-activity-badge">
                          <Ticket className="w-3 h-3" />
                          {c.entries} {c.entries === 1 ? "entry" : "entries"}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Profile link card */}
              <motion.section initial="hidden" animate="visible" variants={fadeUp} custom={6} className="pub-section">
                <div className="pub-section-hd">
                  <ExternalLink className="w-4 h-4 text-white/30" />
                  <h2 className="pub-section-title">Public Profile URL</h2>
                </div>
                <div className="pub-url-card">
                  <div className="pub-url-shine" />
                  <div className="relative z-[2] flex items-center gap-3">
                    <code className="pub-url-code flex-1 truncate">
                      x247.app/profile/{profile.profileSlug}
                    </code>
                    <button onClick={share} className="pub-url-copy" title="Copy link">
                      <AnimatePresence mode="wait">
                        {copied
                          ? <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Check className="w-3.5 h-3.5" /></motion.span>
                          : <motion.span key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Copy className="w-3.5 h-3.5" /></motion.span>}
                      </AnimatePresence>
                    </button>
                  </div>
                </div>
              </motion.section>

              {/* Join X247 CTA */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7} className="pub-cta">
                <div className="pub-cta-glow" />
                <div className="pub-cta-grid" />
                <div className="relative z-[2] flex flex-col items-center gap-5 text-center">
                  <div className="pub-cta-badge">
                    <Sparkles className="w-3 h-3" />
                    <span>Free to join</span>
                  </div>
                  <div>
                    <h3 className="pub-cta-title">Win Daily Prizes with {profile.fullName?.split(" ")[0]}</h3>
                    <p className="pub-cta-sub">
                      Join X247 and enter daily giveaways. Zero cost. Real prizes. Every day.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    <Link href="/account" className="pub-cta-primary">
                      <Sparkles className="w-3.5 h-3.5" />
                      Create Free Account
                    </Link>
                    <Link href="/giveaway" className="pub-cta-secondary">
                      Browse Giveaways
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="pub-cta-trust">
                    <Users className="w-3 h-3 opacity-30" />
                    <span>10,000+ members</span>
                    <span className="opacity-20">·</span>
                    <span>Daily prizes</span>
                    <span className="opacity-20">·</span>
                    <span>No credit card</span>
                  </div>
                </div>
              </motion.div>

            </div>
          </>
        )}
      </main>

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Giveaway", href: "/giveaway" },
        { label: "Account", href: "/account" },
      ]} />
    </div>
  );
}
