import React, { useState } from "react";
import BorderGlow from "@/components/BorderGlow";
import SiteNav from "@/components/SiteNav";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
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
  Info,
  ListChecks,
} from "lucide-react";
import { Link, useParams } from "wouter";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

interface PartnerData {
  id: string;
  name: string;
  tagline: string;
  category: string;
  accent: "navy" | "red" | "neutral";
  bannerGradient: string;
  description: string[];
  benefits: string[];
  howToEnter: string[];
  stats: { registrations: number; entries: number; winners: number };
  badge: string | null;
}

const partnersData: Record<string, PartnerData> = {
  "partner-1": {
    id: "partner-1",
    name: "Solution Challenge 2026",
    tagline: "Hack2Skill — Students Only",
    category: "Registration",
    accent: "navy",
    bannerGradient: "linear-gradient(145deg, rgba(30, 35, 80, 0.6) 0%, rgba(10, 10, 20, 0.95) 100%)",
    description: [
      "The Solution Challenge 2026 is a nationwide hackathon by Google Developer Groups on Campus, hosted on Hack2Skill. It challenges student developers to build real-world solutions using Google technologies like Flutter, Firebase, Google Cloud, and AI/ML APIs.",
      "By registering for this event through our partner link, you earn your mandatory first entry into the X247 Rewards daily prize draw. This registration is required to participate in our giveaway.",
      "This offer is exclusively for students enrolled in an Indian university or college, aged 18 or above. Teams of 1–4 members can participate. Complete the full registration form on Hack2Skill to qualify.",
    ],
    benefits: [
      "Earn your first giveaway entry instantly",
      "Access to daily prize draws",
      "Eligible for all standard prizes — gift cards, swag kits, gadgets",
      "Participate in a major Google hackathon with ₹10,00,000+ prize pool",
      "Access mentorship, Google Cloud credits, and learning resources",
      "Open to students only — exclusive opportunity",
    ],
    howToEnter: [
      "Click the 'Register Now' button below to visit Hack2Skill",
      "Create your account and fill the complete registration form",
      "Form a team of 1–4 members (or register solo)",
      "Submit your registration — make sure all fields are filled",
      "Return to X247 Rewards — your giveaway entry is now active!",
      "Check the Winners section daily to see if you've won",
    ],
    stats: { registrations: 0, entries: 0, winners: 0 },
    badge: "Required",
  },
  "partner-2": {
    id: "partner-2",
    name: "Partner 2",
    tagline: "Bonus Entry Partner",
    category: "Bonus Entry",
    accent: "red",
    bannerGradient: "linear-gradient(145deg, rgba(80, 20, 30, 0.5) 0%, rgba(15, 10, 10, 0.95) 100%)",
    description: [
      "Partner 2 is your ticket to doubling your chances. By registering with both Partner 1 and Partner 2, you unlock the 2x entry multiplier — meaning every single entry you submit counts twice.",
      "This registration is optional, but highly recommended. The 2x multiplier applies to all your entries going forward, giving you a significant edge over participants who only register with one partner.",
      "The registration process is quick and straightforward. Once both partner registrations are verified, the multiplier is applied automatically — no extra steps needed.",
    ],
    benefits: [
      "2x entry multiplier on all your submissions",
      "Significantly higher winning probability",
      "Access to Partner 2 exclusive bonus draws",
      "Priority consideration for premium prizes",
      "Unlock the 'Power Entrant' badge on the leaderboard",
    ],
    howToEnter: [
      "Make sure you've already registered with Partner 1 first",
      "Click the 'Register Now' button on this page",
      "Complete the full registration on the Partner 2 platform",
      "Your 2x multiplier activates automatically once verified",
      "Submit entries as usual — they now count double",
      "Check your dashboard to confirm the multiplier is active",
    ],
    stats: { registrations: 0, entries: 0, winners: 0 },
    badge: "2x Chances",
  },
  "partner-3": {
    id: "partner-3",
    name: "Partner 3",
    tagline: "Coming Soon",
    category: "Upcoming",
    accent: "neutral",
    bannerGradient: "linear-gradient(145deg, rgba(40, 40, 40, 0.4) 0%, rgba(10, 10, 10, 0.95) 100%)",
    description: [
      "A new partner integration is being finalized. This partner will offer unique registration bonuses and additional entry opportunities exclusive to X247 Rewards participants.",
      "Stay tuned — once launched, early registrations will receive special bonus multipliers and priority access to premium prize pools.",
    ],
    benefits: [
      "Details will be revealed at launch",
      "Early access bonuses for first registrants",
      "Additional entry opportunities",
    ],
    howToEnter: [
      "Partner registration link will be available at launch",
      "Follow the same process as other partners",
      "Join the WhatsApp community to get notified first",
    ],
    stats: { registrations: 0, entries: 0, winners: 0 },
    badge: null,
  },
  "partner-4": {
    id: "partner-4",
    name: "Partner 4",
    tagline: "Coming Soon",
    category: "Upcoming",
    accent: "neutral",
    bannerGradient: "linear-gradient(145deg, rgba(40, 40, 40, 0.4) 0%, rgba(10, 10, 10, 0.95) 100%)",
    description: [
      "Another exciting partner is joining the X247 Rewards ecosystem. More ways to earn entries, more prizes, and bigger rewards.",
      "This partner will introduce a completely new category of prizes and entry mechanics. Details will be announced soon.",
    ],
    benefits: [
      "New prize categories",
      "Unique entry mechanics",
      "Exclusive rewards for early adopters",
    ],
    howToEnter: [
      "Registration details coming soon",
      "Join the community to be the first to know",
    ],
    stats: { registrations: 0, entries: 0, winners: 0 },
    badge: null,
  },
};

