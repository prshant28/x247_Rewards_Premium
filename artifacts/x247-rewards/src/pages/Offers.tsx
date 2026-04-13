import React from "react";
import BorderGlow from "@/components/BorderGlow";
import CardNav from "@/components/CardNav";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ExternalLink,
  Clock,
  Star,
  Zap,
  CheckCircle2,
  Users,
  ShieldCheck,
  Crown,
  Globe,
  Target,
  Trophy,
  Gift,
  Activity,
  Headphones,
} from "lucide-react";
import { Link } from "wouter";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

const offers = [
  {
    title: "Flat 2x Entry Bonus",
    desc: "Register with both partner links and get your entry counted twice. Double your chances of winning daily prizes instantly.",
    tag: "Limited Time",
    status: "active" as const,
    highlight: true,
    accent: "red" as const,
    details: ["Valid for first-time entries", "Both partner registrations required", "Automatic 2x multiplier"],
    icon: <Zap className="w-5 h-5" />,
    number: "01",
  },
  {
    title: "Early Bird Swag Drop",
    desc: "First 100 entries every Monday receive an exclusive branded sticker pack shipped free. Be fast, be first.",
    tag: "Weekly",
    status: "active" as const,
    highlight: false,
    accent: "neutral" as const,
    details: ["Every Monday resets", "First 100 entries only", "Free worldwide shipping"],
    icon: <Clock className="w-5 h-5" />,
    number: "02",
  },
  {
    title: "Weekend Mega Draw",
    desc: "Every Saturday, we run a special mega draw with 3x the usual prize pool. All entries from the week are eligible.",
    tag: "Every Saturday",
    status: "active" as const,
    highlight: false,
    accent: "navy" as const,
    details: ["3x prize pool", "All week's entries count", "Winners announced Sunday"],
    icon: <Star className="w-5 h-5" />,
    number: "03",
  },
  {
    title: "Community Exclusive Drops",
    desc: "Join our WhatsApp community to unlock access to flash giveaways and surprise reward drops shared twice a month.",
    tag: "Members Only",
    status: "active" as const,
    highlight: false,
    accent: "neutral" as const,
    details: ["WhatsApp community access", "Flash giveaways", "Twice monthly drops"],
    icon: <ShieldCheck className="w-5 h-5" />,
    number: "04",
  },
];

function getAccentClasses(accent: "red" | "navy" | "neutral") {
  if (accent === "navy") return { card: "glass-card-accent-navy", icon: "icon-circle-navy", topAccent: "card-top-accent card-top-accent-navy" };
  if (accent === "red") return { card: "glass-card-accent-red", icon: "icon-circle-red", topAccent: "card-top-accent card-top-accent-red" };
  return { card: "", icon: "", topAccent: "card-top-accent" };
}

