import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, UserMinus, BadgeCheck, MapPin,
  Sparkles, Search, Loader2, Crown, Star, Diamond, Zap, ArrowLeft,
  Trophy, Shield, Award, TrendingUp, RefreshCw,
} from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import {
  getFollowers, getFollowing, getSuggestedUsers,
  followUser, unfollowUser, getPublicProfile,
  type FollowUserItem,
} from "@/lib/api";

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

/* ── Premium person card ────────────────────────────── */
function PersonCard({
  user,
  showMutual = false,
  onChange,
  index = 0,
}: {
  user: FollowUserItem;
  showMutual?: boolean;
  onChange?: (next: FollowUserItem) => void;
  index?: number;
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
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
      className="ppl-card"
    >
      <Link href={`/profile/${user.profileSlug}`} className="ppl-card-link">
        {/* Avatar */}
        <div className="ppl-avatar" style={{ background: tier.bg, borderColor: tier.color + "33" }}>
          <span className="ppl-avatar-initials">{getInitials(user.fullName)}</span>
          {user.isVerified && (
            <div className="ppl-avatar-verified">
              <BadgeCheck className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Info block */}
        <div className="ppl-card-info">
          <div className="ppl-card-name-row">
            <span className="ppl-card-name">{user.fullName}</span>
            {isMutual && (
              <span className="ppl-mutual-tag">
                <Users className="w-2.5 h-2.5" />
                Mutual
              </span>
            )}
          </div>

          <div className="ppl-card-chips">
            {/* Tier badge */}
            <span className="ppl-chip ppl-chip-tier" style={{ color: tier.color, background: tier.bg }}>
              <TierIcon className="w-2.5 h-2.5" />
              {tier.label}
            </span>
            {/* Follower count */}
            <span className="ppl-chip">
              <Users className="w-2.5 h-2.5" />
              {formatCount(count)}
            </span>
            {/* City */}
            {user.city && (
              <span className="ppl-chip">
                <MapPin className="w-2.5 h-2.5" />
                {user.city}
              </span>
            )}
          </div>

          {/* Selected badge */}
          {user.selectedBadge && (
            <div className="ppl-badge-line">
              <Award className="w-2.5 h-2.5 shrink-0" />
              <span>{user.selectedBadge}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Follow button */}
      {!user.isSelf && (
        <button
          onClick={toggle}
          disabled={busy}
          className={following ? "ppl-follow-btn ppl-follow-btn--following" : "ppl-follow-btn ppl-follow-btn--follow"}
          aria-label={following ? `Unfollow ${user.fullName}` : `Follow ${user.fullName}`}
        >
          {busy ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
    </motion.div>
  );
}

/* ── Stats summary bar ──────────────────────────────── */
function PeopleStatsBar({ tab, totalDiscover, totalFollowers, totalFollowing }: {
  tab: string;
  totalDiscover: number;
  totalFollowers: number;
  totalFollowing: number;
}) {
  const stats = [
    { icon: Sparkles, label: "Suggested", value: totalDiscover, active: tab === "discover" },
    { icon: Users,    label: "Followers",  value: totalFollowers, active: tab === "followers" },
    { icon: TrendingUp, label: "Following", value: totalFollowing, active: tab === "following" },
  ];
  return (
    <div className="ppl-stats-bar">
      {stats.map((s, i) => (
        <div key={i} className={`ppl-stat-item${s.active ? " ppl-stat-item--active" : ""}`}>
          <s.icon className="w-3 h-3" />
          <span className="ppl-stat-value">{s.value > 0 ? formatCount(s.value) : "—"}</span>
          <span className="ppl-stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Empty state ────────────────────────────────────── */
function PeopleEmpty({ tab, query }: { tab: string; query: string }) {
  const configs = {
    followers: {
      icon: Users,
      title: "No followers yet",
      sub: "Share your profile link to grow your network",
      cta: null,
    },
    following: {
      icon: UserPlus,
      title: "Not following anyone yet",
      sub: "Head to the Discover tab to find interesting people",
      cta: null,
    },
    discover: {
      icon: Sparkles,
      title: "No suggestions right now",
      sub: "More members joining soon — check back later",
      cta: null,
    },
  };
  const cfg = configs[tab as keyof typeof configs] ?? configs.discover;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="ppl-empty"
    >
      <div className="ppl-empty-icon-wrap">
        <Icon className="w-6 h-6" />
      </div>
      <p className="ppl-empty-title">
        {query ? "No matches found" : cfg.title}
      </p>
      <p className="ppl-empty-sub">
        {query ? `No results for "${query}"` : cfg.sub}
      </p>
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

  const tabs: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "discover",  label: "Discover",  icon: Sparkles },
    { id: "followers", label: "Followers", icon: Users },
    { id: "following", label: "Following", icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-[#05050A]">

      {/* ── Premium page banner ── */}
      <section className="page-section-banner">
        <div className="page-section-banner-text">
          <p className="page-section-banner-eyebrow">
            {slugParam ? `${profileName ?? slugParam}'s Network` : "Community"}
          </p>
          <h1 className="page-section-banner-title">
            {slugParam ? "Connections" : "Find People"}
          </h1>
          <p className="page-section-banner-sub">
            {slugParam
              ? "Browse this member's followers and following"
              : "Discover top members, grow your network, track who follows you"}
          </p>
        </div>
        <div className="page-section-banner-img-wrap" aria-hidden="true">
          <img src="/images/community-visual.png" alt="" className="page-section-banner-img" draggable={false} />
        </div>
      </section>

      {/* ── Main content ── */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {slugParam && (
          <Link
            href={`/profile/${slugParam}`}
            className="inline-flex items-center gap-1.5 text-[11px] text-foreground/30 hover:text-foreground/55 transition-colors mb-6 font-light"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to profile
          </Link>
        )}

        {/* Stats overview bar */}
        <PeopleStatsBar
          tab={tab}
          totalDiscover={discover.length}
          totalFollowers={followers.length}
          totalFollowing={following.length}
        />

        {/* Tabs + refresh */}
        <div className="ppl-tabs-row">
          <div className="ppl-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`ppl-tab${tab === t.id ? " ppl-tab--active" : ""}`}
              >
                <t.icon className="w-3 h-3 shrink-0" />
                <span className="ppl-tab-label">{t.label}</span>
                {t.id === "followers" && followers.length > 0 && (
                  <span className="ppl-tab-count">{formatCount(followers.length)}</span>
                )}
                {t.id === "following" && following.length > 0 && (
                  <span className="ppl-tab-count">{formatCount(following.length)}</span>
                )}
                {t.id === "discover" && discover.length > 0 && (
                  <span className="ppl-tab-count">{formatCount(discover.length)}</span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="ppl-refresh-btn"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Search */}
        <div className="ppl-search">
          <Search className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={tab === "discover" ? "Search people…" : `Search ${tab}…`}
            className="ppl-search-input"
          />
          {query && (
            <button onClick={() => setQuery("")} className="ppl-search-clear">✕</button>
          )}
        </div>

        {/* Section label for discover */}
        {tab === "discover" && !query && filtered.length > 0 && (
          <div className="ppl-section-label">
            <Sparkles className="w-3 h-3" />
            <span>Suggested for You</span>
          </div>
        )}
        {tab === "followers" && !query && filtered.length > 0 && (
          <div className="ppl-section-label">
            <Users className="w-3 h-3" />
            <span>People following you</span>
          </div>
        )}
        {tab === "following" && !query && filtered.length > 0 && (
          <div className="ppl-section-label">
            <TrendingUp className="w-3 h-3" />
            <span>People you follow</span>
          </div>
        )}

        {/* List */}
        <div className="ppl-list">
          <AnimatePresence mode="popLayout">
            {loading && list.length === 0 ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="ppl-loading"
              >
                <Loader2 className="w-6 h-6 animate-spin text-foreground/20" />
                <span className="text-xs text-foreground/25 font-light">Loading…</span>
              </motion.div>
            ) : filtered.length === 0 ? (
              <PeopleEmpty key="empty" tab={tab} query={query} />
            ) : (
              filtered.map((u, i) => (
                <PersonCard
                  key={u.id}
                  user={u}
                  index={i}
                  showMutual={tab === "followers"}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Giveaway", href: "/giveaway" },
        { label: "Account", href: "/account" },
        { label: "Community", href: "/community" },
      ]} />
    </div>
  );
}
