import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import SiteFooter from "@/components/SiteFooter";
import UserProfileCard from "@/components/UserProfileCard";
import {
  User, Users, Trophy, Clock, ArrowRight, LogOut, Mail, Phone,
  MapPin, Calendar, Sparkles, Gift, Shield, Eye, EyeOff, Flame, Target,
  Palette, Check, Share2, Globe, Lock, BadgeCheck, Crown, Copy, ExternalLink,
  Edit3, Save, X, Award, CreditCard, Settings, LayoutDashboard, Zap,
  ChevronRight, Star, Bell, Key, Trash2, History, Rocket, Medal, TrendingDown,
  CalendarDays, Infinity as InfinityIcon, Receipt, Diamond
} from "lucide-react";
import {
  getCurrentUser, getUserEntries, loginUser, registerUser,
  logoutUser, isUserLoggedIn, getStoredReferralCode, trackReferralConversion,
  updateProfile, getUserBadges, purchaseMembership, uploadScreenshot,
  getNotifications, markNotificationRead, markAllNotificationsRead,
  getNotificationPreferences, updateNotificationPreferences,
  subscribePush, unsubscribePush, getVapidPublicKey,
  getPartners, getReferralStats, getReferralProfile
} from "@/lib/api";
import AnimatedCounter from "@/components/AnimatedCounter";
import { Sparkline, MiniBarChart, UsageGauge, ActivityHeatmap } from "@/components/MiniCharts";
import { useTheme, THEMES, type ThemeId } from "@/contexts/ThemeContext";
import { TrendingUp, BarChart3, Activity } from "lucide-react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const tabFade = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

type AuthMode = "login" | "register";
type TabId = "overview" | "profile" | "subscription" | "entries" | "referrals" | "billing" | "settings";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: User },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "entries", label: "Entries", icon: Trophy },
  { id: "referrals", label: "Referrals", icon: Share2 },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "settings", label: "Settings", icon: Settings },
];

type TierKey = "free" | "silver" | "gold" | "black";
const TIER_LIMITS: Record<TierKey, { perContest: number; perMonth: number }> = {
  free:   { perContest: 1,  perMonth: 29  },
  silver: { perContest: 3,  perMonth: 69  },
  gold:   { perContest: 7,  perMonth: 149 },
  black:  { perContest: 15, perMonth: 299 },
};

function getTierLimits(tier?: string) {
  return TIER_LIMITS[(tier as TierKey) || "free"] || TIER_LIMITS.free;
}

function getMonthlyEntryCount(entries: any[]): number {
  const now = new Date();
  return entries.reduce((sum, e) => {
    const d = new Date(e.submittedAt);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      return sum + (e.entryCount || 1);
    }
    return sum;
  }, 0);
}

const ACHIEVEMENTS: { id: string; label: string; threshold: number; icon: any }[] = [
  { id: "first",       label: "First Entry",       threshold: 1,   icon: Sparkles },
  { id: "ten",         label: "10 Entries",        threshold: 10,  icon: Star },
  { id: "twenty-five", label: "25 Entries",        threshold: 25,  icon: Medal },
  { id: "fifty",       label: "Half Century",      threshold: 50,  icon: Trophy },
  { id: "hundred",     label: "Century Club",      threshold: 100, icon: Award },
  { id: "legend",      label: "X247 Legend",       threshold: 250, icon: Crown },
];

function getLevelInfo(totalEntries: number) {
  const levels = [0, 5, 15, 30, 60, 110, 175, 260, 380, 540];
  let level = 0;
  for (let i = 0; i < levels.length; i++) {
    if (totalEntries >= levels[i]) level = i + 1;
  }
  const currentBase = levels[level - 1] ?? 0;
  const nextThreshold = levels[level] ?? currentBase + 200;
  const progress = nextThreshold > currentBase ? (totalEntries - currentBase) / (nextThreshold - currentBase) : 1;
  return { level: Math.max(1, level), currentBase, nextThreshold, progress: Math.min(1, Math.max(0, progress)), needed: Math.max(0, nextThreshold - totalEntries) };
}

