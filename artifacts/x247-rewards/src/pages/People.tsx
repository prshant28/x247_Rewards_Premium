import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Users, UserPlus, UserMinus, BadgeCheck, MapPin,
  Sparkles, Search, Loader2, Crown, Star, Diamond, Zap, ArrowLeft,
  Award, TrendingUp, RefreshCw, SlidersHorizontal, ArrowRight,
  ShieldCheck, CheckCircle2, BarChart3, UserCheck,
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
  visible: { transition: { staggerChildren: 0.08 } }
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

/* ── Trust strip items (mirrors Partners "Verified & Secure" block) ── */
const trustItems = [
  { name: "Verified Members", icon: <BadgeCheck className="w-5 h-5" /> },
  { name: "Secure Connections", icon: <ShieldCheck className="w-5 h-5" /> },
  { name: "Real Profiles Only", icon: <CheckCircle2 className="w-5 h-5" /> },
  { name: "Community Audited", icon: <BarChart3 className="w-5 h-5" /> },
];

/* ── Person card — Partners-DNA glass-card + card-top-accent + card-shine ── */
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
          {/* Avatar with BorderGlow */}
          <BorderGlow
            borderRadius={16}
            glowRadius={14}
            cardBg={tier.bg}
            className="w-16 h-16 shrink-0 flex items-center justify-center relative"
          >
            <span
              className="font-display font-light text-lg"
              style={{ color: tier.color }}
            >
              {getInitials(user.fullName)}
            </span>
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black border border-white/20 flex items-center justify-center text-foreground/80">
                <BadgeCheck className="w-3 h-3" />
              </div>
            )}
          </BorderGlow>

          {/* Info block */}
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

            {/* Chips: Tier + Followers + City */}
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

            {/* Selected badge line */}
            {user.selectedBadge && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-3">
                <Award className="w-3 h-3 text-foreground/45 shrink-0" />
                <span className="text-[11px] text-foreground/60 font-light truncate">{user.selectedBadge}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer row: View link + Follow button */}
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
                <>
                  <UserMinus className="w-3 h-3" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3 h-3" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Empty state ────────────────────────────────────── */
function PeopleEmpty({ tab, query }: { tab: string; query: string }) {
  const configs = {
    followers: {
      icon: Users,
      title: "No followers yet",
      sub: "Share your profile link to grow your network",
    },
    following: {
      icon: UserPlus,
      title: "Not following anyone yet",
      sub: "Head to the Discover tab to find interesting people",
    },
    discover: {
      icon: Sparkles,
      title: "No suggestions right now",
      sub: "More members joining soon — check back later",
    },
  };
  const cfg = configs[tab as keyof typeof configs] ?? configs.discover;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass-card p-10 sm:p-14 text-center col-span-full"
    >
      <div className="card-top-accent" />
      <div className="card-shine" />
      <div className="relative z-[2]">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-foreground/45">
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-foreground/75 font-display text-base sm:text-lg font-light mb-2">
          {query ? "No matches found" : cfg.title}
        </p>
        <p className="text-foreground/40 text-xs sm:text-sm font-light">
          {query ? `No results for "${query}"` : cfg.sub}
        </p>
      </div>
    </motion.div>
  );
}

/* ══ MAIN PAGE ══════════════════════════════════════════════════════════ */
type Tab = "discover" | "followers" | "following";

