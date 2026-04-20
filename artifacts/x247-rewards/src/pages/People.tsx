import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Users, UserPlus, UserMinus, BadgeCheck, MapPin,
  Sparkles, Search, Loader2, Crown, Star, Diamond, Zap, ArrowLeft,
  Award, TrendingUp, RefreshCw, ArrowRight,
  ShieldCheck, CheckCircle2, BarChart3, UserCheck, ChevronDown, ChevronUp,
} from "lucide-react";
import BorderGlow from "@/components/BorderGlow";
import SiteFooter from "@/components/SiteFooter";
import {
  getFollowers, getFollowing, getSuggestedUsers,
  followUser, unfollowUser, getPublicProfile,
  type FollowUserItem,
} from "@/lib/api";

/* ── Motion variants (Partners DNA) ─────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};

/* ── Tier helpers ───────────────────────────────────── */
const TIER_META: Record<string, { icon: React.FC<{ className?: string; style?: React.CSSProperties }>; color: string; label: string; bg: string }> = {
  free:   { icon: Zap,     color: "rgba(255,255,255,0.45)", label: "Free",   bg: "rgba(255,255,255,0.06)" },
  silver: { icon: Star,    color: "rgba(192,192,220,0.90)", label: "Silver", bg: "rgba(192,192,220,0.08)" },
  gold:   { icon: Crown,   color: "rgba(212,175,55,0.95)",  label: "Gold",   bg: "rgba(212,175,55,0.10)"  },
  black:  { icon: Diamond, color: "rgba(220,220,240,0.95)", label: "Elite",  bg: "rgba(220,220,240,0.08)" },
};

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/* ── Trust strip items ── */
const trustItems = [
  { name: "Verified Members", icon: <BadgeCheck className="w-5 h-5" /> },
  { name: "Secure Connections", icon: <ShieldCheck className="w-5 h-5" /> },
  { name: "Real Profiles Only", icon: <CheckCircle2 className="w-5 h-5" /> },
  { name: "Community Audited", icon: <BarChart3 className="w-5 h-5" /> },
];