function OurPartnersSection() {
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    getPartners().then((data) => {
      setPartners(data.filter((p: any) => p.isActive).slice(0, 6));
    }).catch(() => {});
  }, []);

  if (partners.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8 max-w-xl mx-auto"
    >
      <div className="metallic-partners-box">
        <div className="metallic-partners-glow" />
        <div className="metallic-partners-shine" />
        <div className="relative z-[2]">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="glass-pill-badge">
              <Sparkles className="w-3 h-3 text-white/50 mr-2" />
              Our Partners
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {partners.map((partner) => (
              <Link
                key={partner.id}
                href="/partners"
                className="metallic-partner-chip group"
              >
                <div className="metallic-partner-chip-inner">
                  <span className="text-xs font-display font-light text-white/70 group-hover:text-white/90 transition-colors truncate">
                    {partner.name}
                  </span>
                  <ExternalLink className="w-2.5 h-2.5 text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/partners"
            className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/50 font-display uppercase tracking-widest transition-colors"
          >
            View All Partners
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    city: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      const result = await loginUser(form.email, form.password);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Login failed");
      }
    } else {
      if (!form.fullName || !form.email || !form.password) {
        setError("Name, email, and password are required");
        setLoading(false);
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      const result = await registerUser({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        city: form.city || undefined,
      });
      if (result.success) {
        const refCode = getStoredReferralCode();
        if (refCode && result.user?.id) {
          trackReferralConversion(refCode, result.user.id, "signup").catch(() => {});
        }
        onSuccess();
      } else {
        setError(result.error || "Registration failed");
      }
    }
    setLoading(false);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
      <div className="glass-card p-6 sm:p-10 max-w-xl mx-auto">
        <div className="card-shine" />
        <div className="relative z-[2]">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <User className="w-6 h-6 text-white/40" />
            </div>
          </div>

          <div className="flex gap-1 mb-6 p-1 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-display font-light transition-all ${mode === "login" ? "bg-white/[0.06] text-white border border-white/[0.08]" : "text-white/40"}`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-display font-light transition-all ${mode === "register" ? "bg-white/[0.06] text-white border border-white/[0.08]" : "text-white/40"}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <input
                type="text"
                placeholder="Full Name *"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-white/20 font-light focus:outline-none focus:border-white/[0.12]"
              />
            )}
            <input
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-white/20 font-light focus:outline-none focus:border-white/[0.12]"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password *"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-white/20 font-light focus:outline-none focus:border-white/[0.12] pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/40">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === "register" && (
              <>
                <input
                  type="tel"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-white/20 font-light focus:outline-none focus:border-white/[0.12]"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-white/20 font-light focus:outline-none focus:border-white/[0.12]"
                />
              </>
            )}

            {error && (
              <p className="text-xs text-red-400/60 font-light">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white font-light hover:bg-white/[0.08] transition-all disabled:opacity-30"
            >
              {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

function getLocalDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeStreak(dates: string[]): number {
  let streak = 0;
  const sorted = [...new Set(dates)].sort().reverse();
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    const expectedStr = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, "0")}-${String(expected.getDate()).padStart(2, "0")}`;
    if (sorted[i] === expectedStr) {
      streak++;
    } else break;
  }
  return streak;
}

function useStreak(): { streak: number; isNew: boolean } {
  const [streak, setStreak] = useState(0);
  const [isNew, setIsNew] = useState(false);
  useEffect(() => {
    const key = "x247_visit_dates";
    const today = getLocalDate();
    const stored = JSON.parse(localStorage.getItem(key) || "[]") as string[];
    const wasNew = !stored.includes(today);
    if (wasNew) {
      stored.push(today);
      localStorage.setItem(key, JSON.stringify(stored.slice(-30)));
    }
    const computed = computeStreak(stored);
    setStreak(computed);
    if (wasNew && computed > 1) setIsNew(true);
  }, []);
  return { streak, isNew };
}

type NotifIconKind = "trophy" | "gift" | "star" | "bell" | "sparkles";

type NotificationItem = {
  id: number;
  icon: NotifIconKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

function useNotifications(): {
  items: NotificationItem[];
  unread: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  latestToast: NotificationItem | null;
  dismissToast: () => void;
} {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [latestToast, setLatestToast] = useState<NotificationItem | null>(null);
  const prevCountRef = useRef(0);

  const fetchNotifs = useCallback(async () => {
    const raw = await getNotifications();
    const mapped: NotificationItem[] = raw.map((n: any) => ({
      id: n.id,
      icon: (n.icon || "bell") as NotifIconKind,
      title: n.title,
      body: n.body,
      time: n.createdAt,
      read: n.read,
    }));
    setItems(mapped);

    const unreadCount = mapped.filter(n => !n.read).length;
    if (prevCountRef.current > 0 && unreadCount > prevCountRef.current) {
      const newest = mapped.find(n => !n.read);
      if (newest) setLatestToast(newest);
    }
    prevCountRef.current = unreadCount;
  }, []);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  const markRead = (id: string) => {
    const numId = Number(id);
    markNotificationRead(numId);
    setItems(prev => prev.map(n => n.id === numId ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    markAllNotificationsRead();
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissToast = () => setLatestToast(null);

  return { items, unread: items.filter(n => !n.read).length, markRead, markAllRead, latestToast, dismissToast };
}

function NotificationIcon({ type }: { type: NotifIconKind }) {
  if (type === "trophy") return <Trophy className="w-4 h-4 text-white/40" />;
  if (type === "star") return <Star className="w-4 h-4 text-white/40" />;
  if (type === "gift") return <Gift className="w-4 h-4 text-white/40" />;
  return <Bell className="w-4 h-4 text-white/40" />;
}

function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onClose, containerRef }: {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && containerRef.current.contains(target)) return;
      if (panelRef.current && !panelRef.current.contains(target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, containerRef]);

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="notif-panel"
    >
      <div className="notif-header">
        <span className="text-xs font-display font-medium text-white/70">Notifications</span>
        {notifications.some(n => !n.read) && (
          <button onClick={onMarkAllRead} className="text-[10px] text-white/30 hover:text-white/50 transition-colors font-light">
            Mark all read
          </button>
        )}
      </div>
      <div className="notif-list">
        {notifications.map(n => (
          <button
            key={n.id}
            onClick={() => { if (!n.read) onMarkRead(String(n.id)); }}
            className={`notif-item ${!n.read ? "notif-item-unread" : ""}`}
          >
            <div className="notif-item-icon">
              <NotificationIcon type={n.icon} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[11px] font-display font-medium text-white/70">{n.title}</div>
              <div className="text-[10px] text-white/30 font-light leading-snug mt-0.5 line-clamp-2">{n.body}</div>
            </div>
            <div className="text-[9px] text-white/20 font-light shrink-0">{formatTime(n.time)}</div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function StreakCelebration({ streak, onDone }: { streak: number; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="streak-celebration"
    >
      <div className="streak-particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="streak-particle"
            style={{
              "--angle": `${i * 30}deg`,
              "--delay": `${i * 0.05}s`,
              "--dist": `${30 + Math.random() * 20}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        className="streak-badge"
      >
        <Flame className="w-5 h-5 text-white/80" />
        <span className="text-lg font-display font-bold text-white">{streak}</span>
        <span className="text-[9px] text-white/50 font-display uppercase tracking-wider">Day Streak</span>
      </motion.div>
    </motion.div>
  );
}

