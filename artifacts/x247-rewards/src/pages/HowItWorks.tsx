import React, { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import {
  UserPlus, Trophy, Gift, Sparkles, ArrowRight, Check,
  Shield, Zap, Star, Crown, Diamond, BadgeCheck,
  BarChart3, Globe, Users, Lock, RefreshCw, Layers,
  ChevronDown, Target, Flame, CreditCard, Headphones,
  CalendarDays, Wallet, Hash, Eye, Repeat, Award,
} from "lucide-react";

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

/* ─── Section header ─── */
function SectionHeader({ badge, title, sub }: { badge: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="hiw-section-header">
      <div className="hiw-badge">
        <Sparkles className="w-3 h-3" />
        <span>{badge}</span>
      </div>
      <h2 className="hiw-section-title">{title}</h2>
      {sub && <p className="hiw-section-sub">{sub}</p>}
    </div>
  );
}

/* ─── Step card ─── */
function StepCard({ num, icon: Icon, title, desc, items, delay }: {
  num: string; icon: any; title: string; desc: string; items?: string[]; delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className="hiw-step-card"
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <div className="hiw-step-num">{num}</div>
      <div className="hiw-step-icon-wrap">
        <Icon className="w-6 h-6" />
        <div className="hiw-step-icon-glow" />
      </div>
      <h3 className="hiw-step-title">{title}</h3>
      <p className="hiw-step-desc">{desc}</p>
      {items && (
        <ul className="hiw-step-items">
          {items.map((item, i) => (
            <li key={i} className="hiw-step-item">
              <Check className="w-3 h-3 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

/* ─── Tier row ─── */
function TierRow({ tier, icon: Icon, price, entries, perMonth, perks, isBlack = false }: {
  tier: string; icon: any; price: string; entries: string; perMonth: string; perks: string[]; isBlack?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      className={`hiw-tier-row ${isBlack ? "hiw-tier-row--black" : ""}`}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {isBlack && <div className="hiw-tier-shimmer" aria-hidden />}
      <div className="hiw-tier-left">
        <div className={`hiw-tier-icon ${isBlack ? "hiw-tier-icon--black" : ""}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="hiw-tier-name">{tier}</div>
          <div className="hiw-tier-price">{price}</div>
        </div>
      </div>
      <div className="hiw-tier-entries">
        <span className="hiw-tier-entries-num">{entries}</span>
        <span className="hiw-tier-entries-lbl">per contest</span>
      </div>
      <div className="hiw-tier-entries">
        <span className="hiw-tier-entries-num">{perMonth}</span>
        <span className="hiw-tier-entries-lbl">per month</span>
      </div>
      <div className="hiw-tier-perks">
        {perks.map((p, i) => (
          <span key={i} className="hiw-tier-perk">{p}</span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── FAQ item ─── */
function FaqItem({ q, a, delay = 0 }: { q: string; a: string; delay?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <motion.div
      ref={ref}
      className="hiw-faq-item"
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <button className="hiw-faq-q" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-4 h-4 text-white/30" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="hiw-faq-a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hiw-faq-a-inner">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Mechanic card ─── */
function MechanicCard({ icon: Icon, title, desc, delay = 0 }: { icon: any; title: string; desc: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      className="hiw-mechanic-card"
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <div className="hiw-mechanic-icon">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="hiw-mechanic-title">{title}</div>
        <div className="hiw-mechanic-desc">{desc}</div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════ */

export default function HowItWorks() {
  return (
    <div className="hiw-page">
      <SiteNav activePage="how-it-works" />

      {/* ── Hero ── */}
      <section className="hiw-hero">
        <div className="hiw-hero-bg-grid" aria-hidden />
        <div className="hiw-hero-radial" aria-hidden />
        <div className="hiw-hero-noise" aria-hidden />

        <motion.div
          className="hiw-hero-inner"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hiw-hero-badge">
            <Target className="w-3 h-3" />
            <span>Transparent &amp; Simple</span>
          </div>

          <h1 className="hiw-hero-title">
            How X247
            <br />
            <span className="hiw-hero-accent">actually works</span>
          </h1>

          <p className="hiw-hero-subtitle">
            No tricks, no hidden rules — just a clean, fair system designed to give you the best shot at winning real prizes from top brands. Here's every detail, laid bare.
          </p>

          <div className="hiw-hero-pills">
            <div className="hiw-hero-pill"><Shield className="w-3 h-3" /><span>100% Fair</span></div>
            <div className="hiw-hero-pill"><Eye className="w-3 h-3" /><span>Fully Transparent</span></div>
            <div className="hiw-hero-pill"><Lock className="w-3 h-3" /><span>Secure</span></div>
            <div className="hiw-hero-pill"><RefreshCw className="w-3 h-3" /><span>Always Free to Join</span></div>
          </div>

          <motion.div
            className="hiw-hero-scroll"
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-white/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Three-step overview ── */}
      <section className="hiw-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <SectionHeader
            badge="The Process"
            title={<>Three steps.<br />Infinite possibilities.</>}
            sub="Getting started takes under 2 minutes. Here's how the whole journey looks from sign-up to winning."
          />

          <div className="hiw-steps-grid">
            {/* Connector lines between steps */}
            <div className="hiw-steps-connectors" aria-hidden>
              <div className="hiw-step-connector" />
              <div className="hiw-step-connector" />
            </div>

            <StepCard
              num="01"
              icon={UserPlus}
              title="Create your account"
              desc="Sign up for free in seconds. Set up your profile, choose your username, and you're in — no payment card required."
              items={[
                "Free forever, no credit card",
                "Instant access to all contests",
                "Public profile with shareable link",
                "Upgrade your tier anytime",
              ]}
              delay={0}
            />
            <StepCard
              num="02"
              icon={Trophy}
              title="Enter giveaway contests"
              desc="Browse active contests from partner brands. Each contest has an entry window — submit your entry before it closes to be included in the draw."
              items={[
                "Up to 15 entries per contest (Black tier)",
                "Entry limit resets with each new contest",
                "Entries stack — more entries = better odds",
                "Join as many open contests as you like",
              ]}
              delay={1}
            />
            <StepCard
              num="03"
              icon={Gift}
              title="Win real prizes"
              desc="When a contest closes, our randomised draw picks the winner. Winners are notified instantly and announced publicly within 24 hours."
              items={[
                "Draws are randomised and tamper-proof",
                "Black members get 24h advance announcement",
                "Prize shipped or credited within 7 days",
                "All winners listed on the Winners Hall",
              ]}
              delay={2}
            />
          </div>
        </div>
      </section>

      {/* ── Entry mechanics ── */}
      <section className="hiw-section hiw-section--alt">
        <div className="container mx-auto px-4 max-w-5xl">
          <SectionHeader
            badge="Entry System"
            title={<>How entries<br />are counted</>}
            sub="Your membership tier determines how many entries you can submit per contest — and per month in total."
          />

          <div className="hiw-mechanics-grid">
            <MechanicCard
              icon={Hash}
              title="Entries per contest"
              desc="Each tier grants a fixed number of entries you can put into a single giveaway. More entries = proportionally better chance of winning that specific draw."
              delay={0}
            />
            <MechanicCard
              icon={CalendarDays}
              title="Monthly entry cap"
              desc="In addition to per-contest limits, there's a monthly cap on total entries. This resets on the 1st of every month, regardless of your billing date."
              delay={1}
            />
            <MechanicCard
              icon={Repeat}
              title="Contest windows"
              desc="Each contest runs for a defined period (visible on the contest card). You can enter at any point during the window — timing within the window doesn't affect your odds."
              delay={2}
            />
            <MechanicCard
              icon={Flame}
              title="Streak & bonus entries"
              desc="Black members earn 3× bonus entries during their birthday week. Consistent participation can also unlock streak bonuses in future seasons."
              delay={3}
            />
            <MechanicCard
              icon={BarChart3}
              title="XP & levelling"
              desc="Every entry earns you XP. Earn enough XP and your level goes up, unlocking cosmetic rewards and priority queue status in future contests."
              delay={4}
            />
            <MechanicCard
              icon={Wallet}
              title="Instant carry-over"
              desc="Unused monthly entries do not carry over. Maximise your entries by entering as many eligible contests as possible each month."
              delay={5}
            />
          </div>
        </div>
      </section>

      {/* ── Draw mechanics ── */}
      <section className="hiw-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <SectionHeader
            badge="The Draw"
            title={<>Transparent,<br />verifiable draws</>}
            sub="We use a cryptographically seeded randomised draw engine. Every draw result is auditable and logged permanently."
          />

          <div className="hiw-draw-grid">
            <motion.div
              className="hiw-draw-main"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="hiw-draw-main-glow" aria-hidden />
              <div className="hiw-draw-steps">
                {[
                  { icon: Lock, label: "Contest closes", desc: "Entry window ends. No new entries accepted." },
                  { icon: Hash, label: "Entry pool finalised", desc: "All valid entries compiled into an immutable pool." },
                  { icon: Zap, label: "Random seed generated", desc: "Cryptographic seed created at draw time — unpredictable and unique." },
                  { icon: Award, label: "Winner selected", desc: "Seed applied to pool. Winner is mathematically determined." },
                  { icon: BadgeCheck, label: "Winner verified", desc: "Identity confirmed. Result logged to draw history." },
                  { icon: Globe, label: "Public announcement", desc: "Winner listed in Winners Hall within 24 hours." },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    className="hiw-draw-step"
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.08 }}
                  >
                    <div className="hiw-draw-step-num">{String(i + 1).padStart(2, "0")}</div>
                    <div className="hiw-draw-step-icon">
                      <step.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="hiw-draw-step-label">{step.label}</div>
                      <div className="hiw-draw-step-desc">{step.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="hiw-draw-aside">
              {[
                { icon: Shield, title: "Tamper-proof", desc: "Draw seeds are generated externally and cannot be influenced by X247 staff or any participant." },
                { icon: Eye, title: "Auditable history", desc: "Every completed draw is logged in our public Winners Hall with draw ID, timestamp, and entry pool size." },
                { icon: Users, title: "Equal opportunity", desc: "Within your tier, every entry has exactly the same chance. Premium tiers simply give you more entries, not a higher individual probability." },
                { icon: Layers, title: "No pay-to-win", desc: "Paid tiers offer more entries — not inflated odds per entry. A free member with 1 entry has the same 1-in-N chance as any other single entry." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="hiw-draw-trust-card"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="hiw-draw-trust-icon">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="hiw-draw-trust-title">{item.title}</div>
                    <div className="hiw-draw-trust-desc">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tier ladder ── */}
      <section className="hiw-section hiw-section--alt">
        <div className="container mx-auto px-4 max-w-5xl">
          <SectionHeader
            badge="Membership Tiers"
            title={<>Four tiers.<br />You choose your level.</>}
            sub="Every tier is fully functional. Paid tiers simply multiply your entries and unlock premium perks."
          />

          <div className="hiw-tiers-wrap">
            <div className="hiw-tier-header-row">
              <div className="hiw-tier-col-tier">Tier</div>
              <div className="hiw-tier-col-num">Per Contest</div>
              <div className="hiw-tier-col-num">Per Month</div>
              <div className="hiw-tier-col-perks hiw-tier-col-perks--header">Key Perks</div>
            </div>

            <TierRow
              tier="Free"
              icon={Sparkles}
              price="₹0 forever"
              entries="1"
              perMonth="29"
              perks={["Text AI chat", "All partners access", "Standard support"]}
            />
            <TierRow
              tier="Silver"
              icon={Star}
              price="₹199 / month"
              entries="3"
              perMonth="69"
              perks={["Priority support", "Early partner access", "Partner insights"]}
            />
            <TierRow
              tier="Gold"
              icon={Crown}
              price="₹499 / month"
              entries="7"
              perMonth="149"
              perks={["Voice AI chat", "Verified badge", "Exclusive partner deals"]}
            />
            <TierRow
              tier="Black"
              icon={Diamond}
              price="₹999 / month"
              entries="15"
              perMonth="299"
              perks={["Physical VIP card", "Concierge + account manager", "Black-only events"]}
              isBlack
            />

            <motion.div
              className="hiw-tier-cta-row"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/pricing" className="hiw-tier-cta-link">
                Compare all tiers in detail
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Partner ecosystem ── */}
      <section className="hiw-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <SectionHeader
            badge="Partner Brands"
            title={<>How brands<br />participate</>}
            sub="X247 partners are real brands that sponsor prizes — from gadgets to fashion to lifestyle experiences."
          />

          <div className="hiw-partners-grid">
            {[
              { icon: CreditCard, title: "Brands fund the prizes", desc: "Each partner funds the prize pool for their giveaway. This keeps X247 free for members — brands pay, not you." },
              { icon: Target, title: "Partners set the contest rules", desc: "Partners define the prize, duration, and entry cap for their giveaway. X247 handles the draw infrastructure." },
              { icon: Globe, title: "Verified brand partnerships", desc: "Every partner goes through a vetting process. We only list legitimate brands — no unverified or suspicious sponsors." },
              { icon: BarChart3, title: "Brands get real insights", desc: "Partners receive aggregated, anonymised data on contest engagement. No personal data is shared without consent." },
              { icon: Headphones, title: "Dedicated partner support", desc: "Partners have a dedicated account manager. If a brand partner changes terms or withdraws, you'll be notified immediately." },
              { icon: Shield, title: "Prize guarantee", desc: "If a brand fails to deliver a prize, X247 guarantees the winner is made whole — either with an equivalent prize or credit." },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="hiw-partner-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="hiw-partner-icon">
                  <item.icon className="w-4 h-4" />
                </div>
                <h4 className="hiw-partner-title">{item.title}</h4>
                <p className="hiw-partner-desc">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="hiw-section hiw-section--alt">
        <div className="container mx-auto px-4 max-w-3xl">
          <SectionHeader
            badge="Questions"
            title={<>Everything<br />you need to know</>}
          />

          <div className="hiw-faq-list">
            {[
              { q: "Do I need to pay anything to enter giveaways?", a: "No. The Free tier is completely free and has no expiry. You can enter up to 1 contest slot per giveaway and 29 total entries per month at zero cost." },
              { q: "How are winners actually chosen?", a: "Winners are selected using a cryptographically seeded random number generator applied to the finalised entry pool. The draw cannot be influenced by anyone at X247 or externally. Draw logs are permanently stored and viewable in the Winners Hall." },
              { q: "What happens if I enter and then cancel my subscription?", a: "Entries already submitted for an open contest remain valid even if you downgrade or cancel before the draw closes. Your membership tier at the time of entry is what counts." },
              { q: "Can I enter the same contest multiple times?", a: "Yes — your tier determines how many entries you can submit to a single contest. All entries are submitted at once when you click 'Enter'. You cannot top-up entries for the same contest later." },
              { q: "How long does prize delivery take?", a: "Digital prizes (vouchers, credits) are delivered within 24 hours of winner verification. Physical prizes are dispatched within 7 business days and delivered within 7–14 business days depending on location." },
              { q: "Is my personal data shared with brand partners?", a: "No personal data is ever shared with partners without your explicit consent. Partners receive only aggregated, anonymised engagement metrics. Winner delivery details are shared only with the relevant partner for prize fulfilment, under strict data processing agreements." },
              { q: "What is the Black tier physical card?", a: "Black members receive a premium embossed membership card shipped to their registered address within 7–14 business days of subscribing. It is a luxury physical keepsake — there are no payment functions on the card." },
              { q: "How does the AI chat feature work?", a: "All paid tiers include access to our AI chat assistant which can help with questions about your account, active contests, partner details, and general support queries. Gold and Black tiers additionally include voice-mode AI chat." },
            ].map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="hiw-cta-section">
        <div className="hiw-cta-glow" aria-hidden />
        <div className="hiw-cta-grid" aria-hidden />
        <motion.div
          className="hiw-cta-inner"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="hiw-cta-badge">
            <Sparkles className="w-3 h-3" />
            <span>Start today</span>
          </div>
          <h2 className="hiw-cta-title">Ready to enter?</h2>
          <p className="hiw-cta-sub">It's free, it's fair, and you could win something incredible. Your first entry is one click away.</p>
          <div className="hiw-cta-actions">
            <Link href="/account" className="hiw-cta-btn-primary">
              <UserPlus className="w-4 h-4" />
              <span>Create free account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/giveaway" className="hiw-cta-btn-secondary">
              <Trophy className="w-4 h-4" />
              <span>Browse contests</span>
            </Link>
          </div>
          <div className="hiw-cta-trust">
            <span><Shield className="w-3 h-3" />No credit card</span>
            <span><Zap className="w-3 h-3" />Instant access</span>
            <span><Lock className="w-3 h-3" />No spam ever</span>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}