export default function People() {
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const slugParam = searchParams.get("slug") ?? undefined;
  const tabParam = (searchParams.get("tab") ?? "discover") as Tab;

  const [tab, setTab] = useState<Tab>(tabParam);
  const [query, setQuery] = useState("");
  const [discover, setDiscover] = useState<FollowUserItem[]>([]);
  const [followers, setFollowers] = useState<FollowUserItem[]>([]);
  const [following, setFollowing] = useState<FollowUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileName, setProfileName] = useState<string | undefined>(undefined);
  const [loadedTabs, setLoadedTabs] = useState<Set<Tab>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const [currentSlug, setCurrentSlug] = useState<string | undefined>(slugParam);

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

  const load = useCallback(async (t: Tab, slug?: string, force = false) => {
    if (!force && !slug && (t === "followers" || t === "following")) return;
    if (!force && loadedTabs.has(t)) return;
    setLoading(true);
    if (t === "discover") {
      const users = await getSuggestedUsers(30);
      setDiscover(users);
    } else if (t === "followers" && slug) {
      const { users } = await getFollowers(slug, 0, 50);
      setFollowers(users);
    } else if (t === "following" && slug) {
      const { users } = await getFollowing(slug, 0, 50);
      setFollowing(users);
    }
    setLoadedTabs(prev => new Set(prev).add(t));
    setLoading(false);
  }, [loadedTabs]);

  useEffect(() => {
    if (loadedTabs.has(tab)) return;
    load(tab, currentSlug);
  }, [tab, currentSlug, load, loadedTabs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setLoadedTabs(prev => {
      const next = new Set(prev);
      next.delete(tab);
      return next;
    });
    await load(tab, currentSlug, true);
    setRefreshing(false);
  };

  const list = tab === "discover" ? discover : tab === "followers" ? followers : following;
  const filtered = query.trim()
    ? list.filter(u =>
        u.fullName.toLowerCase().includes(query.toLowerCase()) ||
        u.profileSlug.toLowerCase().includes(query.toLowerCase()) ||
        (u.city ?? "").toLowerCase().includes(query.toLowerCase()))
    : list;

  const tabs: { id: Tab; label: string; icon: React.FC<{ className?: string }>; count: number }[] = [
    { id: "discover",  label: "Discover",  icon: Sparkles, count: discover.length },
    { id: "followers", label: "Followers", icon: Users,    count: followers.length },
    { id: "following", label: "Following", icon: UserCheck, count: following.length },
  ];

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-[70px] pb-20 sm:pb-32">

        {/* ── Hero (Partners DNA) ── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-20 sm:py-28 px-4">
          <div className="glass-pill-badge inline-flex mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block" />
            {slugParam ? `${profileName ?? slugParam}'s Network` : "Community"}
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-light text-foreground mb-5 leading-tight tracking-tight">
            {slugParam ? "Connections" : "Find People"}
          </h1>
          <p className="text-foreground/45 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto tracking-wide">
            {slugParam
              ? "Browse this member's followers and people they follow — discover shared connections."
              : "Discover top members, grow your network, and track who follows you across X247."}
          </p>
        </motion.div>

        <div className="container mx-auto px-4 max-w-5xl">

          {/* Back to profile (only when viewing a slug) */}
          {slugParam && (
            <Link
              href={`/profile/${slugParam}`}
              className="inline-flex items-center gap-1.5 text-[11px] text-foreground/35 hover:text-foreground/65 transition-colors mb-6 font-display tracking-wide"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to profile
            </Link>
          )}

          {/* ── Stats overview card (mirrors Partners "Platform Stats") ── */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-6 sm:mb-8">
            <div className="glass-card p-4 sm:p-5">
              <div className="card-top-accent" />
              <div className="relative z-[2] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/40" />
                  <span className="text-xs sm:text-sm text-foreground/50 font-light tracking-wide">Network Overview</span>
                </div>
                <div className="grid grid-cols-3 gap-0 w-full sm:w-auto sm:flex sm:items-center sm:gap-10">
                  <div className="text-center sm:text-right border-r sm:border-r-0 border-white/[0.06] px-2 sm:px-0">
                    <div className="text-lg sm:text-2xl font-display font-light text-foreground">{discover.length || "—"}</div>
                    <div className="text-[9px] sm:text-[10px] text-foreground/30 uppercase tracking-widest font-display mt-0.5">Suggested</div>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-white/[0.06]" />
                  <div className="text-center sm:text-right border-r sm:border-r-0 border-white/[0.06] px-2 sm:px-0">
                    <div className="text-lg sm:text-2xl font-display font-light text-foreground">{followers.length || "—"}</div>
                    <div className="text-[9px] sm:text-[10px] text-foreground/30 uppercase tracking-widest font-display mt-0.5">Followers</div>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-white/[0.06]" />
                  <div className="text-center sm:text-right px-2 sm:px-0">
                    <div className="text-lg sm:text-2xl font-display font-light text-foreground">{following.length || "—"}</div>
                    <div className="text-[9px] sm:text-[10px] text-foreground/30 uppercase tracking-widest font-display mt-0.5">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Premium segmented tab nav (large, unmistakable) ── */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-5 sm:mb-6">
            <div className="glass-card p-1.5 sm:p-2 relative overflow-hidden">
              <div className="card-top-accent" />
              <div className="relative z-[2] grid grid-cols-3 gap-1 sm:gap-1.5">
                {tabs.map((t) => {
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm font-display tracking-wide transition-all overflow-hidden ${
                        active
                          ? "bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
                          : "text-foreground/60 hover:text-foreground/90 hover:bg-white/[0.04]"
                      }`}
                      aria-pressed={active}
                    >
                      <t.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${active ? "text-black" : ""}`} />
                      <span className="font-light">{t.label}</span>
                      {t.count > 0 && (
                        <span className={`hidden sm:inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-display ${
                          active ? "bg-black/10 text-black/70" : "bg-white/[0.08] text-foreground/55"
                        }`}>
                          {formatCount(t.count)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ── Sub-action bar: section label + refresh ── */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-4 sm:mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-foreground/45 min-w-0">
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-display truncate">
                {tab === "discover" && "Suggested members for you"}
                {tab === "followers" && (slugParam ? "Members following them" : "Members following you")}
                {tab === "following" && (slugParam ? "Members they follow" : "Members you follow")}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] text-foreground/55 hover:text-foreground/85 hover:bg-white/[0.07] transition-all disabled:opacity-40"
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </motion.div>

          {/* ── Search (glass-card style) ── */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8 sm:mb-10">
            <div className="glass-card p-3 sm:p-3.5">
              <div className="card-top-accent" />
              <div className="relative z-[2] flex items-center gap-3 px-2">
                <Search className="w-4 h-4 text-foreground/35 shrink-0" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={tab === "discover" ? "Search people by name, handle or city…" : `Search ${tab}…`}
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
          </motion.div>

          {/* ── List grid (Partners 2-col DNA) ── */}
          {loading && list.length === 0 ? (
            <div className="flex items-center justify-center py-20 mb-16 sm:mb-24">
              <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : (tab === "followers" || tab === "following") && !currentSlug ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 sm:p-12 text-center mb-16 sm:mb-24"
            >
              <div className="card-top-accent" />
              <div className="card-shine" />
              <div className="relative z-[2]">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-5 text-foreground/55">
                  {tab === "followers" ? <Users className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
                </div>
                <h3 className="text-lg sm:text-xl font-display font-light text-foreground mb-2">
                  Sign in to see your {tab === "followers" ? "followers" : "following"}
                </h3>
                <p className="text-foreground/40 text-xs sm:text-sm font-light max-w-md mx-auto mb-6 leading-relaxed">
                  Login karke apna network dekho — followers, following, aur mutual connections ek jagah.
                </p>
                <BorderGlow as={Link} href="/account" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group inline-flex">
                  <span className="relative z-[2]">Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                </BorderGlow>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-16 sm:mb-24"
            >
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <PeopleEmpty key="empty" tab={tab} query={query} />
                ) : (
                  filtered.map((u) => (
                    <motion.div key={u.id} variants={fadeUp}>
                      <PersonCard
                        user={u}
                        showMutual={tab === "followers"}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Trust strip (mirrors Partners "Verified & Secure") ── */}
          <motion.div
            initial="hidden"
            animate="visible"
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

          {/* ── Bottom CTA (Partners "How It Works" pattern) ── */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
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
