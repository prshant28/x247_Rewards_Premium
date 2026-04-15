import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  BarChart3, Link2, Share2, Copy, CheckCircle2, Users, Trophy,
  ArrowRight, ExternalLink, Zap, Target, MousePointer, UserPlus,
  Gift, Clock, ChevronRight, MessageCircle, Globe
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  isUserLoggedIn, getReferralProfile, getReferralStats,
  type ReferralPartner
} from "@/lib/api";
import SiteFooter from "@/components/SiteFooter";
import AnimatedCounter from "@/components/AnimatedCounter";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

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
        <input
          type="text"
          value={referralLink}
          readOnly
          className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-white/60 font-mono focus:outline-none"
        />
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-xs text-white/60 hover:bg-white/[0.1] transition-all shrink-0"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
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
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-white/40 hover:bg-white/[0.06] hover:text-white/60 transition-all"
          >
            {s.icon}
            <span className="font-light">{s.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function StatsCard({ icon, value, label, suffix }: { icon: React.ReactNode; value: number; label: string; suffix?: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="card-shine" />
      <div className="relative z-[2]">
        <div className="text-white/30 mx-auto mb-2 flex justify-center">{icon}</div>
        <AnimatedCounter value={value} suffix={suffix} className="text-xl sm:text-2xl font-display font-light text-white" />
        <div className="text-[9px] text-white/25 uppercase tracking-widest font-display mt-1">{label}</div>
      </div>
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Users className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-sm text-white/40 font-light mb-4">Please sign in to access your dashboard</p>
          <Link href="/account">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white font-light cursor-pointer">
              Sign In <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (!partner || partner.status !== "approved") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Share2 className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-sm text-white/40 font-light mb-4">
            {!partner ? "You haven't applied as a referral partner yet." : "Your application is still pending approval."}
          </p>
          <Link href="/referral">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white font-light cursor-pointer">
              {!partner ? "Apply Now" : "Check Status"} <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const baseUrl = window.location.origin;
  const referralLink = `${baseUrl}/api/r/${partner.code}`;
  const stats = partner.stats || { totalClicks: 0, totalConversions: 0, totalSignups: 0, totalEntries: 0 };
  const conversionRate = stats.totalClicks > 0 ? ((stats.totalConversions / stats.totalClicks) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-28 pb-20 sm:pt-36 sm:pb-32">
        <div className="container mx-auto px-4 max-w-5xl">

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-8">
            <div className="glass-card p-6 sm:p-8">
              <div className="card-shine" />
              <div className="relative z-[2]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <Share2 className="w-7 h-7 text-white/40" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl sm:text-2xl font-display font-light text-white">{partner.name}</h2>
                      {partner.isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[9px] text-white/50 font-display uppercase tracking-wider">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/30 font-light">
                      <span className="font-mono text-white/40">{partner.code}</span>
                      <span className="text-white/10">•</span>
                      <span>Partner since {new Date(partner.approvedAt || partner.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatsCard icon={<MousePointer className="w-4 h-4" />} value={stats.totalClicks} label="Link Clicks" />
              <StatsCard icon={<UserPlus className="w-4 h-4" />} value={stats.totalSignups} label="Signups" />
              <StatsCard icon={<Gift className="w-4 h-4" />} value={stats.totalEntries} label="Entries" />
              <StatsCard icon={<Target className="w-4 h-4" />} value={stats.totalConversions} label="Conversions" />
              <StatsCard icon={<BarChart3 className="w-4 h-4" />} value={parseFloat(conversionRate)} label="Conv. Rate" suffix="%" />
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="mb-8">
            <div className="glass-card p-5 sm:p-6">
              <div className="card-shine" />
              <div className="relative z-[2]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-light text-white">Your Referral Link</h3>
                    <p className="text-[10px] text-white/25 font-light">Share this link to earn referrals</p>
                  </div>
                </div>
                <ShareButtons code={partner.code} referralLink={referralLink} />
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/0" />
              <h3 className="text-lg font-display font-light text-white">Recent Conversions</h3>
            </div>

            {statsData?.recentConversions?.length > 0 ? (
              <div className="space-y-2">
                {statsData.recentConversions.map((c: any) => (
                  <div key={c.id} className="glass-card p-4">
                    <div className="card-shine" />
                    <div className="relative z-[2] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                          {c.type === "signup" ? <UserPlus className="w-3.5 h-3.5 text-white/30" /> : <Gift className="w-3.5 h-3.5 text-white/30" />}
                        </div>
                        <div>
                          <span className="text-xs text-white/60 font-light">{c.userName || "Anonymous"}</span>
                          {c.userCity && <span className="text-[10px] text-white/25 font-light ml-2">{c.userCity}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[9px] text-white/35 font-display uppercase tracking-wider">
                          {c.type}
                        </span>
                        <span className="text-[10px] text-white/20 font-light">
                          {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <div className="card-shine" />
                <div className="relative z-[2]">
                  <Trophy className="w-8 h-8 text-white/15 mx-auto mb-3" />
                  <p className="text-sm text-white/30 font-light mb-1">No conversions yet</p>
                  <p className="text-xs text-white/20 font-light">Share your referral link to start earning conversions</p>
                </div>
              </div>
            )}
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
