import React, { useState, useRef } from "react";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import { Link } from "wouter";
import BorderGlow from "@/components/BorderGlow";
import SiteFooter from "@/components/SiteFooter";
import {
  UserPlus, Trophy, Gift, Sparkles, ArrowRight, Check,
  Shield, Zap, Star, Crown, Diamond,
  BarChart3, Globe, Users, Lock, RefreshCw, Layers,
  ChevronDown, Target, Flame, CreditCard, Headphones,
  CalendarDays, Wallet, Hash, Eye, Repeat, Award, BadgeCheck,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ── Section header (Partners pattern) ── */
function SectionHeader({
  badge,
  title,
  sub,
}: {
  badge: string;
  title: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="text-center mb-10 sm:mb-14">
      <div className="glass-pill-badge mb-6 mx-auto">
        <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block" />
        {badge}
      </div>
      <h2 className="text-xl sm:text-3xl md:text-4xl font-display font-light mb-4 text-foreground tracking-tight">
        {title}
      </h2>
      {sub && (
        <p className="text-foreground/40 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto tracking-wide">
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── Step card (3-step overview) ── */
function StepCard({
  num,
  icon: Icon,
  title,
  desc,
  items,
}: {
  num: string;
  icon: any;
  title: string;
  desc: string;
  items?: string[];
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <div className="glass-card p-6 sm:p-8 group relative overflow-hidden h-full">
        <div className="card-top-accent" />
        <div className="card-shine" />
        <div className="relative z-[2] flex flex-col h-full">
          <div className="flex items-start justify-between mb-5">
            <BorderGlow
              borderRadius={14}
              glowRadius={12}
              cardBg="rgba(255,255,255,0.05)"
              className="icon-circle w-14 h-14"
            >
              <Icon className="w-6 h-6" />
            </BorderGlow>
            <span className="text-[10px] font-display font-medium text-foreground/30 uppercase tracking-[0.18em]">
              Step {num}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-light text-foreground mb-2">{title}</h3>
          <p className="text-foreground/40 font-light text-xs sm:text-sm leading-relaxed mb-4">{desc}</p>
          {items && (
            <div className="mt-auto pt-2">
              <p className="text-[9px] font-display uppercase tracking-[0.18em] text-foreground/25 mb-2">What's included</p>
              <div className="grid grid-cols-1 gap-1.5">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                  >
                    <Check className="w-3 h-3 text-foreground/50 shrink-0" />
                    <span className="text-[11px] text-foreground/55 font-light leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Mechanic / Partner / Trust card (small icon + title + desc) ── */
function InfoCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="glass-card p-5 sm:p-6 group relative overflow-hidden h-full">
      <div className="card-top-accent" />
      <div className="card-shine" />
      <div className="relative z-[2]">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-foreground/50 group-hover:text-foreground/70 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <h4 className="text-sm sm:text-base font-display font-light text-foreground mb-2">{title}</h4>
        <p className="text-[12px] sm:text-[13px] text-foreground/40 font-light leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ── Tier card ── */
function TierCard({
  tier,
  icon: Icon,
  price,
  entries,
  perMonth,
  perks,
  isBlack = false,
}: {
  tier: string;
  icon: any;
  price: string;
  entries: string;
  perMonth: string;
  perks: string[];
  isBlack?: boolean;
}) {
  return (
    <div className="glass-card p-6 group relative overflow-hidden h-full">
      <div className="card-top-accent" />
      <div className="card-shine" />
      <div className="relative z-[2] flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <BorderGlow
            borderRadius={12}
            glowRadius={10}
            cardBg="rgba(255,255,255,0.05)"
            className="icon-circle w-11 h-11"
          >
            <Icon className="w-4 h-4" />
          </BorderGlow>
          {isBlack && (
            <div className="premium-badge premium-badge-hot !text-[9px]">
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              Top Tier
            </div>
          )}
        </div>
        <span className="text-[10px] font-display font-medium text-foreground/30 uppercase tracking-[0.18em] mb-1">
          Membership
        </span>
        <h3 className="text-lg font-display font-light text-foreground mb-1">{tier}</h3>
        <p className="text-foreground/45 font-light text-xs mb-5">{price}</p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="text-base font-display font-light text-foreground">{entries}</div>
            <div className="text-[9px] text-foreground/30 uppercase tracking-widest font-display mt-0.5">Per Contest</div>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="text-base font-display font-light text-foreground">{perMonth}</div>
            <div className="text-[9px] text-foreground/30 uppercase tracking-widest font-display mt-0.5">Per Month</div>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-white/[0.04] space-y-1.5">
          {perks.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="w-3 h-3 text-foreground/40 shrink-0" />
              <span className="text-[11px] text-foreground/55 font-light">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── FAQ accordion ── */
function FaqItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `hiw-faq-panel-${idx}`;
  const buttonId = `hiw-faq-button-${idx}`;
  return (
    <div className="glass-card relative overflow-hidden">
      <div className="card-top-accent" />
      <div className="relative z-[2]">
        <button
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left"
        >
          <span className="text-sm sm:text-[15px] font-display font-light text-foreground/85 leading-snug">{q}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} className="shrink-0">
            <ChevronDown className="w-4 h-4 text-foreground/40" />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-1 text-foreground/50 font-light text-[13px] sm:text-sm leading-relaxed">
                {a}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */

const STEPS = [
  {
    num: "01",
    icon: UserPlus,
    title: "Create your account",
    desc: "Sign up for free in seconds. Set up your profile, choose your username, and you're in — no payment card required.",
    items: [
      "Free forever, no credit card",
      "Instant access to all contests",
      "Public profile with shareable link",
      "Upgrade your tier anytime",
    ],
  },
  {
    num: "02",
    icon: Trophy,
    title: "Enter giveaway contests",
    desc: "Browse active contests from partner brands. Each contest has an entry window — submit your entry before it closes to be included in the draw.",
    items: [
      "Up to 15 entries per contest (Black tier)",
      "Entry limit resets with each new contest",
      "Entries stack — more entries = better odds",
      "Join as many open contests as you like",
    ],
  },
  {
    num: "03",
    icon: Gift,
    title: "Win real prizes",
    desc: "When a contest closes, our randomised draw picks the winner. Winners are notified instantly and announced publicly within 24 hours.",
    items: [
      "Draws are randomised and tamper-proof",
      "Black members get 24h advance announcement",
      "Prize shipped or credited within 7 days",
      "All winners listed on the Winners Hall",
    ],
  },
];

const MECHANICS = [
  { icon: Hash, title: "Entries per contest", desc: "Each tier grants a fixed number of entries you can put into a single giveaway. More entries = proportionally better chance of winning that specific draw." },
  { icon: CalendarDays, title: "Monthly entry cap", desc: "In addition to per-contest limits, there's a monthly cap on total entries. This resets on the 1st of every month, regardless of your billing date." },
  { icon: Repeat, title: "Contest windows", desc: "Each contest runs for a defined period (visible on the contest card). You can enter at any point during the window — timing within the window doesn't affect your odds." },
  { icon: Flame, title: "Streak & bonus entries", desc: "Black members earn 3× bonus entries during their birthday week. Consistent participation can also unlock streak bonuses in future seasons." },
  { icon: BarChart3, title: "XP & levelling", desc: "Every entry earns you XP. Earn enough XP and your level goes up, unlocking cosmetic rewards and priority queue status in future contests." },
  { icon: Wallet, title: "No carry-over", desc: "Unused monthly entries do not carry over. Maximise your entries by entering as many eligible contests as possible each month." },
];

const DRAW_STEPS = [
  { icon: Lock, label: "Contest closes", desc: "Entry window ends. No new entries accepted." },
  { icon: Hash, label: "Entry pool finalised", desc: "All valid entries compiled into an immutable pool." },
  { icon: Zap, label: "Random seed generated", desc: "Cryptographic seed created at draw time — unpredictable and unique." },
  { icon: Award, label: "Winner selected", desc: "Seed applied to pool. Winner is mathematically determined." },
  { icon: BadgeCheck, label: "Winner verified", desc: "Identity confirmed. Result logged to draw history." },
  { icon: Globe, label: "Public announcement", desc: "Winner listed in Winners Hall within 24 hours." },
];

const DRAW_TRUST = [
  { icon: Shield, title: "Tamper-proof", desc: "Draw seeds are generated externally and cannot be influenced by X247 staff or any participant." },
  { icon: Eye, title: "Auditable history", desc: "Every completed draw is logged in our public Winners Hall with draw ID, timestamp, and entry pool size." },
  { icon: Users, title: "Equal opportunity", desc: "Within your tier, every entry has exactly the same chance. Premium tiers simply give you more entries, not a higher individual probability." },
  { icon: Layers, title: "No pay-to-win", desc: "Paid tiers offer more entries — not inflated odds per entry. A free member with 1 entry has the same 1-in-N chance as any other single entry." },
];

const PARTNERS = [
  { icon: CreditCard, title: "Brands fund the prizes", desc: "Each partner funds the prize pool for their giveaway. This keeps X247 free for members — brands pay, not you." },
  { icon: Target, title: "Partners set the rules", desc: "Partners define the prize, duration, and entry cap for their giveaway. X247 handles the draw infrastructure." },
  { icon: Globe, title: "Verified partnerships", desc: "Every partner goes through a vetting process. We only list legitimate brands — no unverified or suspicious sponsors." },
  { icon: BarChart3, title: "Real, anonymised insights", desc: "Partners receive aggregated, anonymised data on contest engagement. No personal data is shared without consent." },
  { icon: Headphones, title: "Dedicated partner support", desc: "Partners have a dedicated account manager. If a brand changes terms or withdraws, you'll be notified immediately." },
  { icon: Shield, title: "Prize guarantee", desc: "If a brand fails to deliver a prize, X247 guarantees the winner is made whole — either with an equivalent prize or credit." },
];

const FAQS = [
  { q: "Do I need to pay anything to enter giveaways?", a: "No. The Free tier is completely free and has no expiry. You can enter up to 1 contest slot per giveaway and 29 total entries per month at zero cost." },
  { q: "How are winners actually chosen?", a: "Winners are selected using a cryptographically seeded random number generator applied to the finalised entry pool. The draw cannot be influenced by anyone at X247 or externally. Draw logs are permanently stored and viewable in the Winners Hall." },
  { q: "What happens if I enter and then cancel my subscription?", a: "Entries already submitted for an open contest remain valid even if you downgrade or cancel before the draw closes. Your membership tier at the time of entry is what counts." },
  { q: "Can I enter the same contest multiple times?", a: "Yes — your tier determines how many entries you can submit to a single contest. All entries are submitted at once when you click 'Enter'. You cannot top-up entries for the same contest later." },
  { q: "How long does prize delivery take?", a: "Digital prizes (vouchers, credits) are delivered within 24 hours of winner verification. Physical prizes are dispatched within 7 business days and delivered within 7–14 business days depending on location." },
  { q: "Is my personal data shared with brand partners?", a: "No personal data is ever shared with partners without your explicit consent. Partners receive only aggregated, anonymised engagement metrics. Winner delivery details are shared only with the relevant partner for prize fulfilment, under strict data processing agreements." },
  { q: "What is the Black tier physical card?", a: "Black members receive a premium embossed membership card shipped to their registered address within 7–14 business days of subscribing. It is a luxury physical keepsake — there are no payment functions on the card." },
  { q: "How does the AI chat feature work?", a: "All paid tiers include access to our AI chat assistant which can help with questions about your account, active contests, partner details, and general support queries. Gold and Black tiers additionally include voice-mode AI chat." },
];

const TRUST_PILLS = [
  { icon: Shield, label: "100% Fair" },
  { icon: Eye, label: "Fully Transparent" },
  { icon: Lock, label: "Secure" },
  { icon: RefreshCw, label: "Always Free to Join" },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-[70px] pb-20 sm:pb-32">

        {/* ── Hero ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center py-20 sm:py-28 px-4"
        >
          <div className="glass-pill-badge inline-flex mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block" />
            Transparent &amp; Simple
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-light text-foreground mb-5 leading-tight tracking-tight">
            How X247 Works
          </h1>
          <p className="text-foreground/45 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto tracking-wide mb-8">
            No tricks, no hidden rules — just a clean, fair system designed to give you the best shot at winning real prizes from top brands. Here&apos;s every detail, laid bare.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-2xl mx-auto">
            {TRUST_PILLS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-foreground/55 text-[11px] font-display font-light tracking-wide"
                >
                  <Icon className="w-3 h-3 text-foreground/40" />
                  <span>{p.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="container mx-auto px-4 max-w-6xl">

          {/* ── Three-step Process ── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="mb-16 sm:mb-24"
          >
            <SectionHeader
              badge="The Process"
              title="Three steps. Infinite possibilities."
              sub="Getting started takes under 2 minutes. Here's how the whole journey looks from sign-up to winning."
            />
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
            >
              {STEPS.map((s) => (
                <StepCard key={s.num} {...s} />
              ))}
            </motion.div>
          </motion.section>

          {/* ── Entry Mechanics ── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="mb-16 sm:mb-24"
          >
            <SectionHeader
              badge="Entry System"
              title="How entries are counted"
              sub="Your membership tier determines how many entries you can submit per contest — and per month in total."
            />
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              {MECHANICS.map((m, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <InfoCard {...m} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* ── The Draw ── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="mb-16 sm:mb-24"
          >
            <SectionHeader
              badge="The Draw"
              title="Transparent, verifiable draws"
              sub="We use a cryptographically seeded randomised draw engine. Every draw result is auditable and logged permanently."
            />
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5 sm:gap-6">
              {/* Numbered process steps */}
              <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
                <div className="card-top-accent" />
                <div className="card-shine" />
                <div className="relative z-[2]">
                  <p className="text-[10px] font-display uppercase tracking-[0.18em] text-foreground/30 mb-5">Draw process</p>
                  <div className="space-y-3">
                    {DRAW_STEPS.map((step, i) => {
                      const Icon = step.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                        >
                          <span className="text-[10px] font-display font-medium text-foreground/30 uppercase tracking-widest pt-1 w-6 shrink-0">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-foreground/50 shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-display font-light text-foreground/85">{step.label}</div>
                            <div className="text-[12px] text-foreground/40 font-light leading-relaxed mt-0.5">{step.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Trust cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {DRAW_TRUST.map((item, i) => (
                  <InfoCard key={i} {...item} />
                ))}
              </div>
            </div>
          </motion.section>

          {/* ── Membership Tiers ── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="mb-16 sm:mb-24"
          >
            <SectionHeader
              badge="Membership Tiers"
              title="Four tiers. You choose your level."
              sub="Every tier is fully functional. Paid tiers simply multiply your entries and unlock premium perks."
            />
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8"
            >
              <motion.div variants={fadeUp}>
                <TierCard tier="Free" icon={Sparkles} price="₹0 forever" entries="1" perMonth="29" perks={["Text AI chat", "All partners access", "Standard support"]} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <TierCard tier="Silver" icon={Star} price="₹199 / month" entries="3" perMonth="69" perks={["Priority support", "Early partner access", "Partner insights"]} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <TierCard tier="Gold" icon={Crown} price="₹499 / month" entries="7" perMonth="149" perks={["Voice AI chat", "Verified badge", "Exclusive partner deals"]} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <TierCard tier="Black" icon={Diamond} price="₹999 / month" entries="15" perMonth="299" perks={["Physical VIP card", "Concierge + account manager", "Black-only events"]} isBlack />
              </motion.div>
            </motion.div>
            <div className="text-center">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-foreground/55 hover:text-foreground/85 transition-colors text-sm font-display font-light"
              >
                Compare all tiers in detail
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.section>

          {/* ── Partner Brands ── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="mb-16 sm:mb-24"
          >
            <SectionHeader
              badge="Partner Brands"
              title="How brands participate"
              sub="X247 partners are real brands that sponsor prizes — from gadgets to fashion to lifestyle experiences."
            />
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              {PARTNERS.map((p, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <InfoCard {...p} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* ── FAQ ── */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="mb-16 sm:mb-24 max-w-3xl mx-auto"
          >
            <SectionHeader
              badge="Questions"
              title="Everything you need to know"
            />
            <motion.div variants={stagger} className="space-y-3">
              {FAQS.map((f, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <FaqItem q={f.q} a={f.a} idx={i} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* ── Final CTA ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
          >
            <div className="glass-card p-6 sm:p-10 text-center">
              <div className="card-top-accent" />
              <div className="card-shine" />
              <div className="relative z-[2]">
                <div className="glass-pill-badge mb-6 mx-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block" />
                  Start today
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-light text-foreground mb-4">
                  Ready to enter?
                </h3>
                <p className="text-foreground/40 font-light text-sm leading-relaxed max-w-xl mx-auto mb-8">
                  It&apos;s free, it&apos;s fair, and you could win something incredible. Your first entry is one click away.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                  <BorderGlow as={Link} href="/account" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                    <UserPlus className="w-4 h-4 mr-2 relative z-[2]" />
                    <span className="relative z-[2]">Create free account</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                  </BorderGlow>
                  <BorderGlow as={Link} href="/giveaway" borderRadius={16} glowRadius={20} cardBg="rgba(10,10,10,0.6)" className="premium-btn premium-btn-lg premium-btn-ghost glass-btn-effect group">
                    <Trophy className="w-4 h-4 mr-2 relative z-[2]" />
                    <span className="relative z-[2]">Browse contests</span>
                  </BorderGlow>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-foreground/40 text-[11px] font-display font-light tracking-wide">
                  <span className="inline-flex items-center gap-1.5"><Shield className="w-3 h-3" />No credit card</span>
                  <span className="inline-flex items-center gap-1.5"><Zap className="w-3 h-3" />Instant access</span>
                  <span className="inline-flex items-center gap-1.5"><Lock className="w-3 h-3" />No spam ever</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <SiteFooter
        links={[
          { label: "Home", href: "/" },
          { label: "Partners", href: "/partners" },
          { label: "Giveaway", href: "/giveaway" },
          { label: "Pricing", href: "/pricing" },
        ]}
      />
    </div>
  );
}
