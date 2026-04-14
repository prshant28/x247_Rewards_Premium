import React, { useEffect, useRef } from "react";
import BorderGlow from "@/components/BorderGlow";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  ExternalLink,
  Gift,
  Users,
  Zap,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Star,
  BarChart3,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getPartners, trackClick, trackImpression, type PartnerData } from "@/lib/api";
import SiteFooter from "@/components/SiteFooter";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

type PartnerCardData = Pick<PartnerData, "id" | "slug" | "name" | "tagline" | "description" | "category" | "registrationUrl" | "accent" | "badge" | "badgeSecondary" | "isActive" | "isRequired" | "entryPoints" | "stats">;

function buildPlaceholders(activeCount: number): PartnerCardData[] {
  const placeholders: PartnerCardData[] = [];
  for (let i = 0; i < 3; i++) {
    const num = activeCount + i + 1;
    placeholders.push({
      id: -(num),
      slug: `partner-coming-${i + 1}`,
      name: `Partner ${num}`,
      tagline: i === 0 ? "Bonus Entry Partner" : "Coming Soon",
      description: i === 0
        ? "Register here as well to increase your winning chances. Additional registrations unlock bonus entry multipliers for every giveaway."
        : "A new partner integration is being finalized. Stay tuned for exclusive registration bonuses and additional entry opportunities.",
      category: i === 0 ? "Bonus Entry" : "Upcoming",
      registrationUrl: "",
      accent: i === 0 ? "red" : "neutral",
      badge: i === 0 ? "2x Chances" : null,
      badgeSecondary: null,
      isActive: false,
      isRequired: false,
      entryPoints: 1,
      stats: { clicks: 0, impressions: 0, formFills: 0 },
    });
  }
  return placeholders;
}

const verifiedBy = [
  { name: "SSL Secured", icon: <ShieldCheck className="w-5 h-5" /> },
  { name: "Verified Partners", icon: <CheckCircle2 className="w-5 h-5" /> },
  { name: "Real Registrations", icon: <Users className="w-5 h-5" /> },
  { name: "Daily Audited", icon: <BarChart3 className="w-5 h-5" /> },
];

function getAccentClasses(accent: string) {
  if (accent === "navy") return { card: "glass-card-accent-navy", icon: "icon-circle-navy", topAccent: "card-top-accent card-top-accent-navy" };
  if (accent === "red") return { card: "glass-card-accent-red", icon: "icon-circle-red", topAccent: "card-top-accent card-top-accent-red" };
  return { card: "", icon: "", topAccent: "card-top-accent" };
}

function getPartnerIcon(accent: string) {
  if (accent === "navy") return <ExternalLink className="w-6 h-6" />;
  if (accent === "red") return <Star className="w-6 h-6" />;
  return <Gift className="w-6 h-6" />;
}

function PartnerCard({ partner }: { partner: PartnerCardData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (partner.id < 0 || tracked.current) return;
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          trackImpression(partner.id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [partner.id]);

  const isComingSoon = !partner.isActive;
  const classes = getAccentClasses(partner.accent);

  const handleClick = () => {
    if (partner.id > 0 && partner.registrationUrl) {
      trackClick(partner.id);
    }
  };

  const cardContent = (
    <div ref={cardRef} className={`glass-card ${classes.card} p-6 sm:p-8 group relative overflow-hidden h-full`}>
      <div className={classes.topAccent} />
      <div className="card-shine" />

      {isComingSoon && (
        <div className="absolute inset-0 z-[3] bg-black/60 backdrop-blur-[2px] flex items-center justify-center rounded-[24px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
              <Lock className="w-5 h-5 text-white/40" />
            </div>
            <span className="text-sm font-display font-light text-white/60">Coming Soon</span>
          </div>
        </div>
      )}

      <div className="relative z-[2] flex flex-col h-full">
        <div className="flex items-start justify-between mb-5">
          <BorderGlow borderRadius={14} glowRadius={12} cardBg="rgba(255,255,255,0.05)" className={`icon-circle ${classes.icon} w-14 h-14`}>
            {getPartnerIcon(partner.accent)}
          </BorderGlow>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {partner.badge && (
              <div className="premium-badge premium-badge-hot !text-[9px]">
                <Zap className="w-2.5 h-2.5 mr-1" />
                {partner.badge}
              </div>
            )}
            {partner.badgeSecondary && (
              <div className="premium-badge !text-[9px]" style={{ background: "rgba(30, 40, 100, 0.3)", border: "1px solid rgba(60, 80, 180, 0.3)" }}>
                <Star className="w-2.5 h-2.5 mr-1 text-blue-400" />
                <span className="text-blue-300">{partner.badgeSecondary}</span>
              </div>
            )}
          </div>
        </div>

        <span className="text-[10px] font-display font-medium text-white/30 uppercase tracking-[0.15em] mb-1">{partner.category}</span>
        <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-2">{partner.name}</h3>
        <p className="text-white/40 font-light text-xs sm:text-sm leading-relaxed mb-4">{partner.description}</p>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-5">
          <Trophy className="w-3.5 h-3.5 text-white/40 shrink-0" />
          <span className="text-[11px] text-white/50 font-light">
            Earn <strong className="text-white/70 font-medium">{partner.entryPoints || 1} entry {(partner.entryPoints || 1) === 1 ? "point" : "points"}</strong> after completing registration
          </span>
        </div>

        <div className="mt-auto pt-4 border-t border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm font-display font-light text-white">{partner.stats?.clicks || 0}</div>
                <div className="text-[9px] text-white/25 uppercase tracking-widest">Clicks</div>
              </div>
              <div className="w-px h-6 bg-white/[0.06]" />
              <div>
                <div className="text-sm font-display font-light text-white">{partner.stats?.impressions || 0}</div>
                <div className="text-[9px] text-white/25 uppercase tracking-widest">Views</div>
              </div>
            </div>
            {partner.isActive && (
              <div className="flex items-center text-white/30 group-hover:text-white/60 transition-colors text-xs font-display">
                <span>View Details</span>
                <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (partner.isActive) {
    return (
      <Link href={`/partners/${partner.slug}`} className="block" onClick={handleClick}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export default function Partners() {
  const { data: apiPartners, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: getPartners,
    staleTime: 30_000,
  });

  const allPartners: PartnerCardData[] = React.useMemo(() => {
    const active: PartnerCardData[] = Array.isArray(apiPartners) ? apiPartners : [];
    const activeCount = active.length;
    const fillerCount = Math.max(0, 4 - activeCount);
    const placeholders = buildPlaceholders(activeCount);
    return [...active, ...placeholders.slice(0, fillerCount)];
  }, [apiPartners]);

  const totalClicks = allPartners.reduce((sum, p) => sum + (p.stats?.clicks || 0), 0);
  const totalImpressions = allPartners.reduce((sum, p) => sum + (p.stats?.impressions || 0), 0);
  const activeCount = allPartners.filter((p) => p.isActive).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-32 sm:pt-40 pb-20 sm:pb-32">
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
                    <div className="text-xl sm:text-2xl font-display font-light text-white">{totalClicks}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest font-display">Total Clicks</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-display font-light text-white">{totalImpressions}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest font-display">Impressions</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-display font-light text-white">{activeCount}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest font-display">Active Partners</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-16 sm:mb-24"
            >
              {allPartners.map((partner) => (
                <motion.div key={partner.slug || partner.id} variants={fadeUp}>
                  <PartnerCard partner={partner} />
                </motion.div>
              ))}
            </motion.div>
          )}

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

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Offers", href: "/offers" },
      ]} />
    </div>
  );
}