/* ── Person card ── */
function PersonCard({
  user,
  showMutual = false,
  onChange,
}: {
  user: FollowUserItem;
  showMutual?: boolean;
  onChange?: (next: FollowUserItem) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [following, setFollowing] = useState(user.isFollowing);
  const [count, setCount] = useState(user.followersCount);
  const tier = TIER_META[user.membershipTier] ?? TIER_META.free;
  const TierIcon = tier.icon;
  const isMutual = showMutual && user.isFollowing;

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy || user.isSelf) return;
    const token = localStorage.getItem("user_token");
    if (!token) { window.location.href = "/account"; return; }
    setBusy(true);
    if (following) {
      const r = await unfollowUser(user.profileSlug);
      if (r.success) { setFollowing(false); setCount(c => Math.max(0, c - 1)); onChange?.({ ...user, isFollowing: false }); }
    } else {
      const r = await followUser(user.profileSlug);
      if (r.success) { setFollowing(true); setCount(c => c + 1); onChange?.({ ...user, isFollowing: true }); }
    }
    setBusy(false);
  };

  return (
    <Link href={`/profile/${user.profileSlug}`} className="block group">
      <div className="glass-card p-6 sm:p-7 relative overflow-hidden h-full">
        <div className="card-top-accent" />
        <div className="card-shine" />

        <div className="relative z-[2] flex items-start gap-4">
          <BorderGlow
            borderRadius={16}
            glowRadius={14}
            cardBg={tier.bg}
            className="w-16 h-16 shrink-0 flex items-center justify-center relative"
          >
            <span className="font-display font-light text-lg" style={{ color: tier.color }}>
              {getInitials(user.fullName)}
            </span>
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black border border-white/20 flex items-center justify-center text-foreground/80">
                <BadgeCheck className="w-3 h-3" />
              </div>
            )}
          </BorderGlow>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h3 className="text-base sm:text-lg font-display font-light text-foreground truncate">
                {user.fullName}
              </h3>
              {isMutual && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[9px] font-display uppercase tracking-widest text-foreground/55">
                  <Users className="w-2.5 h-2.5" />
                  Mutual
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display tracking-wide"
                style={{ color: tier.color, background: tier.bg, border: `1px solid ${tier.color}22` }}
              >
                <TierIcon className="w-2.5 h-2.5" />
                {tier.label}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] text-foreground/55 font-light">
                <Users className="w-2.5 h-2.5" />
                {formatCount(count)}
              </span>
              {user.city && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] text-foreground/55 font-light">
                  <MapPin className="w-2.5 h-2.5" />
                  {user.city}
                </span>
              )}
            </div>

            {user.selectedBadge && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-3">
                <Award className="w-3 h-3 text-foreground/45 shrink-0" />
                <span className="text-[11px] text-foreground/60 font-light truncate">{user.selectedBadge}</span>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-[2] mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center text-foreground/30 group-hover:text-foreground/60 transition-colors text-xs font-display">
            <span>View Profile</span>
            <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </div>
          {!user.isSelf && (
            <button
              onClick={toggle}
              disabled={busy}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-display tracking-wide transition-all ${
                following
                  ? "bg-white/[0.05] border border-white/[0.08] text-foreground/70 hover:bg-white/[0.08]"
                  : "bg-white text-black border border-white/20 hover:bg-white/90"
              }`}
              aria-label={following ? `Unfollow ${user.fullName}` : `Follow ${user.fullName}`}
            >
              {busy ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : following ? (
                <><UserMinus className="w-3 h-3" /><span>Following</span></>
              ) : (
                <><UserPlus className="w-3 h-3" /><span>Follow</span></>
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Empty state inside a section ── */
function SectionEmpty({ icon: Icon, title, sub }: { icon: React.FC<{ className?: string }>; title: string; sub: string }) {
  return (
    <div className="glass-card p-10 sm:p-12 text-center col-span-full">
      <div className="card-top-accent" />
      <div className="card-shine" />
      <div className="relative z-[2]">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-foreground/45">
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-foreground/75 font-display text-base sm:text-lg font-light mb-2">{title}</p>
        <p className="text-foreground/40 text-xs sm:text-sm font-light">{sub}</p>
      </div>
    </div>
  );
}

/* ── Sign-in inline CTA ── */
function SignInInline({ kind }: { kind: "followers" | "following" }) {
  return (
    <div className="glass-card p-8 sm:p-12 text-center col-span-full">
      <div className="card-top-accent" />
      <div className="card-shine" />
      <div className="relative z-[2]">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-5 text-foreground/55">
          {kind === "followers" ? <Users className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
        </div>
        <h3 className="text-lg sm:text-xl font-display font-light text-foreground mb-2">
          Sign in to see your {kind === "followers" ? "followers" : "following"}
        </h3>
        <p className="text-foreground/40 text-xs sm:text-sm font-light max-w-md mx-auto mb-6 leading-relaxed">
          Login karke apna network dekho — followers, following, aur mutual connections ek jagah.
        </p>
        <BorderGlow as={Link} href="/account" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group inline-flex">
          <span className="relative z-[2]">Sign In</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
        </BorderGlow>
      </div>
    </div>
  );
}

/* ── Section block: header + grid + expand toggle ── */
const SECTION_PREVIEW = 6;

function SectionBlock({
  id,
  icon: Icon,
  label,
  title,
  subtitle,
  items,
  loading,
  showMutual = false,
  emptyIcon,
  emptyTitle,
  emptySub,
  signedOut = false,
  signKind,
  onChange,
}: {
  id: string;
  icon: React.FC<{ className?: string }>;
  label: string;
  title: string;
  subtitle: string;
  items: FollowUserItem[];
  loading: boolean;
  showMutual?: boolean;
  emptyIcon: React.FC<{ className?: string }>;
  emptyTitle: string;
  emptySub: string;
  signedOut?: boolean;
  signKind?: "followers" | "following";
  onChange?: (next: FollowUserItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, SECTION_PREVIEW);
  const hasMore = items.length > SECTION_PREVIEW;

  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      className="mb-14 sm:mb-20 scroll-mt-24"
    >
      {/* Header */}
      <div className="flex items-end justify-between gap-3 mb-5 sm:mb-6">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
            <Icon className="w-3 h-3 text-foreground/55" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-display text-foreground/55">{label}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-light text-foreground tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-foreground/45 text-xs sm:text-sm font-light mt-2 max-w-xl tracking-wide">
            {subtitle}
          </p>
        </div>
        {!signedOut && items.length > 0 && (
          <span className="shrink-0 inline-flex items-center justify-center min-w-[44px] h-8 px-3 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] font-display text-foreground/65">
            {formatCount(items.length)}
          </span>
        )}
      </div>

      {/* Grid */}
      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : signedOut && signKind ? (
        <SignInInline kind={signKind} />
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {visible.length === 0 ? (
              <SectionEmpty icon={emptyIcon} title={emptyTitle} sub={emptySub} />
            ) : (
              visible.map((u) => (
                <motion.div key={u.id} variants={fadeUp} layout>
                  <PersonCard user={u} showMutual={showMutual} onChange={onChange} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Expand toggle */}
      {!signedOut && hasMore && (
        <div className="flex justify-center mt-6 sm:mt-8">
          <button
            onClick={() => setExpanded(v => !v)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-foreground/70 hover:bg-white/[0.08] hover:text-foreground transition-all text-[11px] sm:text-xs font-display tracking-wide"
          >
            {expanded ? (
              <>Show less<ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Show all {formatCount(items.length)}<ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      )}
    </motion.section>
  );
}

/* ══ MAIN PAGE ══════════════════════════════════════════════════════════ */
export default function People() {
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const slugParam = searchParams.get("slug") ?? undefined;

  const [query, setQuery] = useState("");
  const [discover, setDiscover] = useState<FollowUserItem[]>([]);
  const [followers, setFollowers] = useState<FollowUserItem[]>([]);
  const [following, setFollowing] = useState<FollowUserItem[]>([]);
  const [loadingDiscover, setLoadingDiscover] = useState(true);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [profileName, setProfileName] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSlug, setCurrentSlug] = useState<string | undefined>(slugParam);
  const searchRef = useRef<HTMLInputElement>(null);

  /* Derive current slug from token if not viewing someone else */
  useEffect(() => {
    if (!slugParam) {
      const token = localStorage.getItem("user_token");
      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.profileSlug) setCurrentSlug(payload.profileSlug);
      } catch { /* ignore */ }
    } else {
      setCurrentSlug(slugParam);
      getPublicProfile(slugParam).then(d => {
        if (d?.fullName) setProfileName(d.fullName);
      });
    }
  }, [slugParam]);

  const loadAll = useCallback(async (slug?: string) => {
    setLoadingDiscover(true);
    setLoadingFollowers(true);
    setLoadingFollowing(true);

    const tasks: Array<Promise<unknown>> = [
      getSuggestedUsers(30)
        .then(users => setDiscover(users))
        .catch(() => setDiscover([]))
        .finally(() => setLoadingDiscover(false)),
    ];

    if (slug) {
      tasks.push(
        getFollowers(slug, 0, 50)
          .then(({ users }) => setFollowers(users))
          .catch(() => setFollowers([]))
          .finally(() => setLoadingFollowers(false)),
        getFollowing(slug, 0, 50)
          .then(({ users }) => setFollowing(users))
          .catch(() => setFollowing([]))
          .finally(() => setLoadingFollowing(false)),
      );
    } else {
      setFollowers([]); setLoadingFollowers(false);
      setFollowing([]); setLoadingFollowing(false);
    }
    await Promise.allSettled(tasks);
  }, []);

  useEffect(() => {
    loadAll(currentSlug);
  }, [currentSlug, loadAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll(currentSlug);
    setRefreshing(false);
  };

  /* Search filter */
  const filterFn = useCallback((u: FollowUserItem) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.profileSlug.toLowerCase().includes(q) ||
      (u.city ?? "").toLowerCase().includes(q)
    );
  }, [query]);

  const filteredDiscover = useMemo(() => discover.filter(filterFn), [discover, filterFn]);
  const filteredFollowers = useMemo(() => followers.filter(filterFn), [followers, filterFn]);
  const filteredFollowing = useMemo(() => following.filter(filterFn), [following, filterFn]);

  const isViewingOther = !!slugParam;
  const signedOut = !currentSlug;

  /* Update handler — keep counts in sync if a user is followed/unfollowed in any section */
  const syncUser = (next: FollowUserItem) => {
    const apply = (u: FollowUserItem) => u.id === next.id ? { ...u, isFollowing: next.isFollowing } : u;
    setDiscover(list => list.map(apply));
    setFollowers(list => list.map(apply));
    setFollowing(list => list.map(apply));
  };

  /* Quick-jump pills */
  const jumps = [
    { id: "discover", label: "Discover", icon: Sparkles, count: discover.length },
    { id: "followers", label: "Followers", icon: Users, count: followers.length },
    { id: "following", label: "Following", icon: UserCheck, count: following.length },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-[70px] pb-20 sm:pb-32">

        {/* ── Hero ── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-20 sm:py-28 px-4">
          <div className="glass-pill-badge inline-flex mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block" />
            {isViewingOther ? `${profileName ?? slugParam}'s Network` : "Community"}
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-light text-foreground mb-5 leading-tight tracking-tight">
            {isViewingOther ? "Connections" : "Your Network"}
          </h1>
          <p className="text-foreground/45 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto tracking-wide">
            {isViewingOther
              ? "Browse this member's followers and people they follow — discover shared connections."
              : "All your followers, the members you follow, and top people to discover — every connection in one place."}
          </p>
        </motion.div>

        <div className="container mx-auto px-4 max-w-5xl">

          {/* Back to profile (only when viewing a slug) */}
          {isViewingOther && (
            <Link
              href={`/profile/${slugParam}`}
              className="inline-flex items-center gap-1.5 text-[11px] text-foreground/35 hover:text-foreground/65 transition-colors mb-6 font-display tracking-wide"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to profile
            </Link>
          )}

          {/* ── Network overview stats ── */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-6 sm:mb-8">
            <div className="glass-card p-4 sm:p-5">
              <div className="card-top-accent" />
              <div className="relative z-[2] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/40" />
                  <span className="text-xs sm:text-sm text-foreground/50 font-light tracking-wide">Network Overview</span>
                </div>
                <div className="grid grid-cols-3 gap-0 w-full sm:w-auto sm:flex sm:items-center sm:gap-10">
                  <button onClick={() => scrollToSection("followers")} className="text-center sm:text-right border-r sm:border-r-0 border-white/[0.06] px-2 sm:px-0 hover:opacity-80 transition-opacity">
                    <div className="text-lg sm:text-2xl font-display font-light text-foreground">{followers.length || "—"}</div>
                    <div className="text-[9px] sm:text-[10px] text-foreground/30 uppercase tracking-widest font-display mt-0.5">Followers</div>
                  </button>
                  <div className="hidden sm:block w-px h-8 bg-white/[0.06]" />
                  <button onClick={() => scrollToSection("following")} className="text-center sm:text-right border-r sm:border-r-0 border-white/[0.06] px-2 sm:px-0 hover:opacity-80 transition-opacity">
                    <div className="text-lg sm:text-2xl font-display font-light text-foreground">{following.length || "—"}</div>
                    <div className="text-[9px] sm:text-[10px] text-foreground/30 uppercase tracking-widest font-display mt-0.5">Following</div>
                  </button>
                  <div className="hidden sm:block w-px h-8 bg-white/[0.06]" />
                  <button onClick={() => scrollToSection("discover")} className="text-center sm:text-right px-2 sm:px-0 hover:opacity-80 transition-opacity">
                    <div className="text-lg sm:text-2xl font-display font-light text-foreground">{discover.length || "—"}</div>
                    <div className="text-[9px] sm:text-[10px] text-foreground/30 uppercase tracking-widest font-display mt-0.5">Suggested</div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Quick-jump pills (replace tabs — they scroll to sections) ── */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-5 sm:mb-6">
            <div className="glass-card p-1.5 sm:p-2 relative overflow-hidden">
              <div className="card-top-accent" />
              <div className="relative z-[2] grid grid-cols-3 gap-1 sm:gap-1.5">
                {jumps.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => scrollToSection(j.id)}
                    className="relative flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm font-display tracking-wide transition-all overflow-hidden text-foreground/70 hover:text-foreground hover:bg-white/[0.05]"
                  >
                    <j.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="font-light">{j.label}</span>
                    {j.count > 0 && (
                      <span className="hidden sm:inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-display bg-white/[0.08] text-foreground/60">
                        {formatCount(j.count)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Search + global refresh ── */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-12 sm:mb-16 flex items-center gap-3">
            <div className="glass-card p-3 sm:p-3.5 flex-1">
              <div className="card-top-accent" />
              <div className="relative z-[2] flex items-center gap-3 px-2">
                <Search className="w-4 h-4 text-foreground/35 shrink-0" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search across followers, following & discover…"
                  className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground/85 placeholder:text-foreground/30 font-light"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-foreground/40 hover:text-foreground/80 text-xs px-2 py-1 rounded transition-colors"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.08] text-foreground/55 hover:text-foreground/85 hover:bg-white/[0.07] transition-all disabled:opacity-40"
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </motion.div>

          {/* ── Followers Section ── */}
          <SectionBlock
            id="followers"
            icon={Users}
            label={isViewingOther ? "Their Followers" : "Your Followers"}
            title={isViewingOther ? "Members Following Them" : "Members Following You"}
            subtitle={isViewingOther
              ? "People who follow this member — including any mutual connections you share."
              : "Real X247 members who follow your journey. Mutual followers get a special tag."}
            items={filteredFollowers}
            loading={loadingFollowers}
            showMutual
            emptyIcon={Users}
            emptyTitle={query ? "No matches found" : "No followers yet"}
            emptySub={query ? `No followers matching "${query}"` : "Share your profile link to grow your network."}
            signedOut={signedOut}
            signKind="followers"
            onChange={syncUser}
          />

          {/* ── Following Section ── */}
          <SectionBlock
            id="following"
            icon={UserCheck}
            label={isViewingOther ? "They Follow" : "You Follow"}
            title={isViewingOther ? "Members They Follow" : "Members You Follow"}
            subtitle={isViewingOther
              ? "Members in this profile's circle — see who they're inspired by."
              : "Your curated circle. Their wins and updates show up in your feed."}
            items={filteredFollowing}
            loading={loadingFollowing}
            emptyIcon={UserPlus}
            emptyTitle={query ? "No matches found" : "Not following anyone yet"}
            emptySub={query ? `No following matching "${query}"` : "Scroll down to discover top people worth following."}
            signedOut={signedOut}
            signKind="following"
            onChange={syncUser}
          />

          {/* ── Discover Section ── */}
          <SectionBlock
            id="discover"
            icon={Sparkles}
            label="Discover"
            title="Top People to Follow"
            subtitle="Hand-picked premium members — top tier players, active winners, and verified profiles worth knowing."
            items={filteredDiscover}
            loading={loadingDiscover}
            emptyIcon={Sparkles}
            emptyTitle={query ? "No matches found" : "No suggestions right now"}
            emptySub={query ? `No suggestions matching "${query}"` : "More members joining soon — check back later."}
            onChange={syncUser}
          />

          {/* ── Trust strip ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="mb-16 sm:mb-24"
          >
            <div className="text-center mb-10 sm:mb-14">
              <div className="glass-pill-badge mb-6 mx-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block" />
                Trust & Safety
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-display font-light mb-4 text-foreground tracking-tight">
                A Verified Community
              </h2>
              <p className="text-foreground/40 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto tracking-wide">
                Every member you see here is a real, verified X247 account. No bots, no fake follows — just an authentic community of rewards enthusiasts.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {trustItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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

          {/* ── Bottom CTA ── */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
            <div className="glass-card p-6 sm:p-10 text-center">
              <div className="card-top-accent" />
              <div className="card-shine" />
              <div className="relative z-[2]">
                <h3 className="text-xl sm:text-2xl font-display font-light text-foreground mb-4">Build Your Circle</h3>
                <p className="text-foreground/40 font-light text-sm leading-relaxed max-w-xl mx-auto mb-8">
                  Follow other members to see their wins, climb the leaderboards together, and unlock community-only perks. Your network multiplies your rewards.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <BorderGlow as={Link} href="/account" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                    <span className="relative z-[2]">My Account</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                  </BorderGlow>
                  <BorderGlow as={Link} href="/giveaway" borderRadius={16} glowRadius={20} cardBg="rgba(10,10,10,0.6)" className="premium-btn premium-btn-lg premium-btn-ghost glass-btn-effect group">
                    <span className="relative z-[2]">Enter Giveaway</span>
                  </BorderGlow>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Giveaway", href: "/giveaway" },
        { label: "Account", href: "/account" },
        { label: "Partners", href: "/partners" },
      ]} />
    </div>
  );
}
