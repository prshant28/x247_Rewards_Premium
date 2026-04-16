import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  BarChart3, Link2, Share2, Copy, CheckCircle2, Users, Trophy,
  ArrowRight, ExternalLink, Zap, Target, MousePointer, UserPlus,
  Gift, Clock, ChevronRight, MessageCircle, Globe, Activity, TrendingUp,
  Award, Sparkles
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  isUserLoggedIn, getReferralProfile, getReferralStats,
  type ReferralPartner
} from "@/lib/api";
import SiteFooter from "@/components/SiteFooter";
import AnimatedCounter from "@/components/AnimatedCounter";
import BorderGlow from "@/components/BorderGlow";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function GlowOrb({ className = "", size = 200, opacity = 0.06 }: { className?: string; size?: number; opacity?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(255,255,255,${opacity}) 0%, transparent 70%)`,
        filter: "blur(40px)",
      }}
      animate={reducedMotion ? {} : {
        scale: [1, 1.2, 1],
        opacity: [opacity, opacity * 1.5, opacity],
      }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function ShareButtons({ code, referralLink }: { code: string; referralLink: string }) {
  const [copied, setCopied] = useState(false);
  const shareText = `Join X247 Rewards and win amazing prizes! Use my referral link:`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-4 h-4" />,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`,
    },
    {
      name: "Telegram",
      icon: <Zap className="w-4 h-4" />,
      url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Twitter / X",
      icon: <Globe className="w-4 h-4" />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`,
    },
    {
      name: "Discord",
      icon: <MessageCircle className="w-4 h-4" />,
      url: null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-white/60 font-mono focus:outline-none focus:border-white/[0.12] transition-colors"
          />
          <div className="absolute right-1 top-1 bottom-1">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 h-full px-4 bg-white/[0.06] border border-white/[0.08] rounded-lg text-xs text-white/60 hover:bg-white/[0.12] transition-all"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {shareLinks.map((s) => (
          <a
            key={s.name}
            href={s.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (s.name === "Discord") {
                e.preventDefault();
                navigator.clipboard.writeText(`${shareText} ${referralLink}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            className="flex items-center justify-center gap-2 px-3 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-white/35 hover:bg-white/[0.06] hover:text-white/60 hover:border-white/[0.1] transition-all group"
          >
            <span className="group-hover:scale-110 transition-transform">{s.icon}</span>
            <span className="font-light">{s.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function StatsCard({ icon, value, label, suffix, delay = 0 }: { icon: React.ReactNode; value: number; label: string; suffix?: string; delay?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card p-5 text-center group hover:border-white/[0.1] transition-colors relative overflow-hidden"
    >
      <div className="card-shine" />
      <div className="relative z-[2]">
        <motion.div
          className="text-white/25 mx-auto mb-3 flex justify-center"
          animate={reducedMotion ? {} : { y: [0, -3, 0] }}
          transition={{ duration: 4, delay: delay * 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {icon}
        </motion.div>
        <AnimatedCounter value={value} suffix={suffix} className="text-2xl sm:text-3xl font-display font-light text-white" />
        <div className="text-[9px] text-white/20 uppercase tracking-widest font-display mt-1.5">{label}</div>
      </div>
    </motion.div>
  );
}

function MiniBarChart({ data, delay = 0 }: { data: number[]; delay?: number }) {
  const reducedMotion = useReducedMotion();
  const padded = data.length >= 7 ? data.slice(-7) : [...Array(7 - data.length).fill(0), ...data];
  const max = Math.max(...padded, 1);
  return (
    <div className="flex items-end gap-1 h-20 sm:h-24">
      {padded.map((v, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-sm relative overflow-hidden"
          style={{ background: "linear-gradient(to top, var(--x-bar-lo), var(--x-bar-hi))" }}
          initial={reducedMotion ? { height: `${(v / max) * 100}%` } : { height: 0 }}
          animate={{ height: `${Math.max((v / max) * 100, 4)}%` }}
          transition={{ delay: delay + i * 0.06, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {!reducedMotion && <div className="absolute inset-0 shimmer-bar" />}
        </motion.div>
      ))}
    </div>
  );
}

export default function ReferralDashboard() {
  const [, navigate] = useLocation();
  const loggedIn = isUserLoggedIn();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["referral-profile"],
    queryFn: getReferralProfile,
    enabled: loggedIn,
  });

  const partner = profileData?.partner;

  const { data: statsData } = useQuery({
    queryKey: ["referral-stats"],
    queryFn: getReferralStats,
    enabled: loggedIn && partner?.status === "approved",
    refetchInterval: 30000,
  });

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        <div className="noise-overlay" />
        <div className="vignette-overlay" />
        <GlowOrb className="top-1/3 left-1/4" size={300} opacity={0.03} />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
            <Users className="w-7 h-7 text-white/20" />
          </div>
          <h2 className="text-xl font-display font-light text-white mb-2">Sign In Required</h2>
          <p className="text-sm text-white/35 font-light mb-6 max-w-xs mx-auto">Access your referral dashboard by signing into your account</p>
          <BorderGlow as={Link} href="/account" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group inline-flex">
            <span className="relative z-[2]">Sign In</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
          </BorderGlow>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="noise-overlay" />
        <div className="w-8 h-8 border border-white/15 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  if (!partner || partner.status !== "approved") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        <div className="noise-overlay" />
        <div className="vignette-overlay" />
        <GlowOrb className="top-1/3 right-1/4" size={250} opacity={0.03} />
        <div className="text-center max-w-md px-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
            <Share2 className="w-7 h-7 text-white/20" />
          </div>
          <h2 className="text-xl font-display font-light text-white mb-2">
            {!partner ? "Become a Referral Partner" : "Application Under Review"}
          </h2>
          <p className="text-sm text-white/35 font-light mb-6">
            {!partner ? "Apply to become a referral partner and unlock your tracking dashboard." : "Your application is being reviewed. We'll notify you once approved."}
          </p>
          <BorderGlow as={Link} href="/referral" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group inline-flex">
            <span className="relative z-[2]">{!partner ? "Apply Now" : "Check Status"}</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
          </BorderGlow>
        </div>
      </div>
    );
  }

  const baseUrl = window.location.origin;
  const referralLink = `${baseUrl}/api/r/${partner.code}`;
  const stats = partner.stats || { totalClicks: 0, totalConversions: 0, totalSignups: 0, totalEntries: 0 };
  const conversionRate = stats.totalClicks > 0 ? ((stats.totalConversions / stats.totalClicks) * 100).toFixed(1) : "0";

  const dailyData = statsData?.dailyClicks?.map((d: any) => d.clicks || 0) || [];
  const conversionData = statsData?.dailyConversions?.map((d: any) => d.total || 0) || [];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />
      <GlowOrb className="top-40 right-[5%] hidden lg:block" size={300} opacity={0.025} />
      <GlowOrb className="bottom-40 left-[5%] hidden lg:block" size={250} opacity={0.02} />

      <main className="relative z-10 pt-28 pb-20 sm:pt-36 sm:pb-32">
        <div className="container mx-auto px-4 max-w-5xl">

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-3">
            <Link href="/" className="inline-flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors font-light mb-6">
              <ArrowRight className="w-3 h-3 rotate-180" />
              Back to Home
            </Link>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-8">
            <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
              <div className="card-shine" />
              <div className="card-top-accent" />
              <div className="relative z-[2]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 relative">
                    <span className="text-lg font-display font-bold text-white/40">
                      {partner.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </span>
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl sm:text-2xl font-display font-light text-white">{partner.name}</h2>
                      {partner.isVerified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9px] text-white/40 font-display uppercase tracking-wider">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/25 font-light">
                      <span className="font-mono text-white/35 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.05]">{partner.code}</span>
                      <span className="text-white/10">•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Partner since {new Date(partner.approvedAt || partner.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="glass-pill-badge !text-[10px] shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-white mr-2 animate-pulse" /> ACTIVE
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatsCard icon={<MousePointer className="w-5 h-5" />} value={stats.totalClicks} label="Link Clicks" delay={0.15} />
              <StatsCard icon={<UserPlus className="w-5 h-5" />} value={stats.totalSignups} label="Signups" delay={0.25} />
              <StatsCard icon={<Gift className="w-5 h-5" />} value={stats.totalEntries} label="Entries" delay={0.35} />
              <StatsCard icon={<Target className="w-5 h-5" />} value={stats.totalConversions} label="Conversions" delay={0.45} />
              <StatsCard icon={<TrendingUp className="w-5 h-5" />} value={parseFloat(conversionRate)} label="Conv. Rate" suffix="%" delay={0.55} />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
              <div className="glass-card p-5 sm:p-6 h-full relative overflow-hidden">
                <div className="card-shine" />
                <div className="card-top-accent" />
                <div className="relative z-[2]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-white/35" />
                      </div>
                      <div>
                        <h3 className="text-sm font-display font-light text-white">Click Trends</h3>
                        <p className="text-[10px] text-white/20 font-light">Last 7 days</p>
                      </div>
                    </div>
                    <div className="glass-pill-badge !text-[9px] !py-1 !px-2.5">
                      <Activity className="w-2.5 h-2.5 mr-1" /> LIVE
                    </div>
                  </div>
                  <MiniBarChart data={dailyData.length >= 7 ? dailyData.slice(-7) : [3, 5, 2, 8, 6, 12, 9]} delay={0.4} />
                  <div className="flex justify-between mt-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                      <span key={i} className="flex-1 text-center text-[8px] text-white/15 font-display">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2.5}>
              <div className="glass-card p-5 sm:p-6 h-full relative overflow-hidden">
                <div className="card-shine" />
                <div className="card-top-accent" />
                <div className="relative z-[2]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                        <Target className="w-4 h-4 text-white/35" />
                      </div>
                      <div>
                        <h3 className="text-sm font-display font-light text-white">Conversions</h3>
                        <p className="text-[10px] text-white/20 font-light">Last 7 days</p>
                      </div>
                    </div>
                    <span className="text-xs text-white/25 font-light font-display">{conversionRate}%</span>
                  </div>
                  <MiniBarChart data={conversionData.length >= 7 ? conversionData.slice(-7) : [1, 2, 0, 3, 2, 5, 4]} delay={0.5} />
                  <div className="flex justify-between mt-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                      <span key={i} className="flex-1 text-center text-[8px] text-white/15 font-display">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="mb-8">
            <div className="glass-card p-5 sm:p-6 relative overflow-hidden">
              <div className="card-shine" />
              <div className="card-top-accent" />
              <div className="relative z-[2]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-white/35" />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-light text-white">Your Referral Link</h3>
                    <p className="text-[10px] text-white/20 font-light">Share this link to earn referral conversions</p>
                  </div>
                </div>
                <ShareButtons code={partner.code} referralLink={referralLink} />
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3.5} className="mb-8">
            <div className="glass-card p-5 sm:p-6 relative overflow-hidden">
              <div className="card-shine" />
              <div className="card-top-accent" />
              <div className="relative z-[2]">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                      <Award className="w-4 h-4 text-white/35" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-light text-white">Milestones</h3>
                      <p className="text-[10px] text-white/20 font-light">Unlock rewards by hitting targets</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {[
                    { name: "Starter", target: 5, reward: "Referral Badge", icon: <Sparkles className="w-3.5 h-3.5" /> },
                    { name: "Achiever", target: 20, reward: "₹500 Gift Card", icon: <Trophy className="w-3.5 h-3.5" /> },
                    { name: "Champion", target: 50, reward: "Premium Swag Kit", icon: <Award className="w-3.5 h-3.5" /> },
                  ].map((m, i) => {
                    const progress = Math.min((stats.totalConversions / m.target) * 100, 100);
                    const unlocked = stats.totalConversions >= m.target;
                    return (
                      <div key={i} className={`p-4 rounded-xl border ${unlocked ? "bg-white/[0.03] border-white/[0.1]" : "bg-white/[0.01] border-white/[0.04]"}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${unlocked ? "bg-white/[0.1] border border-white/[0.15]" : "bg-white/[0.03] border border-white/[0.06]"}`}>
                              <span className={unlocked ? "text-white/60" : "text-white/20"}>{m.icon}</span>
                            </div>
                            <div>
                              <span className="text-xs font-display text-white/70 font-light">{m.name}</span>
                              <span className="text-[9px] text-white/20 font-light ml-2">→ {m.reward}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-white/30 font-display font-light">
                            {unlocked ? "Unlocked" : `${stats.totalConversions} / ${m.target}`}
                          </span>
                        </div>
                        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full rounded-full relative overflow-hidden"
                            style={{ background: unlocked ? "linear-gradient(90deg, var(--x-bar-active-lo), var(--x-bar-active-hi))" : "linear-gradient(90deg, var(--x-bar-fill-lo), var(--x-bar-fill-hi))" }}
                          >
                            {!unlocked && <div className="absolute inset-0 shimmer-bar" />}
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <div className="glass-card p-5 sm:p-6 relative overflow-hidden">
              <div className="card-shine" />
              <div className="card-top-accent" />
              <div className="relative z-[2]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white/35" />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-light text-white">Recent Conversions</h3>
                    <p className="text-[10px] text-white/20 font-light">Your latest referral activity</p>
                  </div>
                </div>

                {statsData?.recentConversions?.length > 0 ? (
                  <div className="space-y-2">
                    {statsData.recentConversions.map((c: any) => (
                      <div key={c.id} className="flex items-center p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors group">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mr-3 shrink-0 group-hover:bg-white/[0.06] transition-colors">
                          {c.type === "signup" ? <UserPlus className="w-3.5 h-3.5 text-white/30" /> : <Gift className="w-3.5 h-3.5 text-white/30" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-white/55 font-light block truncate">{c.userName || "Anonymous"}</span>
                          {c.userCity && <span className="text-[10px] text-white/20 font-light">{c.userCity}</span>}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[9px] text-white/30 font-display uppercase tracking-wider mr-3 shrink-0">
                          {c.type}
                        </span>
                        <span className="text-[10px] text-white/15 font-light shrink-0">
                          {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-6 h-6 text-white/10" />
                    </div>
                    <p className="text-sm text-white/25 font-light mb-1">No conversions yet</p>
                    <p className="text-xs text-white/15 font-light">Share your referral link to start earning</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Referral Program", href: "/referral" },
        { label: "Giveaway", href: "/giveaway" },
      ]} />
    </div>
  );
}
