import React from "react";
import BorderGlow from "@/components/BorderGlow";
import CardNav from "@/components/CardNav";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ExternalLink,
  Globe,
  Target,
  Trophy,
  Gift,
  Activity,
  Headphones,
  Users,
  Zap,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Star,
  BarChart3,
  TrendingUp,
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

const partners = [
  {
    id: "partner-1",
    name: "Partner 1",
    tagline: "Primary Registration Partner",
    desc: "Complete your registration on this platform to earn your first giveaway entry. This is the mandatory step to participate in daily draws.",
    category: "Registration",
    status: "coming-soon" as const,
    accent: "navy" as const,
    stats: { registrations: 0, entries: 0, winners: 0 },
    badge: "Required",
    icon: <ExternalLink className="w-6 h-6" />,
  },
  {
    id: "partner-2",
    name: "Partner 2",
    tagline: "Bonus Entry Partner",
    desc: "Register here as well to double your winning chances. Both registrations combined unlock the 2x entry multiplier for every giveaway.",
    category: "Bonus Entry",
    status: "coming-soon" as const,
    accent: "red" as const,
    stats: { registrations: 0, entries: 0, winners: 0 },
    badge: "2x Chances",
    icon: <Star className="w-6 h-6" />,
  },
  {
    id: "partner-3",
    name: "Partner 3",
    tagline: "Coming Soon",
    desc: "A new partner integration is being finalized. Stay tuned for exclusive registration bonuses and additional entry opportunities.",
    category: "Upcoming",
    status: "coming-soon" as const,
    accent: "neutral" as const,
    stats: { registrations: 0, entries: 0, winners: 0 },
    badge: null,
    icon: <Gift className="w-6 h-6" />,
  },
  {
    id: "partner-4",
    name: "Partner 4",
    tagline: "Coming Soon",
    desc: "Another exciting partner joining the X247 ecosystem. More ways to earn entries and win bigger rewards.",
    category: "Upcoming",
    status: "coming-soon" as const,
    accent: "neutral" as const,
    stats: { registrations: 0, entries: 0, winners: 0 },
    badge: null,
    icon: <Zap className="w-6 h-6" />,
  },
];

const verifiedBy = [
  { name: "SSL Secured", icon: <ShieldCheck className="w-5 h-5" /> },
  { name: "Verified Partners", icon: <CheckCircle2 className="w-5 h-5" /> },
  { name: "Real Registrations", icon: <Users className="w-5 h-5" /> },
  { name: "Daily Audited", icon: <BarChart3 className="w-5 h-5" /> },
];

function getAccentClasses(accent: "red" | "navy" | "neutral") {
  if (accent === "navy") return { card: "glass-card-accent-navy", icon: "icon-circle-navy", topAccent: "card-top-accent card-top-accent-navy" };
  if (accent === "red") return { card: "glass-card-accent-red", icon: "icon-circle-red", topAccent: "card-top-accent card-top-accent-red" };
  return { card: "", icon: "", topAccent: "card-top-accent" };
}

