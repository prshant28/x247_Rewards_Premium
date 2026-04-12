import React from "react";
import BorderGlow from "@/components/BorderGlow";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ExternalLink,
  Clock,
  Star,
  Tag,
  Zap,
  CheckCircle2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Link } from "wouter";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const offers = [
  {
    title: "Flat 2x Entry Bonus",
    desc: "Register with both partner links and get your entry counted twice. Double your chances of winning daily prizes instantly.",
    tag: "Limited Time",
    status: "active" as const,
    highlight: true,
    details: ["Valid for first-time entries", "Both partner registrations required", "Automatic 2x multiplier"],
    icon: <Zap className="w-5 h-5" />,
  },
  {
    title: "Refer 5, Get Bonus Entry",
    desc: "Refer 5 friends who complete their registration and receive a guaranteed bonus entry into the weekly mega draw.",
    tag: "Ongoing",
    status: "active" as const,
    highlight: false,
    details: ["5 verified referrals needed", "Bonus entry auto-added", "Stackable — no limit"],
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: "Early Bird Swag Drop",
    desc: "First 100 entries every Monday receive an exclusive branded sticker pack shipped free. Be fast, be first.",
    tag: "Weekly",
    status: "active" as const,
    highlight: false,
    details: ["Every Monday resets", "First 100 entries only", "Free worldwide shipping"],
    icon: <Clock className="w-5 h-5" />,
  },
  {
    title: "Partner Signup Cashback",
    desc: "Complete your partner registration and get ₹50 cashback credited to your account. Valid for new partners only.",
    tag: "New Partners",
    status: "active" as const,
    highlight: true,
    details: ["For new partner signups", "₹50 instant credit", "One-time per partner"],
    icon: <Tag className="w-5 h-5" />,
  },
  {
    title: "Weekend Mega Draw",
    desc: "Every Saturday, we run a special mega draw with 3x the usual prize pool. All entries from the week are eligible.",
    tag: "Every Saturday",
    status: "active" as const,
    highlight: false,
    details: ["3x prize pool", "All week's entries count", "Winners announced Sunday"],
    icon: <Star className="w-5 h-5" />,
  },
  {
    title: "Community Exclusive Drops",
    desc: "Join our WhatsApp community to unlock access to flash giveaways and surprise reward drops shared twice a month.",
    tag: "Members Only",
    status: "active" as const,
    highlight: false,
    details: ["WhatsApp community access", "Flash giveaways", "Twice monthly drops"],
    icon: <ShieldCheck className="w-5 h-5" />,
  },
];

export default function Offers() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <nav className="fixed top-0 left-0 right-0 z-[9999] px-3 sm:px-4 py-3 flex justify-center">
        <div className="nav-pill nav-pill-scrolled transition-all duration-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-light text-base sm:text-lg tracking-wide text-white">X247 Rewards</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-[13px] font-display font-normal text-white/50">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/offers" className="nav-link" style={{ color: "rgba(255,255,255,0.9)" }}>Offers</Link>
          </div>
          <BorderGlow as={Link} href="/" borderRadius="100px" glowPadding="15px" cardBg="rgba(6,6,6,0.9)" className="nav-cta-btn group" style={{ border: "none" }}>
            <span className="relative z-[2]">Back to Home</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 relative z-[2]" />
          </BorderGlow>
        </div>
      </nav>

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
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-semibold mb-6 text-white tracking-tight">
              Exclusive Offers
            </h1>
            <p className="text-white/60 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
              Boost your entries, earn bonus rewards, and unlock exclusive drops. These offers are live — grab them before they expire.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-16"
          >
            {offers.map((offer, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className={`glass-card ${offer.highlight ? 'glass-card-featured' : ''} p-5 sm:p-8 group h-full`}>
                  {offer.highlight && (
                    <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-[5]">
                      <div className="premium-badge">
                        <Star className="w-3 h-3 mr-1" />
                        HOT
                      </div>
                    </div>
                  )}
                  <div className="relative z-[2] flex flex-col h-full">
                    <div className="flex-1">
                      <div className="icon-circle mb-6">
                        {offer.icon}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] sm:text-xs font-display font-medium text-white/25 uppercase tracking-widest">{offer.tag}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse"></span>
                        <span className="text-[10px] font-display text-white/40 uppercase tracking-wider">Live</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-3">{offer.title}</h3>
                      <p className="text-white/35 font-light mb-6 text-xs sm:text-sm leading-relaxed">{offer.desc}</p>
                    </div>
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
              </motion.div>
            ))}
          </motion.div>

          <div className="w-full overflow-hidden py-6 sm:py-8 border-y border-white/[0.04] bg-white/[0.01] rounded-2xl mb-16">
            <div className="marquee-container">
              <div className="marquee-content">
                {["2x Entry Bonus", "Refer & Earn", "Early Bird Drops", "Partner Cashback", "Weekend Mega Draw", "Flash Giveaways", "Community Rewards", "Exclusive Merch"].map((text, i) => (
                  <div key={`m1-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                    <span className="text-lg sm:text-2xl font-display font-light text-white/55 uppercase tracking-wider">{text}</span>
                    <span className="text-white/10 text-xl font-light">✦</span>
                  </div>
                ))}
              </div>
              <div className="marquee-content">
                {["2x Entry Bonus", "Refer & Earn", "Early Bird Drops", "Partner Cashback", "Weekend Mega Draw", "Flash Giveaways", "Community Rewards", "Exclusive Merch"].map((text, i) => (
                  <div key={`m2-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                    <span className="text-lg sm:text-2xl font-display font-light text-white/55 uppercase tracking-wider">{text}</span>
                    <span className="text-white/10 text-xl font-light">✦</span>
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
            <div className="glass-card p-8 sm:p-12 max-w-2xl mx-auto">
              <div className="relative z-[2]">
                <div className="icon-circle mx-auto mb-6">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-semibold text-white mb-4">Ready to Enter?</h3>
                <p className="text-white/55 font-light mb-8 text-sm leading-relaxed max-w-md mx-auto">
                  Head back to the main page, register with the partner links, and start claiming these offers today.
                </p>
                <BorderGlow as={Link} href="/" borderRadius="16px" glowPadding="20px" cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg group inline-flex" style={{ border: "none" }}>
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
            © 2025 X247 Rewards. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
