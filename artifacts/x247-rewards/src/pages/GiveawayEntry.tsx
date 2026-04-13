import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Trophy, Sparkles, Shield, Camera, CheckCircle2, AlertCircle,
  Clock, Users, ArrowRight, Gift, Star, ExternalLink, Loader2, PartyPopper
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import { getPartners, getGiveawayStatus, submitGiveawayEntry, type PartnerData, type GiveawayStatus } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function GiveawayEntry() {
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [status, setStatus] = useState<GiveawayStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    city: "",
  });
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  const [screenshotConfirmed, setScreenshotConfirmed] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    Promise.all([
      getPartners().then(setPartners),
      getGiveawayStatus().then(setStatus),
    ]).finally(() => setLoading(false));
  }, []);

  const activePartners = partners.filter((p) => p.isActive);
  const requiredPartners = activePartners.filter((p) => p.isRequired);
  const allRequiredSelected = requiredPartners.every((p) => selectedPartners.includes(p.id));

  function togglePartner(id: number) {
    setSelectedPartners((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!allRequiredSelected) {
      setError("You must complete all required partner registrations before entering.");
      return;
    }

    if (selectedPartners.length === 0) {
      setError("Please select at least one partner you've registered with.");
      return;
    }

    if (!screenshotConfirmed) {
      setError("You must confirm you have screenshot proof of your registrations.");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    const age = parseInt(form.age);
    if (isNaN(age) || age < 18) {
      setError("You must be 18 or older to participate.");
      return;
    }

    setSubmitting(true);
    const result = await submitGiveawayEntry({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      age,
      city: form.city,
      completedPartners: selectedPartners,
      screenshotConfirmed,
      agreedToTerms,
    });

    if (result.success) {
      setSubmitted(true);
      setSuccessMessage(result.message);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <SiteNav activePage="home" />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
        </div>
      </div>
    );
  }

  const announcementDate = status?.announcementDate
    ? new Date(status.announcementDate).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "To be announced";

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white">
        <SiteNav activePage="home" />
        <div className="noise-overlay" />
        <div className="vignette-overlay" />
        <div className="flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-lg text-center"
          >
            <div className="glass-card p-8 sm:p-12">
              <div className="card-top-accent card-top-accent-navy" />
              <div className="card-shine" />
              <div className="relative z-[2]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <PartyPopper className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-light text-white mb-3">You're In!</h2>
                <p className="text-white/60 text-sm font-light mb-6 leading-relaxed">{successMessage}</p>
                <div className="glass-card p-4 mb-6">
                  <div className="card-shine" />
                  <div className="relative z-[2] flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-widest text-white/30 font-display">Winner Announcement</p>
                      <p className="text-sm text-white font-light">{announcementDate}</p>
                    </div>
                  </div>
                </div>
                <Link href="/partners" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-display font-light hover:bg-white/[0.1] transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  Register with More Partners
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNav activePage="home" />
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" className="text-center mb-10">
            <motion.div variants={fadeUp} custom={0} className="flex items-center justify-center gap-2 mb-4">
              <span className="glass-pill-badge">
                <Gift className="w-3.5 h-3.5 text-white/60" />
                <span className="text-[11px] text-white/60 font-light">Daily Prize Draw</span>
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-display font-light text-white mb-4">
              Enter the Giveaway
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-white/40 text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
              Complete partner registrations, submit your proof, and earn entries into the daily prize draw. More registrations = more entries = higher chances of winning!
            </motion.p>
          </motion.div>

          <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible" className="grid grid-cols-3 gap-3 mb-8">
            <div className="glass-card p-4 text-center">
              <div className="card-shine" />
              <div className="relative z-[2]">
                <div className="text-2xl font-display font-light text-white">{status?.spotsRemaining ?? "..."}</div>
                <div className="text-[9px] uppercase tracking-widest text-white/30 font-display mt-1">Spots Left</div>
              </div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="card-shine" />
              <div className="relative z-[2]">
                <div className="text-2xl font-display font-light text-white">{status?.maxSpots ?? 100}</div>
                <div className="text-[9px] uppercase tracking-widest text-white/30 font-display mt-1">Total Spots</div>
              </div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="card-shine" />
              <div className="relative z-[2]">
                <div className="text-2xl font-display font-light text-amber-400">{activePartners.length}</div>
                <div className="text-[9px] uppercase tracking-widest text-white/30 font-display mt-1">Partners</div>
              </div>
            </div>
          </motion.div>

          {status?.isFull ? (
            <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible" className="glass-card p-8 text-center">
              <div className="card-shine" />
              <div className="relative z-[2]">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-display font-light text-white mb-2">Contest Full</h2>
                <p className="text-white/40 text-sm font-light mb-4">All {status.maxSpots} spots have been taken. Stay tuned for the next giveaway!</p>
                <div className="flex items-center gap-3 justify-center">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-white/60 font-light">Winner announcement: {announcementDate}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible">
              <div className="glass-card p-5 sm:p-6 mb-6">
                <div className="card-top-accent card-top-accent-red" />
                <div className="card-shine" />
                <div className="relative z-[2]">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-light text-white mb-1">Before You Enter</h3>
                      <p className="text-xs text-white/40 font-light leading-relaxed">
                        Make sure you have completed partner registrations successfully. You will need to provide proof (screenshot) of each registration you've completed.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: "Complete all required partner registrations first" },
                      { icon: <Camera className="w-3.5 h-3.5" />, text: "Take a screenshot after each successful registration as proof" },
                      { icon: <Star className="w-3.5 h-3.5" />, text: "More partners you join = more entries = higher chances of winning" },
                      { icon: <Trophy className="w-3.5 h-3.5" />, text: "Each partner registration counts as 1 separate entry" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02]">
                        <span className="text-red-400/70">{item.icon}</span>
                        <span className="text-xs text-white/50 font-light">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="glass-card p-5 sm:p-6">
                  <div className="card-top-accent card-top-accent-navy" />
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em]">Step 1</span>
                      <span className="text-[10px] text-white/20">—</span>
                      <span className="text-sm font-display font-light text-white">Select Completed Registrations</span>
                    </div>
                    <p className="text-xs text-white/35 font-light mb-4">
                      Select the partners you've successfully registered with. Each selected partner = 1 entry into the draw. Partners marked as "Required" must be selected.
                    </p>
                    <div className="space-y-2">
                      {activePartners.map((partner) => {
                        const isSelected = selectedPartners.includes(partner.id);
                        const isRequired = partner.isRequired;
                        return (
                          <label
                            key={partner.id}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                              isSelected
                                ? "bg-white/[0.06] border-white/[0.12]"
                                : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePartner(partner.id)}
                              className="accent-blue-500 w-4 h-4 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-white font-light">{partner.name}</span>
                                {isRequired && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-[8px] text-red-400 font-display">REQUIRED</span>
                                )}
                                {partner.badgeSecondary && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-[8px] text-blue-400 font-display">{partner.badgeSecondary}</span>
                                )}
                              </div>
                              <p className="text-[11px] text-white/30 font-light truncate mt-0.5">{partner.tagline}</p>
                            </div>
                            <Link
                              href={`/partners/${partner.slug}`}
                              className="text-white/20 hover:text-white/50 transition-colors shrink-0"
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </label>
                        );
                      })}
                    </div>
                    {selectedPartners.length > 0 && (
                      <div className="mt-4 px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/10">
                        <p className="text-xs text-green-400/80 font-light">
                          <Star className="w-3 h-3 inline mr-1" />
                          You'll earn <strong className="font-medium">{selectedPartners.length} {selectedPartners.length === 1 ? "entry" : "entries"}</strong> into the daily prize draw!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-card p-5 sm:p-6">
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em]">Step 2</span>
                      <span className="text-[10px] text-white/20">—</span>
                      <span className="text-sm font-display font-light text-white">Your Details</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Full Name *</label>
                        <input
                          type="text" required value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Email *</label>
                        <input
                          type="email" required value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Phone *</label>
                        <input
                          type="tel" required value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">Age *</label>
                        <input
                          type="number" required min={18} value={form.age}
                          onChange={(e) => setForm({ ...form, age: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                          placeholder="18+"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em] block mb-2">City *</label>
                        <input
                          type="text" required value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-light placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                          placeholder="Your city"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5 sm:p-6">
                  <div className="card-shine" />
                  <div className="relative z-[2]">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-[10px] font-display font-medium text-white/40 uppercase tracking-[0.15em]">Step 3</span>
                      <span className="text-[10px] text-white/20">—</span>
                      <span className="text-sm font-display font-light text-white">Verification & Agreement</span>
                    </div>

                    <div className="space-y-3">
                      <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${screenshotConfirmed ? "bg-green-500/5 border-green-500/15" : "bg-white/[0.02] border-white/[0.05]"}`}>
                        <input
                          type="checkbox"
                          checked={screenshotConfirmed}
                          onChange={(e) => setScreenshotConfirmed(e.target.checked)}
                          className="accent-green-500 w-4 h-4 shrink-0 mt-0.5"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Camera className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-sm text-white font-light">Screenshot Proof Confirmation</span>
                          </div>
                          <p className="text-[11px] text-white/35 font-light leading-relaxed">
                            I confirm that I have taken screenshots of my completed registration forms for all selected partners above. I understand that I may be asked to provide these screenshots as proof and failure to do so may result in disqualification.
                          </p>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${agreedToTerms ? "bg-green-500/5 border-green-500/15" : "bg-white/[0.02] border-white/[0.05]"}`}>
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="accent-green-500 w-4 h-4 shrink-0 mt-0.5"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-sm text-white font-light">Terms & Conditions Agreement</span>
                          </div>
                          <p className="text-[11px] text-white/35 font-light leading-relaxed">
                            I agree to the X247 Rewards terms and conditions. I confirm that I am 18 years or older, all information provided is accurate, and I have genuinely completed the partner registrations I've selected. I understand that fraudulent entries will be disqualified.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 sm:p-5">
                  <div className="card-shine" />
                  <div className="relative z-[2] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-white/50 font-light">
                        <strong className="text-white/70 font-medium">Limited Spots:</strong> Only {status?.maxSpots ?? 100} entries accepted. {status?.spotsRemaining ?? "..."} spots remaining.
                      </p>
                      <p className="text-xs text-white/35 font-light mt-1">
                        Winner announcement: <strong className="text-amber-400/80 font-medium">{announcementDate}</strong>. Once all spots are filled, no more entries will be accepted.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !allRequiredSelected || selectedPartners.length === 0 || !screenshotConfirmed || !agreedToTerms}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-white text-sm font-display font-light transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, rgba(140, 20, 30, 0.3) 0%, rgba(20, 30, 80, 0.3) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Submit Entry — Earn {selectedPartners.length || 0} {selectedPartners.length === 1 ? "Entry" : "Entries"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
