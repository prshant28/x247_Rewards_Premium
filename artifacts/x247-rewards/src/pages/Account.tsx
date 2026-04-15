import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import SiteFooter from "@/components/SiteFooter";
import UserProfileCard from "@/components/UserProfileCard";
import {
  User, Trophy, Clock, ArrowRight, LogOut, Mail, Phone,
  MapPin, Calendar, Sparkles, Gift, Shield, Eye, EyeOff, Flame, Target,
  Palette, Check, Share2, Globe, Lock, BadgeCheck, Crown, Copy, ExternalLink,
  Edit3, Save, X, Award
} from "lucide-react";
import {
  getCurrentUser, getUserEntries, loginUser, registerUser,
  logoutUser, isUserLoggedIn, getStoredReferralCode, trackReferralConversion,
  updateProfile, getUserBadges, purchaseMembership, uploadScreenshot
} from "@/lib/api";
import AnimatedCounter from "@/components/AnimatedCounter";
import { useTheme, THEMES, type ThemeId } from "@/contexts/ThemeContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

type AuthMode = "login" | "register";

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
      <div className="glass-card p-6 sm:p-8 max-w-md mx-auto">
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

function useStreak(): number {
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    const key = "x247_visit_dates";
    const today = getLocalDate();
    const stored = JSON.parse(localStorage.getItem(key) || "[]") as string[];
    if (!stored.includes(today)) {
      stored.push(today);
      localStorage.setItem(key, JSON.stringify(stored.slice(-30)));
    }
    setStreak(computeStreak(stored));
  }, []);
  return streak;
}

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2.5} className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/0" />
        <Palette className="w-4 h-4 text-white/40" />
        <h3 className="text-lg font-display font-light text-white">Appearance</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {THEMES.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`group relative rounded-2xl p-3 sm:p-4 text-left transition-all duration-300 cursor-pointer border ${
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

              <div className="flex gap-1 mb-3 h-8 rounded-lg overflow-hidden border border-white/[0.06]">
                <div className="flex-1" style={{ background: t.preview.bg }} />
                <div className="flex-1" style={{ background: t.preview.card }} />
                <div className="flex-1" style={{ background: t.preview.border }} />
                <div className="w-1" style={{ background: t.preview.accent }} />
              </div>

              <div className="text-xs font-display font-medium text-white/80 mb-0.5">{t.name}</div>
              <div className="text-[9px] text-white/35 font-light leading-relaxed">{t.description}</div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function ProfileEditor({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [profileSlug, setProfileSlug] = useState(user.profileSlug || "");
  const [isPublic, setIsPublic] = useState(user.isPublic || false);

  const profileUrl = profileSlug
    ? `${window.location.origin}${import.meta.env.BASE_URL}profile/${profileSlug}`
    : "";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
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

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/0" />
        <User className="w-4 h-4 text-white/40" />
        <h3 className="text-lg font-display font-light text-white">Public Profile</h3>
        <button
          onClick={() => setEditing(!editing)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[10px] text-white/40 font-light hover:bg-white/[0.06] transition-all"
        >
          {editing ? <X className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
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

        <div className="space-y-3">
          {editing ? (
            <>
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-widest font-display mb-1.5">Avatar</label>
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
                <label className="block text-[10px] text-white/30 uppercase tracking-widest font-display mb-1.5">Bio</label>
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
                <label className="block text-[10px] text-white/30 uppercase tracking-widest font-display mb-1.5">Profile Link</label>
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
            </>
          ) : (
            <div className="space-y-3">
              <div className="glass-card p-4">
                <div className="card-shine" />
                <div className="relative z-[2]">
                  <div className="flex items-center gap-2 mb-2">
                    {isPublic ? <Globe className="w-4 h-4 text-white/40" /> : <Lock className="w-4 h-4 text-white/25" />}
                    <span className="text-xs text-white/50 font-light">{isPublic ? "Public" : "Private"}</span>
                  </div>
                  {profileSlug && isPublic ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-white/[0.03] border border-white/[0.04] rounded-lg">
                        <span className="text-[10px] text-white/30 font-mono truncate flex-1">/profile/{profileSlug}</span>
                        <button onClick={handleCopyLink} className="shrink-0 p-1 hover:bg-white/[0.06] rounded transition-all">
                          {copied ? <Check className="w-3 h-3 text-white/60" /> : <Copy className="w-3 h-3 text-white/30" />}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleShare}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[10px] text-white/40 font-light hover:bg-white/[0.06] transition-all"
                        >
                          <Share2 className="w-3 h-3" />
                          Share
                        </button>
                        <Link
                          href={`/profile/${profileSlug}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[10px] text-white/40 font-light hover:bg-white/[0.06] transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-white/25 font-light">
                      {profileSlug ? "Make your profile public to share it" : "Click Edit to set up your profile link"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BadgeSelector({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [badges, setBadges] = useState<{ available: any[]; earned: string[] }>({ available: [], earned: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUserBadges().then(setBadges);
  }, []);

  const handleSelectBadge = async (badgeId: string | null) => {
    setSaving(true);
    const result = await updateProfile({ selectedBadge: badgeId });
    if (result.success) {
      onUpdate({ ...user, selectedBadge: badgeId });
    }
    setSaving(false);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2.2} className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/0" />
        <Award className="w-4 h-4 text-white/40" />
        <h3 className="text-lg font-display font-light text-white">Badges</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {badges.available.map((badge) => {
          const earned = badges.earned.includes(badge.id);
          const isSelected = user.selectedBadge === badge.id;
          return (
            <button
              key={badge.id}
              onClick={() => earned ? handleSelectBadge(isSelected ? null : badge.id) : undefined}
              disabled={!earned || saving}
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
    </motion.div>
  );
}

function MembershipSection({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const plans = [
    { id: "basic", name: "Basic", price: 199, features: ["5 entries per contest", "Unlimited chat", "Priority support"] },
    { id: "premium", name: "Premium", price: 499, features: ["Unlimited entries", "Verified badge", "Voice AI chat", "VIP support"] },
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

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2.8} className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/0" />
        <Crown className="w-4 h-4 text-white/40" />
        <h3 className="text-lg font-display font-light text-white">Membership</h3>
        {user.isVerified && (
          <div className="flex items-center gap-1 ml-auto px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg">
            <BadgeCheck className="w-3.5 h-3.5 text-white/60" />
            <span className="text-[10px] text-white/50 font-light">Verified</span>
          </div>
        )}
      </div>

      {user.membershipTier !== "free" ? (
        <div className="glass-card p-5">
          <div className="card-shine" />
          <div className="relative z-[2]">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-5 h-5 text-white/50" />
              <div>
                <div className="text-sm font-display font-light text-white capitalize">{user.membershipTier} Plan</div>
                <div className="text-[10px] text-white/30 font-light">Active membership</div>
              </div>
            </div>
            {user.isVerified && (
              <div className="flex items-center gap-2 p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                <BadgeCheck className="w-4 h-4 text-white/50" />
                <span className="text-xs text-white/40 font-light">Verified badge is active on your profile</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plans.map((plan) => (
            <div key={plan.id} className={`glass-card p-5 ${plan.id === "premium" ? "border border-white/[0.12]" : ""}`}>
              <div className="card-shine" />
              <div className="relative z-[2]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-display font-light text-white">{plan.name}</h4>
                  {plan.id === "premium" && (
                    <BadgeCheck className="w-4 h-4 text-white/40" />
                  )}
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-display font-light text-white">{plan.price}</span>
                  <span className="text-xs text-white/30 font-light"> /mo</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-white/40 font-light">
                      <Check className="w-3 h-3 text-white/30" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchasing !== null}
                  className="w-full py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-xs text-white font-light hover:bg-white/[0.08] transition-all disabled:opacity-30"
                >
                  {purchasing === plan.id ? "Processing..." : `Get ${plan.name}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Dashboard({ user: initialUser, entries, onLogout }: { user: any; entries: any[]; onLogout: () => void }) {
  const [user, setUser] = useState(initialUser);
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  const streak = useStreak();

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };

  return (
    <>
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="mb-6">
        <div className="glass-card p-6 sm:p-8">
          <div className="card-shine" />
          <div className="relative z-[2]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                <User className="w-7 h-7 text-white/40" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-display font-light text-white">{user.fullName}</h2>
                  {user.isVerified && <BadgeCheck className="w-5 h-5 text-white/50" />}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/30 font-light">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      <span>{user.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>Member since {memberSince}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-xs text-white/40 font-light hover:bg-white/[0.06] hover:text-white/60 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1.5} className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 text-center">
            <div className="card-shine" />
            <div className="relative z-[2]">
              <Flame className="w-4 h-4 text-white/30 mx-auto mb-2" />
              <AnimatedCounter value={streak} className="text-xl font-display font-light text-white block" />
              <div className="text-[9px] text-white/25 uppercase tracking-widest font-display mt-1">Day Streak</div>
            </div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="card-shine" />
            <div className="relative z-[2]">
              <Trophy className="w-4 h-4 text-white/30 mx-auto mb-2" />
              <AnimatedCounter value={entries.length} className="text-xl font-display font-light text-white block" />
              <div className="text-[9px] text-white/25 uppercase tracking-widest font-display mt-1">Entries</div>
            </div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="card-shine" />
            <div className="relative z-[2]">
              <Target className="w-4 h-4 text-white/30 mx-auto mb-2" />
              <AnimatedCounter value={entries.reduce((s: number, e: any) => s + (e.partnersCompleted || 0), 0)} className="text-xl font-display font-light text-white block" />
              <div className="text-[9px] text-white/25 uppercase tracking-widest font-display mt-1">Partners</div>
            </div>
          </div>
        </div>
      </motion.div>

      <ProfileEditor user={user} onUpdate={handleUserUpdate} />

      <BadgeSelector user={user} onUpdate={handleUserUpdate} />

      <MembershipSection user={user} onUpdate={handleUserUpdate} />

      <ThemeSelector />

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/0" />
          <h3 className="text-lg font-display font-light text-white">Your Giveaway Entries</h3>
          <span className="text-[10px] text-white/25 font-light">{entries.length} total</span>
        </div>

        {entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry: any, i: number) => (
              <motion.div key={entry.id} custom={i + 3} variants={fadeUp} initial="hidden" animate="visible">
                <div className="glass-card p-4 sm:p-5">
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-4 h-4 text-white/30" />
                          <span className="text-sm font-display font-light text-white">{entry.contestName}</span>
                        </div>
                        <div className="text-xs text-white/30 font-mono mb-1">{entry.entryCode}</div>
                        <div className="flex items-center gap-3 text-[10px] text-white/25 font-light">
                          <span>{entry.entryCount} {entry.entryCount === 1 ? "entry" : "entries"}</span>
                          <span className="text-white/10">•</span>
                          <span>{entry.partnersCompleted} partners</span>
                          <span className="text-white/10">•</span>
                          <span>{new Date(entry.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                        <Clock className="w-3 h-3 text-white/25" />
                        <span className="text-[10px] text-white/30 font-light">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 sm:p-12 text-center">
            <div className="card-shine" />
            <div className="relative z-[2]">
              <Gift className="w-10 h-10 text-white/15 mx-auto mb-3" />
              <h4 className="text-base font-display font-light text-white/50 mb-2">No Entries Yet</h4>
              <p className="text-xs text-white/30 font-light mb-4">You haven't entered any giveaway contests yet</p>
              <Link href="/giveaway" className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] border border-white/[0.08] rounded-xl text-xs text-white/60 font-light hover:bg-white/[0.08] transition-all">
                <Sparkles className="w-3.5 h-3.5" />
                Browse Contests
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </>
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

      <main className="relative z-10 pt-28 pb-20 sm:pt-36 sm:pb-32">
        <div className="container mx-auto px-4 max-w-3xl">

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] mb-4">
              <Shield className="w-3 h-3 text-white/40" />
              <span className="text-[10px] text-white/40 font-display uppercase tracking-widest">My Account</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-extralight text-white mb-4 tracking-tight">
              {user ? "Dashboard" : "Account"}
            </h1>
            <p className="text-sm sm:text-base text-white/35 font-light max-w-xl mx-auto leading-relaxed">
              {user ? "Track your giveaway entries and manage your profile" : "Sign in or create an account to track your giveaway entries"}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : user ? (
            <Dashboard user={user} entries={entries} onLogout={handleLogout} />
          ) : (
            <AuthForm onSuccess={loadUser} />
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