type Tab = "details" | "how-to-enter";

export default function PartnerDetail() {
  const params = useParams<{ id: string }>();
  const partner = partnersData[params.id || ""];
  const [activeTab, setActiveTab] = useState<Tab>("details");

  if (!partner) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-light mb-4">Partner Not Found</h1>
          <Link href="/partners" className="text-white/50 hover:text-white transition-colors">← Back to Partners</Link>
        </div>
      </div>
    );
  }

  const isComingSoon = partner.tagline === "Coming Soon";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <SiteNav activePage="partner-detail" />

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
              <div className="relative" style={{ background: partner.bannerGradient }}>
                <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 relative z-[2]">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center shrink-0">
                    {partner.accent === "navy" ? <ExternalLink className="w-7 h-7 sm:w-8 sm:h-8 text-white/60" /> :
                     partner.accent === "red" ? <Star className="w-7 h-7 sm:w-8 sm:h-8 text-white/60" /> :
                     <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-white/60" />}
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
                      {partner.id === "partner-1" && (
                        <div className="premium-badge !text-[9px]" style={{ background: "rgba(30, 40, 100, 0.3)", border: "1px solid rgba(60, 80, 180, 0.3)" }}>
                          <Star className="w-2.5 h-2.5 mr-1 text-blue-400" />
                          <span className="text-blue-300">Students Only</span>
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
                    <div className="text-lg sm:text-xl font-display font-light text-white">{partner.stats.registrations}</div>
                    <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">Registrations</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-display font-light text-white">{partner.stats.entries}</div>
                    <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">Entries</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-display font-light text-white">{partner.stats.winners}</div>
                    <div className="text-[9px] text-white/25 uppercase tracking-widest font-display">Winners</div>
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
                  <BorderGlow as={Link} href="/" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                    <span className="relative z-[2]">Back to Home</span>
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
                Details & Benefits
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
                <div className="glass-card p-6 sm:p-8">
                  <div className="card-top-accent" />
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <h3 className="text-lg sm:text-xl font-display font-light text-white mb-5">About This Partner</h3>
                    <div className="space-y-4">
                      {partner.description.map((para, i) => (
                        <p key={i} className="text-white/45 font-light text-sm leading-relaxed">{para}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 sm:p-8">
                  <div className="card-top-accent card-top-accent-navy" />
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <h3 className="text-lg sm:text-xl font-display font-light text-white mb-5">What You Get</h3>
                    <ul className="space-y-3">
                      {partner.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-white/50 font-light">
                          <CheckCircle2 className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {!isComingSoon && (
                  <div className="flex justify-center pt-4">
                    {partner.id === "partner-1" ? (
                      <BorderGlow as="a" href="https://vision.hack2skill.com/event/solution-challenge-2026/?utm_source=hack2skill&utm_medium=teamdashboard&utm_term=referral-1&utm_campaign=solution-challenge-2026&utm_content=693e29520010adcadec1b495" target="_blank" rel="noopener noreferrer" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                        <ExternalLink className="w-4 h-4 mr-2 relative z-[2]" />
                        <span className="relative z-[2]">Register Now</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                      </BorderGlow>
                    ) : (
                      <BorderGlow as="a" href="#" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                        <Lock className="w-4 h-4 mr-2 relative z-[2]" />
                        <span className="relative z-[2]">Registration Link Coming Soon</span>
                      </BorderGlow>
                    )}
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
                      {partner.howToEnter.map((step, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                            <span className="text-xs font-display text-white/50">{String(i + 1).padStart(2, "0")}</span>
                          </div>
                          <p className="text-sm text-white/50 font-light leading-relaxed pt-1.5">{step}</p>
                        </div>
                      ))}
                    </div>

                    {partner.id === "partner-1" && (
                      <div className="flex justify-center pt-8 border-t border-white/[0.04] mt-8">
                        <BorderGlow as="a" href="https://vision.hack2skill.com/event/solution-challenge-2026/?utm_source=hack2skill&utm_medium=teamdashboard&utm_term=referral-1&utm_campaign=solution-challenge-2026&utm_content=693e29520010adcadec1b495" target="_blank" rel="noopener noreferrer" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                          <ExternalLink className="w-4 h-4 mr-2 relative z-[2]" />
                          <span className="relative z-[2]">Register Now on Hack2Skill</span>
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

      <footer className="bg-black pt-0 pb-8 sm:pb-12 relative">
        <div className="footer-gradient-line mb-12 sm:mb-16" />
        <div className="container mx-auto px-4 sm:px-6">
          <div className="border-t border-white/[0.04] pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs font-light text-white/20">
              <p>&copy; 2026 X247 Rewards Protocol. All rights reserved.</p>
              <div className="flex gap-5">
                <Link href="/" className="hover:text-white/40 transition-colors duration-300">Home</Link>
                <Link href="/partners" className="hover:text-white/40 transition-colors duration-300">Partners</Link>
                <Link href="/offers" className="hover:text-white/40 transition-colors duration-300">Offers</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
