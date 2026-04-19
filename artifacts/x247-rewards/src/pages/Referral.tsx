import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Users, Share2, ArrowRight, Trophy, Zap, Target, Gift,
  BarChart3, Link2, MessageCircle, Globe, Sparkles, Shield,
  CheckCircle2, Loader2, ChevronRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  isUserLoggedIn, applyReferralPartner, getReferralProfile,
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

const benefits = [
  { icon: <Link2 className="w-5 h-5" />, title: "Unique Referral Link", desc: "Get your personal sharing link to track every click and conversion." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Real-Time Dashboard", desc: "Monitor clicks, signups, and entries from your referrals in real time." },
  { icon: <Share2 className="w-5 h-5" />, title: "Share Anywhere", desc: "Share via WhatsApp, Discord, Twitter, Telegram — wherever your audience is." },
  { icon: <Trophy className="w-5 h-5" />, title: "Earn Recognition", desc: "Top referrers get featured on our platform and exclusive rewards." },
  { icon: <Target className="w-5 h-5" />, title: "Performance Tracking", desc: "See exactly how many people signed up and entered giveaways through you." },
  { icon: <Shield className="w-5 h-5" />, title: "Verified Badge", desc: "Approved partners get a verified badge and priority support." },
];

const steps = [
  { step: "01", title: "Apply", desc: "Fill out a quick application form with your details and social presence." },
  { step: "02", title: "Get Approved", desc: "Our team reviews your application and approves you within 24-48 hours." },
  { step: "03", title: "Share Your Link", desc: "Get your unique referral link and start sharing with your network." },
  { step: "04", title: "Track & Earn", desc: "Monitor your referrals in real-time from your partner dashboard." },
];

function ApplicationForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    bio: "",
    motivation: "",
    audienceSize: "",
    phone: "",
    whatsapp: "",
    discord: "",
    twitter: "",
    telegram: "",
    instagram: "",
    youtube: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const socialMedia: Record<string, string> = {};
    if (form.whatsapp) socialMedia.whatsapp = form.whatsapp;
    if (form.discord) socialMedia.discord = form.discord;
    if (form.twitter) socialMedia.twitter = form.twitter;
    if (form.telegram) socialMedia.telegram = form.telegram;
    if (form.instagram) socialMedia.instagram = form.instagram;
    if (form.youtube) socialMedia.youtube = form.youtube;

    const result = await applyReferralPartner({
      bio: form.bio || undefined,
      motivation: form.motivation || undefined,
      audienceSize: form.audienceSize || undefined,
      phone: form.phone || undefined,
      socialMedia: Object.keys(socialMedia).length ? socialMedia : undefined,
    });

    if (result.error) {
      setError(result.error);
    } else {
      onSuccess();
    }
    setSubmitting(false);
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-foreground placeholder-white/20 font-light focus:outline-none focus:border-white/[0.12] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-foreground/40 font-display uppercase tracking-wider mb-1.5 block">Why do you want to be a referral partner? *</label>
        <textarea
          value={form.motivation}
          onChange={(e) => setForm({ ...form, motivation: e.target.value })}
          required
          rows={3}
          placeholder="Tell us why you'd be a great referral partner..."
          className={inputClass + " resize-none"}
        />
      </div>

      <div>
        <label className="text-xs text-foreground/40 font-display uppercase tracking-wider mb-1.5 block">About You</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={2}
          placeholder="Brief bio — who you are, what you do..."
          className={inputClass + " resize-none"}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-foreground/40 font-display uppercase tracking-wider mb-1.5 block">Audience Size</label>
          <select
            value={form.audienceSize}
            onChange={(e) => setForm({ ...form, audienceSize: e.target.value })}
            className={inputClass + " appearance-none"}
          >
            <option value="" className="bg-[#0a0a0a]">Select range</option>
            <option value="1-100" className="bg-[#0a0a0a]">1 – 100 people</option>
            <option value="100-500" className="bg-[#0a0a0a]">100 – 500 people</option>
            <option value="500-1000" className="bg-[#0a0a0a]">500 – 1,000 people</option>
            <option value="1000-5000" className="bg-[#0a0a0a]">1,000 – 5,000 people</option>
            <option value="5000+" className="bg-[#0a0a0a]">5,000+ people</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-foreground/40 font-display uppercase tracking-wider mb-1.5 block">Phone (Optional)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 XXXXX XXXXX"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-foreground/40 font-display uppercase tracking-wider mb-2 block">Social Media (at least one recommended)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "whatsapp", label: "WhatsApp", placeholder: "+91 number or group link" },
            { key: "discord", label: "Discord", placeholder: "Username or server link" },
            { key: "twitter", label: "Twitter / X", placeholder: "@handle" },
            { key: "telegram", label: "Telegram", placeholder: "@handle or group link" },
            { key: "instagram", label: "Instagram", placeholder: "@handle" },
            { key: "youtube", label: "YouTube", placeholder: "Channel URL" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <span className="text-[10px] text-foreground/25 font-light block mb-1">{label}</span>
              <input
                type="text"
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-xs text-foreground/50 font-light bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !form.motivation.trim()}
        className="w-full py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-foreground font-light hover:bg-white/[0.1] transition-all disabled:opacity-30 font-display"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit Application"}
      </button>
    </form>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-white/[0.06] text-foreground/50 border-white/[0.08]",
    approved: "bg-white/[0.08] text-foreground/70 border-white/[0.12]",
    rejected: "bg-white/[0.04] text-foreground/30 border-white/[0.06]",
    suspended: "bg-white/[0.04] text-foreground/30 border-white/[0.06]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-display uppercase tracking-widest border ${styles[status] || styles.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "approved" ? "bg-white/60" : status === "pending" ? "bg-white/30 animate-pulse" : "bg-white/20"}`} />
      {status}
    </span>
  );
}