export default function Offers() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <CardNav
        logo={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-base sm:text-lg tracking-wide text-white font-normal">X247</span>
          </div>
        }
        baseColor="rgba(6, 6, 6, 0.92)"
        menuColor="#fff"
        buttonBgColor="rgba(255,255,255,0.06)"
        buttonTextColor="#fff"
        onCtaClick={() => { window.location.href = "/"; }}
        renderLink={(href, children, className) => (
          <Link href={href} className={className}>{children}</Link>
        )}
        items={[
          {
            label: "Navigate",
            icon: <Globe className="w-3 h-3" />,
            bgColor: "rgba(20, 25, 60, 0.15)",
            textColor: "#fff",
            links: [
              { label: "Home", href: "/", spa: true, icon: <Sparkles className="w-3.5 h-3.5" /> },
              { label: "How it Works", href: "/#how-it-works", icon: <Target className="w-3.5 h-3.5" /> },
              { label: "Rewards", href: "/#rewards", icon: <Trophy className="w-3.5 h-3.5" /> },
            ],
          },
          {
            label: "Explore",
            icon: <Zap className="w-3 h-3" />,
            bgColor: "rgba(120, 20, 30, 0.12)",
            textColor: "#fff",
            links: [
              { label: "Offers", href: "/offers", spa: true, icon: <Gift className="w-3.5 h-3.5" /> },
              { label: "Dashboard", href: "/#dashboard", icon: <Activity className="w-3.5 h-3.5" /> },
              { label: "FAQ", href: "/#faq", icon: <Headphones className="w-3.5 h-3.5" /> },
            ],
          },
          {
            label: "Connect",
            icon: <Users className="w-3 h-3" />,
            bgColor: "rgba(255, 255, 255, 0.03)",
            textColor: "#fff",
            links: [
              { label: "WhatsApp", href: "/#register", icon: <ExternalLink className="w-3.5 h-3.5" /> },
              { label: "Community", href: "/#register", icon: <Users className="w-3.5 h-3.5" /> },
              { label: "Support", href: "/#faq", icon: <Headphones className="w-3.5 h-3.5" /> },
            ],
          },
        ]}
      />

      <main className="relative z-10 pt-28 sm:pt-36 pb-20 sm:pb-32">
        <div className="container mx-auto px-4 max-w-6xl">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-center mb-16 sm:mb-24"
          >
            <div className="glass-pill-badge mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
              Active Offers
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight">
              Exclusive Offers
            </h1>
            <p className="text-white/50 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
              Boost your entries, earn bonus rewards, and unlock exclusive drops. These offers are live — grab them before they expire.
            </p>
          </motion.div>

          {/* Hero Offer — first card spans full width */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6 sm:mb-8"
          >
            {(() => {
              const offer = offers[0];
              const classes = getAccentClasses(offer.accent);
              return (
                <div className={`glass-card glass-card-featured ${classes.card} p-6 sm:p-10 group relative`}>
                  <div className={classes.topAccent} />
                  <div className="card-shine" />
                  <div className="relative z-[2] flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                    <div className="flex-shrink-0">
                      <BorderGlow borderRadius={14} glowRadius={14} cardBg="rgba(255,255,255,0.05)" className={`icon-circle ${classes.icon} w-16 h-16 sm:w-20 sm:h-20`}>
                        <Zap className="w-7 h-7 sm:w-8 sm:h-8" />
                      </BorderGlow>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] sm:text-xs font-display font-medium text-white/30 uppercase tracking-widest">{offer.tag}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse"></span>
                        <span className="text-[10px] font-display text-white/45 uppercase tracking-wider">Live</span>
                        <div className="premium-badge premium-badge-hot ml-auto sm:ml-4">
                          <Crown className="w-3 h-3 mr-1.5" />
                          Featured
                        </div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-light text-white mb-3">{offer.title}</h3>
                      <p className="text-white/40 font-light mb-6 text-sm sm:text-base leading-relaxed max-w-2xl">{offer.desc}</p>
                      <div className="flex flex-wrap gap-3">
                        {offer.details.map((d, di) => (
                          <div key={di} className="stat-card !p-2.5 !px-4 !rounded-xl flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white/25 shrink-0" />
                            <span className="text-xs text-white/55">{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-center">
                      <span className="text-6xl font-display font-light text-white/[0.04] leading-none">{offer.number}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>

          {/* Remaining offers grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-16"
          >
            {offers.slice(1).map((offer, i) => {
              const classes = getAccentClasses(offer.accent);
              return (
                <motion.div key={i} variants={fadeUp}>
                  <div className={`glass-card ${offer.highlight ? 'glass-card-featured' : ''} ${classes.card} p-5 sm:p-8 group h-full relative`}>
                    <div className={classes.topAccent} />
                    <div className="card-shine" />
                    {offer.highlight && (
                      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-[5]">
                        <div className="premium-badge premium-badge-hot">
                          <Star className="w-3 h-3 mr-1" />
                          HOT
                        </div>
                      </div>
                    )}
                    <div className="relative z-[2] flex flex-col h-full">
                      <div className="flex items-start justify-between mb-5">
                        <BorderGlow borderRadius={14} glowRadius={12} cardBg="rgba(255,255,255,0.05)" className={`icon-circle ${classes.icon}`}>
                          {offer.icon}
                        </BorderGlow>
                        <span className="text-4xl sm:text-5xl font-display font-light text-white/[0.03] leading-none mt-[-4px]">{offer.number}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] sm:text-xs font-display font-medium text-white/25 uppercase tracking-widest">{offer.tag}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse"></span>
                          <span className="text-[10px] font-display text-white/40 uppercase tracking-wider">Live</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-3">{offer.title}</h3>
                        <p className="text-white/35 font-light mb-6 text-xs sm:text-sm leading-relaxed">{offer.desc}</p>
                      </div>
                      <div className="border-t border-white/[0.04] pt-4 mt-auto">
                        <ul className="space-y-2.5 text-xs text-white/50">
                          {offer.details.map((d, di) => (
                            <li key={di} className="flex items-center">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-2.5 text-white/20 shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="w-full overflow-hidden py-6 sm:py-8 border-y border-white/[0.04] bg-white/[0.01] rounded-2xl mb-16">
            <div className="marquee-container">
              <div className="marquee-content">
                {["2x Entry Bonus", "Refer & Earn", "Early Bird Drops", "Partner Cashback", "Weekend Mega Draw", "Flash Giveaways", "Community Rewards", "Exclusive Merch"].map((text, i) => (
                  <div key={`m1-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                    <span className="text-lg sm:text-2xl font-display font-light text-white/[0.12] uppercase tracking-wider">{text}</span>
                    <span className="text-white/[0.06] text-xl font-light">✦</span>
                  </div>
                ))}
              </div>
              <div className="marquee-content">
                {["2x Entry Bonus", "Refer & Earn", "Early Bird Drops", "Partner Cashback", "Weekend Mega Draw", "Flash Giveaways", "Community Rewards", "Exclusive Merch"].map((text, i) => (
                  <div key={`m2-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                    <span className="text-lg sm:text-2xl font-display font-light text-white/[0.12] uppercase tracking-wider">{text}</span>
                    <span className="text-white/[0.06] text-xl font-light">✦</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center"
          >
            <div className="glass-card glass-card-accent-navy p-8 sm:p-14 max-w-2xl mx-auto relative">
              <div className="card-top-accent card-top-accent-navy" />
              <div className="card-shine" />
              <div className="relative z-[2]">
                <BorderGlow borderRadius={14} glowRadius={12} cardBg="rgba(255,255,255,0.05)" className="icon-circle icon-circle-navy mx-auto mb-6">
                  <ExternalLink className="w-5 h-5" />
                </BorderGlow>
                <h3 className="text-xl sm:text-3xl font-display font-light text-white mb-4">Ready to Enter?</h3>
                <p className="text-white/45 font-light mb-8 text-sm leading-relaxed max-w-md mx-auto">
                  Head back to the main page, register with the partner links, and start claiming these offers today.
                </p>
                <BorderGlow as={Link} href="/" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group inline-flex">
                  <span className="relative z-[2]">Go to Registration</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                </BorderGlow>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <footer className="bg-black pt-0 pb-8 sm:pb-12 relative">
        <div className="footer-gradient-line mb-8 sm:mb-12" />
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-white/20 font-light">
            © 2026 X247 Rewards. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
