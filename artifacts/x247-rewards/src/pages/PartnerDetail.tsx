import React, { useState, useEffect, useRef } from "react";
import BorderGlow from "@/components/BorderGlow";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ArrowRight, ArrowLeft, ExternalLink, Gift, Zap, Lock, CheckCircle2,
  Star, Info, ListChecks, Trophy, Camera, Sparkles, BadgeCheck, Copy,
  Share2, ChevronRight, ShieldCheck, Clock, Users, Target, Rocket,
  BookOpen, AlertCircle, CheckSquare, Square, TrendingUp,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getPartner, trackClick, type PartnerData } from "@/lib/api";
import SiteFooter from "@/components/SiteFooter";

/* ─── animation variants ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};
const itemFade: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const tabVariants: Variants = {
  enter: { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

type Tab = "what-you-get" | "details" | "how-to-enter";

/* ─── whatYouGet parsing helpers ─── */
function parseWhatYouGet(text: string): string[] {
  return text
    .split(/[,|•\n;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
}

function getBenefitIcon(text: string): React.ReactNode {
  const t = text.toLowerCase();
  if (/prize|cash|money|₹|\$|win|lakh|crore|reward/.test(t)) return <Trophy className="w-5 h-5 text-white/50" />;
  if (/intern|job|career|opport|recruit|placement/.test(t)) return <Rocket className="w-5 h-5 text-white/50" />;
  if (/cert|badge|award|recogni/.test(t)) return <BadgeCheck className="w-5 h-5 text-white/50" />;
  if (/learn|course|train|skill|workshop|bootcamp|educat/.test(t)) return <BookOpen className="w-5 h-5 text-white/50" />;
  if (/community|network|meet|connect|people/.test(t)) return <Users className="w-5 h-5 text-white/50" />;
  if (/free|zero|no cost|compliment|gratis/.test(t)) return <Sparkles className="w-5 h-5 text-white/50" />;
  if (/growth|build|launch|start|scale/.test(t)) return <TrendingUp className="w-5 h-5 text-white/50" />;
  return <Gift className="w-5 h-5 text-white/50" />;
}

/* ─── helpers ─── */
function getPartnerIcon(accent: string) {
  if (accent === "navy") return <ExternalLink className="w-7 h-7 sm:w-8 sm:h-8 text-white/60" />;
  if (accent === "red") return <Star className="w-7 h-7 sm:w-8 sm:h-8 text-white/60" />;
  return <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-white/60" />;
}
function getBannerGradient(_accent: string) {
  return "linear-gradient(145deg, rgba(40,40,40,0.4) 0%, rgba(10,10,10,0.95) 100%)";
}

/* ─── sticky CTA ─── */
function StickyCTA({ partner, onRegister, isComingSoon }: { partner: PartnerData; onRegister: () => void; isComingSoon: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (isComingSoon) return null;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:pb-6"
        >
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-3 sm:p-4 flex items-center gap-3">
              <div className="card-shine" />
              <div className="relative z-[2] flex items-center gap-3 w-full">
                <div className="hidden sm:flex w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.1] items-center justify-center shrink-0">
                  {getPartnerIcon(partner.accent)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/40 font-light truncate">{partner.name}</p>
                  <p className="text-xs text-white/70 font-display font-light truncate">
                    Earn {partner.entryPoints ?? 1} draw {(partner.entryPoints ?? 1) === 1 ? "entry" : "entries"} on registration
                  </p>
                </div>
                {partner.registrationUrl && (
                  <a
                    href={partner.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onRegister}
                    className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-display font-medium hover:bg-white/90 transition-colors"
                  >
                    Register Now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── interactive checklist ─── */
function Checklist({ steps }: { steps: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(steps.map(() => false));
  const toggle = (i: number) => setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
  const done = checked.filter(Boolean).length;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-display">Progress</p>
        <div className="flex items-center gap-2">
          <div className="h-1 w-32 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full bg-white/40 rounded-full"
              animate={{ width: `${(done / steps.length) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="text-[10px] text-white/30 font-display">{done}/{steps.length}</span>
        </div>
      </div>
      {steps.map((text, i) => (
        <button
          key={i}
          onClick={() => toggle(i)}
          className="w-full flex items-start gap-3 text-left group"
        >
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${checked[i] ? "bg-white/20 border-white/40" : "border-white/15 group-hover:border-white/30"}`}>
            {checked[i] ? <CheckSquare className="w-3.5 h-3.5 text-white" /> : <Square className="w-3.5 h-3.5 text-white/20" />}
          </div>
          <p className={`text-sm font-light leading-relaxed transition-colors ${checked[i] ? "text-white/30 line-through" : "text-white/55"}`}>{text}</p>
        </button>
      ))}
    </div>
  );
}

/* ─── share helper ─── */
function useShare(partner: PartnerData) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: partner.name, text: partner.tagline, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const copyRegUrl = async () => {
    await navigator.clipboard.writeText(partner.registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return { share, copyRegUrl, copied };
}

/* ─── main component ─── */
function PartnerDetailContent({ partner }: { partner: PartnerData }) {
  const hasWhatYouGet = !!partner.whatYouGet?.trim();
  const [activeTab, setActiveTab] = useState<Tab>(hasWhatYouGet ? "what-you-get" : "details");
  const isComingSoon = !partner.isActive;
  const { share, copyRegUrl, copied } = useShare(partner);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleRegisterClick = () => {
    if (partner.registrationUrl) trackClick(partner.id);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    ...(hasWhatYouGet ? [{ key: "what-you-get" as Tab, label: "What You Get", icon: <Sparkles className="w-4 h-4" /> }] : []),
    { key: "details", label: "Details", icon: <Info className="w-4 h-4" /> },
    { key: "how-to-enter", label: "How to Enter", icon: <ListChecks className="w-4 h-4" /> },
  ];

  const checklistSteps = [
    `Visit ${partner.name} via the Register Now button`,
    "Create your account on the partner platform",
    "Fill in all required form fields completely",
    "Submit the registration form successfully",
    "Take a clear screenshot of your confirmation page",
    "Come back to X247 Rewards and go to Giveaway",
    `Select "${partner.name}" and upload your screenshot`,
    "Submit your entry and save your entry code",
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <StickyCTA partner={partner} onRegister={handleRegisterClick} isComingSoon={isComingSoon} />

      <main className="relative z-10 pt-32 sm:pt-40 pb-32 sm:pb-40">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* breadcrumb */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
            <div className="flex items-center gap-1.5 text-sm text-white/30 font-light">
              <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/partners" className="hover:text-white/60 transition-colors">Partners</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white/50 truncate max-w-[160px]">{partner.name}</span>
            </div>
          </motion.div>

          {/* ── Hero Banner ── */}
          <motion.div ref={heroRef} initial="hidden" animate="visible" variants={fadeUp} className="mb-8 sm:mb-12">
            <div className="glass-card overflow-hidden relative">
              <div className="card-shine" />
              <div className="relative" style={{ background: getBannerGradient(partner.accent) }}>
                <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 relative z-[2]">
                  <motion.div variants={scaleIn} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center shrink-0">
                    {getPartnerIcon(partner.accent)}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.12 }}
                      className="flex items-center gap-2.5 mb-2 flex-wrap"
                    >
                      <span className="text-[10px] font-display font-medium text-white/30 uppercase tracking-[0.15em]">{partner.category}</span>
                      {partner.badge && (
                        <div className="premium-badge premium-badge-hot !text-[9px]">
                          <Zap className="w-2.5 h-2.5 mr-1" />{partner.badge}
                        </div>
                      )}
                      {isComingSoon && (
                        <div className="premium-badge !text-[9px]" style={{ background: "var(--x-badge-bg)", border: "1px solid var(--x-badge-border)" }}>
                          <Lock className="w-2.5 h-2.5 mr-1" />Coming Soon
                        </div>
                      )}
                      {partner.badgeSecondary && (
                        <div className="premium-badge !text-[9px]" style={{ background: "var(--x-badge-bg)", border: "1px solid var(--x-badge-border)" }}>
                          <Star className="w-2.5 h-2.5 mr-1 text-white/50" />
                          <span className="text-white/60">{partner.badgeSecondary}</span>
                        </div>
                      )}
                      {partner.isRequired && (
                        <div className="premium-badge !text-[9px]" style={{ background: "var(--x-badge-bg)", border: "1px solid var(--x-badge-border)" }}>
                          <AlertCircle className="w-2.5 h-2.5 mr-1 text-white/60" />
                          <span className="text-white/60">Required</span>
                        </div>
                      )}
                    </motion.div>
                    <motion.h1
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.18 }}
                      className="text-2xl sm:text-3xl md:text-4xl font-display font-light text-white mb-1"
                    >
                      {partner.name}
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }} className="text-sm text-white/40 font-light">
                      {partner.tagline}
                    </motion.p>
                  </div>

                  {/* Quick action buttons */}
                  {!isComingSoon && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35, duration: 0.45 }}
                      className="flex items-center gap-2 shrink-0"
                    >
                      <button
                        onClick={copyRegUrl}
                        title="Copy registration link"
                        className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.09] transition-all"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-white/60" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={share}
                        title="Share this partner"
                        className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.09] transition-all"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      {partner.registrationUrl && (
                        <a
                          href={partner.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleRegisterClick}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] border border-white/[0.14] text-white text-sm font-display font-light hover:bg-white/[0.12] transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Register
                        </a>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* stats strip */}
              <div className="px-6 sm:px-10 py-4 sm:py-5 border-t border-white/[0.04] relative z-[2]">
                <div className="flex items-center gap-6 sm:gap-10 flex-wrap">
                  {[
                    { label: "Clicks", value: partner.stats.clicks, icon: <Target className="w-3 h-3" /> },
                    { label: "Impressions", value: partner.stats.impressions, icon: <Users className="w-3 h-3" /> },
                    { label: "Form Fills", value: partner.stats.formFills, icon: <BookOpen className="w-3 h-3" /> },
                    { label: `+${partner.entryPoints ?? 1} ${(partner.entryPoints ?? 1) === 1 ? "Entry" : "Entries"}`, value: null, icon: <Trophy className="w-3 h-3" /> },
                  ].map((stat, i) => (
                    <React.Fragment key={stat.label}>
                      {i > 0 && <div className="w-px h-7 bg-white/[0.06]" />}
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.07 }}
                        className="flex items-center gap-1.5"
                      >
                        <span className="text-white/25">{stat.icon}</span>
                        <div>
                          {stat.value !== null && (
                            <span className="text-sm font-display font-light text-white mr-1">{stat.value}</span>
                          )}
                          <span className="text-[10px] text-white/30 font-display uppercase tracking-widest">{stat.label}</span>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="ml-auto flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-[10px] text-white/30 font-display uppercase tracking-widest">Verified Partner</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Coming soon gate */}
          {isComingSoon && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8 sm:mb-12">
              <div className="glass-card p-8 sm:p-12 text-center">
                <div className="card-top-accent" />
                <div className="card-shine" />
                <div className="relative z-[2]">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-7 h-7 text-white/30" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-3">Registration Not Yet Available</h3>
                  <p className="text-white/40 font-light text-sm leading-relaxed max-w-md mx-auto mb-6">
                    This partner hasn't launched yet. Join our community to be the first to know when registration opens.
                  </p>
                  <BorderGlow as={Link} href="/partners" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                    <span className="relative z-[2]">Browse Active Partners</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                  </BorderGlow>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Tabs ── */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="flex gap-1 mb-6 p-1 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-display font-light transition-all duration-300 ${
                    activeTab === t.key
                      ? "bg-white/[0.07] text-white border border-white/[0.09] shadow-sm"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {t.icon}
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ══════ WHAT YOU GET ══════ */}
              {activeTab === "what-you-get" && hasWhatYouGet && (
                <motion.div key="wyg" variants={tabVariants} initial="enter" animate="center" exit="exit" className="space-y-5">

                  {/* Section header */}
                  <div className="glass-card px-6 sm:px-8 py-5 relative overflow-hidden">
                    <div className="card-shine" />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% -20%, var(--x-glow-soft) 0%, transparent 65%)" }} />
                    <div className="relative z-[2] flex items-center gap-4">
                      <motion.div variants={scaleIn} className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center shrink-0">
                        <Gift className="w-6 h-6 text-white/60" />
                      </motion.div>
                      <div>
                        <p className="text-[9px] font-display uppercase tracking-[0.22em] text-white/30 mb-1">Benefits &amp; Rewards</p>
                        <p className="text-base sm:text-lg font-display font-light text-white leading-snug">
                          Register with {partner.name} to unlock all of the below
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Parsed solution cards */}
                  {(() => {
                    const items = parseWhatYouGet(partner.whatYouGet!);
                    return (
                      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {items.map((item, i) => (
                          <motion.div key={i} variants={itemFade} className="glass-card p-5">
                            <div className="card-shine" />
                            <div className="relative z-[2] flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                                {getBenefitIcon(item)}
                              </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-sm text-white font-light leading-relaxed">{item}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    );
                  })()}

                  {/* X247 entry benefit chip */}
                  <motion.div variants={itemFade} className="glass-card p-5 relative overflow-hidden">
                    <div className="card-shine" />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, var(--x-glow-grad) 0%, transparent 60%)" }} />
                    <div className="relative z-[2] flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex flex-col items-center justify-center shrink-0">
                        <span className="text-lg font-display font-light text-white leading-none">+{partner.entryPoints ?? 1}</span>
                        <span className="text-[8px] text-white/30 uppercase tracking-widest font-display mt-0.5">{(partner.entryPoints ?? 1) === 1 ? "Entry" : "Entries"}</span>
                      </div>
                      <div>
                        <p className="text-[9px] font-display uppercase tracking-[0.18em] text-white/30 mb-1">X247 Bonus</p>
                        <p className="text-sm text-white font-light leading-snug">
                          Earn {partner.entryPoints ?? 1} prize draw {(partner.entryPoints ?? 1) === 1 ? "entry" : "entries"} into X247 Rewards daily giveaway
                        </p>
                        <p className="text-[11px] text-white/35 font-light mt-1">More partners = more entries = higher winning chances.</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Why Register */}
                  <div className="glass-card p-6 sm:p-8">
                    <div className="card-top-accent" />
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <h3 className="text-base sm:text-lg font-display font-light text-white mb-5">Why Register?</h3>
                      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                        {[
                          `Complete ${partner.name} registration to unlock the prize`,
                          `Earn ${partner.entryPoints ?? 1} guaranteed X247 giveaway ${(partner.entryPoints ?? 1) === 1 ? "entry" : "entries"}`,
                          "More partners you complete = higher winning chances",
                          "Winners announced within 24–48 hours after contest fills",
                          "Zero cost — registration is completely free",
                        ].map((text, i) => (
                          <motion.div key={i} variants={itemFade} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-md bg-white/[0.05] border border-white/[0.09] flex items-center justify-center shrink-0 mt-0.5">
                              <BadgeCheck className="w-3 h-3 text-white/45" />
                            </div>
                            <p className="text-sm text-white/55 font-light leading-relaxed">{text}</p>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>

                  {!isComingSoon && (
                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                      {partner.registrationUrl && (
                        <BorderGlow as="a" href={partner.registrationUrl} target="_blank" rel="noopener noreferrer" onClick={handleRegisterClick} borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                          <ExternalLink className="w-4 h-4 mr-2 relative z-[2]" />
                          <span className="relative z-[2]">Register &amp; Claim</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                        </BorderGlow>
                      )}
                      <BorderGlow as={Link} href="/giveaway" borderRadius={16} glowRadius={20} cardBg="rgba(10,10,10,0.7)" className="premium-btn premium-btn-lg premium-btn-ghost glass-btn-effect group">
                        <Trophy className="w-4 h-4 mr-2 relative z-[2]" />
                        <span className="relative z-[2]">Enter Giveaway</span>
                      </BorderGlow>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ══════ DETAILS ══════ */}
              {activeTab === "details" && (
                <motion.div key="details" variants={tabVariants} initial="enter" animate="center" exit="exit" className="space-y-5">

                  {/* Your Benefit */}
                  <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
                    <div className="card-shine" />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, var(--x-glow-grad) 0%, transparent 60%)" }} />
                    <div className="relative z-[2] flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex flex-col items-center justify-center shrink-0">
                          <span className="text-2xl font-display font-light text-white leading-none">+{partner.entryPoints ?? 1}</span>
                          <span className="text-[8px] text-white/30 uppercase tracking-widest font-display mt-0.5">{(partner.entryPoints ?? 1) === 1 ? "Entry" : "Entries"}</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-display uppercase tracking-[0.18em] text-white/30 mb-1">Your Benefit</p>
                          <p className="text-white font-light text-sm sm:text-base leading-snug">
                            Earn <span className="font-normal">{partner.entryPoints ?? 1} prize draw {(partner.entryPoints ?? 1) === 1 ? "entry" : "entries"}</span> after completing registration
                          </p>
                          <p className="text-white/35 font-light text-xs mt-1">Each entry = one chance to win in the daily prize draw</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0">
                        <Trophy className="w-3 h-3 text-white/40" />
                        <span className="text-[10px] font-display text-white/40 uppercase tracking-widest">Daily Draw</span>
                      </div>
                    </div>
                  </div>

                  {/* About */}
                  <div className="glass-card p-6 sm:p-8">
                    <div className="card-top-accent" />
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <h3 className="text-lg sm:text-xl font-display font-light text-white mb-4">About This Partner</h3>
                      <p className="text-white/45 font-light text-sm leading-relaxed">{partner.description}</p>
                    </div>
                  </div>

                  {/* Eligibility & Key Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="glass-card p-6 sm:p-7">
                      <div className="card-top-accent" />
                      <div className="card-shine" />
                      <div className="relative z-[2]">
                        <h3 className="text-base font-display font-light text-white mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-white/40" />
                          Key Info
                        </h3>
                        <motion.ul variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                          {[
                            "1 registration = 1 giveaway entry",
                            ...(partner.isRequired ? ["REQUIRED — must be completed"] : []),
                            ...(partner.badgeSecondary ? [`${partner.badgeSecondary} restriction`] : []),
                            "Free to register",
                            "Winners in 24–48 hrs",
                          ].map((text, i) => (
                            <motion.li key={i} variants={itemFade} className="flex items-start gap-2.5 text-sm text-white/50 font-light">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white/25 shrink-0 mt-0.5" />
                              {text}
                            </motion.li>
                          ))}
                        </motion.ul>
                      </div>
                    </div>

                    <div className="glass-card p-6 sm:p-7">
                      <div className="card-top-accent" />
                      <div className="card-shine" />
                      <div className="relative z-[2]">
                        <h3 className="text-base font-display font-light text-white mb-4 flex items-center gap-2">
                          <Target className="w-4 h-4 text-white/40" />
                          Who Can Register
                        </h3>
                        <div className="space-y-3">
                          {[
                            partner.badgeSecondary ? partner.badgeSecondary : "Open for all users",
                            "Must be 18+ years old",
                            "Valid email address required",
                            "One entry per person per contest",
                          ].map((text, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-sm text-white/50 font-light">
                              <div className="w-1 h-1 rounded-full bg-white/25 shrink-0 mt-2" />
                              {text}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Registration URL quick copy */}
                  {partner.registrationUrl && !isComingSoon && (
                    <div className="glass-card p-4 sm:p-5">
                      <div className="card-shine" />
                      <div className="relative z-[2] flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-display uppercase tracking-widest text-white/25 mb-1">Registration URL</p>
                          <p className="text-xs text-white/50 font-light truncate">{partner.registrationUrl}</p>
                        </div>
                        <button
                          onClick={copyRegUrl}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs font-display font-light hover:bg-white/[0.09] transition-all shrink-0"
                        >
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                        <a
                          href={partner.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleRegisterClick}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs font-display font-light hover:bg-white/[0.09] transition-all shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open
                        </a>
                      </div>
                    </div>
                  )}

                  {!isComingSoon && (
                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                      {partner.registrationUrl && (
                        <BorderGlow as="a" href={partner.registrationUrl} target="_blank" rel="noopener noreferrer" onClick={handleRegisterClick} borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                          <ExternalLink className="w-4 h-4 mr-2 relative z-[2]" />
                          <span className="relative z-[2]">Register Now</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                        </BorderGlow>
                      )}
                      <BorderGlow as={Link} href="/giveaway" borderRadius={16} glowRadius={20} cardBg="rgba(10,10,10,0.7)" className="premium-btn premium-btn-lg premium-btn-ghost glass-btn-effect group">
                        <Trophy className="w-4 h-4 mr-2 relative z-[2]" />
                        <span className="relative z-[2]">Enter Giveaway</span>
                      </BorderGlow>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ══════ HOW TO ENTER ══════ */}
              {activeTab === "how-to-enter" && (
                <motion.div key="how" variants={tabVariants} initial="enter" animate="center" exit="exit" className="space-y-5">

                  {/* Interactive Checklist */}
                  <div className="glass-card p-6 sm:p-8">
                    <div className="card-top-accent" />
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <h3 className="text-lg sm:text-xl font-display font-light text-white mb-2">Registration Checklist</h3>
                      <p className="text-xs text-white/35 font-light mb-6">Tap each step to track your progress</p>
                      <Checklist steps={checklistSteps} />
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="glass-card p-6 sm:p-8">
                    <div className="card-top-accent" />
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <h3 className="text-base font-display font-light text-white mb-5 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-white/40" />
                        Pro Tips
                      </h3>
                      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                        {[
                          "Use a clear, readable screenshot — blurry screenshots may be rejected",
                          "Screenshot must show your name / email to verify ownership",
                          `Register with ${partner.name} before submitting your X247 entry`,
                          "Multiple entries per contest are not allowed — one per person",
                          "Save your X247 entry code immediately after submission",
                        ].map((tip, i) => (
                          <motion.div key={i} variants={itemFade} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                            <div className="w-5 h-5 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-[9px] font-display text-white/40">{String(i + 1).padStart(2, "0")}</span>
                            </div>
                            <p className="text-xs text-white/50 font-light leading-relaxed">{tip}</p>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>

                  {/* Screenshot guide */}
                  <div className="glass-card p-6 sm:p-7">
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <h3 className="text-base font-display font-light text-white mb-4 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-white/40" />
                        Screenshot Guide
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { label: "Must include", items: ["Your name / email", "Confirmation message", "Partner platform name", "Date if visible"] },
                          { label: "Avoid", items: ["Cropped / partial screens", "Blurry or dark images", "Screenshots of screenshots", "Edited / altered images"] },
                        ].map((col) => (
                          <div key={col.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <p className="text-[10px] font-display uppercase tracking-widest text-white/30 mb-3">{col.label}</p>
                            <ul className="space-y-1.5">
                              {col.items.map((item) => (
                                <li key={item} className="flex items-center gap-2 text-xs text-white/50 font-light">
                                  <div className="w-1 h-1 rounded-full bg-white/25 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {!isComingSoon && (
                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                      {partner.registrationUrl && (
                        <BorderGlow as="a" href={partner.registrationUrl} target="_blank" rel="noopener noreferrer" onClick={handleRegisterClick} borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                          <ExternalLink className="w-4 h-4 mr-2 relative z-[2]" />
                          <span className="relative z-[2]">Register Now</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                        </BorderGlow>
                      )}
                      <BorderGlow as={Link} href="/giveaway" borderRadius={16} glowRadius={20} cardBg="rgba(10,10,10,0.7)" className="premium-btn premium-btn-lg premium-btn-ghost glass-btn-effect">
                        <Trophy className="w-4 h-4 mr-2 relative z-[2]" />
                        <span className="relative z-[2]">Enter Giveaway</span>
                      </BorderGlow>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>

        </div>
      </main>

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Partners", href: "/partners" },
        { label: "Giveaway", href: "/giveaway" },
      ]} />
    </div>
  );
}

export default function PartnerDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: partner, isLoading, error } = useQuery({
    queryKey: ["partner", slug],
    queryFn: () => getPartner(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (!partner || error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-light mb-4">Partner Not Found</h1>
          <Link href="/partners" className="text-white/50 hover:text-white transition-colors">← Back to Partners</Link>
        </div>
      </div>
    );
  }

  return <PartnerDetailContent partner={partner} />;
}