export default function Referral() {
  const [, navigate] = useLocation();
  const loggedIn = isUserLoggedIn();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["referral-profile"],
    queryFn: getReferralProfile,
    enabled: loggedIn,
  });

  const partner = profileData?.partner;

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-28 pb-20 sm:pt-36 sm:pb-32">
        <div className="container mx-auto px-4 max-w-5xl">

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-16 sm:mb-24">
            <div className="glass-pill-badge mb-6">
              <Share2 className="w-3 h-3 text-foreground/50 mr-2" />
              Referral Program
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-foreground tracking-tight">
              Become a Referral Partner
            </h1>
            <p className="text-foreground/50 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
              Share X247 Rewards with your network. Track clicks, conversions, and earn recognition as a verified partner.
            </p>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="mb-12">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Partners", value: 25, icon: <Users className="w-4 h-4" /> },
                { label: "Referrals", value: 1200, icon: <Share2 className="w-4 h-4" />, suffix: "+" },
                { label: "Contests", value: 50, icon: <Trophy className="w-4 h-4" />, suffix: "+" },
                { label: "Prizes Won", value: 5, icon: <Gift className="w-4 h-4" />, prefix: "₹", suffix: "L+" },
              ].map((s) => (
                <div key={s.label} className="glass-card p-4 text-center">
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <div className="text-foreground/30 mx-auto mb-2 flex justify-center">{s.icon}</div>
                    <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} className="text-xl font-display font-light text-foreground" />
                    <div className="text-[9px] text-foreground/25 uppercase tracking-widest font-display mt-1">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/0" />
              <h2 className="text-lg sm:text-xl font-display font-light text-foreground">How It Works</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <motion.div key={i} custom={i + 3} variants={fadeUp} initial="hidden" animate="visible">
                  <div className="glass-card p-5 sm:p-6 h-full">
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <span className="text-2xl font-display font-extralight text-foreground/15 block mb-3">{step.step}</span>
                      <h3 className="text-sm font-display font-light text-foreground mb-2">{step.title}</h3>
                      <p className="text-xs text-foreground/30 font-light leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/0" />
              <h2 className="text-lg sm:text-xl font-display font-light text-foreground">Partner Benefits</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((b, i) => (
                <motion.div key={i} custom={i + 6} variants={fadeUp} initial="hidden" animate="visible">
                  <div className="glass-card p-5 h-full">
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3 text-foreground/40">
                        {b.icon}
                      </div>
                      <h3 className="text-sm font-display font-light text-foreground mb-1.5">{b.title}</h3>
                      <p className="text-xs text-foreground/30 font-light leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={9} className="mb-8">
            <div className="glass-card p-6 sm:p-8">
              <div className="card-shine" />
              <div className="relative z-[2]">
                {!loggedIn ? (
                  <div className="text-center py-6">
                    <Users className="w-10 h-10 text-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-display font-light text-foreground mb-2">Sign in to Apply</h3>
                    <p className="text-xs text-foreground/30 font-light mb-6 max-w-md mx-auto">
                      You need an X247 Rewards account to apply as a referral partner. Create one or sign in to get started.
                    </p>
                    <Link href="/account">
                      <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-foreground font-light hover:bg-white/[0.1] transition-all cursor-pointer">
                        Sign In / Create Account <ArrowRight className="w-4 h-4" />
                      </span>
                    </Link>
                  </div>
                ) : isLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                  </div>
                ) : partner ? (
                  <div className="text-center py-4">
                    <StatusBadge status={partner.status} />
                    <h3 className="text-lg font-display font-light text-foreground mt-4 mb-2">
                      {partner.status === "approved" ? "You're a Referral Partner!" : partner.status === "pending" ? "Application Under Review" : "Application Status"}
                    </h3>
                    <p className="text-xs text-foreground/30 font-light mb-2">Code: <span className="text-foreground/50 font-mono">{partner.code}</span></p>
                    {partner.status === "pending" && (
                      <p className="text-xs text-foreground/30 font-light max-w-md mx-auto mb-4">Your application is being reviewed. We'll notify you once it's approved — usually within 24-48 hours.</p>
                    )}
                    {partner.status === "rejected" && partner.rejectionReason && (
                      <p className="text-xs text-foreground/30 font-light max-w-md mx-auto mb-4">Reason: {partner.rejectionReason}</p>
                    )}
                    {partner.status === "approved" && (
                      <Link href="/referral/dashboard">
                        <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-foreground font-light hover:bg-white/[0.1] transition-all cursor-pointer mt-2">
                          Go to Dashboard <ChevronRight className="w-4 h-4" />
                        </span>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-foreground/40" />
                      </div>
                      <div>
                        <h3 className="text-lg font-display font-light text-foreground">Apply as Referral Partner</h3>
                        <p className="text-xs text-foreground/30 font-light">Fill out the form below to get started</p>
                      </div>
                    </div>
                    <ApplicationForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ["referral-profile"] })} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Giveaway", href: "/giveaway" },
        { label: "Partners", href: "/partners" },
      ]} />
    </div>
  );
}
