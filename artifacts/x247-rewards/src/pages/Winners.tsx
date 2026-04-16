import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Trophy, Crown, MapPin, Calendar, Gift, Sparkles, ArrowRight, Star
} from "lucide-react";
import { getWinners, type WinnerData } from "@/lib/api";
import SiteFooter from "@/components/SiteFooter";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function WinnerCard({ winner, index }: { winner: WinnerData; index: number }) {
  const date = new Date(winner.announcedAt);
  const formattedDate = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible">
      <div className="glass-card overflow-hidden">
        <div className="card-shine" />
        <div className="relative z-[2] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-white/40" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-display font-light text-white truncate">{winner.winnerName}</h3>
                <Trophy className="w-4 h-4 text-white/25 shrink-0" />
              </div>

              {winner.winnerCity && (
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3 h-3 text-white/20" />
                  <span className="text-[11px] text-white/30 font-light">{winner.winnerCity}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <Gift className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <span className="text-sm text-white/60 font-light">{winner.prize}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/25 font-light">{winner.contestName}</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-white/20" />
                  <span className="text-[10px] text-white/25 font-light">{formattedDate}</span>
                </div>
              </div>

              {winner.entryCode && (
                <div className="mt-2 text-[10px] text-white/20 font-mono">
                  {winner.entryCode}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Winners() {
  const [winners, setWinners] = useState<WinnerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWinners().then((data) => {
      setWinners(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-28 pb-20 sm:pt-36 sm:pb-32">
        <div className="container mx-auto px-4 max-w-4xl">

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-10 sm:mb-14">
            <div className="page-hero-banner">
              <div className="page-hero-glow" />
              <div className="page-hero-inner">
                <div className="glass-pill-badge mb-6">
                  <Trophy className="w-3 h-3 text-white/50 mr-2" />
                  Hall of Fame
                </div>
                <h1 className="text-[2rem] sm:text-4xl md:text-5xl font-display font-light text-white mb-4 tracking-tight leading-[1.1]">
                  <span className="text-gradient">Winners</span>
                </h1>
                <p className="text-sm sm:text-base text-white/40 font-light max-w-lg mx-auto leading-relaxed">
                  Celebrating our lucky winners. Complete partner registrations and enter contests for your chance to be featured here!
                </p>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : winners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {winners.map((winner, i) => (
                <WinnerCard key={winner.id} winner={winner} index={i + 1} />
              ))}
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
              <div className="glass-card p-10 sm:p-16 text-center">
                <div className="card-shine" />
                <div className="relative z-[2]">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
                    <Star className="w-7 h-7 text-white/20" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-3">No Winners Yet</h3>
                  <p className="text-white/35 font-light text-sm leading-relaxed max-w-md mx-auto mb-6">
                    Winners will be announced within 24-48 hours after verification, when a contest fills up. Enter now for your chance!
                  </p>
                  <Link href="/giveaway" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white/70 font-light hover:bg-white/[0.08] transition-all">
                    <Sparkles className="w-4 h-4" />
                    Enter a Contest
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="mt-12">
            <div className="glass-card p-6 sm:p-8">
              <div className="card-shine" />
              <div className="relative z-[2] text-center">
                <h3 className="text-lg sm:text-xl font-display font-light text-white mb-2">Want to Be Next?</h3>
                <p className="text-xs text-white/35 font-light mb-4">Join our active contests and you could be our next winner!</p>
                <Link href="/giveaway" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white/70 font-light hover:bg-white/[0.08] transition-all">
                  <Trophy className="w-4 h-4" />
                  Browse Contests
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
