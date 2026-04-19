import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Search, CheckCircle2, Loader2, ArrowLeft, Shield, Sparkles, Trophy,
  Hash, User as UserIcon, Ticket, AlertCircle,
} from "lucide-react";
import { checkEntryCode } from "@/lib/api";
import SiteFooter from "@/components/SiteFooter";
import ConfettiEffect from "@/components/ConfettiEffect";

interface EntryResult {
  entryCode: string;
  fullName: string;
  entryCount: number;
}

export default function EntryCheck() {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<EntryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);

  const handleCheck = useCallback(async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setChecking(true);
    setError(null);
    setResult(null);
    try {
      const res = await checkEntryCode(trimmed);
      if (res?.found && res.entry) {
        setResult(res.entry as EntryResult);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 1800);
      } else {
        setError(res?.error || "No entry found for that code. Please double-check and try again.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong while checking that code.";
      setError(msg);
    } finally {
      setChecking(false);
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="relative z-10 pt-[70px] pb-16 sm:pb-24">
        <div className="container mx-auto px-4 max-w-2xl pt-8 sm:pt-12">

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <Link
              href="/giveaway"
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-display text-white/45 hover:text-white/80 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Contest Hub
            </Link>
          </motion.div>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[28px] overflow-hidden"
            style={{
              background: "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* Decorative top wash */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-40 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)",
              }}
            />
            <ConfettiEffect active={confetti} />

            <div className="relative z-[2] p-6 sm:p-9">

              {/* Eyebrow pill */}
              <div className="text-center mb-5">
                <div className="glass-pill-badge inline-flex">
                  <Shield className="w-3 h-3 mr-2 text-white/60" />
                  Verified Entry Lookup
                </div>
              </div>

              {/* Title */}
              <h1 className="text-center text-2xl sm:text-3xl md:text-4xl font-display font-light text-white mb-3 leading-[1.15] tracking-tight">
                Check Your Entry
              </h1>
              <p className="text-center text-white/50 text-xs sm:text-sm font-light leading-relaxed max-w-md mx-auto mb-7">
                Enter your X247 code to verify your contest entry and view your details.
              </p>

              {/* Input */}
              <div className="space-y-3">
                <label htmlFor="entry-code" className="block">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-white/35 font-display mb-2">
                    Entry Code
                  </span>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    <input
                      id="entry-code"
                      type="text"
                      value={code}
                      onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
                      onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                      placeholder="X247-XXXX-XXXX"
                      autoComplete="off"
                      autoFocus
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm sm:text-base text-white placeholder-white/20 font-mono tracking-wider focus:outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    />
                  </div>
                </label>

                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={checking || !code.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-display font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(140deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.08) inset, 0 6px 20px rgba(0,0,0,0.25)",
                  }}
                >
                  {checking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Check Entry
                    </>
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-start gap-2.5 p-3 rounded-xl"
                  style={{
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.18)",
                  }}
                >
                  <AlertCircle className="w-4 h-4 text-red-400/80 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300/80 font-light leading-relaxed">{error}</p>
                </motion.div>
              )}

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-6 rounded-2xl overflow-hidden relative"
                  style={{
                    background: "linear-gradient(150deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-white/85" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-display">Status</div>
                        <div className="text-sm font-display text-white">Entry Verified</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <ResultField icon={<Hash className="w-3.5 h-3.5" />} label="Code" value={result.entryCode} mono />
                      <ResultField icon={<UserIcon className="w-3.5 h-3.5" />} label="Name" value={result.fullName} />
                      <ResultField icon={<Ticket className="w-3.5 h-3.5" />} label="Entries" value={String(result.entryCount)} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Helper footer */}
              <div className="mt-6 pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-center gap-4 text-[10px] sm:text-[11px] text-white/40 font-light">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-white/35" />
                    Instant verification
                  </span>
                  <span className="w-px h-3 bg-white/10" />
                  <span className="inline-flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-white/35" />
                    Privacy protected
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Below: helper card */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-white/35 font-light">
              Don't have a code yet?{" "}
              <Link href="/giveaway" className="text-white/70 hover:text-white underline-offset-4 hover:underline transition-colors">
                Browse contests
              </Link>
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function ResultField({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-1.5 text-white/35 mb-1">
        {icon}
        <span className="text-[9px] uppercase tracking-[0.18em] font-display">{label}</span>
      </div>
      <div
        className={`text-xs sm:text-sm text-white/85 truncate ${mono ? "font-mono tracking-wider" : "font-light"}`}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}
