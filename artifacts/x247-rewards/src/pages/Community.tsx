import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import SiteFooter from "@/components/SiteFooter";
import {
  Users, MessageCircle, Heart, Share2, Trophy, Sparkles,
  ArrowRight, Globe, Shield, Star, Zap, ExternalLink,
  ChevronDown, HelpCircle
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const communityLinks = [
  {
    name: "WhatsApp Group",
    description: "Join our active WhatsApp community for instant updates, winner announcements, and exclusive contest alerts.",
    icon: <MessageCircle className="w-6 h-6" />,
    members: "2.5K+",
    link: "#",
  },
  {
    name: "Telegram Channel",
    description: "Get notified about new contests, partner offers, and flash giveaways on our Telegram channel.",
    icon: <Zap className="w-6 h-6" />,
    members: "1.8K+",
    link: "#",
  },
  {
    name: "Instagram",
    description: "Follow us for contest highlights, winner stories, and behind-the-scenes content.",
    icon: <Heart className="w-6 h-6" />,
    members: "5K+",
    link: "#",
  },
  {
    name: "Twitter / X",
    description: "Stay updated with the latest announcements, contest launches, and community shoutouts.",
    icon: <Globe className="w-6 h-6" />,
    members: "3.2K+",
    link: "#",
  },
];

const stats = [
  { label: "Community Members", value: "10K+", icon: <Users className="w-5 h-5" /> },
  { label: "Prizes Given", value: "₹5L+", icon: <Trophy className="w-5 h-5" /> },
  { label: "Contests Run", value: "50+", icon: <Star className="w-5 h-5" /> },
  { label: "Partners", value: "25+", icon: <ExternalLink className="w-5 h-5" /> },
];

const faqs = [
  {
    q: "How do I enter a giveaway?",
    a: "Visit our Giveaway page, pick an active contest, and complete the partner registration steps. Once done, you'll receive a unique entry code that confirms your participation.",
  },
  {
    q: "How are winners selected?",
    a: "Winners are chosen through a transparent random draw from all valid entries. Each entry code gets an equal chance. Results are announced on our Winners page and community channels.",
  },
  {
    q: "Can I enter multiple contests?",
    a: "Absolutely! You can enter as many active contests as you like. Each contest is independent — completing one doesn't affect your chances in another.",
  },
  {
    q: "What happens after I win?",
    a: "Winners are contacted via their registered email within 48 hours. You'll need to verify your identity and provide delivery details. Prizes are dispatched within 7–10 business days.",
  },
  {
    q: "Is registration on partner sites mandatory?",
    a: "Yes. Partner registrations are how we fund the prizes. You must genuinely register on the partner platform — fake or duplicate registrations lead to disqualification.",
  },
  {
    q: "How do I check my entry status?",
    a: "Use the 'Check Entry Code' tool on the Giveaway page. Enter your unique code to see your entry details, including the number of entries earned and contest information.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div custom={index + 10} variants={fadeUp} initial="hidden" animate="visible">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left glass-card p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:bg-white/[0.02]"
      >
        <div className="card-shine" />
        <div className="relative z-[2]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-display font-light text-white">{q}</span>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0"
            >
              <ChevronDown className="w-4 h-4 text-white/30" />
            </motion.div>
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="text-xs text-white/35 font-light leading-relaxed mt-3 pt-3 border-t border-white/[0.04]">
                  {a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>
    </motion.div>
  );
}

export default function Community() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-28 pb-20 sm:pt-36 sm:pb-32">
        <div className="container mx-auto px-4 max-w-5xl">

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] mb-4">
              <Users className="w-3 h-3 text-white/40" />
              <span className="text-[10px] text-white/40 font-display uppercase tracking-widest">Community</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-extralight text-white mb-4 tracking-tight">
              Join the Community
            </h1>
            <p className="text-sm sm:text-base text-white/35 font-light max-w-xl mx-auto leading-relaxed">
              Connect with thousands of members, get instant contest updates, and never miss a giveaway opportunity.
            </p>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="mb-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((stat, i) => (
                <motion.div key={i} custom={i + 1} variants={fadeUp} initial="hidden" animate="visible">
                  <div className="glass-card p-4 sm:p-5 text-center">
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-2 text-white/30">
                        {stat.icon}
                      </div>
                      <div className="text-lg sm:text-xl font-display font-light text-white">{stat.value}</div>
                      <div className="text-[9px] text-white/25 uppercase tracking-widest font-display mt-0.5">{stat.label}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/0" />
              <h2 className="text-lg sm:text-xl font-display font-light text-white">Connect With Us</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communityLinks.map((item, i) => (
                <motion.div key={i} custom={i + 4} variants={fadeUp} initial="hidden" animate="visible">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="glass-card overflow-hidden group cursor-pointer transition-all duration-300">
                      <div className="card-shine" />
                      <div className="relative z-[2] p-5 sm:p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-white/40">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-display font-light text-white">{item.name}</h3>
                              <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:translate-x-0.5 group-hover:text-white/40 transition-all" />
                            </div>
                            <p className="text-xs text-white/35 font-light leading-relaxed mb-2">{item.description}</p>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3 h-3 text-white/20" />
                              <span className="text-[10px] text-white/25 font-light">{item.members} members</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/0" />
              <h2 className="text-lg sm:text-xl font-display font-light text-white">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
            <div className="glass-card p-6 sm:p-8">
              <div className="card-shine" />
              <div className="relative z-[2]">
                <h3 className="text-lg sm:text-xl font-display font-light text-white mb-3 text-center">Community Guidelines</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {[
                    { icon: <Shield className="w-4 h-4" />, title: "Be Respectful", desc: "Treat every member with kindness and respect." },
                    { icon: <Star className="w-4 h-4" />, title: "Stay Genuine", desc: "Only participate with real registrations. Fraud = disqualification." },
                    { icon: <Share2 className="w-4 h-4" />, title: "Share & Help", desc: "Help other members with registration steps and tips." },
                    { icon: <Sparkles className="w-4 h-4" />, title: "Stay Active", desc: "Engage regularly to never miss flash contests and bonus entries." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-white/30">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-display font-light text-white mb-0.5">{item.title}</h4>
                        <p className="text-[11px] text-white/30 font-light">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <SiteFooter links={[
        { label: "Home", href: "/" },
        { label: "Giveaway", href: "/giveaway" },
        { label: "Winners", href: "/winners" },
      ]} />
    </div>
  );
}
