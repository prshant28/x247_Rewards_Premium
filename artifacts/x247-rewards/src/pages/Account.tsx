import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link, useLocation } from "wouter";
import SiteFooter from "@/components/SiteFooter";
import UserProfileCard from "@/components/UserProfileCard";
import {
  User, Users, Trophy, Clock, ArrowRight, LogOut, Mail, Phone,
  MapPin, Calendar, Sparkles, Gift, Shield, Eye, EyeOff, Flame, Target,
  Palette, Check, Share2, Globe, Lock, BadgeCheck, Crown, Copy, ExternalLink,
  Edit3, Save, X, Award, CreditCard, Settings, LayoutDashboard, Zap,
  ChevronRight, Star, Bell, Key, Trash2, History, Rocket, Medal, TrendingDown,
  CalendarDays, Infinity as InfinityIcon, Receipt, Diamond, Search, AlertTriangle,
  CheckCircle2, XCircle, RefreshCw, Fingerprint, ChevronDown, ChevronUp
} from "lucide-react";
import {
  getCurrentUser, getUserEntries, loginUser, registerUser,
  logoutUser, isUserLoggedIn, getStoredReferralCode, trackReferralConversion,
  updateProfile, getUserBadges, purchaseMembership, uploadScreenshot,
  getNotifications, markNotificationRead, markAllNotificationsRead,
  getNotificationPreferences, updateNotificationPreferences,
  subscribePush, unsubscribePush, getVapidPublicKey,
  getPartners, getReferralStats, getReferralProfile, changePassword
} from "@/lib/api";
import AnimatedCounter from "@/components/AnimatedCounter";
import X247BlackCard from "@/components/X247BlackCard";
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

/* ── Curved scallop divider — theme-aware decorative section break ── */
function ScallopDivider({ label }: { label?: string }) {
  return (
    <div className="acct-scallop-divider" role="separator" aria-label={label || "section divider"}>
      <span className="acct-scallop-line" />
      {label && (
        <span className="acct-scallop-label">
          <span className="acct-scallop-dot" />
          {label}
          <span className="acct-scallop-dot" />
        </span>
      )}
      <span className="acct-scallop-line" />
    </div>
  );
}

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
      className="mb-6"
    >
      <div className="metallic-partners-box">
        <div className="metallic-partners-glow" />
        <div className="metallic-partners-shine" />
        <div className="relative z-[2]">
          <div className="flex items-center justify-between mb-4">
            <div className="glass-pill-badge">
              <Sparkles className="w-3 h-3 text-white/50 mr-2" />
              Our Partners
            </div>
            <Link
              href="/partners"
              className="inline-flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50 font-display uppercase tracking-widest transition-colors"
            >
              View All
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
        </div>
      </div>
    </motion.div>
  );
}

const GUEST_FEATURES = [
  {
    icon: Trophy,
    title: "Daily Giveaways",
    desc: "Enter premium contests every single day. New prizes added constantly.",
  },
  {
    icon: Zap,
    title: "Instant Entries",
    desc: "One-click entry system. Track all your submissions in real time.",
  },
  {
    icon: Shield,
    title: "Verified Winners",
    desc: "Transparent draws with publicly announced winners. No catch.",
  },
  {
    icon: Crown,
    title: "Membership Tiers",
    desc: "Unlock Silver, Gold & Black tiers for more entries and exclusive perks.",
  },
];

const GUEST_STATS = [
  { value: "10K+", label: "Members" },
  { value: "₹5L+", label: "Prizes Won" },
  { value: "Daily", label: "Giveaways" },
  { value: "100%", label: "Free to Join" },
];

const WINNERS_FEED = [
  { name: "Rohit S.", prize: "iPhone 15 Pro", city: "Mumbai" },
  { name: "Priya K.", prize: "₹25,000 Cash", city: "Delhi" },
  { name: "Arjun M.", prize: "MacBook Air", city: "Bengaluru" },
  { name: "Neha R.", prize: "PS5 Console", city: "Hyderabad" },
  { name: "Vikram T.", prize: "₹10,000 Voucher", city: "Pune" },
  { name: "Ananya G.", prize: "AirPods Pro", city: "Chennai" },
  { name: "Karan J.", prize: "Apple Watch", city: "Ahmedabad" },
  { name: "Simran B.", prize: "₹50,000 Cash", city: "Jaipur" },
];

