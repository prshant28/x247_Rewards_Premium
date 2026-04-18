import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Users, UserPlus, UserMinus, BadgeCheck, MapPin, Sparkles,
  Search, Loader2, Crown, Star, Diamond, Zap,
} from "lucide-react";
import {
  getFollowers, getFollowing, getSuggestedUsers,
  followUser, unfollowUser, type FollowUserItem,
} from "@/lib/api";

type Tab = "followers" | "following" | "suggestions";

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

function FollowRow({ user, onChange }: { user: FollowUserItem; onChange?: (next: FollowUserItem) => void }) {
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
    <Link href={`/profile/${user.profileSlug}`} className="follow-row">
      <div className="follow-row-avatar">
        <span>{getInitials(user.fullName)}</span>
        {user.isVerified && <div className="follow-row-verified"><BadgeCheck className="w-3 h-3" /></div>}
      </div>
      <div className="follow-row-info">
        <div className="follow-row-name-line">
          <span className="follow-row-name">{user.fullName}</span>
          <TierIcon className="follow-row-tier-ico" style={{ color: TIER_COLOR[user.membershipTier] }} />
        </div>
        <div className="follow-row-meta">
          {user.city && <span className="follow-row-meta-chip"><MapPin className="w-2.5 h-2.5" />{user.city}</span>}
          <span className="follow-row-meta-chip"><Users className="w-2.5 h-2.5" />{count.toLocaleString()}</span>
        </div>
      </div>
      {!user.isSelf && (
        <button
          onClick={toggle}
          disabled={busy}
          className={following ? "follow-row-btn follow-row-btn--following" : "follow-row-btn follow-row-btn--follow"}
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
    </Link>
  );
}

export default function FollowListModal({
  open, onClose, slug, initialTab = "followers", initialFollowersCount = 0, initialFollowingCount = 0,
}: {
  open: boolean;
  onClose: () => void;
  slug: string;
  initialTab?: Tab;
  initialFollowersCount?: number;
  initialFollowingCount?: number;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [followers, setFollowers] = useState<FollowUserItem[]>([]);
  const [following, setFollowing] = useState<FollowUserItem[]>([]);
  const [suggestions, setSuggestions] = useState<FollowUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [followersTotal, setFollowersTotal] = useState(initialFollowersCount);
  const [followingTotal, setFollowingTotal] = useState(initialFollowingCount);
  const [loadedTabs, setLoadedTabs] = useState<Set<Tab>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) setTab(initialTab); }, [open, initialTab]);

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    if (t === "followers") {
      const { users, total } = await getFollowers(slug, 0, 50);
      setFollowers(users); setFollowersTotal(total);
    } else if (t === "following") {
      const { users, total } = await getFollowing(slug, 0, 50);
      setFollowing(users); setFollowingTotal(total);
    } else {
      const users = await getSuggestedUsers(12);
      setSuggestions(users);
    }
    setLoadedTabs(prev => new Set(prev).add(t));
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    if (!open) return;
    if (loadedTabs.has(tab)) return;
    load(tab);
  }, [open, tab, load, loadedTabs]);

  useEffect(() => {
    if (!open) { setLoadedTabs(new Set()); setQuery(""); }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => { document.removeEventListener("keydown", handleEsc); document.body.style.overflow = ""; };
  }, [open, onClose]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [tab]);

  const list = tab === "followers" ? followers : tab === "following" ? following : suggestions;
  const filtered = query.trim()
    ? list.filter(u =>
        u.fullName.toLowerCase().includes(query.toLowerCase()) ||
        u.profileSlug.toLowerCase().includes(query.toLowerCase()) ||
        (u.city ?? "").toLowerCase().includes(query.toLowerCase()))
    : list;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="follow-modal-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="follow-modal-panel"
            onClick={e => e.stopPropagation()}
            role="dialog" aria-modal="true"
          >
            <header className="follow-modal-header">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white/40" />
                <h2 className="follow-modal-title">Connections</h2>
              </div>
              <button onClick={onClose} className="follow-modal-close" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </header>

            <div className="follow-modal-tabs" role="tablist">
              {([
                { id: "followers", label: "Followers", count: followersTotal },
                { id: "following", label: "Following", count: followingTotal },
                { id: "suggestions", label: "Discover", icon: Sparkles },
              ] as const).map(t => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id as Tab)}
                  className={`follow-modal-tab ${tab === t.id ? "follow-modal-tab--active" : ""}`}
                >
                  {("icon" in t && t.icon) ? <t.icon className="w-3 h-3" /> : null}
                  <span>{t.label}</span>
                  {"count" in t && typeof t.count === "number" && (
                    <span className="follow-modal-tab-count">{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="follow-modal-search">
              <Search className="w-3.5 h-3.5" />
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder={`Search ${tab === "suggestions" ? "people" : tab}...`}
              />
            </div>

            <div ref={scrollRef} className="follow-modal-scroll">
              {loading && list.length === 0 ? (
                <div className="follow-modal-empty">
                  <Loader2 className="w-5 h-5 animate-spin text-white/30" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="follow-modal-empty">
                  <div className="follow-modal-empty-ico"><Users className="w-5 h-5" /></div>
                  <div className="follow-modal-empty-title">
                    {query ? "No matches" : tab === "followers" ? "No followers yet" : tab === "following" ? "Not following anyone" : "No suggestions"}
                  </div>
                  <div className="follow-modal-empty-sub">
                    {tab === "followers" && !query && "Share your profile to grow your audience"}
                    {tab === "following" && !query && "Discover people in the Discover tab"}
                  </div>
                </div>
              ) : (
                <div className="follow-modal-list">
                  {filtered.map(u => <FollowRow key={u.id} user={u} />)}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