function ToastNotifications({ toast, onDismiss }: { toast: NotificationItem | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
            className="toast-item"
          >
            <div className="toast-icon">
              {toast.icon === "trophy" && <Trophy className="w-4 h-4 text-white/50" />}
              {toast.icon === "gift" && <Gift className="w-4 h-4 text-white/50" />}
              {toast.icon === "star" && <Star className="w-4 h-4 text-white/50" />}
              {toast.icon !== "trophy" && toast.icon !== "gift" && toast.icon !== "star" && <Sparkles className="w-4 h-4 text-white/50" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-display font-medium text-white/80">{toast.title}</div>
              <div className="text-[10px] text-white/30 font-light mt-0.5">{toast.body}</div>
            </div>
            <button onClick={onDismiss} className="text-white/20 hover:text-white/40 transition-colors shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildEntryHistoryData(entries: any[]) {
  const dateCounts: Record<string, number> = {};
  const activityDates: string[] = [];

  entries.forEach((e: any) => {
    const ds = toDateStr(new Date(e.submittedAt));
    dateCounts[ds] = (dateCounts[ds] || 0) + 1;
    activityDates.push(ds);
  });

  const last7: { label: string; value: number }[] = [];
  const sparkData: number[] = [];
  let thisWeekTotal = 0;
  let lastWeekTotal = 0;

  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = toDateStr(d);
    const count = dateCounts[ds] || 0;

    if (i <= 6) {
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
      last7.push({ label: dayLabel, value: count });
      sparkData.push(count);
      thisWeekTotal += count;
    } else {
      lastWeekTotal += count;
    }
  }

  return { last7, sparkData, activityDates, thisWeekTotal, lastWeekTotal };
}

function OverviewTab({ user, entries, streak, onChangeTab }: { user: any; entries: any[]; streak: number; onChangeTab?: (id: TabId) => void }) {
  const tier = (user.membershipTier as TierKey) || "free";
  const tierLabel = tier === "free" ? "Free" : tier.charAt(0).toUpperCase() + tier.slice(1);
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const totalPartners = entries.reduce((s: number, e: any) => s + (e.partnersCompleted || 0), 0);
  const limits = getTierLimits(tier);
  const entryLimitNum = limits.perContest;
  const entryLimit = String(entryLimitNum);
  const monthlyCap = limits.perMonth;
  const monthlyUsed = React.useMemo(() => getMonthlyEntryCount(entries), [entries]);
  const monthlyPct = Math.min(1, monthlyUsed / Math.max(1, monthlyCap));
  const totalEntries = entries.length;
  const levelInfo = React.useMemo(() => getLevelInfo(totalEntries), [totalEntries]);

  const { last7, sparkData, activityDates, thisWeekTotal, lastWeekTotal } = React.useMemo(
    () => buildEntryHistoryData(entries), [entries]
  );
  const weekTrend = thisWeekTotal > lastWeekTotal ? "up" : thisWeekTotal < lastWeekTotal ? "down" : "flat";

  return (
    <motion.div key="overview" variants={tabFade} initial="hidden" animate="visible" exit="exit">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
        {[
          { icon: Flame, label: "Day Streak", value: streak, sub: streak > 0 ? "Active" : "Start today", spark: sparkData },
          { icon: Trophy, label: "Total Entries", value: entries.length, sub: `${entryLimit}/contest`, spark: sparkData },
          { icon: Target, label: "Partners Done", value: totalPartners, sub: "Completed" },
          { icon: Star, label: "Current Tier", value: tierLabel, isText: true, sub: user.membershipTier === "free" ? "Upgrade available" : "Active" },
        ].map((stat) => (
          <div key={stat.label} className="acct-stat-card relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-5 h-5 text-white/25" />
              <span className="text-[9px] text-white/25 uppercase tracking-widest font-display">{stat.sub}</span>
            </div>
            {stat.isText ? (
              <span className="text-2xl sm:text-3xl font-display font-light text-white block">{stat.value}</span>
            ) : (
              <AnimatedCounter value={stat.value as number} className="text-2xl sm:text-3xl font-display font-light text-white block" />
            )}
            <div className="text-[11px] text-white/35 font-light mt-2">{stat.label}</div>
            {"spark" in stat && stat.spark && stat.spark.length >= 2 && (
              <div className="absolute bottom-0 right-0 opacity-50 pointer-events-none">
                <Sparkline data={stat.spark} width={70} height={28} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
        <div className="dash-chart-card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-white/30" />
              <h3 className="text-xs font-display font-medium text-white/50 uppercase tracking-wider">Entry History</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className={`w-3.5 h-3.5 ${weekTrend === "up" ? "text-emerald-400/40" : weekTrend === "down" ? "text-red-400/40 rotate-180" : "text-white/20"}`} />
              <span className="text-[10px] text-white/30 font-light">{thisWeekTotal} this week</span>
            </div>
          </div>
          <div className="flex justify-center">
            <MiniBarChart data={last7} width={260} height={80} />
          </div>
        </div>

        <div className="dash-chart-card">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-white/30" />
            <h3 className="text-xs font-display font-medium text-white/50 uppercase tracking-wider">Activity Map</h3>
          </div>
          <div className="flex justify-center overflow-x-auto">
            <ActivityHeatmap dates={activityDates} weeks={8} />
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-3">
            <span className="text-[9px] text-white/20 font-light">Less</span>
            {[0.03, 0.1, 0.2, 0.35].map((op, i) => (
              <div key={i} className="w-[9px] h-[9px] rounded-[2px] acct-grid-dot" style={{ opacity: op }} />
            ))}
            <span className="text-[9px] text-white/20 font-light">More</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        <Link href="/giveaway" className="dash-quick-action group">
          <div className="dash-qa-icon"><Sparkles className="w-4 h-4" /></div>
          <div>
            <div className="text-sm font-display font-light text-white/70 group-hover:text-white transition-colors">Enter Giveaway</div>
            <div className="text-[10px] text-white/30 font-light">Browse active contests</div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/15 ml-auto group-hover:text-white/30 transition-colors" />
        </Link>
        <Link href="/partners" className="dash-quick-action group">
          <div className="dash-qa-icon"><Users className="w-4 h-4" /></div>
          <div>
            <div className="text-sm font-display font-light text-white/70 group-hover:text-white transition-colors">Visit Partners</div>
            <div className="text-[10px] text-white/30 font-light">Earn more entries</div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/15 ml-auto group-hover:text-white/30 transition-colors" />
        </Link>
        <Link href="/winners" className="dash-quick-action group">
          <div className="dash-qa-icon"><Award className="w-4 h-4" /></div>
          <div>
            <div className="text-sm font-display font-light text-white/70 group-hover:text-white transition-colors">View Winners</div>
            <div className="text-[10px] text-white/30 font-light">Hall of fame</div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/15 ml-auto group-hover:text-white/30 transition-colors" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="dash-chart-card">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-white/30" />
            <h3 className="text-xs font-display font-medium text-white/50 uppercase tracking-wider">Recent Activity</h3>
          </div>
          {entries.length > 0 ? (
            <div className="dash-activity">
              {entries.slice(0, 4).map((entry: any, i: number) => (
                <div key={entry.id} className="dash-activity-item">
                  <div className="dash-activity-dot" />
                  {i < Math.min(entries.length - 1, 3) && <div className="dash-activity-line" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-light text-white/60 truncate">Entered {entry.contestName}</div>
                    <div className="text-[10px] text-white/25 font-light">{entry.entryCount} entries · {new Date(entry.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                  </div>
                  <div className="acct-entry-status">
                    <Clock className="w-3 h-3" />
                    <span>Pending</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Gift className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-xs text-white/30 font-light">No activity yet</p>
            </div>
          )}
        </div>

        <div className="dash-chart-card">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-white/30" />
            <h3 className="text-xs font-display font-medium text-white/50 uppercase tracking-wider">Membership</h3>
          </div>
          <div className={`p-5 rounded-xl border ${user.membershipTier === "black" ? "bg-white/[0.04] border-white/[0.1]" : "bg-white/[0.02] border-white/[0.05]"}`}>
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-5 h-5 text-white/30" />
              <div>
                <div className="text-sm font-display font-light text-white capitalize">{tierLabel}</div>
                <div className="text-[9px] text-white/25 font-light">
                  {user.membershipTier === "free" ? "Free plan" : "Active subscription"}
                </div>
              </div>
              {user.isVerified && <BadgeCheck className="w-4 h-4 text-white/40 ml-auto" />}
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[8px] text-white/20 uppercase tracking-wider font-display">Per Contest</div>
                <div className="text-[9px] text-white/35 font-light">{Math.min(entries.length, entryLimitNum)}/{entryLimit}</div>
              </div>
              <UsageGauge used={entries.length} limit={entryLimitNum} />
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[8px] text-white/20 uppercase tracking-wider font-display flex items-center gap-1">
                  <CalendarDays className="w-2.5 h-2.5" /> Monthly Cap
                </div>
                <div className="text-[9px] text-white/35 font-light">{monthlyUsed}/{monthlyCap} · {Math.round(monthlyPct * 100)}%</div>
              </div>
              <UsageGauge used={monthlyUsed} limit={monthlyCap} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                <div className="text-[8px] text-white/20 uppercase tracking-wider font-display">Entries</div>
                <div className="text-xs text-white/50 font-light mt-0.5">{entryLimit}/contest</div>
              </div>
              <div className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                <div className="text-[8px] text-white/20 uppercase tracking-wider font-display">Voice Chat</div>
                <div className="text-xs text-white/50 font-light mt-0.5">{tier === "silver" || tier === "free" ? "Off" : "On"}</div>
              </div>
            </div>
            {tier !== "black" && (
              <button
                type="button"
                onClick={() => onChangeTab?.("subscription")}
                className="w-full mt-3 flex items-center justify-between p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.13] hover:bg-white/[0.04] transition-all group"
              >
                <span className="text-[10px] text-white/50 font-light">Upgrade for more entries</span>
                <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── level progress ─── */}
      <div className="dash-chart-card mt-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-white/30" />
            <h3 className="text-xs font-display font-medium text-white/50 uppercase tracking-wider">Level {levelInfo.level}</h3>
          </div>
          <div className="text-[10px] text-white/30 font-light">
            {levelInfo.needed > 0 ? `${levelInfo.needed} entries to Level ${levelInfo.level + 1}` : "Max level"}
          </div>
        </div>
        <div className="relative h-2 rounded-full bg-white/[0.04] border border-white/[0.05] overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelInfo.progress * 100}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/30 to-white/60 rounded-full"
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-white/25 font-light">
          <span>{totalEntries} total entries</span>
          <span>{levelInfo.nextThreshold} for next level</span>
        </div>
      </div>

      {/* ─── achievements ─── */}
      <div className="dash-chart-card mt-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Medal className="w-4 h-4 text-white/30" />
            <h3 className="text-xs font-display font-medium text-white/50 uppercase tracking-wider">Achievements</h3>
          </div>
          <span className="text-[10px] text-white/25 font-light">
            {ACHIEVEMENTS.filter(a => totalEntries >= a.threshold).length}/{ACHIEVEMENTS.length} unlocked
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = totalEntries >= a.threshold;
            const Icon = a.icon;
            return (
              <div
                key={a.id}
                className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                  unlocked
                    ? "bg-white/[0.05] border-white/[0.12] hover:bg-white/[0.07]"
                    : "bg-white/[0.01] border-white/[0.04] opacity-50"
                }`}
                title={unlocked ? `Unlocked at ${a.threshold} entries` : `Reach ${a.threshold} entries to unlock`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 border ${
                  unlocked ? "bg-white/[0.08] border-white/[0.15]" : "bg-white/[0.02] border-white/[0.05]"
                }`}>
                  {unlocked ? <Icon className="w-4 h-4 text-white/70" /> : <Lock className="w-3 h-3 text-white/20" />}
                </div>
                <div className={`text-[10px] font-display font-light leading-tight ${unlocked ? "text-white/70" : "text-white/25"}`}>
                  {a.label}
                </div>
                <div className="text-[8px] text-white/25 font-light mt-0.5">{a.threshold}</div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function ProfileTab({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [profileSlug, setProfileSlug] = useState(user.profileSlug || "");
  const [isPublic, setIsPublic] = useState(user.isPublic || false);
  const [badges, setBadges] = useState<{ available: any[]; earned: string[] }>({ available: [], earned: [] });
  const [badgeSaving, setBadgeSaving] = useState(false);

  useEffect(() => {
    getUserBadges().then(setBadges);
  }, []);

  const profileUrl = profileSlug
    ? `${window.location.origin}${import.meta.env.BASE_URL}profile/${profileSlug}`
    : "";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return; }
    setUploading(true);
    setError("");
    try {
      const objectPath = await uploadScreenshot(file);
      const cleanPath = objectPath.startsWith("/objects/") ? objectPath.slice("/objects/".length) : objectPath.replace(/^\//, "");
      const url = `/api/storage/objects/${cleanPath}`;
      setAvatarUrl(url);
      await updateProfile({ avatarUrl: url });
      onUpdate({ ...user, avatarUrl: url });
    } catch (err: any) {
      setError(err.message || "Upload failed");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const result = await updateProfile({ bio, profileSlug, isPublic });
    if (result.success) {
      onUpdate({ ...user, bio, profileSlug: result.data.profileSlug, isPublic, avatarUrl });
      setProfileSlug(result.data.profileSlug);
      setEditing(false);
    } else {
      setError(result.error || "Failed to save");
    }
    setSaving(false);
  };

  const handleCopyLink = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (profileUrl && navigator.share) {
      navigator.share({ title: `${user.fullName} on X247`, url: profileUrl }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleSelectBadge = async (badgeId: string | null) => {
    setBadgeSaving(true);
    const result = await updateProfile({ selectedBadge: badgeId });
    if (result.success) {
      onUpdate({ ...user, selectedBadge: badgeId });
    }
    setBadgeSaving(false);
  };

  return (
    <motion.div key="profile" variants={tabFade} initial="hidden" animate="visible" exit="exit">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-2 flex justify-center lg:justify-start">
          <UserProfileCard
            fullName={user.fullName}
            bio={bio || undefined}
            avatarUrl={avatarUrl || undefined}
            isVerified={user.isVerified}
            selectedBadge={user.selectedBadge}
            stats={{ entries: 0, contestsJoined: 0 }}
            membershipTier={user.membershipTier}
            compact={false}
            onShare={profileSlug && isPublic ? handleShare : undefined}
          />
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-display font-light text-white">Profile Details</h3>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[10px] text-white/40 font-light hover:bg-white/[0.06] transition-all"
            >
              {editing ? <X className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="acct-label">Avatar</label>
                <label className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl cursor-pointer hover:bg-white/[0.04] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center overflow-hidden shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-white/30" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white/50 font-light">{uploading ? "Uploading..." : "Change avatar"}</div>
                    <div className="text-[9px] text-white/25 font-light">Max 5MB, JPG/PNG</div>
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
                </label>
              </div>

              <div>
                <label className="acct-label">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 200))}
                  placeholder="Tell people about yourself..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-white/20 font-light focus:outline-none focus:border-white/[0.12] resize-none"
                />
                <div className="text-right text-[9px] text-white/20 mt-0.5">{bio.length}/200</div>
              </div>

              <div>
                <label className="acct-label">Profile Link</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/25 font-light shrink-0">/profile/</span>
                  <input
                    type="text"
                    value={profileSlug}
                    onChange={(e) => setProfileSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30))}
                    placeholder="your-name"
                    className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white placeholder-white/20 font-light focus:outline-none focus:border-white/[0.12]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <div className="flex items-center gap-2">
                  {isPublic ? <Globe className="w-4 h-4 text-white/40" /> : <Lock className="w-4 h-4 text-white/25" />}
                  <span className="text-xs text-white/50 font-light">{isPublic ? "Profile is public" : "Profile is private"}</span>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative w-10 h-5 rounded-full transition-all ${isPublic ? "bg-white/20" : "bg-white/[0.06]"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isPublic ? "left-5.5 bg-white" : "left-0.5 bg-white/40"}`} />
                </button>
              </div>

              {error && <p className="text-xs text-red-400/60 font-light">{error}</p>}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white font-light hover:bg-white/[0.08] transition-all disabled:opacity-30"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="acct-info-row">
                <Mail className="w-4 h-4 text-white/25" />
                <div>
                  <div className="text-[9px] text-white/25 uppercase tracking-wider font-display">Email</div>
                  <div className="text-sm text-white/60 font-light">{user.email}</div>
                </div>
              </div>
              {user.phone && (
                <div className="acct-info-row">
                  <Phone className="w-4 h-4 text-white/25" />
                  <div>
                    <div className="text-[9px] text-white/25 uppercase tracking-wider font-display">Phone</div>
                    <div className="text-sm text-white/60 font-light">{user.phone}</div>
                  </div>
                </div>
              )}
              {user.city && (
                <div className="acct-info-row">
                  <MapPin className="w-4 h-4 text-white/25" />
                  <div>
                    <div className="text-[9px] text-white/25 uppercase tracking-wider font-display">City</div>
                    <div className="text-sm text-white/60 font-light">{user.city}</div>
                  </div>
                </div>
              )}
              {profileSlug && isPublic && (
                <div className="acct-info-row">
                  <Globe className="w-4 h-4 text-white/25" />
                  <div className="flex-1">
                    <div className="text-[9px] text-white/25 uppercase tracking-wider font-display">Public Profile</div>
                    <div className="text-sm text-white/60 font-light font-mono">/profile/{profileSlug}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={handleCopyLink} className="p-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg hover:bg-white/[0.06] transition-all">
                      {copied ? <Check className="w-3 h-3 text-white/60" /> : <Copy className="w-3 h-3 text-white/30" />}
                    </button>
                    <Link href={`/profile/${profileSlug}`} className="p-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg hover:bg-white/[0.06] transition-all">
                      <ExternalLink className="w-3 h-3 text-white/30" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-4 h-4 text-white/40" />
          <h3 className="text-base font-display font-light text-white">Badges</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.available.map((badge) => {
            const earned = badges.earned.includes(badge.id);
            const isSelected = user.selectedBadge === badge.id;
            return (
              <button
                key={badge.id}
                onClick={() => earned ? handleSelectBadge(isSelected ? null : badge.id) : undefined}
                disabled={!earned || badgeSaving}
                className={`relative rounded-2xl p-3 text-center transition-all duration-300 border ${
                  isSelected
                    ? "border-white/20 bg-white/[0.06]"
                    : earned
                    ? "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.05] cursor-pointer"
                    : "border-white/[0.04] bg-white/[0.01] opacity-40 cursor-not-allowed"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white/80" />
                  </div>
                )}
                <div className="text-2xl mb-1.5">{badge.icon}</div>
                <div className="text-[10px] font-display font-medium text-white/70 mb-0.5">{badge.name}</div>
                <div className="text-[8px] text-white/30 font-light leading-tight">{badge.description}</div>
                {!earned && <div className="text-[8px] text-white/20 mt-1 font-display uppercase tracking-wider">Locked</div>}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function SubscriptionTab({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      tagline: "Start exploring giveaways",
      features: [
        `${TIER_LIMITS.free.perContest} entry per contest`,
        `${TIER_LIMITS.free.perMonth} total entries / month`,
        "Text AI chat",
        "Browse all partners",
        "Standard contest access",
      ],
    },
    {
      id: "silver",
      name: "Silver",
      price: 199,
      tagline: "For casual participants",
      features: [
        `${TIER_LIMITS.silver.perContest} entries per contest`,
        `${TIER_LIMITS.silver.perMonth} total entries / month`,
        "Unlimited text chat",
        "Priority support",
        "Early access to new partners",
        "Partner insights",
      ],
    },
    {
      id: "gold",
      name: "Gold",
      price: 499,
      tagline: "For dedicated members",
      popular: true,
      features: [
        `${TIER_LIMITS.gold.perContest} entries per contest`,
        `${TIER_LIMITS.gold.perMonth} total entries / month`,
        "Premium AI voice chat",
        "Verified badge",
        "Exclusive partner deals",
        "Priority everything",
        "VIP support",
      ],
    },
    {
      id: "black",
      name: "Black",
      price: 999,
      tagline: "The ultimate luxury tier",
      features: [
        `${TIER_LIMITS.black.perContest} entries per contest`,
        `${TIER_LIMITS.black.perMonth} total entries / month`,
        "Unlimited premium AI voice chat",
        "Verified + Elite Black badge",
        "Early winner announcements (24h before public)",
        "Private dedicated concierge",
        "Exclusive Black-only members events",
        "Lifetime priority queue across all draws",
        "Personal account manager",
        "Annual luxury surprise gift",
        "Birthday bonus entries (3x for a week)",
        "Free physical Black VIP card by post",
        "Custom profile theme on public profile",
        "First-look access to new partners",
      ],
    },
  ];

  const handlePurchase = async (planId: string) => {
    setPurchasing(planId);
    const result = await purchaseMembership(planId);
    if (result.success) {
      onUpdate({
        ...user,
        membershipTier: planId,
        isVerified: result.data.isVerified,
      });
    }
    setPurchasing(null);
  };

  const activeTier = user.membershipTier || "free";
  const tierOrder = ["free", "silver", "gold", "black"];
  const activeIndex = tierOrder.indexOf(activeTier);

  const currentPlan = plans.find((p) => p.id === activeTier) ?? plans[0];
  const isBlackTier = activeTier === "black";

  return (
    <motion.div key="subscription" variants={tabFade} initial="hidden" animate="visible" exit="exit">
      <div className={`glass-card p-6 mb-6 ${isBlackTier ? "acct-black-card-elite" : ""}`}>
        {isBlackTier && <div className="acct-black-shimmer" />}
        <div className="card-shine" />
        <div className="relative z-[2]">
          <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${isBlackTier ? "acct-black-icon" : "bg-white/[0.04] border-white/[0.08]"}`}>
                {isBlackTier ? <Diamond className="w-5 h-5 text-white" /> : <Crown className="w-6 h-6 text-white/50" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-display font-light text-white capitalize">{activeTier} Membership</h3>
                  {user.isVerified && <BadgeCheck className="w-4 h-4 text-white/50" />}
                  {isBlackTier && (
                    <span className="acct-black-badge">
                      <Diamond className="w-2.5 h-2.5" />
                      <span>Elite Member</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/30 font-light">{activeTier === "free" ? "No commitment · Upgrade anytime" : "Active · Renews monthly"}</div>
              </div>
            </div>
            {activeTier !== "black" && (
              <button
                type="button"
                onClick={() => handlePurchase(activeTier === "free" ? "silver" : tierOrder[Math.min(tierOrder.length - 1, activeIndex + 1)])}
                disabled={purchasing !== null}
                className="acct-upgrade-pill"
              >
                <Rocket className="w-3 h-3" />
                <span>Upgrade Plan</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                <div className="text-[9px] text-white/25 uppercase tracking-wider font-display mb-1">Status</div>
                <div className="text-xs text-white/60 font-light">Active</div>
              </div>
              <div className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                <div className="text-[9px] text-white/25 uppercase tracking-wider font-display mb-1">Per Contest</div>
                <div className="text-xs text-white/60 font-light">{getTierLimits(activeTier).perContest}</div>
              </div>
              <div className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                <div className="text-[9px] text-white/25 uppercase tracking-wider font-display mb-1">Per Month</div>
                <div className="text-xs text-white/60 font-light">{getTierLimits(activeTier).perMonth}</div>
              </div>
              <div className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                <div className="text-[9px] text-white/25 uppercase tracking-wider font-display mb-1">Voice Chat</div>
                <div className="text-xs text-white/60 font-light">{activeTier === "silver" ? "Not included" : "Enabled"}</div>
              </div>
            </div>
          </div>
        </div>

      <div className={`glass-card p-5 mb-6 ${isBlackTier ? "acct-black-card-elite" : ""}`}>
        <div className="card-shine" />
        <div className="relative z-[2]">
          <div className="flex items-center gap-3 mb-4">
            <Check className="w-4 h-4 text-white/40" />
            <h3 className="text-sm font-display font-light text-white">What's included in {currentPlan.name}</h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {currentPlan.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-xs text-white/55 font-light">
                <div className="w-4 h-4 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-white/40" />
                </div>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="acct-pricing-cta-banner">
        <div className="acct-pricing-cta-left">
          <div className="acct-pricing-cta-icon"><Crown className="w-4 h-4" /></div>
          <div>
            <div className="text-sm font-display text-white font-light">Compare All Plans</div>
            <div className="text-[10px] text-white/35 font-light mt-0.5">Explore full features, perks and pricing for every tier</div>
          </div>
        </div>
        <Link href="/pricing" className="acct-pricing-cta-btn">
          <span>View Pricing</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

function ReferralsTab({ user }: { user: any }) {
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getReferralStats().then(setStats).catch(() => {});
    getReferralProfile().then((d) => setProfile(d.partner)).catch(() => {});
  }, []);

  const refCode = profile?.referralCode || `X247-${user.id}`;
  const refLink = `${window.location.origin}/?ref=${refCode}`;

  const copy = () => {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <motion.div key="referrals" variants={tabFade} initial="hidden" animate="visible" exit="exit">
      <div className="flex items-center gap-3 mb-5">
        <Share2 className="w-4 h-4 text-white/40" />
        <h3 className="text-base font-display font-light text-white">Referrals</h3>
      </div>

      <div className="glass-card p-6 mb-5">
        <div className="card-shine" />
        <div className="relative z-[2]">
          <div className="text-[10px] uppercase tracking-wider font-display text-white/30 mb-2">Your Referral Code</div>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] font-mono text-sm text-white/85 flex-1 min-w-[160px] truncate">{refCode}</code>
            <button onClick={copy} className="acct-copy-btn">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Link"}</span>
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="text-[9px] text-white/25 uppercase tracking-wider font-display mb-1">Total Referrals</div>
              <div className="text-lg font-display font-light text-white">{stats?.totalReferrals ?? 0}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="text-[9px] text-white/25 uppercase tracking-wider font-display mb-1">Conversions</div>
              <div className="text-lg font-display font-light text-white">{stats?.conversions ?? 0}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="text-[9px] text-white/25 uppercase tracking-wider font-display mb-1">Earnings</div>
              <div className="text-lg font-display font-light text-white">₹{stats?.earnings ?? 0}</div>
            </div>
          </div>
          <Link href="/referral-dashboard" className="mt-5 acct-compare-link inline-flex">
            <span>Open Full Referral Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="card-shine" />
        <div className="relative z-[2]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-white/40" />
            <h4 className="text-sm font-display font-light text-white">How it works</h4>
          </div>
          <ol className="space-y-2 text-xs text-white/50 font-light">
            <li className="flex gap-3"><span className="text-white/30 font-mono">01</span><span>Share your unique link with friends and on social.</span></li>
            <li className="flex gap-3"><span className="text-white/30 font-mono">02</span><span>They register and complete partner tasks for entries.</span></li>
            <li className="flex gap-3"><span className="text-white/30 font-mono">03</span><span>You earn bonus entries and rewards for every conversion.</span></li>
          </ol>
        </div>
      </div>
    </motion.div>
  );
}

function BillingTab({ user }: { user: any }) {
  const tier = (user.membershipTier as TierKey) || "free";
  const isFree = tier === "free";
  const tierPrice = tier === "silver" ? 199 : tier === "gold" ? 499 : tier === "black" ? 999 : 0;
  const memberSince = new Date(user.createdAt);
  const nextRenewal = new Date();
  nextRenewal.setDate(nextRenewal.getDate() + 30);

  const invoices = isFree ? [] : [
    { id: `INV-${memberSince.getFullYear()}${String(memberSince.getMonth() + 1).padStart(2, "0")}-001`, date: memberSince, amount: tierPrice, plan: tier },
  ];

  return (
    <motion.div key="billing" variants={tabFade} initial="hidden" animate="visible" exit="exit">
      <div className="flex items-center gap-3 mb-5">
        <Receipt className="w-4 h-4 text-white/40" />
        <h3 className="text-base font-display font-light text-white">Billing</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="glass-card p-4">
          <div className="card-shine" />
          <div className="relative z-[2]">
            <div className="flex items-center gap-2 mb-2"><CreditCard className="w-3.5 h-3.5 text-white/30" /><div className="text-[9px] uppercase tracking-wider font-display text-white/30">Current Plan</div></div>
            <div className="text-sm font-display font-light text-white capitalize">{tier}</div>
            <div className="text-[10px] text-white/35 font-light mt-0.5">{isFree ? "Free forever" : `₹${tierPrice}/mo`}</div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="card-shine" />
          <div className="relative z-[2]">
            <div className="flex items-center gap-2 mb-2"><CalendarDays className="w-3.5 h-3.5 text-white/30" /><div className="text-[9px] uppercase tracking-wider font-display text-white/30">Next Renewal</div></div>
            <div className="text-sm font-display font-light text-white">{isFree ? "—" : nextRenewal.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
            <div className="text-[10px] text-white/35 font-light mt-0.5">{isFree ? "No active subscription" : "Auto-renews"}</div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="card-shine" />
          <div className="relative z-[2]">
            <div className="flex items-center gap-2 mb-2"><Calendar className="w-3.5 h-3.5 text-white/30" /><div className="text-[9px] uppercase tracking-wider font-display text-white/30">Member Since</div></div>
            <div className="text-sm font-display font-light text-white">{memberSince.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</div>
            <div className="text-[10px] text-white/35 font-light mt-0.5">{Math.floor((Date.now() - memberSince.getTime()) / 86400000)} days</div>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="card-shine" />
        <div className="relative z-[2]">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-3.5 h-3.5 text-white/40" />
            <h4 className="text-sm font-display font-light text-white">Invoice History</h4>
            <span className="text-[10px] text-white/25 font-light ml-auto">{invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}</span>
          </div>
          {invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <Receipt className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/65 font-mono truncate">{inv.id}</div>
                    <div className="text-[10px] text-white/30 font-light capitalize">{inv.plan} · {inv.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                  <div className="text-sm text-white/75 font-display font-light shrink-0">₹{inv.amount}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-4 h-4 text-white/20" />
              </div>
              <div className="text-xs text-white/40 font-light">No invoices yet</div>
              <div className="text-[10px] text-white/25 font-light mt-1">Upgrade to a paid plan to see invoices here</div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EntriesTab({ entries }: { entries: any[] }) {
  return (
    <motion.div key="entries" variants={tabFade} initial="hidden" animate="visible" exit="exit">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-4 h-4 text-white/40" />
        <h3 className="text-base font-display font-light text-white">Giveaway Entries</h3>
        <span className="text-[10px] text-white/20 font-light ml-auto">{entries.length} total</span>
      </div>

      {entries.length > 0 ? (
        <div className="space-y-2">
          {entries.map((entry: any) => (
            <div key={entry.id} className="acct-entry-row">
              <Trophy className="w-4 h-4 text-white/25 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-light text-white/60 truncate">{entry.contestName}</div>
                <div className="flex items-center gap-3 text-[10px] text-white/25 font-light mt-0.5">
                  <span className="font-mono">{entry.entryCode}</span>
                  <span className="text-white/10">·</span>
                  <span>{entry.entryCount} {entry.entryCount === 1 ? "entry" : "entries"}</span>
                  <span className="text-white/10">·</span>
                  <span>{entry.partnersCompleted} partners</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="acct-entry-status">
                  <Clock className="w-3 h-3" />
                  <span>Pending</span>
                </div>
                <div className="text-[9px] text-white/20 font-light mt-0.5">
                  {new Date(entry.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-10 sm:p-14 text-center">
          <div className="card-shine" />
          <div className="relative z-[2]">
            <Gift className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h4 className="text-lg font-display font-light text-white/40 mb-2">No Entries Yet</h4>
            <p className="text-sm text-white/25 font-light mb-6">You haven't entered any giveaway contests yet</p>
            <Link href="/giveaway" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white/60 font-light hover:bg-white/[0.08] transition-all">
              <Sparkles className="w-4 h-4" />
              Browse Contests
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SettingsTab({ user, onLogout }: { user: any; onLogout: () => void }) {
  const { theme, setTheme } = useTheme();
  const [contestAlerts, setContestAlerts] = useState(true);
  const [winnerAnnouncements, setWinnerAnnouncements] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported] = useState(() => "serviceWorker" in navigator && "PushManager" in window);

  useEffect(() => {
    getNotificationPreferences().then(prefs => {
      setContestAlerts(prefs.contestAlerts);
      setWinnerAnnouncements(prefs.winnerAnnouncements);
      setPushEnabled(prefs.pushEnabled);
    });
  }, []);

  const toggleContestAlerts = () => {
    const next = !contestAlerts;
    setContestAlerts(next);
    updateNotificationPreferences({ contestAlerts: next });
  };

  const toggleWinnerAnnouncements = () => {
    const next = !winnerAnnouncements;
    setWinnerAnnouncements(next);
    updateNotificationPreferences({ winnerAnnouncements: next });
  };

  const togglePush = async () => {
    if (!pushSupported) return;
    if (pushEnabled) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await unsubscribePush(sub.endpoint);
      }
      setPushEnabled(false);
      updateNotificationPreferences({ pushEnabled: false });
    } else {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;
        const vapidKey = await getVapidPublicKey();
        if (!vapidKey) return;
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
        await subscribePush(sub);
        setPushEnabled(true);
        updateNotificationPreferences({ pushEnabled: true });
      } catch (err) {
        console.error("Push subscription failed:", err);
      }
    }
  };

  return (
    <motion.div key="settings" variants={tabFade} initial="hidden" animate="visible" exit="exit">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-4 h-4 text-white/40" />
            <h3 className="text-base font-display font-light text-white">Appearance</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {THEMES.map((t) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`group relative rounded-2xl p-3 text-left transition-all duration-300 cursor-pointer border ${
                    isActive
                      ? "border-white/20 bg-white/[0.06]"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white/80" />
                    </div>
                  )}
                  <div className="flex gap-1 mb-2.5 h-7 rounded-lg overflow-hidden border border-white/[0.06]">
                    <div className="flex-1" style={{ background: t.preview.bg }} />
                    <div className="flex-1" style={{ background: t.preview.card }} />
                    <div className="flex-1" style={{ background: t.preview.border }} />
                    <div className="w-1" style={{ background: t.preview.accent }} />
                  </div>
                  <div className="text-[10px] font-display font-medium text-white/80">{t.name}</div>
                  <div className="text-[8px] text-white/30 font-light leading-relaxed mt-0.5">{t.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="section-divider" />

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-4 h-4 text-white/40" />
            <h3 className="text-base font-display font-light text-white">Notifications</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div>
                <div className="text-sm text-white/60 font-light">Contest alerts</div>
                <div className="text-[10px] text-white/25 font-light">Get notified about new giveaways</div>
              </div>
              <button
                onClick={toggleContestAlerts}
                className={`relative w-10 h-5 rounded-full transition-all ${contestAlerts ? "bg-white/20" : "bg-white/[0.06]"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${contestAlerts ? "left-5.5 bg-white" : "left-0.5 bg-white/40"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div>
                <div className="text-sm text-white/60 font-light">Winner announcements</div>
                <div className="text-[10px] text-white/25 font-light">Be first to know when winners are drawn</div>
              </div>
              <button
                onClick={toggleWinnerAnnouncements}
                className={`relative w-10 h-5 rounded-full transition-all ${winnerAnnouncements ? "bg-white/20" : "bg-white/[0.06]"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${winnerAnnouncements ? "left-5.5 bg-white" : "left-0.5 bg-white/40"}`} />
              </button>
            </div>
            {pushSupported && (
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <div>
                  <div className="text-sm text-white/60 font-light">Push notifications</div>
                  <div className="text-[10px] text-white/25 font-light">Receive alerts even when the page is closed</div>
                </div>
                <button
                  onClick={togglePush}
                  className={`relative w-10 h-5 rounded-full transition-all ${pushEnabled ? "bg-white/20" : "bg-white/[0.06]"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${pushEnabled ? "left-5.5 bg-white" : "left-0.5 bg-white/40"}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="section-divider" />

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-4 h-4 text-white/40" />
            <h3 className="text-base font-display font-light text-white">Account</h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl text-left hover:bg-white/[0.04] transition-all group"
            >
              <LogOut className="w-4 h-4 text-white/25 group-hover:text-white/40 transition-colors" />
              <div>
                <div className="text-sm text-white/60 font-light">Sign out</div>
                <div className="text-[10px] text-white/25 font-light">Log out of your account</div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/15 ml-auto" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Dashboard({ user: initialUser, entries, onLogout }: { user: any; entries: any[]; onLogout: () => void }) {
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { streak, isNew: isStreakNew } = useStreak();
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifs = useNotifications();
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  useEffect(() => {
    if (!(isStreakNew && streak > 1)) return undefined;
    const timer = setTimeout(() => setShowStreakCelebration(true), 800);
    return () => clearTimeout(timer);
  }, [isStreakNew, streak]);

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const notifContainerRef = useRef<HTMLDivElement>(null);
  const toggleNotifs = useCallback(() => setShowNotifs(prev => !prev), []);
  const closeNotifs = useCallback(() => setShowNotifs(false), []);

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.5}>
      <div className="dash-frame">
        <div className="dash-frame-glow" />
        <div className="dash-frame-inner">

          <div className="dash-topbar">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`dash-avatar ${user.membershipTier === "black" ? "dash-avatar-black" : ""}`}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-display font-medium text-white truncate">{user.fullName}</h2>
                  {user.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-white/50 shrink-0" />}
                  {user.membershipTier && user.membershipTier !== "free" && (
                    <span className={`acct-pro-badge acct-pro-${user.membershipTier}`}>
                      {user.membershipTier === "black" ? <Diamond className="w-2.5 h-2.5" /> : user.membershipTier === "gold" ? <Crown className="w-2.5 h-2.5" /> : <Star className="w-2.5 h-2.5" />}
                      <span>{user.membershipTier === "black" ? "Elite" : user.membershipTier === "gold" ? "Pro" : "Plus"}</span>
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-white/25 font-light truncate">{user.email} · Joined {memberSince}</div>
              </div>
            </div>

            <div className="dash-topbar-actions">
              <div className="relative" ref={notifContainerRef}>
                <button onClick={toggleNotifs} className="dash-topbar-btn notif-bell-btn" title="Notifications">
                  <Bell className="w-3.5 h-3.5" />
                  {notifs.unread > 0 && (
                    <span className="notif-badge-count">{notifs.unread}</span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotifs && (
                    <NotificationPanel
                      notifications={notifs.items}
                      onMarkRead={notifs.markRead}
                      onMarkAllRead={notifs.markAllRead}
                      onClose={closeNotifs}
                      containerRef={notifContainerRef}
                    />
                  )}
                </AnimatePresence>
              </div>
              <button onClick={onLogout} className="dash-topbar-btn" title="Sign out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showStreakCelebration && (
              <StreakCelebration streak={streak} onDone={() => setShowStreakCelebration(false)} />
            )}
          </AnimatePresence>

          <ToastNotifications toast={notifs.latestToast} onDismiss={notifs.dismissToast} />

          <div className="dash-layout">
            <nav className="dash-sidebar">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`dash-nav-item ${isActive ? "dash-nav-active" : ""}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="dash-mobile-tabs">
              <div className="acct-tabs-inner">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`acct-tab ${isActive ? "acct-tab-active" : ""}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="dash-content">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && <OverviewTab user={user} entries={entries} streak={streak} onChangeTab={setActiveTab} />}
                {activeTab === "profile" && <ProfileTab user={user} onUpdate={handleUserUpdate} />}
                {activeTab === "subscription" && <SubscriptionTab user={user} onUpdate={handleUserUpdate} />}
                {activeTab === "entries" && <EntriesTab entries={entries} />}
                {activeTab === "referrals" && <ReferralsTab user={user} />}
                {activeTab === "billing" && <BillingTab user={user} />}
                {activeTab === "settings" && <SettingsTab user={user} onLogout={onLogout} />}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

export default function Account() {
  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  const loadUser = async () => {
    setLoading(true);
    const u = await getCurrentUser();
    if (u) {
      setUser(u);
      const e = await getUserEntries();
      setEntries(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setEntries([]);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-24 pb-20 sm:pt-32 sm:pb-32">
        <div className={`container mx-auto px-3 sm:px-4 ${user ? "max-w-5xl" : "max-w-4xl"}`}>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="acct-hero-banner">
              <div className="acct-hero-banner-glow" />
              <div className="acct-hero-banner-inner">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-pill-badge mb-4 sm:mb-6"
                >
                  <Shield className="w-3 h-3 text-white/50 mr-2" />
                  My Account
                </motion.div>

                {!user && (
                  <>
                    <motion.h1
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="text-[1.8rem] sm:text-4xl md:text-5xl lg:text-6xl font-display font-light text-white mb-3 sm:mb-4 tracking-tight leading-[1.1]"
                    >
                      <span className="text-gradient">Your Rewards Hub</span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="text-sm sm:text-base text-white/40 font-light max-w-lg mx-auto leading-relaxed mb-6 sm:mb-8"
                    >
                      Sign in or create an account to track your giveaway entries
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="acct-steps-bar"
                    >
                      <div className="acct-step-item">
                        <div className="acct-step-num">1</div>
                        <span className="acct-step-label">Register</span>
                      </div>
                      <div className="acct-step-divider" />
                      <div className="acct-step-item">
                        <div className="acct-step-num">2</div>
                        <span className="acct-step-label">Enter</span>
                      </div>
                      <div className="acct-step-divider" />
                      <div className="acct-step-item">
                        <div className="acct-step-num">3</div>
                        <span className="acct-step-label">Win Daily</span>
                      </div>
                    </motion.div>
                  </>
                )}

                {user && (
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-xs sm:text-sm text-white/30 font-light max-w-md mx-auto leading-relaxed"
                  >
                    Manage your entries, membership &amp; rewards in one place
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : user ? (
            <Dashboard user={user} entries={entries} onLogout={handleLogout} />
          ) : (
            <>
              <OurPartnersSection />
              <AuthForm onSuccess={loadUser} />
            </>
          )}

        </div>
      </main>

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Giveaway", href: "/giveaway" },
        { label: "Winners", href: "/winners" },
      ]} />
    </div>
  );
}