function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const reduceMotion = useReducedMotion();
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

  const handleGoogleSignIn = () => {
    setError("Google sign-in is launching soon — please continue with email below.");
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
      <div className="guest-auth-card auth-card-premium">
        <div className="guest-auth-card-glow" />
        <div className="guest-auth-card-shine" />

        {/* Animated ambient layers */}
        <div className="auth-ambient">
          <div className="auth-ambient-orb auth-ambient-orb-a" />
          <div className="auth-ambient-orb auth-ambient-orb-b" />
          <div className="auth-ambient-orb auth-ambient-orb-c" />
          <div className="auth-ambient-grid" />
          <div className="auth-ambient-noise" />
        </div>

        <div className="relative z-[2]">
          {/* Animated welcome heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`heading-${mode}`}
              initial={reduceMotion ? false : { opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-5 sm:mb-6"
            >
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reduceMotion ? 0 : 0.05, duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="auth-eyebrow-pill mb-3 mx-auto"
                aria-hidden="true"
              >
                <span className="auth-eyebrow-dot" />
                <span>{mode === "login" ? "WELCOME BACK" : "JOIN X247"}</span>
              </motion.div>
              <h2 className="auth-heading text-2xl sm:text-[28px] font-display font-light text-white tracking-tight leading-[1.15]">
                {(mode === "login" ? "Sign in to your rewards" : "Create your free account").split(" ").map((word, i) => (
                  <motion.span
                    key={`${mode}-${i}-${word}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: reduceMotion ? 0 : 0.12 + i * 0.06, duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block mr-[0.28em]"
                  >
                    {word}
                  </motion.span>
                ))}
              </h2>
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.45, duration: reduceMotion ? 0 : 0.5 }}
                className="text-xs sm:text-[13px] text-white/40 font-light mt-2"
              >
                {mode === "login" ? "Continue your winning streak" : "Daily prizes await — start in seconds"}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="auth-google-btn mb-4"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-display font-medium text-[13px] tracking-wide">Continue with Google</span>
            <span className="auth-google-lock-pill">
              <Lock className="w-3 h-3" strokeWidth={2.4} />
            </span>
          </button>

          {/* OR Divider */}
          <div className="auth-divider mb-4">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">OR CONTINUE WITH EMAIL</span>
            <span className="auth-divider-line" />
          </div>

          <div className="guest-auth-tabs mb-5">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`guest-auth-tab ${mode === "login" ? "guest-auth-tab-active" : ""}`}
            >
              <Key className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`guest-auth-tab ${mode === "register" ? "guest-auth-tab-active" : ""}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              {mode === "register" && (
                <div className="guest-input-wrap">
                  <User className="guest-input-icon" />
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="guest-input"
                  />
                </div>
              )}

              <div className="guest-input-wrap">
                <Mail className="guest-input-icon" />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="guest-input"
                />
              </div>

              <div className="guest-input-wrap">
                <Lock className="guest-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password *"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="guest-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {mode === "register" && (
                <>
                  <div className="guest-input-wrap">
                    <Phone className="guest-input-icon" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="guest-input"
                    />
                  </div>
                  <div className="guest-input-wrap">
                    <MapPin className="guest-input-icon" />
                    <input
                      type="text"
                      placeholder="City"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="guest-input"
                    />
                  </div>
                </>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/[0.06] border border-red-500/[0.12] rounded-xl"
                  >
                    <X className="w-3.5 h-3.5 text-red-400/60 shrink-0" />
                    <p className="text-xs text-red-400/70 font-light">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="guest-auth-submit-btn"
              >
                {loading ? (
                  <div className="w-4 h-4 border border-white/30 border-t-white/80 rounded-full animate-spin" />
                ) : mode === "login" ? (
                  <>
                    <Key className="w-4 h-4" />
                    Sign In to Dashboard
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Free Account
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </button>

              {mode === "register" && (
                <p className="text-center text-[10px] text-white/20 font-light pt-1">
                  By creating an account you agree to our terms. Free forever.
                </p>
              )}
            </motion.form>
          </AnimatePresence>

          <div className="mt-6 pt-5 border-t border-white/[0.05] flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-white/20" />
              <span className="text-[10px] text-white/20 font-light">Secure</span>
            </div>
            <div className="w-px h-3 bg-white/[0.06]" />
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="w-3 h-3 text-white/20" />
              <span className="text-[10px] text-white/20 font-light">Verified Platform</span>
            </div>
            <div className="w-px h-3 bg-white/[0.06]" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-white/20" />
              <span className="text-[10px] text-white/20 font-light">Instant Access</span>
            </div>
          </div>
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
  containerRef: React.RefObject<HTMLDivElement | null>;
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
  const [, navigate] = useLocation();
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
  const uniqueContests = React.useMemo(() => new Set(entries.map((e: any) => e.contestName)).size, [entries]);
  const monthlyRemaining = Math.max(0, monthlyCap - monthlyUsed);

  const { last7, sparkData, activityDates, thisWeekTotal, lastWeekTotal } = React.useMemo(
    () => buildEntryHistoryData(entries), [entries]
  );
  const weekTrend = thisWeekTotal > lastWeekTotal ? "up" : thisWeekTotal < lastWeekTotal ? "down" : "flat";

  const TIER_RANKS: Record<string, number> = { free: 4, silver: 3, gold: 2, black: 1 };
  const tierRank = TIER_RANKS[tier] ?? 4;

  return (
    <motion.div key="overview" variants={tabFade} initial="hidden" animate="visible" exit="exit">

      {/* ── Welcome strip ── */}
      <div className="acct-welcome-strip mb-6">
        <div className="acct-welcome-strip-left">
          <div className={`acct-welcome-tier-dot tier-dot-${tier}`} />
          <div>
            <div className="acct-welcome-greeting">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, <span className="acct-welcome-greeting-name">{user.fullName?.split(" ")[0]}</span>
            </div>
            <div className="acct-welcome-meta">Member since {memberSince} · {tierLabel} tier</div>
          </div>
        </div>
        {tier !== "black" && (
          <button onClick={() => onChangeTab?.("subscription")} className="acct-welcome-upgrade-btn">
            <Zap className="w-3 h-3" />
            <span>Upgrade</span>
          </button>
        )}
      </div>

      {/* ── Curved scallop divider ── */}
      <ScallopDivider label="Today's Snapshot" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-7">
        {[
          { icon: Flame, label: "Day Streak", value: streak, sub: streak > 0 ? "🔥 Active" : "Start today", spark: sparkData, color: "text-orange-400/50" },
          { icon: Trophy, label: "Total Entries", value: totalEntries, sub: `${entryLimit}/contest`, spark: sparkData, color: "text-white/25" },
          { icon: CalendarDays, label: "Contests Entered", value: uniqueContests, sub: "All time", color: "text-white/25" },
          { icon: Target, label: "Partners Done", value: totalPartners, sub: "Tasks completed", color: "text-white/25" },
          { icon: InfinityIcon, label: "Monthly Left", value: monthlyRemaining, sub: `of ${monthlyCap} cap`, color: monthlyPct > 0.8 ? "text-red-400/50" : "text-white/25" },
          { icon: Star, label: "Tier Rank", value: `#${tierRank}`, isText: true, sub: tierLabel + " member", color: "text-white/25" },
        ].map((stat) => (
          <div key={stat.label} className="acct-stat-card relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-[9px] text-white/22 uppercase tracking-widest font-display leading-tight text-right max-w-[80px]">{stat.sub}</span>
            </div>
            {stat.isText ? (
              <span className="text-2xl sm:text-3xl font-display font-light text-white block">{stat.value}</span>
            ) : (
              <AnimatedCounter value={stat.value as number} className="text-2xl sm:text-3xl font-display font-light text-white block" />
            )}
            <div className="text-[11px] text-white/35 font-light mt-2">{stat.label}</div>
            {"spark" in stat && stat.spark && stat.spark.length >= 2 && (
              <div className="absolute bottom-0 right-0 opacity-40 pointer-events-none">
                <Sparkline data={stat.spark} width={70} height={28} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Social Stats Strip */}
      <div className="acct-social-strip mb-7">
        <button
          className="acct-social-stat acct-social-stat--btn"
          onClick={() => navigate("/people?tab=followers")}
        >
          <AnimatedCounter value={user.followersCount ?? 0} className="acct-social-num" />
          <span className="acct-social-lbl">Followers</span>
        </button>
        <div className="acct-social-divider" />
        <button
          className="acct-social-stat acct-social-stat--btn"
          onClick={() => navigate("/people?tab=following")}
        >
          <AnimatedCounter value={user.followingCount ?? 0} className="acct-social-num" />
          <span className="acct-social-lbl">Following</span>
        </button>
        <div className="acct-social-divider" />
        <div className="acct-social-stat">
          <AnimatedCounter value={entries.length} className="acct-social-num" />
          <span className="acct-social-lbl">Entries</span>
        </div>
        <button
          className="acct-social-discover-btn ml-auto"
          onClick={() => navigate("/people")}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Find People</span>
        </button>
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
                    <div className="text-[10px] text-white/25 font-light">{entry.entryCount} entries · {entry.submittedAt ? new Date(entry.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</div>
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

function computeProfileCompletion(user: any, bio: string, avatarUrl: string, profileSlug: string, isPublic: boolean): { score: number; missing: string[] } {
  const checks = [
    { done: !!user.fullName, label: "Full name" },
    { done: !!user.email, label: "Email address" },
    { done: !!user.phone, label: "Phone number" },
    { done: !!user.city, label: "City" },
    { done: !!bio, label: "Bio" },
    { done: !!avatarUrl, label: "Profile photo" },
    { done: !!profileSlug, label: "Public profile slug" },
    { done: isPublic, label: "Public visibility" },
  ];
  const done = checks.filter(c => c.done).length;
  const missing = checks.filter(c => !c.done).map(c => c.label);
  return { score: Math.round((done / checks.length) * 100), missing };
}

function ProfileTab({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [fullName, setFullName] = useState(user.fullName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [profileSlug, setProfileSlug] = useState(user.profileSlug || "");
  const [isPublic, setIsPublic] = useState(user.isPublic || false);
  const [badges, setBadges] = useState<{ available: any[]; earned: string[] }>({ available: [], earned: [] });
  const [badgeSaving, setBadgeSaving] = useState(false);
  const completion = React.useMemo(() => computeProfileCompletion(user, bio, avatarUrl, profileSlug, isPublic), [user, bio, avatarUrl, profileSlug, isPublic]);

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

  const [phone, setPhone] = useState(user.phone || "");
  const [city, setCity] = useState(user.city || "");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const result = await updateProfile({ fullName, phone, city, bio, profileSlug, isPublic });
    if (result.success) {
      onUpdate({ ...user, fullName, phone, city, bio, profileSlug: result.data?.profileSlug ?? profileSlug, isPublic, avatarUrl });
      setProfileSlug(result.data?.profileSlug ?? profileSlug);
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

      {/* Profile completion bar */}
      <div className="acct-completion-bar mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-3.5 h-3.5 text-white/40" />
            <span className="text-xs font-display font-light text-white/60">Profile Completion</span>
          </div>
          <span className={`text-xs font-display font-medium ${completion.score >= 80 ? "text-emerald-400/70" : completion.score >= 50 ? "text-amber-400/60" : "text-white/40"}`}>{completion.score}%</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completion.score}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-y-0 left-0 rounded-full ${completion.score >= 80 ? "bg-gradient-to-r from-emerald-500/50 to-emerald-400/70" : completion.score >= 50 ? "bg-gradient-to-r from-amber-500/40 to-amber-400/60" : "bg-gradient-to-r from-white/20 to-white/40"}`}
          />
        </div>
        {completion.missing.length > 0 && (
          <div className="mt-1.5 text-[10px] text-white/25 font-light">Missing: {completion.missing.slice(0, 3).join(", ")}{completion.missing.length > 3 ? ` +${completion.missing.length - 3} more` : ""}</div>
        )}
      </div>

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
                <label className="acct-label">Photo</label>
                <label className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl cursor-pointer hover:bg-white/[0.04] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center overflow-hidden shrink-0">
                    {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white/30" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white/50 font-light">{uploading ? "Uploading…" : "Change photo"}</div>
                    <div className="text-[9px] text-white/25 font-light">Max 5MB · JPG / PNG</div>
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="acct-label">Full Name</label>
                  <div className="guest-input-wrap">
                    <User className="guest-input-icon" />
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value.slice(0, 80))} placeholder="Your full name" className="guest-input" />
                  </div>
                </div>
                <div>
                  <label className="acct-label">Phone</label>
                  <div className="guest-input-wrap">
                    <Phone className="guest-input-icon" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value.slice(0, 20))} placeholder="+91 98765 43210" className="guest-input" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="acct-label">City</label>
                  <div className="guest-input-wrap">
                    <MapPin className="guest-input-icon" />
                    <input type="text" value={city} onChange={e => setCity(e.target.value.slice(0, 50))} placeholder="Mumbai, Delhi…" className="guest-input" />
                  </div>
                </div>
                <div>
                  <label className="acct-label">Profile Link</label>
                  <div className="guest-input-wrap">
                    <Globe className="guest-input-icon" />
                    <input type="text" value={profileSlug} onChange={e => setProfileSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30))} placeholder="your-name" className="guest-input" />
                  </div>
                </div>
              </div>

              <div>
                <label className="acct-label">Bio <span className="text-white/20 normal-case font-light">({bio.length}/200)</span></label>
                <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 200))} placeholder="Tell people about yourself…" rows={3}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-white/20 font-light focus:outline-none focus:border-white/[0.12] resize-none" />
              </div>

              <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <div className="flex items-center gap-2">
                  {isPublic ? <Globe className="w-4 h-4 text-white/40" /> : <Lock className="w-4 h-4 text-white/25" />}
                  <span className="text-xs text-white/50 font-light">{isPublic ? "Profile is public" : "Profile is private"}</span>
                </div>
                <button onClick={() => setIsPublic(!isPublic)} className={`relative w-10 h-5 rounded-full transition-all ${isPublic ? "bg-white/20" : "bg-white/[0.06]"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isPublic ? "left-[22px]" : "left-0.5 bg-white/40"}`} />
                </button>
              </div>

              {error && <p className="text-xs text-red-400/60 font-light">{error}</p>}

              <button onClick={handleSave} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white font-light hover:bg-white/[0.08] transition-all disabled:opacity-30">
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { icon: User, label: "Full Name", value: user.fullName },
                { icon: Mail, label: "Email", value: user.email, extra: user.isVerified ? <BadgeCheck className="w-3.5 h-3.5 text-white/40 ml-1 inline" /> : null },
                { icon: Phone, label: "Phone", value: user.phone },
                { icon: MapPin, label: "City", value: user.city },
              ].map((row) => row.value ? (
                <div key={row.label} className="acct-info-row">
                  <row.icon className="w-4 h-4 text-white/25" />
                  <div>
                    <div className="text-[9px] text-white/25 uppercase tracking-wider font-display">{row.label}</div>
                    <div className="text-sm text-white/60 font-light flex items-center">{row.value}{row.extra}</div>
                  </div>
                </div>
              ) : null)}
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
                    ? "border-white/30 bg-white/[0.08] ring-1 ring-white/20"
                    : earned
                    ? "border-white/[0.14] bg-white/[0.05] hover:border-white/[0.25] hover:bg-white/[0.08] cursor-pointer"
                    : "border-white/[0.06] bg-white/[0.02] opacity-50 cursor-not-allowed"
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

      {/* ── Black tier physical card showcase ── */}
      {isBlackTier && (
        <div className="acct-black-card-showcase mb-6">
          <div className="acct-bcs-glow" aria-hidden />
          <div className="acct-bcs-inner">
            <div className="acct-bcs-card-wrap">
              <X247BlackCard variant="compact" animate={false} />
            </div>
            <div className="acct-bcs-text">
              <span className="acct-black-badge mb-3">
                <Diamond className="w-2.5 h-2.5" />
                <span>Elite Member</span>
              </span>
              <h3 className="acct-bcs-title">X247 Black</h3>
              <p className="acct-bcs-sub">The most exclusive tier. Your physical Black card will be shipped within 7–14 days.</p>
            </div>
          </div>
        </div>
      )}

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
  const [profile, setProfile] = useState<any | null | "loading">("loading");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getReferralStats().then(setStats).catch(() => {});
    getReferralProfile()
      .then((d) => setProfile(d.partner ?? null))
      .catch(() => setProfile(null));
  }, []);

  const refCode = profile && profile !== "loading" ? profile.referralCode : null;
  const refLink = refCode ? `${window.location.origin}/?ref=${refCode}` : "";

  const copy = () => {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const isEnrolled = profile && profile !== "loading";
  const isLoading = profile === "loading";

  return (
    <motion.div key="referrals" variants={tabFade} initial="hidden" animate="visible" exit="exit">
      <div className="flex items-center gap-3 mb-5">
        <Share2 className="w-4 h-4 text-white/40" />
        <h3 className="text-base font-display font-light text-white">Referrals</h3>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : !isEnrolled ? (
        /* Not enrolled state */
        <div className="glass-card p-8 mb-5 text-center">
          <div className="card-shine" />
          <div className="relative z-[2] flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white/25" />
            </div>
            <div>
              <h4 className="text-sm font-display font-light text-white mb-1">Not Enrolled in Referral Program</h4>
              <p className="text-xs text-white/35 font-light leading-relaxed max-w-xs mx-auto">
                Join the X247 referral program to earn bonus entries and rewards every time a friend signs up through your link.
              </p>
            </div>
            <Link href="/referral-dashboard" className="mt-2 acct-copy-btn inline-flex">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join Referral Program</span>
            </Link>
            <div className="mt-2 space-y-2 w-full max-w-xs text-left">
              <div className="flex gap-3 text-xs text-white/40 font-light"><span className="text-white/20 font-mono">01</span><span>Apply to become a referral partner.</span></div>
              <div className="flex gap-3 text-xs text-white/40 font-light"><span className="text-white/20 font-mono">02</span><span>Get your unique link after approval.</span></div>
              <div className="flex gap-3 text-xs text-white/40 font-light"><span className="text-white/20 font-mono">03</span><span>Earn bonus entries per successful referral.</span></div>
            </div>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
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
  const daysActive = Math.floor((Date.now() - memberSince.getTime()) / 86400000);

  const invoices = isFree ? [] : [
    { id: `INV-${memberSince.getFullYear()}${String(memberSince.getMonth() + 1).padStart(2, "0")}-001`, date: memberSince, amount: tierPrice, plan: tier, status: "paid" },
  ];

  return (
    <motion.div key="billing" variants={tabFade} initial="hidden" animate="visible" exit="exit">
      <div className="flex items-center gap-3 mb-5">
        <Receipt className="w-4 h-4 text-white/40" />
        <h3 className="text-base font-display font-light text-white">Billing</h3>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { icon: CreditCard, label: "Current Plan", value: tier === "free" ? "Free Forever" : `₹${tierPrice}/mo`, sub: tier.charAt(0).toUpperCase() + tier.slice(1) + " tier" },
          { icon: CalendarDays, label: "Next Renewal", value: isFree ? "—" : nextRenewal.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), sub: isFree ? "No subscription" : "Auto-renews monthly" },
          { icon: Calendar, label: "Member Since", value: memberSince.toLocaleDateString("en-IN", { month: "short", year: "numeric" }), sub: `${daysActive} day${daysActive !== 1 ? "s" : ""} active` },
        ].map(c => (
          <div key={c.label} className="glass-card p-4">
            <div className="card-shine" />
            <div className="relative z-[2]">
              <div className="flex items-center gap-2 mb-2"><c.icon className="w-3.5 h-3.5 text-white/30" /><div className="text-[9px] uppercase tracking-wider font-display text-white/30">{c.label}</div></div>
              <div className="text-sm font-display font-light text-white capitalize">{c.value}</div>
              <div className="text-[10px] text-white/35 font-light mt-0.5">{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment method */}
      <div className="glass-card p-5 mb-5">
        <div className="card-shine" />
        <div className="relative z-[2]">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-white/40" />
              <h4 className="text-sm font-display font-light text-white">Payment Method</h4>
            </div>
            <button className="text-[10px] text-white/25 font-light hover:text-white/50 transition-colors flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Manage
            </button>
          </div>
          {isFree ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] border-dashed">
              <CreditCard className="w-5 h-5 text-white/15" />
              <div>
                <div className="text-xs text-white/35 font-light">No payment method on file</div>
                <div className="text-[10px] text-white/20 font-light mt-0.5">Add a card when you upgrade to a paid plan</div>
              </div>
            </div>
          ) : (
            <div className="acct-payment-card">
              <div className="acct-payment-card-inner">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">Saved Card</div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-full bg-white/10" />
                    <div className="w-4 h-4 rounded-full bg-white/20 -ml-2" />
                  </div>
                </div>
                <div className="text-sm font-mono text-white/50 tracking-wider mb-3">•••• •••• •••• 4242</div>
                <div className="flex items-center justify-between">
                  <div className="text-[9px] text-white/20 font-light">Expires 12/27</div>
                  <div className="text-[9px] text-emerald-400/50 flex items-center gap-1"><Check className="w-2.5 h-2.5" />Active</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice history */}
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
                <div key={inv.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.03] transition-all group">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
                    <Receipt className="w-3.5 h-3.5 text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/65 font-mono truncate">{inv.id}</div>
                    <div className="text-[10px] text-white/30 font-light capitalize">{inv.plan} · {inv.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] text-emerald-400/50 bg-emerald-400/[0.06] border border-emerald-400/[0.12] px-2 py-0.5 rounded-full">Paid</span>
                    <div className="text-sm text-white/75 font-display font-light">₹{inv.amount}</div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/[0.04] border border-white/[0.06] rounded-lg">
                      <ArrowRight className="w-3 h-3 text-white/30" />
                    </button>
                  </div>
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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "won">("all");

  const filtered = React.useMemo(() => {
    let list = entries;
    if (query.trim()) list = list.filter(e => e.contestName?.toLowerCase().includes(query.toLowerCase()) || e.entryCode?.toLowerCase().includes(query.toLowerCase()));
    if (filter === "won") list = list.filter(e => e.status === "won");
    if (filter === "pending") list = list.filter(e => e.status !== "won");
    return list;
  }, [entries, query, filter]);

  const FILTERS: { id: "all" | "pending" | "won"; label: string }[] = [
    { id: "all", label: `All (${entries.length})` },
    { id: "pending", label: "Pending" },
    { id: "won", label: "Won 🏆" },
  ];

  return (
    <motion.div key="entries" variants={tabFade} initial="hidden" animate="visible" exit="exit">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-4 h-4 text-white/40" />
        <h3 className="text-base font-display font-light text-white">Giveaway Entries</h3>
        <span className="text-[10px] text-white/20 font-light ml-auto">{entries.length} total</span>
      </div>

      {entries.length > 0 && (
        <div className="space-y-3 mb-4">
          <div className="guest-input-wrap">
            <Search className="guest-input-icon" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by contest or entry code…" className="guest-input" />
            {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40"><X className="w-3.5 h-3.5" /></button>}
          </div>
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-display font-medium transition-all ${filter === f.id ? "bg-white/[0.08] border border-white/[0.14] text-white/80" : "bg-white/[0.02] border border-white/[0.05] text-white/35 hover:bg-white/[0.04]"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((entry: any) => (
            <div key={entry.id} className="acct-entry-row">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${entry.status === "won" ? "bg-amber-400/10 border border-amber-400/20" : "bg-white/[0.03] border border-white/[0.06]"}`}>
                <Trophy className={`w-3.5 h-3.5 ${entry.status === "won" ? "text-amber-400/60" : "text-white/25"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-light text-white/65 truncate">{entry.contestName}</div>
                <div className="flex items-center gap-2 text-[10px] text-white/25 font-light mt-0.5 flex-wrap">
                  <span className="font-mono bg-white/[0.03] px-1.5 py-0.5 rounded">{entry.entryCode}</span>
                  <span className="text-white/10">·</span>
                  <span>{entry.entryCount} {entry.entryCount === 1 ? "entry" : "entries"}</span>
                  <span className="text-white/10">·</span>
                  <span>{entry.partnersCompleted} partners</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`acct-entry-status ${entry.status === "won" ? "!text-amber-400/70 !border-amber-400/20 !bg-amber-400/[0.06]" : ""}`}>
                  {entry.status === "won" ? <Star className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  <span>{entry.status === "won" ? "Won!" : "Pending"}</span>
                </div>
                {entry.status === "won" && entry.prize && (
                  <div className="text-[9px] text-amber-400/50 font-light mt-0.5 max-w-[90px] truncate">{entry.prize}</div>
                )}
                {!(entry.status === "won" && entry.prize) && (
                  <div className="text-[9px] text-white/20 font-light mt-0.5">
                    {entry.submittedAt ? new Date(entry.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : entries.length > 0 ? (
        <div className="py-12 text-center">
          <div className="text-[11px] text-white/25 font-light">No entries match your search</div>
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

  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.next !== pwForm.confirm) { setPwError("New passwords don't match"); return; }
    if (pwForm.next.length < 6) { setPwError("New password must be at least 6 characters"); return; }
    setPwSaving(true);
    const result = await changePassword(pwForm.current, pwForm.next);
    if (result.success) {
      setPwSuccess(true);
      setPwForm({ current: "", next: "", confirm: "" });
      setTimeout(() => { setPwSuccess(false); setPwOpen(false); }, 2500);
    } else {
      setPwError(result.error || "Failed to change password");
    }
    setPwSaving(false);
  };

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
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as ArrayBuffer,
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
            <h3 className="text-base font-display font-light text-white">Security</h3>
          </div>
          <div className="space-y-2">
            {/* Change password — expandable */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => { setPwOpen(p => !p); setPwError(""); setPwSuccess(false); }}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.03] transition-all"
              >
                <Key className="w-4 h-4 text-white/25" />
                <div className="flex-1">
                  <div className="text-sm text-white/60 font-light">Change Password</div>
                  <div className="text-[10px] text-white/25 font-light">Update your login credentials</div>
                </div>
                {pwOpen ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
              </button>
              <AnimatePresence>
                {pwOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                    className="border-t border-white/[0.05] overflow-hidden">
                    <form onSubmit={handleChangePassword} className="p-4 space-y-3">
                      {pwSuccess ? (
                        <div className="flex items-center gap-2 p-3 bg-emerald-500/[0.07] border border-emerald-500/[0.15] rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400/60 shrink-0" />
                          <span className="text-xs text-emerald-400/70 font-light">Password changed successfully!</span>
                        </div>
                      ) : (
                        <>
                          <div className="guest-input-wrap">
                            <Lock className="guest-input-icon" />
                            <input type={showCurrentPw ? "text" : "password"} placeholder="Current password" value={pwForm.current}
                              onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} className="guest-input pr-10" />
                            <button type="button" onClick={() => setShowCurrentPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors">
                              {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="guest-input-wrap">
                            <Lock className="guest-input-icon" />
                            <input type={showNewPw ? "text" : "password"} placeholder="New password (min 6 chars)" value={pwForm.next}
                              onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} className="guest-input pr-10" />
                            <button type="button" onClick={() => setShowNewPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors">
                              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="guest-input-wrap">
                            <Lock className="guest-input-icon" />
                            <input type="password" placeholder="Confirm new password" value={pwForm.confirm}
                              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} className="guest-input" />
                          </div>
                          {pwForm.next && (
                            <div className="flex gap-1">
                              {[6, 8, 12].map((len, i) => (
                                <div key={len} className={`flex-1 h-1 rounded-full transition-all ${pwForm.next.length >= len ? "bg-white/40" : "bg-white/[0.05]"}`} />
                              ))}
                              <span className="text-[9px] text-white/25 font-light ml-1">{pwForm.next.length < 6 ? "Weak" : pwForm.next.length < 12 ? "Fair" : "Strong"}</span>
                            </div>
                          )}
                          {pwError && (
                            <div className="flex items-center gap-2 p-2.5 bg-red-500/[0.06] border border-red-500/[0.12] rounded-lg">
                              <XCircle className="w-3.5 h-3.5 text-red-400/60 shrink-0" />
                              <span className="text-[11px] text-red-400/70 font-light">{pwError}</span>
                            </div>
                          )}
                          <button type="submit" disabled={pwSaving}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white/70 font-light hover:bg-white/[0.08] transition-all disabled:opacity-30">
                            {pwSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                            {pwSaving ? "Updating…" : "Update Password"}
                          </button>
                        </>
                      )}
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-4 h-4 text-white/25" />
                <div>
                  <div className="text-sm text-white/60 font-light">Two-Factor Authentication</div>
                  <div className="text-[10px] text-white/25 font-light">Add an extra layer of security — coming soon</div>
                </div>
              </div>
              <span className="text-[9px] text-white/20 font-display uppercase tracking-wider px-2 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg">Soon</span>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        <div>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400/40" />
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
                <div className="text-[10px] text-white/25 font-light">Log out of your account on this device</div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/15 ml-auto" />
            </button>
            <button
              className="w-full flex items-center gap-3 p-4 bg-red-500/[0.03] border border-red-500/[0.08] rounded-xl text-left hover:bg-red-500/[0.05] transition-all group opacity-60 cursor-not-allowed"
              disabled
            >
              <Trash2 className="w-4 h-4 text-red-400/30" />
              <div>
                <div className="text-sm text-red-400/50 font-light">Delete Account</div>
                <div className="text-[10px] text-white/20 font-light">Permanently remove your account and all data — contact support</div>
              </div>
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
  const [showMobileNav, setShowMobileNav] = useState(false);
  const activeTabMeta = TABS.find(t => t.id === activeTab) || TABS[0];
  const ActiveTabIcon = activeTabMeta.icon;
  // Close mobile drawer on Escape + body scroll lock while open
  useEffect(() => {
    if (!showMobileNav) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowMobileNav(false); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showMobileNav]);
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
    <div className="dash-frame">
      <div className="dash-frame-glow" />
      <div className="dash-frame-inner">

        {/* ── Full-width premium banner ─────────────────────────── */}
        <div className="dash-banner">
          <div className="dash-banner-bg-deco" />
          <div className="dash-banner-left">
            <div className="dash-banner-eyebrow">
              <span className={`dash-banner-tier-dot tier-dot-${user.membershipTier || "free"}`} />
              <span>Member Area</span>
            </div>
            <h1 className="dash-banner-title">My Account</h1>
            <div className="dash-banner-meta">
              <span className="dash-banner-name">{user.fullName}</span>
              {user.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-white/40 shrink-0" />}
              <span className="dash-banner-sep">·</span>
              <span className="dash-banner-tier-label">
                {user.membershipTier === "black" ? "Elite Member" : user.membershipTier === "gold" ? "Gold Member" : user.membershipTier === "silver" ? "Silver Member" : "Free Member"}
              </span>
            </div>
            <div className="dash-banner-since">Since {memberSince} · {user.email}</div>
          </div>

          <div className="dash-banner-right">
            {/* Notification bell */}
            <div className="dash-banner-actions">
              <div className="relative" ref={notifContainerRef}>
                <button onClick={toggleNotifs} className="dash-banner-action-btn notif-bell-btn" title="Notifications">
                  <Bell className="w-4 h-4" />
                  {notifs.unread > 0 && <span className="notif-badge-count">{notifs.unread}</span>}
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
            </div>

            {/* Inline KPI mini-strip — fills the right-side space with live data */}
            <div className="dash-banner-kpis" aria-label="Account quick stats">
              <div className="dash-banner-kpi">
                <div className="dash-banner-kpi-icon"><Flame className="w-3.5 h-3.5" /></div>
                <div>
                  <div className="dash-banner-kpi-value">{streak}</div>
                  <div className="dash-banner-kpi-label">Streak</div>
                </div>
              </div>
              <div className="dash-banner-kpi-sep" />
              <div className="dash-banner-kpi">
                <div className="dash-banner-kpi-icon"><Trophy className="w-3.5 h-3.5" /></div>
                <div>
                  <div className="dash-banner-kpi-value">{entries.length}</div>
                  <div className="dash-banner-kpi-label">Entries</div>
                </div>
              </div>
              <div className="dash-banner-kpi-sep" />
              <div className="dash-banner-kpi">
                <div className="dash-banner-kpi-icon"><Star className="w-3.5 h-3.5" /></div>
                <div>
                  <div className="dash-banner-kpi-value capitalize">{user.membershipTier || "free"}</div>
                  <div className="dash-banner-kpi-label">Tier</div>
                </div>
              </div>
            </div>

            {/* Decorative graphic */}
            <div className="dash-banner-graphic" aria-hidden="true">
              <svg viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="dash-banner-svg">
                {/* Concentric rings */}
                <circle cx="90" cy="80" r="72" stroke="white" strokeOpacity="0.04" strokeWidth="1"/>
                <circle cx="90" cy="80" r="55" stroke="white" strokeOpacity="0.06" strokeWidth="1"/>
                <circle cx="90" cy="80" r="38" stroke="white" strokeOpacity="0.08" strokeWidth="1"/>
                <circle cx="90" cy="80" r="20" stroke="white" strokeOpacity="0.1" strokeWidth="1"/>
                {/* Diamond */}
                <path d="M90 44 L114 80 L90 116 L66 80 Z" stroke="white" strokeOpacity="0.15" strokeWidth="1" fill="none"/>
                <path d="M90 58 L107 80 L90 102 L73 80 Z" stroke="white" strokeOpacity="0.22" strokeWidth="1" fill="rgba(255,255,255,0.02)"/>
                {/* Center dot */}
                <circle cx="90" cy="80" r="4" fill="white" fillOpacity="0.15"/>
                <circle cx="90" cy="80" r="2" fill="white" fillOpacity="0.4"/>
                {/* Cross lines */}
                <line x1="90" y1="8" x2="90" y2="32" stroke="white" strokeOpacity="0.07" strokeWidth="1"/>
                <line x1="90" y1="128" x2="90" y2="152" stroke="white" strokeOpacity="0.07" strokeWidth="1"/>
                <line x1="18" y1="80" x2="42" y2="80" stroke="white" strokeOpacity="0.07" strokeWidth="1"/>
                <line x1="138" y1="80" x2="162" y2="80" stroke="white" strokeOpacity="0.07" strokeWidth="1"/>
                {/* Corner dots */}
                <circle cx="30" cy="30" r="2" fill="white" fillOpacity="0.1"/>
                <circle cx="150" cy="30" r="2" fill="white" fillOpacity="0.1"/>
                <circle cx="30" cy="130" r="2" fill="white" fillOpacity="0.1"/>
                <circle cx="150" cy="130" r="2" fill="white" fillOpacity="0.1"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Premium section divider */}
        <div className="dash-premium-divider" />

        <AnimatePresence>
          {showStreakCelebration && (
            <StreakCelebration streak={streak} onDone={() => setShowStreakCelebration(false)} />
          )}
        </AnimatePresence>

        <ToastNotifications toast={notifs.latestToast} onDismiss={notifs.dismissToast} />

        {/* ── Main layout: sidebar + content ───────────────────── */}
        <div className="dash-layout">

          {/* Desktop sidebar */}
          <nav className="dash-sidebar" aria-label="Dashboard navigation">

            {/* Mini user profile */}
            <div className="dash-sidebar-profile">
              <div className={`dash-sidebar-avatar ${user.membershipTier === "black" ? "dash-avatar-black" : ""}`}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="dash-sidebar-avatar-letter">
                    {user.fullName?.charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <div className="dash-sidebar-user-info">
                <div className="dash-sidebar-user-name">{user.fullName?.split(" ")[0]}</div>
                <div className="dash-sidebar-user-tier">
                  {user.membershipTier === "black" ? "Elite Member" : user.membershipTier === "gold" ? "Gold Member" : user.membershipTier === "silver" ? "Silver Member" : "Free Member"}
                </div>
              </div>
            </div>

            <div className="dash-sidebar-divider" />

            <div className="dash-sidebar-section">Navigation</div>

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

            <div className="dash-sidebar-divider" style={{ marginTop: "auto" }} />
            <button onClick={onLogout} className="dash-nav-item dash-nav-logout">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </nav>

          {/* Mobile tab row */}
          {/* Mobile: premium top bar showing current tab + menu trigger */}
          <div className="dash-mobile-topbar">
            <button
              type="button"
              onClick={() => setShowMobileNav(true)}
              className="dash-mobile-topbar-trigger"
              aria-label="Open account menu"
            >
              <span className="dash-mobile-topbar-icon">
                <ActiveTabIcon className="w-4 h-4" />
              </span>
              <span className="dash-mobile-topbar-label">{activeTabMeta.label}</span>
              <span className="dash-mobile-topbar-chevron">
                <ChevronDown className="w-3.5 h-3.5" />
              </span>
            </button>
            <div className="dash-mobile-topbar-meta">
              <span className="dash-mobile-topbar-meta-dot" />
              {TABS.findIndex(t => t.id === activeTab) + 1} / {TABS.length}
            </div>
          </div>

          {/* Mobile: slide-up drawer with all tabs as premium cards */}
          <AnimatePresence>
            {showMobileNav && (
              <>
                <motion.div
                  className="dash-mobile-drawer-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowMobileNav(false)}
                />
                <motion.div
                  className="dash-mobile-drawer"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Account navigation"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 320, damping: 36 }}
                >
                  <div className="dash-mobile-drawer-handle" />
                  <div className="dash-mobile-drawer-header">
                    <div>
                      <div className="dash-mobile-drawer-title">Account</div>
                      <div className="dash-mobile-drawer-sub">Switch sections</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMobileNav(false)}
                      className="dash-mobile-drawer-close"
                      aria-label="Close menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="dash-mobile-drawer-grid">
                    {TABS.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => { setActiveTab(tab.id); setShowMobileNav(false); }}
                          className={`dash-mobile-drawer-card ${isActive ? "is-active" : ""}`}
                        >
                          <span className="dash-mobile-drawer-card-icon">
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="dash-mobile-drawer-card-label">{tab.label}</span>
                          {isActive && <span className="dash-mobile-drawer-card-pulse" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Tab content */}
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
  );
}

export default function Account() {
  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();
  const [winPopupData, setWinPopupData] = useState<{ prize: string; contestName: string; entryCode: string } | null>(null);

  const loadUser = async () => {
    setLoading(true);
    const u = await getCurrentUser();
    if (u) {
      setUser(u);
      const e = await getUserEntries();
      setEntries(e);
      const wonEntries = e.filter((en: any) => en.status === "won");
      if (wonEntries.length > 0) {
        const seenKey = "x247_seen_wins";
        const seenWins: string[] = JSON.parse(localStorage.getItem(seenKey) || "[]");
        const unseen = wonEntries.find((en: any) => !seenWins.includes(String(en.id)));
        if (unseen) {
          setWinPopupData({ prize: unseen.prize || "a prize", contestName: unseen.contestName || "the giveaway", entryCode: unseen.entryCode || "" });
          const updated = [...seenWins, String(unseen.id)];
          localStorage.setItem(seenKey, JSON.stringify(updated));
        }
      }
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

      {winPopupData && (
        <div className="win-popup-overlay" onClick={() => setWinPopupData(null)}>
          <motion.div
            className="win-popup-card"
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="win-popup-glow" />
            <div className="win-popup-confetti-row">
              {["✦","✧","★","✦","✧","✦","★","✧","✦"].map((c, i) => (
                <motion.span key={i} className="win-popup-confetti-star"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], y: [-10, -30, -50] }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
                >{c}</motion.span>
              ))}
            </div>
            <div className="win-popup-trophy-ring">
              <Trophy className="win-popup-trophy-icon" />
            </div>
            <div className="win-popup-eyebrow">You Won!</div>
            <div className="win-popup-prize">{winPopupData.prize}</div>
            <div className="win-popup-meta">in {winPopupData.contestName}</div>
            {winPopupData.entryCode && (
              <div className="win-popup-entry-code">Entry: {winPopupData.entryCode}</div>
            )}
            <p className="win-popup-body">
              Congratulations! Our team will reach out to you shortly to arrange your prize delivery.
            </p>
            <button className="win-popup-btn" onClick={() => setWinPopupData(null)}>
              Claim My Win
            </button>
          </motion.div>
        </div>
      )}

      <main className={`relative z-10 ${user ? "pt-[70px]" : "pt-24 pb-20 sm:pt-32 sm:pb-32"}`}>
        <div className={user ? "w-full" : "container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl"}>

          {/* Hero Banner — guest only */}
          {!user && (
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
                  X247 Rewards Platform
                </motion.div>

                  <>
                    <motion.h1
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="text-[2rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] font-display font-light text-white mb-3 sm:mb-4 tracking-tight leading-[1.15] px-4 sm:px-8"
                    >
                      <span className="text-gradient" style={{ paddingBottom: "0.12em", display: "inline-block" }}>Your Rewards Hub</span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="text-sm sm:text-base text-white/40 font-light max-w-lg mx-auto leading-relaxed mb-8 sm:mb-10"
                    >
                      Enter daily giveaways, track your wins, and unlock exclusive membership perks — all in one place.
                    </motion.p>

                    {/* Steps Bar */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="acct-steps-bar mb-8 sm:mb-10"
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

                    {/* Auth Form + Premium Side Panel — 2-column on lg+ */}
                    <div className="acct-auth-grid">
                      <div className="acct-auth-form-col">
                        <AuthForm onSuccess={loadUser} />
                      </div>
                      <aside className="acct-side-panel" aria-label="Live activity & platform highlights">
                        {/* LIVE NOW header */}
                        <div className="acct-side-head">
                          <span className="acct-side-pulse" aria-hidden="true" />
                          <span className="acct-side-head-label">Live Now</span>
                          <span className="acct-side-head-time">UPDATED JUST NOW</span>
                        </div>

                        {/* Recent winners feed (compact, vertical) */}
                        <div className="acct-side-feed" aria-label="Recent winners">
                          {WINNERS_FEED.slice(0, 4).map((w, i) => (
                            <div key={w.name + i} className="acct-side-feed-row">
                              <div className="acct-side-feed-avatar" aria-hidden="true">
                                {w.name.split(" ").map(n => n[0]).join("")}
                              </div>
                              <div className="acct-side-feed-body">
                                <div className="acct-side-feed-line">
                                  <strong className="acct-side-feed-name">{w.name}</strong>
                                  <span className="acct-side-feed-sep">won</span>
                                  <span className="acct-side-feed-prize">{w.prize}</span>
                                </div>
                                <div className="acct-side-feed-meta">
                                  <span className="acct-side-feed-city">{w.city}</span>
                                  <span className="acct-side-feed-dot" />
                                  <span className="acct-side-feed-ago">{["2m", "8m", "14m", "21m"][i]} ago</span>
                                </div>
                              </div>
                              <Trophy className="acct-side-feed-icon" aria-hidden="true" />
                            </div>
                          ))}
                        </div>

                        {/* Stat row */}
                        <div className="acct-side-stats">
                          {GUEST_STATS.map((s) => (
                            <div key={s.label} className="acct-side-stat">
                              <div className="acct-side-stat-value">{s.value}</div>
                              <div className="acct-side-stat-label">{s.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Feature highlights — compact list */}
                        <div className="acct-side-features">
                          {GUEST_FEATURES.map((feat) => (
                            <div key={feat.title} className="acct-side-feature">
                              <span className="acct-side-feature-icon" aria-hidden="true">
                                <feat.icon className="w-3.5 h-3.5" strokeWidth={1.7} />
                              </span>
                              <span className="acct-side-feature-title">{feat.title}</span>
                            </div>
                          ))}
                        </div>

                        {/* Trust footer */}
                        <div className="acct-side-foot">
                          <Shield className="w-3 h-3" aria-hidden="true" />
                          <span>Bank-grade security · 100% free to join</span>
                        </div>
                      </aside>
                    </div>
                  </>
              </div>
            </div>
          </motion.div>
          )}

          {!user && <OurPartnersSection />}

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          )}

          {user && !loading && (
            <Dashboard user={user} entries={entries} onLogout={handleLogout} />
          )}

        </div>
      </main>

      {(!user || loading) && (
        <SiteFooter links={[
          { label: "Home", href: "/" },
          { label: "Giveaway", href: "/giveaway" },
          { label: "Winners", href: "/winners" },
        ]} />
      )}
    </div>
  );
}
