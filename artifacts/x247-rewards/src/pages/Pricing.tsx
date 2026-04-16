import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import {
  Sparkles, Crown, Star, Diamond, Check, X, ArrowRight,
  Zap, Shield, Headphones, Trophy, CalendarDays, Gift,
  Mic, BadgeCheck, Users, Rocket, Phone, CreditCard, Globe,
} from "lucide-react";
import { purchaseMembership } from "@/lib/api";

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    tagline: "Start your journey",
    taglineDetail: "Explore giveaways at zero cost",
    perContest: 1,
    perMonth: 29,
    icon: Sparkles,
    features: [
      { label: "Entries per contest", value: "1" },
      { label: "Monthly entry cap", value: "29" },
      { label: "Text AI chat", available: true },
      { label: "Browse all partners", available: true },
      { label: "Standard contest access", available: true },
      { label: "Priority support", available: false },
      { label: "Voice AI chat", available: false },
      { label: "Verified badge", available: false },
      { label: "Partner deals", available: false },
      { label: "VIP support", available: false },
      { label: "Concierge service", available: false },
      { label: "Account manager", available: false },
      { label: "Physical VIP card", available: false },
      { label: "Annual luxury gift", available: false },
    ],
    highlights: [
      { icon: Trophy, text: "1 entry / contest" },
      { icon: Sparkles, text: "Text AI chat" },
      { icon: Globe, text: "All partners" },
    ],
  },
  {
    id: "silver",
    name: "Silver",
    price: 199,
    tagline: "For active members",
    taglineDetail: "More entries, priority perks",
    perContest: 3,
    perMonth: 69,
    icon: Star,
    features: [
      { label: "Entries per contest", value: "3" },
      { label: "Monthly entry cap", value: "69" },
      { label: "Unlimited text chat", available: true },
      { label: "Browse all partners", available: true },
      { label: "Priority support", available: true },
      { label: "Early partner access", available: true },
      { label: "Partner insights", available: true },
      { label: "Voice AI chat", available: false },
      { label: "Verified badge", available: false },
      { label: "VIP support", available: false },
      { label: "Concierge service", available: false },
      { label: "Account manager", available: false },
      { label: "Physical VIP card", available: false },
      { label: "Annual luxury gift", available: false },
    ],
    highlights: [
      { icon: Trophy, text: "3 entries / contest" },
      { icon: Headphones, text: "Priority support" },
      { icon: Zap, text: "Early access" },
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 499,
    tagline: "For dedicated members",
    taglineDetail: "Voice AI, verified status & more",
    perContest: 7,
    perMonth: 149,
    popular: true,
    icon: Crown,
    features: [
      { label: "Entries per contest", value: "7" },
      { label: "Monthly entry cap", value: "149" },
      { label: "Premium AI voice chat", available: true },
      { label: "Browse all partners", available: true },
      { label: "Verified badge", available: true },
      { label: "Exclusive partner deals", available: true },
      { label: "Priority everything", available: true },
      { label: "VIP support", available: true },
      { label: "Early partner access", available: true },
      { label: "Partner insights", available: true },
      { label: "Concierge service", available: false },
      { label: "Account manager", available: false },
      { label: "Physical VIP card", available: false },
      { label: "Annual luxury gift", available: false },
    ],
    highlights: [
      { icon: Trophy, text: "7 entries / contest" },
      { icon: Mic, text: "Voice AI chat" },
      { icon: BadgeCheck, text: "Verified badge" },
    ],
  },
  {
    id: "black",
    name: "Black",
    price: 999,
    tagline: "The pinnacle of membership",
    taglineDetail: "Every luxury, all features, zero limits",
    perContest: 15,
    perMonth: 299,
    icon: Diamond,
    features: [
      { label: "Entries per contest", value: "15" },
      { label: "Monthly entry cap", value: "299" },
      { label: "Unlimited premium voice AI", available: true },
      { label: "Browse all partners", available: true },
      { label: "Verified + Black badge", available: true },
      { label: "Exclusive partner deals", available: true },
      { label: "Priority everything", available: true },
      { label: "VIP support", available: true },
      { label: "Early partner access", available: true },
      { label: "Partner insights", available: true },
      { label: "Concierge service", available: true },
      { label: "Personal account manager", available: true },
      { label: "Physical Black VIP card", available: true },
      { label: "Annual luxury surprise gift", available: true },
    ],
    highlights: [
      { icon: Trophy, text: "15 entries / contest" },
      { icon: Diamond, text: "Concierge + manager" },
      { icon: CreditCard, text: "Physical VIP card" },
    ],
  },
];

