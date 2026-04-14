import React, { useState } from "react";
import BorderGlow from "@/components/BorderGlow";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Gift,
  Zap,
  Lock,
  CheckCircle2,
  Star,
  Info,
  ListChecks,
  Trophy,
  Camera,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getPartner, trackClick, type PartnerData } from "@/lib/api";
import SiteFooter from "@/components/SiteFooter";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

type Tab = "details" | "how-to-enter";

function getPartnerIcon(accent: string) {
  if (accent === "navy") return <ExternalLink className="w-7 h-7 sm:w-8 sm:h-8 text-white/60" />;
  if (accent === "red") return <Star className="w-7 h-7 sm:w-8 sm:h-8 text-white/60" />;
  return <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-white/60" />;
}

function getBannerGradient(accent: string) {
  if (accent === "navy") return "linear-gradient(145deg, rgba(30, 35, 80, 0.6) 0%, rgba(10, 10, 20, 0.95) 100%)";
  if (accent === "red") return "linear-gradient(145deg, rgba(80, 20, 30, 0.5) 0%, rgba(15, 10, 10, 0.95) 100%)";
  return "linear-gradient(145deg, rgba(40, 40, 40, 0.4) 0%, rgba(10, 10, 10, 0.95) 100%)";
}

function PartnerDetailContent({ partner }: { partner: PartnerData }) {
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const isComingSoon = !partner.isActive;

  const handleRegisterClick = () => {
    if (partner.registrationUrl) {
      trackClick(partner.id);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-32 sm:pt-40 pb-20 sm:pb-32">
        <div className="container mx-auto px-4 max-w-4xl">

          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-6">
            <Link href="/partners" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors font-light">
              <ArrowLeft className="w-4 h-4" />
              Back to Partners
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-8 sm:mb-12"
          >
            <div className="glass-card overflow-hidden relative">
              <div className="card-shine" />
              <div className="relative" style={{ background: getBannerGradient(partner.accent) }}>
                <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 relative z-[2]">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center shrink-0">
                    {getPartnerIcon(partner.accent)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-[10px] font-display font-medium text-white/30 uppercase tracking-[0.15em]">{partner.category}</span>
                      {partner.badge && (
                        <div className="premium-badge premium-badge-hot !text-[9px]">
                          <Zap className="w-2.5 h-2.5 mr-1" />
                          {partner.badge}
                        </div>
                      )}
                      {isComingSoon && (
                        <div className="premium-badge !text-[9px]" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <Lock className="w-2.5 h-2.5 mr-1" />
                          Coming Soon
                        </div>
                      )}
                      {partner.badgeSecondary && (
                        <div className="premium-badge !text-[9px]" style={{ background: "rgba(30, 40, 100, 0.3)", border: "1px solid rgba(60, 80, 180, 0.3)" }}>
                          <Star className="w-2.5 h-2.5 mr-1 text-blue-400" />
                          <span className="text-blue-300">{partner.badgeSecondary}</span>
                        </div>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-light text-white mb-1">{partner.name}</h1>
                    <p className="text-sm text-white/40 font-light">{partner.tagline}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-8 border-t border-white/[0.04] relative z-[2]">
                <div className="flex items-center gap-6 sm:gap-10">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-display font-light text-white">{partner.stats.clicks}</div>
                    <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">Clicks</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-display font-light text-white">{partner.stats.impressions}</div>
                    <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">Impressions</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-display font-light text-white">{partner.stats.formFills}</div>
                    <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">Form Fills</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

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
                    <span className="relative z-[2]">Back to Partners</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                  </BorderGlow>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="flex gap-1 mb-6 p-1 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
              <button
                onClick={() => setActiveTab("details")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-display font-light transition-all duration-300 ${
                  activeTab === "details"
                    ? "bg-white/[0.06] text-white border border-white/[0.08]"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <Info className="w-4 h-4" />
                Details
              </button>
              <button
                onClick={() => setActiveTab("how-to-enter")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-display font-light transition-all duration-300 ${
                  activeTab === "how-to-enter"
                    ? "bg-white/[0.06] text-white border border-white/[0.08]"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <ListChecks className="w-4 h-4" />
                How to Enter
              </button>
            </div>

            {activeTab === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
                  <div className="card-shine" />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)" }}
                  />
                  <div className="relative z-[2] flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex flex-col items-center justify-center shrink-0">
                        <span className="text-xl sm:text-2xl font-display font-light text-white leading-none">
                          +{partner.entryPoints ?? 1}
                        </span>
                        <span className="text-[8px] text-white/30 uppercase tracking-widest font-display mt-0.5">
                          {(partner.entryPoints ?? 1) === 1 ? "Entry" : "Entries"}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-display uppercase tracking-[0.18em] text-white/30 mb-1">Your Benefit</p>
                        <p className="text-white font-light text-sm sm:text-base leading-snug">
                          Earn <span className="font-normal text-white">{partner.entryPoints ?? 1} prize draw {(partner.entryPoints ?? 1) === 1 ? "entry" : "entries"}</span> after completing registration
                        </p>
                        <p className="text-white/35 font-light text-xs mt-1">
                          Each entry = one chance to win in the daily prize draw
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                        <Trophy className="w-3 h-3 text-white/40" />
                        <span className="text-[10px] font-display text-white/40 uppercase tracking-widest">Daily Draw</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 sm:p-8">
                  <div className="card-top-accent" />
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <h3 className="text-lg sm:text-xl font-display font-light text-white mb-5">About This Partner</h3>
                    <p className="text-white/45 font-light text-sm leading-relaxed">{partner.description}</p>
                  </div>
                </div>

                <div className="glass-card p-6 sm:p-8">
                  <div className="card-top-accent card-top-accent-navy" />
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <h3 className="text-lg sm:text-xl font-display font-light text-white mb-5">Key Info</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-white/50 font-light">
                        <CheckCircle2 className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                        <span>1 completed registration = 1 giveaway entry</span>
                      </li>
                      {partner.isRequired && (
                        <li className="flex items-start gap-3 text-sm text-white/50 font-light">
                          <CheckCircle2 className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                          <span>This registration is required to participate in the giveaway</span>
                        </li>
                      )}
                      {partner.badgeSecondary && (
                        <li className="flex items-start gap-3 text-sm text-white/50 font-light">
                          <CheckCircle2 className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                          <span>{partner.badgeSecondary} — eligibility restriction applies</span>
                        </li>
                      )}
                      <li className="flex items-start gap-3 text-sm text-white/50 font-light">
                        <CheckCircle2 className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                        <span>Access to daily prize draws after registration</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {!isComingSoon && (
                  <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                    {partner.registrationUrl && (
                      <BorderGlow as="a" href={partner.registrationUrl} target="_blank" rel="noopener noreferrer" onClick={handleRegisterClick} borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                        <ExternalLink className="w-4 h-4 mr-2 relative z-[2]" />
                        <span className="relative z-[2]">Register Now</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                      </BorderGlow>
                    )}
                    <BorderGlow as={Link} href="/giveaway" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                      <Trophy className="w-4 h-4 mr-2 relative z-[2]" />
                      <span className="relative z-[2]">Enter Giveaway</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                    </BorderGlow>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "how-to-enter" && (
              <motion.div
                key="how-to-enter"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="glass-card p-6 sm:p-8">
                  <div className="card-top-accent card-top-accent-red" />
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <h3 className="text-lg sm:text-xl font-display font-light text-white mb-6">Steps to Enter via {partner.name}</h3>
                    <div className="space-y-5">
                      {[
                        { text: `Click the 'Register Now' button to visit ${partner.name}`, icon: <ExternalLink className="w-3.5 h-3.5 text-white/30" /> },
                        { text: "Create your account and fill the complete registration form", icon: <CheckCircle2 className="w-3.5 h-3.5 text-white/30" /> },
                        { text: "Make sure all required fields are filled correctly", icon: <Info className="w-3.5 h-3.5 text-white/30" /> },
                        { text: "Submit the registration on the partner platform", icon: <CheckCircle2 className="w-3.5 h-3.5 text-white/30" /> },
                        { text: "Take a screenshot of your completed registration as proof", icon: <Camera className="w-3.5 h-3.5 text-white/30" /> },
                        { text: "Go to the Giveaway section on X247 Rewards, select a contest", icon: <Trophy className="w-3.5 h-3.5 text-white/30" /> },
                        { text: `Select '${partner.name}' as a completed partner and upload your screenshot proof`, icon: <Star className="w-3.5 h-3.5 text-white/30" /> },
                        { text: "Submit your entry and check the Winners page daily!", icon: <Gift className="w-3.5 h-3.5 text-white/30" /> },
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                            <span className="text-xs font-display text-white/50">{String(i + 1).padStart(2, "0")}</span>
                          </div>
                          <p className="text-sm text-white/50 font-light leading-relaxed pt-1.5">{step.text}</p>
                        </div>
                      ))}
                    </div>

                    {!isComingSoon && (
                      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-8 border-t border-white/[0.04] mt-8">
                        {partner.registrationUrl && (
                          <BorderGlow as="a" href={partner.registrationUrl} target="_blank" rel="noopener noreferrer" onClick={handleRegisterClick} borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                            <ExternalLink className="w-4 h-4 mr-2 relative z-[2]" />
                            <span className="relative z-[2]">Register Now</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                          </BorderGlow>
                        )}
                        <BorderGlow as={Link} href="/giveaway" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                          <Trophy className="w-4 h-4 mr-2 relative z-[2]" />
                          <span className="relative z-[2]">Enter Giveaway</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                        </BorderGlow>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

        </div>
      </main>

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Partners", href: "/partners" },
        { label: "Offers", href: "/offers" },
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
