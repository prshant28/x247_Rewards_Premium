import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, UserMinus, BadgeCheck, MapPin,
  Sparkles, Search, Loader2, Crown, Star, Diamond, Zap, ArrowLeft,
} from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import {
  getFollowers, getFollowing, getSuggestedUsers,
  followUser, unfollowUser, getPublicProfile,
  type FollowUserItem,
} from "@/lib/api";

/* ── Tier styling helpers ───────────────────────────────── */
const TIER_ICON: Record<string, React.FC<{ className?: string }>> = {
  free: Zap, silver: Star, gold: Crown, black: Diamond,
};
const TIER_COLOR: Record<string, string> = {
  free: "rgba(255,255,255,0.4)",
  silver: "rgba(192,192,220,0.85)",
  gold: "rgba(212,175,55,0.95)",
  black: "rgba(220,220,240,0.95)",
};

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ── Single user row ────────────────────────────────────── */
function PersonRow({ user, onChange }: { user: FollowUserItem; onChange?: (next: FollowUserItem) => void }) {
  const [busy, setBusy] = useState(false);
  const [following, setFollowing] = useState(user.isFollowing);
  const [count, setCount] = useState(user.followersCount);
  const TierIcon = TIER_ICON[user.membershipTier] ?? Zap;

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="people-row"
    >
      <Link href={`/profile/${user.profileSlug}`} className="people-row-inner">
        <div className="people-row-avatar">
          <span>{getInitials(user.fullName)}</span>
          {user.isVerified && (
            <div className="people-row-verified">
              <BadgeCheck className="w-2.5 h-2.5" />
            </div>
          )}
        </div>
        <div className="people-row-info">
          <div className="people-row-name-line">
            <span className="people-row-name">{user.fullName}</span>
            <TierIcon className="people-row-tier-ico w-3 h-3" style={{ color: TIER_COLOR[user.membershipTier] }} />
          </div>
          <div className="people-row-meta">
            {user.city && (
              <span className="people-row-chip"><MapPin className="w-2.5 h-2.5" />{user.city}</span>
            )}
            <span className="people-row-chip"><Users className="w-2.5 h-2.5" />{count.toLocaleString()}</span>
          </div>
        </div>
      </Link>
      {!user.isSelf && (
        <button
          onClick={toggle}
          disabled={busy}
          className={following ? "people-follow-btn people-follow-btn--following" : "people-follow-btn people-follow-btn--follow"}
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

  const load = useCallback(async (t: Tab, slug?: string) => {
    if (!slug && (t === "followers" || t === "following")) return;
    setLoading(true);
    if (t === "discover") {
      const users = await getSuggestedUsers(20);
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
  }, []);

  useEffect(() => {
    if (loadedTabs.has(tab)) return;
    load(tab, currentSlug);
  }, [tab, currentSlug, load, loadedTabs]);

  const list = tab === "discover" ? discover : tab === "followers" ? followers : following;
  const filtered = query.trim()
    ? list.filter(u =>
        u.fullName.toLowerCase().includes(query.toLowerCase()) ||
        u.profileSlug.toLowerCase().includes(query.toLowerCase()) ||
        (u.city ?? "").toLowerCase().includes(query.toLowerCase()))
    : list;

  const tabs: { id: Tab; label: string; icon?: React.FC<{ className?: string }> }[] = [
    { id: "discover", label: "Discover", icon: Sparkles },
    { id: "followers", label: "Followers" },
    { id: "following", label: "Following" },
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
              : "Discover top members, track your followers, manage who you follow"}
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
            className="inline-flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/55 transition-colors mb-6 font-light"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to profile
          </Link>
        )}

        {/* Tabs */}
        <div className="people-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`people-tab${tab === t.id ? " people-tab--active" : ""}`}
            >
              {t.icon && <t.icon className="w-3 h-3" />}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="people-search">
          <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={tab === "discover" ? "Search people…" : `Search ${tab}…`}
            className="people-search-input"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-white/20 hover:text-white/40 transition-colors text-xs shrink-0">✕</button>
          )}
        </div>

        {/* List */}
        <div className="people-list">
          <AnimatePresence mode="popLayout">
            {loading && list.length === 0 ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="people-empty"
              >
                <Loader2 className="w-6 h-6 animate-spin text-white/20" />
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="people-empty"
              >
                <div className="people-empty-icon"><Users className="w-5 h-5" /></div>
                <p className="people-empty-title">
                  {query
                    ? "No matches found"
                    : tab === "followers" ? "No followers yet"
                    : tab === "following" ? "Not following anyone yet"
                    : "No suggestions right now"}
                </p>
                <p className="people-empty-sub">
                  {!query && tab === "followers" && "Share your profile to grow your network"}
                  {!query && tab === "following" && "Discover people in the Discover tab"}
                  {!query && tab === "discover" && "Check back soon as more members join"}
                </p>
              </motion.div>
            ) : (
              filtered.map(u => (
                <PersonRow key={u.id} user={u} />
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