const BLACK_EXTRAS = [
  "Early winner announcements (24h before public)",
  "Exclusive Black-only members events",
  "Birthday bonus entries (3× for a week)",
  "Custom profile theme on public profile",
  "First-look access to new partners",
  "Lifetime priority queue across all draws",
];

function PlanCard({ tier, index, activeTier, onPurchase, purchasing }: {
  tier: typeof TIERS[0];
  index: number;
  activeTier: string | null;
  onPurchase: (id: string) => void;
  purchasing: string | null;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 18 });

  const isBlack = tier.id === "black";
  const isGold = tier.id === "gold";
  const isCurrent = activeTier === tier.id;
  const isFree = tier.id === "free";
  const isSilver = tier.id === "silver";
  const tierIndex = ["free", "silver", "gold", "black"].indexOf(tier.id);
  const activeIndex = ["free", "silver", "gold", "black"].indexOf(activeTier || "free");
  const isDowngrade = tierIndex < activeIndex;
  const Icon = tier.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };
  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`pricing-card ${isBlack ? "pricing-card-black" : ""} ${isGold ? "pricing-card-gold" : ""} ${isCurrent ? "pricing-card-current" : ""}`}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        "--mouse-x": springX,
        "--mouse-y": springY,
      } as any}
    >
      {isBlack && <div className="pricing-black-shimmer" />}
      <div className="pricing-card-glow" />

      {tier.popular && !isCurrent && (
        <div className="pricing-ribbon">
          <Star className="w-2.5 h-2.5" />
          <span>Most Popular</span>
        </div>
      )}
      {isCurrent && (
        <div className="pricing-ribbon pricing-ribbon-active">
          <Check className="w-2.5 h-2.5" />
          <span>Your Plan</span>
        </div>
      )}
      {isBlack && !isCurrent && (
        <div className="pricing-ribbon pricing-ribbon-black">
          <Diamond className="w-2.5 h-2.5" />
          <span>Black</span>
        </div>
      )}

      <div className="relative z-[2] flex flex-col h-full">
        <div className={`pricing-card-icon-wrap ${isBlack ? "pricing-card-icon-wrap-black" : ""}`}>
          <Icon className="w-6 h-6" />
          {isBlack && <div className="pricing-icon-pulse" />}
        </div>

        <h2 className="pricing-card-name">{tier.name}</h2>
        <p className="pricing-card-tagline">{tier.tagline}</p>
        <p className="pricing-card-tagline-detail">{tier.taglineDetail}</p>

        <div className="pricing-price-block">
          {isFree ? (
            <>
              <span className="pricing-price-main">Free</span>
              <span className="pricing-price-period">forever</span>
            </>
          ) : (
            <>
              <span className="pricing-price-currency">₹</span>
              <span className="pricing-price-main">{tier.price}</span>
              <span className="pricing-price-period">/month</span>
            </>
          )}
        </div>

        <div className="pricing-entry-badges">
          <div className="pricing-entry-badge">
            <Trophy className="w-3 h-3" />
            <strong>{tier.perContest}</strong>
            <span>per contest</span>
          </div>
          <div className="pricing-entry-badge">
            <CalendarDays className="w-3 h-3" />
            <strong>{tier.perMonth}</strong>
            <span>per month</span>
          </div>
        </div>

        <div className="pricing-highlights">
          {tier.highlights.map((h, i) => (
            <div key={i} className="pricing-highlight-item">
              <h.icon className="w-3 h-3 shrink-0 opacity-60" />
              <span>{h.text}</span>
            </div>
          ))}
        </div>

        <div className="pricing-features-list">
          {tier.features.slice(2).map((f, i) => (
            <div key={i} className={`pricing-feature-row ${!f.available ? "pricing-feature-row-off" : ""}`}>
              {f.available ? (
                <div className="pricing-feature-check"><Check className="w-2.5 h-2.5" /></div>
              ) : (
                <div className="pricing-feature-cross"><X className="w-2.5 h-2.5" /></div>
              )}
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        {isBlack && (
          <div className="pricing-black-extras">
            <div className="pricing-black-extras-label">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Plus exclusive luxuries</span>
            </div>
            {BLACK_EXTRAS.map((e, i) => (
              <div key={i} className="pricing-black-extra-row">
                <Gift className="w-2.5 h-2.5 shrink-0 opacity-50" />
                <span>{e}</span>
              </div>
            ))}
          </div>
        )}

        <button
          className={`pricing-cta-btn ${isBlack && !isCurrent ? "pricing-cta-btn-black" : ""} ${isCurrent ? "pricing-cta-btn-current" : ""}`}
          disabled={!!purchasing || isCurrent || isDowngrade}
          onClick={() => !isCurrent && !isDowngrade && onPurchase(tier.id)}
        >
          {purchasing === tier.id ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-3.5 h-3.5 border border-current/30 border-t-current/80 rounded-full animate-spin" />
              Processing…
            </span>
          ) : isCurrent ? (
            "Current Plan"
          ) : isDowngrade ? (
            "Downgrade"
          ) : isFree ? (
            "Stay on Free"
          ) : (
            <span className="flex items-center gap-1.5 justify-center">
              Get {tier.name}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function ComparisonTable({ activeTier }: { activeTier: string | null }) {
  const rows = [
    { label: "Monthly entry cap", values: ["29", "69", "149", "299"] },
    { label: "Entries per contest", values: ["1", "3", "7", "15"] },
    { label: "Text AI chat", values: [true, true, true, true] },
    { label: "Voice AI chat", values: [false, false, true, true] },
    { label: "Verified badge", values: [false, false, true, true] },
    { label: "Priority support", values: [false, true, true, true] },
    { label: "Partner deals", values: [false, false, true, true] },
    { label: "Concierge service", values: [false, false, false, true] },
    { label: "Account manager", values: [false, false, false, true] },
    { label: "Physical VIP card", values: [false, false, false, true] },
    { label: "Annual luxury gift", values: [false, false, false, true] },
    { label: "Birthday bonus entries", values: [false, false, false, true] },
  ];

  const tiers = ["Free", "Silver", "Gold", "Black"];
  const tierIds = ["free", "silver", "gold", "black"];

  return (
    <div className="pricing-table-wrap">
      <div className="pricing-table-header-row">
        <div className="pricing-table-label-col" />
        {tiers.map((t, i) => (
          <div key={t} className={`pricing-table-tier-col ${activeTier === tierIds[i] ? "pricing-table-tier-active" : ""} ${t === "Black" ? "pricing-table-tier-black" : ""}`}>
            <span className="pricing-table-tier-name">{t}</span>
          </div>
        ))}
      </div>
      {rows.map((row, ri) => (
        <motion.div
          key={row.label}
          className="pricing-table-row"
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: ri * 0.04 }}
        >
          <div className="pricing-table-label-col pricing-table-row-label">{row.label}</div>
          {row.values.map((v, i) => (
            <div key={i} className={`pricing-table-tier-col pricing-table-value ${activeTier === tierIds[i] ? "pricing-table-value-active" : ""}`}>
              {typeof v === "boolean" ? (
                v ? (
                  <div className="pricing-table-check"><Check className="w-3 h-3" /></div>
                ) : (
                  <div className="pricing-table-cross"><X className="w-3 h-3" /></div>
                )
              ) : (
                <span className="pricing-table-number">{v}</span>
              )}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

export default function Pricing() {
  const [, navigate] = useLocation();
  const [activeTier, setActiveTier] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (!token) return;
    fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((u) => setActiveTier(u?.membershipTier || null))
      .catch(() => {});
  }, []);

  const handlePurchase = async (planId: string) => {
    const token = localStorage.getItem("user_token");
    if (!token) { navigate("/account"); return; }
    setPurchasing(planId);
    try {
      await purchaseMembership(planId);
      setActiveTier(planId);
      setToast({ msg: `Upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)}!`, ok: true });
    } catch (e: any) {
      setToast({ msg: e.message || "Purchase failed", ok: false });
    } finally {
      setPurchasing(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="pricing-page">
      <SiteNav activePage="home" />

      <AnimatePresence>
        {toast && (
          <motion.div
            className={`pricing-toast ${toast.ok ? "pricing-toast-ok" : "pricing-toast-err"}`}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
          >
            {toast.ok ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pricing-page-inner">
        <div className="pricing-bg-grid" />
        <div className="pricing-bg-radial" />

        <motion.div
          className="pricing-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="pricing-hero-badge">
            <Sparkles className="w-3 h-3" />
            <span>Membership Tiers</span>
          </div>
          <h1 className="pricing-hero-title">
            Choose your<br />
            <span className="pricing-hero-title-accent">X247 tier</span>
          </h1>
          <p className="pricing-hero-subtitle">
            Every tier unlocks more entries, exclusive perks, and a richer giveaway experience.
            <br className="hidden sm:block" /> Cancel or upgrade anytime — no lock-in.
          </p>

          <div className="pricing-hero-pills">
            <div className="pricing-hero-pill"><Shield className="w-3 h-3" /><span>Cancel anytime</span></div>
            <div className="pricing-hero-pill"><Zap className="w-3 h-3" /><span>Instant activation</span></div>
            <div className="pricing-hero-pill"><Gift className="w-3 h-3" /><span>Real prizes</span></div>
          </div>
        </motion.div>

        <div className="pricing-cards-grid">
          {TIERS.map((tier, i) => (
            <PlanCard
              key={tier.id}
              tier={tier}
              index={i}
              activeTier={activeTier}
              onPurchase={handlePurchase}
              purchasing={purchasing}
            />
          ))}
        </div>

        <motion.div
          className="pricing-table-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <button
            className="pricing-table-toggle"
            onClick={() => setShowTable((v) => !v)}
          >
            <span>{showTable ? "Hide" : "Show"} full comparison table</span>
            <motion.span
              animate={{ rotate: showTable ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="inline-block"
            >
              ↓
            </motion.span>
          </button>

          <AnimatePresence>
            {showTable && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ overflow: "hidden" }}
              >
                <ComparisonTable activeTier={activeTier} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="pricing-faq"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="pricing-faq-title">Common questions</h2>
          <div className="pricing-faq-grid">
            {[
              { q: "Can I upgrade or downgrade anytime?", a: "Yes. Upgrades take effect instantly. Downgrades take effect at your next billing cycle." },
              { q: "Is there a free trial for paid tiers?", a: "No trial period, but the Free tier is fully functional with no expiry." },
              { q: "Are entries per contest cumulative?", a: "Each paid tier gives you a higher cap per individual contest and per month total." },
              { q: "What is the physical Black VIP card?", a: "Black members receive a premium embossed membership card shipped to their address within 7–14 business days." },
              { q: "How does the concierge service work?", a: "Black members get a dedicated WhatsApp/email contact for any X247 related query — available 7 days a week." },
              { q: "Are all prices inclusive of tax?", a: "Displayed prices are exclusive of GST. Applicable tax will be added at checkout." },
            ].map((item, i) => (
              <div key={i} className="pricing-faq-item">
                <div className="pricing-faq-q">{item.q}</div>
                <div className="pricing-faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="pricing-back-row"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link href="/account" className="pricing-back-link">
            ← Back to Account
          </Link>
        </motion.div>
      </div>

      <SiteFooter />
    </div>
  );
}