export default function Partners() {
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
              { label: "Partners", href: "/partners", spa: true, icon: <ExternalLink className="w-3.5 h-3.5" /> },
              { label: "Offers", href: "/offers", spa: true, icon: <Gift className="w-3.5 h-3.5" /> },
            ],
          },
          {
            label: "Explore",
            icon: <Zap className="w-3 h-3" />,
            bgColor: "rgba(120, 20, 30, 0.12)",
            textColor: "#fff",
            links: [
              { label: "How it Works", href: "/#how-it-works", icon: <Target className="w-3.5 h-3.5" /> },
              { label: "Rewards", href: "/#rewards", icon: <Trophy className="w-3.5 h-3.5" /> },
              { label: "Dashboard", href: "/#dashboard", icon: <Activity className="w-3.5 h-3.5" /> },
            ],
          },
          {
            label: "Connect",
            icon: <Users className="w-3 h-3" />,
            bgColor: "rgba(255, 255, 255, 0.03)",
            textColor: "#fff",
            links: [
              { label: "FAQ", href: "/#faq", icon: <Headphones className="w-3.5 h-3.5" /> },
              { label: "Community", href: "/#register", icon: <Users className="w-3.5 h-3.5" /> },
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
              Partner Registration
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight">
              Our Partners
            </h1>
            <p className="text-white/50 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
              Register with our partner platforms to earn giveaway entries. Each completed registration = one entry into the daily prize draw. More partners coming soon.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-10 sm:mb-14"
          >
            <div className="glass-card p-4 sm:p-5">
              <div className="card-top-accent" />
              <div className="relative z-[2] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-white/40" />
                  <span className="text-sm text-white/50 font-light">Platform Stats</span>
                </div>
                <div className="flex items-center gap-6 sm:gap-10">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-display font-light text-white">0</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest font-display">Total Registrations</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-display font-light text-white">0</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest font-display">Active Entries</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-display font-light text-white">0</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest font-display">Winners</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-16 sm:mb-24"
          >
            {partners.map((partner, i) => {
              const classes = getAccentClasses(partner.accent);
              return (
                <motion.div key={partner.id} variants={fadeUp}>
                  <Link href={`/partners/${partner.id}`} className="block">
                    <div className={`glass-card ${classes.card} p-6 sm:p-8 group relative overflow-hidden h-full`}>
                      <div className={classes.topAccent} />
                      <div className="card-shine" />

                      <div className="absolute inset-0 z-[3] bg-black/60 backdrop-blur-[2px] flex items-center justify-center rounded-[24px]">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
                            <Lock className="w-5 h-5 text-white/40" />
                          </div>
                          <span className="text-sm font-display font-light text-white/60">Coming Soon</span>
                        </div>
                      </div>

                      <div className="relative z-[2] flex flex-col h-full">
                        <div className="flex items-start justify-between mb-5">
                          <BorderGlow borderRadius={14} glowRadius={12} cardBg="rgba(255,255,255,0.05)" className={`icon-circle ${classes.icon} w-14 h-14`}>
                            {partner.icon}
                          </BorderGlow>
                          <div className="flex items-center gap-2">
                            {partner.badge && (
                              <div className="premium-badge premium-badge-hot !text-[9px]">
                                <Zap className="w-2.5 h-2.5 mr-1" />
                                {partner.badge}
                              </div>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] font-display font-medium text-white/30 uppercase tracking-[0.15em] mb-1">{partner.category}</span>
                        <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-2">{partner.name}</h3>
                        <p className="text-white/40 font-light text-xs sm:text-sm leading-relaxed mb-5">{partner.desc}</p>

                        <div className="mt-auto pt-4 border-t border-white/[0.04]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="text-sm font-display font-light text-white">{partner.stats.registrations}</div>
                                <div className="text-[9px] text-white/25 uppercase tracking-widest">Registrations</div>
                              </div>
                              <div className="w-px h-6 bg-white/[0.06]" />
                              <div>
                                <div className="text-sm font-display font-light text-white">{partner.stats.entries}</div>
                                <div className="text-[9px] text-white/25 uppercase tracking-widest">Entries</div>
                              </div>
                            </div>
                            <div className="flex items-center text-white/30 group-hover:text-white/60 transition-colors text-xs font-display">
                              <span>View Details</span>
                              <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-16 sm:mb-24"
          >
            <div className="text-center mb-10 sm:mb-14">
              <div className="glass-pill-badge mb-6 mx-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Trust & Security
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-display font-light mb-4 text-white tracking-tight">
                Verified & Secure
              </h2>
              <p className="text-white/40 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto tracking-wide">
                Every partner on X247 is vetted and verified. Your data is protected, registrations are audited, and winners are selected transparently.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {verifiedBy.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="glass-card p-5 sm:p-6 text-center group">
                    <div className="card-top-accent" />
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-white/50 group-hover:text-white/70 transition-colors">
                        {item.icon}
                      </div>
                      <h4 className="text-sm font-display font-light text-white/70">{item.name}</h4>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className="glass-card p-6 sm:p-10 text-center">
              <div className="card-top-accent card-top-accent-navy" />
              <div className="card-shine" />
              <div className="relative z-[2]">
                <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-4">How It Works</h3>
                <p className="text-white/40 font-light text-sm leading-relaxed max-w-xl mx-auto mb-8">
                  Each partner card will have a registration link. Complete the registration → fill the entry form → your entry is confirmed. It's that simple.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <BorderGlow as={Link} href="/" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                    <span className="relative z-[2]">Back to Home</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                  </BorderGlow>
                  <BorderGlow as={Link} href="/offers" borderRadius={16} glowRadius={20} cardBg="rgba(10,10,10,0.6)" className="premium-btn premium-btn-lg premium-btn-ghost glass-btn-effect group">
                    <span className="relative z-[2]">View Offers</span>
                  </BorderGlow>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <footer className="bg-black pt-0 pb-8 sm:pb-12 relative">
        <div className="footer-gradient-line mb-12 sm:mb-16" />
        <div className="container mx-auto px-4 sm:px-6">
          <div className="border-t border-white/[0.04] pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs font-light text-white/20">
              <p>&copy; 2026 X247 Rewards Protocol. All rights reserved.</p>
              <div className="flex gap-5">
                <Link href="/" className="hover:text-white/40 transition-colors duration-300">Home</Link>
                <Link href="/offers" className="hover:text-white/40 transition-colors duration-300">Offers</Link>
                <a href="/#faq" className="hover:text-white/40 transition-colors duration-300">FAQ</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
