import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, type Variants } from "framer-motion";
import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Target,
  TerminalSquare,
  Activity,
  Trophy,
  Users,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Star,
  Globe,
  Clock,
  Award,
  ExternalLink,
  Headphones,
  Ticket,
  Package,
  Gift,
  Gem
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import Silk from "@/components/Silk";
import BorderGlow from "@/components/BorderGlow";
import SiteNav from "@/components/SiteNav";
import DotGrid from "@/components/DotGrid";
import "@/components/DotGrid.css";


function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="floating-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 8}s`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
          }}
        />
      ))}
    </div>
  );
}

function GlowLine() {
  return (
    <div className="section-glow-line">
      <div className="section-glow-line-inner" />
    </div>
  );
}

function TextReveal({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="text-reveal-line inline-block">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: delay + i * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function ScrollProgressLine({ containerRef, totalSteps }: { containerRef: React.RefObject<HTMLDivElement | null>; totalSteps: number }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.6", "end 0.5"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const height = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const glowOpacity = useTransform(smoothProgress, [0, 0.05], [0, 1]);

  return (
    <>
      <div className="absolute left-[23px] sm:left-[27px] top-0 bottom-0 w-px bg-white/[0.04]" />
      <motion.div
        className="absolute left-[22px] sm:left-[26px] top-0 w-[2px] rounded-full origin-top z-[1]"
        style={{
          height,
          background: "linear-gradient(180deg, rgba(20, 30, 80, 0.8) 0%, rgba(255, 255, 255, 0.15) 25%, rgba(140, 20, 30, 0.8) 50%, rgba(255, 255, 255, 0.12) 75%, rgba(20, 30, 80, 0.7) 100%)",
          boxShadow: "0 0 8px 1px rgba(140, 20, 30, 0.3), 0 0 16px 2px rgba(20, 30, 80, 0.2)",
          opacity: glowOpacity,
        }}
      />
      <motion.div
        className="absolute left-[20px] sm:left-[24px] w-[6px] h-[6px] rounded-full z-[3]"
        style={{
          top: height,
          background: "radial-gradient(circle, rgba(140, 20, 30, 0.9) 0%, rgba(20, 30, 80, 0.8) 100%)",
          boxShadow: "0 0 10px 3px rgba(140, 20, 30, 0.4), 0 0 20px 5px rgba(20, 30, 80, 0.25)",
          opacity: glowOpacity,
        }}
      />
    </>
  );
}

function StepIcon({ icon, index, containerRef }: { icon: React.ReactNode; index: number; containerRef: React.RefObject<HTMLDivElement | null> }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.6", "end 0.5"],
  });
  const totalSteps = 8;
  const threshold = index / (totalSteps - 1);
  const borderColor = useTransform(scrollYProgress, (v) => {
    if (v >= threshold - 0.02) {
      const t = index / (totalSteps - 1);
      const r = Math.round(20 + t * 120);
      const g = Math.round(30 - t * 10);
      const b = Math.round(80 - t * 50);
      return `rgba(${r}, ${g}, ${b}, 0.55)`;
    }
    return "rgba(255, 255, 255, 0.06)";
  });
  const shadowColor = useTransform(scrollYProgress, (v) => {
    if (v >= threshold - 0.02) {
      const t = index / (totalSteps - 1);
      const r = Math.round(20 + t * 120);
      const g = Math.round(30 - t * 10);
      const b = Math.round(80 - t * 50);
      return `0 0 12px 1px rgba(${r}, ${g}, ${b}, 0.2), 0 0 24px 2px rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return "none";
  });
  const iconColor = useTransform(scrollYProgress, (v) =>
    v >= threshold - 0.02 ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.3)"
  );

  return (
    <motion.div
      className="w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] rounded-2xl bg-black flex items-center justify-center transition-all duration-500"
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor,
        boxShadow: shadowColor,
        color: iconColor,
      }}
    >
      {icon}
    </motion.div>
  );
}

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(rawRotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rawRotateX.set((py - 0.5) * -4);
    rawRotateY.set((px - 0.5) * 4);
  };

  const handleMouseLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000, transformStyle: "preserve-3d", rotateX, rotateY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const heroY = useTransform(smoothProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }
  };

  const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
  };

  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const slideLeft: Variants = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }
  };

  const slideRight: Variants = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-white/20 font-sans overflow-x-hidden">
      <div className="noise-overlay" />
      <div className="vignette-overlay" />
      <motion.div 
        className="scroll-progress-bar"
        style={{ scaleX: smoothProgress }}
      />
      <SiteNav activePage="home" />
      <main className="relative z-10">
        
        <section id="register" className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden bg-black">
            <Silk
              speed={0.1}
              scale={0.4}
              color="#1a1a1a"
              noiseIntensity={0.3}
              rotation={0}
            />
            <DotGrid
              dotSize={2}
              gap={28}
              baseColor="#1a1a1a"
              activeColor="#8b2030"
              proximity={120}
              speedTrigger={80}
              shockRadius={200}
              shockStrength={3}
              returnDuration={1.5}
              className="z-[1]"
              style={{ opacity: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black z-[2]" />
          </div>

          <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 text-center w-full max-w-4xl mx-auto flex flex-col items-center px-5 sm:px-6 overflow-hidden"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="glass-pill-badge mb-8 mt-12 font-display"
            >
              <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse mr-3 inline-block"></span>
              Register. Enter. Win Daily.
            </motion.div>
            
            <div className="relative mb-8 w-full">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-display font-light leading-[1.1] tracking-tight text-white relative z-[1]"
              >
                <span className="text-gradient">Win Real Rewards Every Single Day</span>
              </motion.h1>
              <div aria-hidden="true" className="hero-text-stroke text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-display font-light leading-[1.1] tracking-tight">
                Win Real Rewards Every Single Day
              </div>
            </div>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-white/70 mb-12 max-w-2xl mx-auto font-light leading-relaxed tracking-wide"
            >
              Sign up through our partner links below, fill the entry form, and you're in. Every completed registration = one giveaway entry. Winners are picked daily — gift cards, premium swag, gadgets & more.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 w-full sm:w-auto px-4"
            >
              <BorderGlow as={Link} href="/giveaway" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group w-full sm:w-auto">
                <span className="relative z-[2]">Enter the Giveaway</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
              </BorderGlow>
              <BorderGlow as={Link} href="/offers" borderRadius={16} glowRadius={20} cardBg="rgba(10,10,10,0.6)" className="premium-btn premium-btn-lg premium-btn-ghost glass-btn-effect group w-full sm:w-auto">
                <span className="relative z-[2]">See Rewards</span>
              </BorderGlow>
            </motion.div>

            <div className="w-full overflow-hidden py-6 sm:py-8 border-y border-white/[0.04] bg-white/[0.01] rounded-2xl">
              <div className="marquee-container">
                <div className="marquee-content">
                  {["Daily Swag Drops", "Gift Cards", "Wireless Earbuds", "Hackathon Passes", "Partner Perks", "Tech Gadgets", "Exclusive Merch", "Workshop Access", "Premium Hoodies"].map((text, i) => (
                    <div key={`m1-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                      <span className="text-lg sm:text-2xl font-display font-light text-white/30 uppercase tracking-wider">{text}</span>
                      <span className="text-white/15 text-xl font-light">✦</span>
                    </div>
                  ))}
                </div>
                <div className="marquee-content">
                  {["Daily Swag Drops", "Gift Cards", "Wireless Earbuds", "Hackathon Passes", "Partner Perks", "Tech Gadgets", "Exclusive Merch", "Workshop Access", "Premium Hoodies"].map((text, i) => (
                    <div key={`m2-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                      <span className="text-lg sm:text-2xl font-display font-light text-white/30 uppercase tracking-wider">{text}</span>
                      <span className="text-white/15 text-xl font-light">✦</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>

        </section>

        <div className="section-divider mx-2 sm:mx-3 md:mx-4 lg:mx-5 mb-8">

        <GlowLine />

        <section id="how-it-works" className="py-20 sm:py-32 relative">
          <FloatingParticles />
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-center mb-16 sm:mb-20"
            >
              <div className="glass-pill-badge mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Step-by-Step Guide
              </div>
              <h2 className="text-2xl sm:text-5xl md:text-6xl font-display font-light mb-6 text-white tracking-tight"><TextReveal text="How to Enter" /></h2>
              <p className="text-white/50 text-base sm:text-lg font-display font-light leading-relaxed tracking-wide max-w-2xl mx-auto">
                Follow each step carefully to enter the giveaway. Complete the full process to confirm your entry.
              </p>
            </motion.div>

            <div className="relative" ref={stepsContainerRef}>
              <ScrollProgressLine containerRef={stepsContainerRef} totalSteps={8} />

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-0">
                {[
                  {
                    step: "01",
                    title: "Register with Partner Link",
                    desc: "Click the provided partner registration link and complete the full registration on the partner profile. Every partner listed here requires registration — make sure it's successfully completed. This is mandatory to enter the giveaway.",
                    icon: <ExternalLink className="w-4 h-4" />,
                    tip: "Required for all partners"
                  },
                  {
                    step: "02",
                    title: "Maximize Your Chances",
                    desc: "Want to increase your winning probability? Register with the second partner link as well. Both registrations must be completed successfully using the same provided links.",
                    icon: <Target className="w-4 h-4" />,
                    tip: "Optional but recommended"
                  },
                  {
                    step: "03",
                    title: "Fill the Entry Form",
                    desc: "Submit the giveaway entry form with all required details as mentioned. If you were referred by someone, make sure to enter their referral code during submission — this helps both of you.",
                    icon: <ShieldCheck className="w-4 h-4" />,
                    tip: null
                  },
                  {
                    step: "04",
                    title: "Multiple Entries Allowed",
                    desc: "You can submit multiple entries to boost your chances. However, each entry must use different details — do not reuse the same email address or mobile number across entries.",
                    icon: <Users className="w-4 h-4" />,
                    tip: "Use unique details for each entry"
                  },
                  {
                    step: "05",
                    title: "Entry Confirmation",
                    desc: "After successfully completing the form, you will receive an \"Entry Successful\" confirmation email. This confirms that you have officially entered the giveaway.",
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    tip: null
                  },
                  {
                    step: "06",
                    title: "Check Daily Winners",
                    desc: "Winners are announced daily on this page in the Winners Section. Make sure to check back regularly — your name could appear anytime.",
                    icon: <Trophy className="w-4 h-4" />,
                    tip: null
                  },
                  {
                    step: "07",
                    title: "Join the Community",
                    desc: "Join our WhatsApp community for more contests, exclusive offers, and monthly giveaways shared twice a month. Stay connected to never miss a drop.",
                    icon: <SiWhatsapp className="w-4 h-4" />,
                    tip: null
                  },
                  {
                    step: "08",
                    title: "Become a Partner",
                    desc: "Want to earn even more? Fill the Partner Program form to join as an official Rewards X247 partner. We provide huge earning opportunities for our partners — start your journey today.",
                    icon: <Star className="w-4 h-4" />,
                    tip: "Coming Soon"
                  },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} className="relative flex gap-5 sm:gap-7 pb-10 sm:pb-12 last:pb-0">
                    <div className="relative z-[2] shrink-0">
                      <StepIcon icon={item.icon} index={i} containerRef={stepsContainerRef} />
                    </div>
                    <div className="relative z-[2] pt-1 flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[11px] font-display font-medium text-white/15 tracking-widest">{item.step}</span>
                        {item.tip && (
                          <span className="text-[10px] font-display font-medium text-white/55 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-0.5 tracking-wide">{item.tip}</span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-display font-light text-white mb-2">{item.title}</h3>
                      <p className="text-white/50 font-light leading-relaxed text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <GlowLine />

        <section id="partners" className="py-20 sm:py-32 relative">
          <FloatingParticles />
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-center mb-16 sm:mb-24"
            >
              <div className="glass-pill-badge mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Step 1 — Register
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight"><TextReveal text="Complete Partner Registration" /></h2>
              <p className="text-white/50 text-base sm:text-lg font-display font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
                This is how you enter the giveaway — register with our partner links below. Each completed registration earns you one entry into the daily prize draw.
              </p>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            >
              <TiltCard className="glass-card p-8 sm:p-12 text-center">
                <div className="card-top-accent card-top-accent-navy" />
                <div className="card-shine" />
                <div className="relative z-[2] flex flex-col items-center">
                  <BorderGlow borderRadius={14} glowRadius={12} cardBg="rgba(255,255,255,0.05)" className="icon-circle icon-circle-navy w-16 h-16 mb-6">
                    <ExternalLink className="w-7 h-7" />
                  </BorderGlow>
                  <h3 className="text-2xl sm:text-3xl font-display font-light text-white mb-3">View All Partner Registrations</h3>
                  <p className="text-white/50 font-light text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
                    Browse all available partner links, check which registrations are live, and complete them to earn your giveaway entries.
                  </p>
                  <BorderGlow as={Link} href="/partners" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group/btn">
                    <ExternalLink className="w-4 h-4 mr-2 relative z-[2]" />
                    <span className="relative z-[2]">Go to Partners Page</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform relative z-[2]" />
                  </BorderGlow>
                </div>
              </TiltCard>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="mt-10 sm:mt-14"
            >
              <TiltCard className="glass-card p-5 sm:p-6 text-center">
                <div className="card-top-accent" />
                <div className="card-shine" />
                <div className="relative z-[2] flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                      <span className="text-xs font-display text-white/60">1</span>
                    </div>
                    <span className="text-sm text-white/50 font-light">Register with partners</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 hidden sm:block" />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                      <span className="text-xs font-display text-white/60">2</span>
                    </div>
                    <span className="text-sm text-white/50 font-light">Fill entry form</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 hidden sm:block" />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                      <span className="text-xs font-display text-white/60">3</span>
                    </div>
                    <span className="text-sm text-white/50 font-light">Win daily prizes</span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </section>

        <GlowLine />

        <section id="rewards" className="py-20 sm:py-32 relative">
          <FloatingParticles />
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-center mb-16 sm:mb-24"
            >
              <div className="glass-pill-badge mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Prizes & Rewards
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight"><TextReveal text="What You Can Win" /></h2>
              <p className="text-white/50 text-base sm:text-lg font-display font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
                Real rewards, no gimmicks. Every entry gives you a shot at these prizes — from daily swag drops to premium tech, gift cards, and exclusive event access.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-16 sm:mb-24"
            >
              {[
                { tier: "Daily Drop", title: "Premium Swag Kit", desc: "11 winners every day. Branded hoodies, tech accessories shipped worldwide.", icon: <Package className="w-5 h-5" />, accent: "rgba(30, 40, 100, 0.2)" },
                { tier: "Gift Cards", title: "500 – 2000", desc: "Amazon, Flipkart, or Google Play gift cards given out daily.", icon: <Gift className="w-5 h-5" />, accent: "rgba(100, 30, 40, 0.2)" },
                { tier: "Event Access", title: "VIP Passes", desc: "Invite-only hackathons, workshops, and tech events with mentorship.", icon: <Ticket className="w-5 h-5" />, accent: "rgba(40, 80, 40, 0.15)" },
                { tier: "Partner Perks", title: "Monthly Payouts", desc: "Join as a partner — unlock payouts, merch, and early access.", icon: <Gem className="w-5 h-5" />, accent: "rgba(80, 40, 100, 0.15)" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <TiltCard className="glass-card p-5 sm:p-6 group h-full">
                    <div className="card-top-accent" />
                    <div className="card-shine" />
                    <div className="relative z-[2] flex flex-col h-full">
                      <BorderGlow borderRadius={12} glowRadius={10} cardBg="rgba(255,255,255,0.04)" className="icon-circle mb-5">
                        {item.icon}
                      </BorderGlow>
                      <h4 className="text-[10px] sm:text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest font-display">{item.tier}</h4>
                      <h3 className="text-lg sm:text-xl font-display font-light text-white mb-2">{item.title}</h3>
                      <p className="text-white/40 font-light text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <GlowLine />

        <section id="dashboard" className="py-20 sm:py-32 relative">
          <FloatingParticles />
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-10 sm:gap-16 items-center">
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideLeft}
                className="lg:w-5/12 w-full"
              >
                <div className="glass-pill-badge mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                  Analytics
                </div>
                <h2 className="text-xl sm:text-4xl md:text-5xl font-display font-light mb-6 text-white tracking-tight"><TextReveal text="Live Tracking Dashboard" /></h2>
                <p className="text-white/50 text-base sm:text-lg font-display font-light mb-8 sm:mb-10 leading-relaxed tracking-wide">
                  Monitor your impact in real-time. Track clicks, verify signups, and watch your rank climb on the global leaderboard.
                </p>
                <ul className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                  {[
                    { icon: <Activity className="w-4 h-4" />, text: "Real-time referral validation status" },
                    { icon: <Trophy className="w-4 h-4" />, text: "Automated milestone unlocking" },
                    { icon: <Users className="w-4 h-4" />, text: "Competitive global leaderboard ranking" }
                  ].map((item, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-center"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="icon-circle icon-circle-sm mr-4 shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-white/60 font-light text-sm sm:text-base">{item.text}</span>
                    </motion.li>
                  ))}
                </ul>
                <BorderGlow as={Link} href="/account" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                  <span className="relative z-[2]">Start Tracking</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                </BorderGlow>
              </motion.div>

              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideRight}
                className="lg:w-7/12 w-full"
              >
                <TiltCard className="glass-card glass-card-accent-navy p-6 sm:p-8 shadow-2xl relative">
                  <div className="card-top-accent card-top-accent-navy" />
                  <div className="card-shine" />
                  <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-white/10 gap-3 relative z-[2]">
                    <div>
                      <h3 className="font-display font-light text-lg sm:text-xl text-white">Agent_X24</h3>
                      <p className="text-xs sm:text-sm text-white/50 font-light">ID: X247-9982</p>
                    </div>
                    <div className="glass-pill-badge !text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-white mr-2 animate-pulse" /> ACTIVE
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-10 relative z-[2]">
                    <div className="stat-card">
                      <div className="text-white/50 text-[10px] sm:text-xs uppercase tracking-widest font-display mb-2">Verified</div>
                      <motion.div 
                        className="text-2xl sm:text-4xl font-display font-light text-white"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      >18</motion.div>
                    </div>
                    <div className="stat-card">
                      <div className="text-white/50 text-[10px] sm:text-xs uppercase tracking-widest font-display mb-2">Total Clicks</div>
                      <motion.div 
                        className="text-2xl sm:text-4xl font-display font-light text-white"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                      >247</motion.div>
                    </div>
                  </div>

                  <div className="mb-6 sm:mb-10 relative z-[2]">
                    <div className="flex justify-between text-xs sm:text-sm mb-3">
                      <span className="text-white/50 font-light">Milestone I Progress</span>
                      <span className="text-white/60 font-light">18 / 20</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "90%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                        className="h-full rounded-full relative overflow-hidden"
                        style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.8))" }}
                      >
                        <div className="absolute inset-0 shimmer-bar" />
                      </motion.div>
                    </div>
                  </div>

                  <div className="relative z-[2]">
                    <h4 className="text-[10px] sm:text-xs uppercase tracking-widest font-display text-white/50 mb-4">Recent Activity</h4>
                    <div className="space-y-3 sm:space-y-4">
                      {[
                        { text: "User ***891 verified", time: "2m ago", icon: <CheckCircle2 className="w-4 h-4" /> },
                        { text: "User ***342 verified", time: "15m ago", icon: <CheckCircle2 className="w-4 h-4" /> },
                        { text: "Link 2 click recorded", time: "1h ago", icon: <Activity className="w-4 h-4" /> }
                      ].map((item, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                          className="flex items-center text-xs sm:text-sm"
                        >
                          <div className="text-white/55 mr-3">{item.icon}</div>
                          <span className="text-white/60 font-light">{item.text}</span>
                          <span className="ml-auto text-[10px] sm:text-xs text-white/20">{item.time}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          </div>
        </section>

        <GlowLine />

        <section id="verify" className="py-16 sm:py-24 relative">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
            >
              <TiltCard className="glass-card p-6 sm:p-10 border-white/10 relative overflow-hidden">
                <div className="card-top-accent card-top-accent-red" />
                <div className="card-shine" />
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white/30 via-white/10 to-transparent"></div>
                <div className="relative z-[2]">
                  <h3 className="text-xl sm:text-2xl font-display font-light mb-4 sm:mb-6 text-white">Verification Protocol</h3>
                  <p className="text-white/50 font-light leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
                    To maintain the integrity of the ecosystem, strict verification measures are in place. Fraudulent referrals will result in permanent disqualification.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 sm:gap-8 pt-6 border-t border-white/[0.04]">
                    <div>
                      <h4 className="text-xs sm:text-sm font-display uppercase tracking-widest text-white mb-4 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-white/60" /> Authorized
                      </h4>
                      <ul className="space-y-3 text-xs sm:text-sm text-white/50 font-light">
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/30" /> Real attendees</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/30" /> Completed registrations</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/30" /> Valid contact details</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-display uppercase tracking-widest text-white/55 mb-4 flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-2 text-white/50" /> Disqualified
                      </h4>
                      <ul className="space-y-3 text-xs sm:text-sm text-white/50 font-light">
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/30" /> Bot/Script traffic</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/30" /> Duplicate IPs</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/30" /> Fake registrations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </section>

        <GlowLine />

        <section className="py-20 sm:py-32 relative">
          <FloatingParticles />
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="text-center mb-16 sm:mb-24"
            >
              <div className="glass-pill-badge mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Inner Circle
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight"><TextReveal text="The Ecosystem" /></h2>
              <p className="text-white/50 text-base sm:text-lg font-display font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
                Beyond giveaways — access a growing network of builders, mentors, and exclusive partner events.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16"
            >
              {[
                { title: "Hackathons", desc: "Access to private building sessions.", icon: <TerminalSquare className="w-5 h-5" /> },
                { title: "Workshops", desc: "Expert-led technical deep dives.", icon: <Zap className="w-5 h-5" /> },
                { title: "Mentorship", desc: "Direct access to industry leaders.", icon: <Users className="w-5 h-5" /> }
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <TiltCard className="glass-card p-6 sm:p-8 text-center group">
                    <div className="card-top-accent card-top-accent-navy" />
                    <div className="card-shine" />
                    <div className="relative z-[2]">
                      <BorderGlow borderRadius={12} glowRadius={10} cardBg="rgba(255,255,255,0.04)" className="icon-circle icon-circle-navy mx-auto mb-5">
                        {item.icon}
                      </BorderGlow>
                      <h3 className="text-lg sm:text-xl font-display font-light text-white mb-3">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-white/45 font-light">{item.desc}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="flex justify-center"
            >
              <BorderGlow as={Link} href="/community" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group">
                <SiWhatsapp className="mr-3 w-5 h-5 relative z-[2]" />
                <span className="relative z-[2]">Join the Network</span>
              </BorderGlow>
            </motion.div>
          </div>
        </section>

        <GlowLine />

        <section className="py-20 sm:py-32 relative">
          <FloatingParticles />
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-center mb-16 sm:mb-20"
            >
              <div className="glass-pill-badge mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Quick Access
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight"><TextReveal text="Explore Everything" /></h2>
              <p className="text-white/50 text-base sm:text-lg font-display font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
                Jump straight to what matters — active offers, your dashboard, partner perks, and more.
              </p>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {[
                { title: "Active Offers", desc: "2x bonuses, cashback deals, and exclusive drops updated weekly.", icon: <Gift className="w-5 h-5" />, href: "/offers", spa: true, accent: "red" as const, badge: "5 Live" },
                { title: "How to Enter", desc: "Step-by-step guide to register, submit entries, and start winning.", icon: <Target className="w-5 h-5" />, href: "#how-it-works", spa: false, accent: "navy" as const, badge: null },
                { title: "Your Dashboard", desc: "Track clicks, verified referrals, milestones, and leaderboard rank.", icon: <Activity className="w-5 h-5" />, href: "#dashboard", spa: false, accent: "navy" as const, badge: null },
                { title: "Rewards Gallery", desc: "See the full list of prizes — swag kits, gift cards, gadgets, and more.", icon: <Trophy className="w-5 h-5" />, href: "#rewards", spa: false, accent: "neutral" as const, badge: null },
                { title: "All Partners", desc: "View all partner registrations, trust verification, and live stats.", icon: <Star className="w-5 h-5" />, href: "/partners", spa: true, accent: "neutral" as const, badge: "Coming Soon" },
                { title: "Community Hub", desc: "Join our WhatsApp group for flash giveaways and surprise drops.", icon: <Users className="w-5 h-5" />, href: "#register", spa: false, accent: "red" as const, badge: null },
              ].map((item, i) => {
                const accentClasses = item.accent === "navy"
                  ? { card: "glass-card-accent-navy", icon: "icon-circle-navy", top: "card-top-accent card-top-accent-navy" }
                  : item.accent === "red"
                  ? { card: "glass-card-accent-red", icon: "icon-circle-red", top: "card-top-accent card-top-accent-red" }
                  : { card: "", icon: "", top: "card-top-accent" };
                const WrapTag = item.spa ? Link : "a";
                return (
                  <motion.div key={i} variants={fadeUp}>
                    <WrapTag href={item.href} className="block">
                      <TiltCard className={`glass-card ${accentClasses.card} p-5 sm:p-7 group h-full relative`}>
                        <div className={accentClasses.top} />
                        <div className="card-shine" />
                        <div className="relative z-[2] flex flex-col h-full">
                          <div className="flex items-start justify-between mb-5">
                            <BorderGlow borderRadius={12} glowRadius={10} cardBg="rgba(255,255,255,0.04)" className={`icon-circle ${accentClasses.icon}`}>
                              {item.icon}
                            </BorderGlow>
                            {item.badge && (
                              <div className="premium-badge premium-badge-hot !text-[9px]">
                                <Zap className="w-2.5 h-2.5 mr-1" />
                                {item.badge}
                              </div>
                            )}
                          </div>
                          <h3 className="text-lg sm:text-xl font-display font-light text-white mb-2">{item.title}</h3>
                          <p className="text-white/40 font-light text-xs sm:text-sm leading-relaxed mb-4">{item.desc}</p>
                          <div className="mt-auto flex items-center text-white/30 group-hover:text-white/60 transition-colors text-xs font-display">
                            <span>Explore</span>
                            <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </TiltCard>
                    </WrapTag>
                  </motion.div>
                );
              })}
            </motion.div>

          </div>
        </section>

        <GlowLine />

        <section id="winners" className="py-20 sm:py-32 relative">
          <FloatingParticles />
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-center mb-16 sm:mb-24"
            >
              <div className="glass-pill-badge mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Daily Winners
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight"><TextReveal text="Winner Showcase" /></h2>
              <p className="text-white/50 text-base sm:text-lg font-display font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
                Real people winning real rewards — every single day. Check back daily to see if your name appears here.
              </p>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-12"
            >
              {[
                { name: "A***sh K.", prize: "₹1,000 Amazon Gift Card", date: "Today", avatar: "AK", tier: "Gift Card" },
                { name: "R***ya S.", prize: "Premium Swag Kit", date: "Today", avatar: "RS", tier: "Daily Drop" },
                { name: "P***av M.", prize: "₹500 Google Play Credit", date: "Yesterday", avatar: "PM", tier: "Gift Card" },
                { name: "S***ti R.", prize: "Wireless Earbuds", date: "Yesterday", avatar: "SR", tier: "Tech Prize" },
                { name: "V***sh P.", prize: "₹2,000 Flipkart Voucher", date: "2 days ago", avatar: "VP", tier: "Gift Card" },
                { name: "M***na J.", prize: "Hackathon VIP Pass", date: "2 days ago", avatar: "MJ", tier: "Event Access" },
              ].map((winner, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <TiltCard className="glass-card p-5 sm:p-6 group h-full">
                    <div className="card-top-accent" />
                    <div className="card-shine" />
                    <div className="relative z-[2] flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center shrink-0">
                          <span className="text-xs font-display text-white/60">{winner.avatar}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-display font-light text-white truncate">{winner.name}</h4>
                          <span className="text-[10px] text-white/30 font-light">{winner.date}</span>
                        </div>
                        <div className="premium-badge !text-[8px] !py-1 !px-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <Trophy className="w-2.5 h-2.5 mr-1" />
                          {winner.tier}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <Gift className="w-4 h-4 text-white/30 shrink-0" />
                        <span className="text-sm text-white/60 font-light">{winner.prize}</span>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="text-center"
            >
              <p className="text-xs text-white/25 font-light mb-6">
                Winners are selected daily. Placeholder data shown — real winners will appear once the first draw is completed.
              </p>
            </motion.div>
          </div>
        </section>

        <GlowLine />

        <section id="faq" className="py-20 sm:py-32 relative">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="text-center mb-12 sm:mb-16"
            >
              <div className="glass-pill-badge mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Intel
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-light text-white tracking-tight">FAQ</h2>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
            >
              <TiltCard className="glass-card p-5 sm:p-8 md:p-12">
                <div className="card-top-accent" />
                <div className="card-shine" />
                <div className="relative z-[2]">
                  <Accordion type="single" collapsible className="w-full">
                    {[
                      { q: "How do I enter the giveaway?", a: "Register with the partner links provided on this page, then fill the giveaway entry form with your details. You'll receive a confirmation email once your entry is submitted successfully." },
                      { q: "Can I enter multiple times?", a: "Yes! You can submit multiple entries to increase your chances. Each entry must use a different email address and mobile number — duplicate details will be disqualified." },
                      { q: "When are daily winners announced?", a: "Winners are selected and announced daily on this page in the Winners Section. Check back regularly — your name could appear anytime." },
                      { q: "What rewards can I win?", a: "Daily swag kits, gift cards (₹500–₹2000), wireless earbuds & gadgets, cloud credits (₹5,000), hackathon passes, and even a brand new laptop in the monthly grand draw." },
                      { q: "How does the referral bonus work?", a: "Share your unique referral code with others. For every person who registers and completes their entry using your code, you earn ₹100. There's no earning limit — refer as many as you can." },
                      { q: "Do I need to register with all partners?", a: "You must register with at least the primary partner link — that's mandatory to enter. The second partner link is optional but recommended to increase your winning chances." },
                      { q: "Are international participants eligible?", a: "Yes, the program is open globally. Rewards and shipping are available worldwide." },
                      { q: "How do I become a partner?", a: "Fill the Partner Program form to join as an official X247 partner. Partners get monthly payouts, exclusive merch, early access to new giveaways, and direct support from our team." }
                    ].map((faq, i) => (
                      <AccordionItem key={i} value={`item-${i}`} className="border-b border-white/[0.06] last:border-0 px-0 sm:px-2">
                        <AccordionTrigger className="text-left font-display font-light text-base sm:text-lg text-white/80 hover:text-white py-5 sm:py-6">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-white/50 font-light leading-relaxed pb-5 sm:pb-6 text-sm sm:text-base">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </section>

        </div>

      </main>
      <footer className="bg-black pt-0 pb-8 sm:pb-12 relative">
        <div className="footer-gradient-line mb-12 sm:mb-16" />
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 mb-14 sm:mb-20"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-display font-light text-white">X247 Rewards</span>
              </div>
              <p className="text-sm text-white/25 font-light leading-relaxed max-w-xs">
                The premier gamified giveaway and referral platform for partner event participants. Register, enter, and win real rewards daily.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-display font-medium uppercase tracking-widest text-white/55 mb-5">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { label: "How it Works", href: "#how-it-works" },
                  { label: "Rewards", href: "#rewards" },
                  { label: "Dashboard", href: "#dashboard" },
                  { label: "FAQ", href: "#faq" },
                ].map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="text-sm text-white/45 font-light hover:text-white/70 transition-colors duration-300 flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-display font-medium uppercase tracking-widest text-white/55 mb-5">Program Info</h4>
              <ul className="space-y-3 text-sm text-white/45 font-light">
                <li className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-white/20" /> Global Availability</li>
                <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-white/20" /> 24/7 Tracking</li>
                <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-white/20" /> Verified Referrals Only</li>
                <li className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-white/20" /> Real Rewards, No Gimmicks</li>
              </ul>
            </div>
          </motion.div>
          <div className="border-t border-white/[0.04] pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs font-light text-white/20">
              <p>&copy; 2026 X247 Rewards Protocol. All rights reserved.</p>
              <div className="flex gap-5">
                <a href="#" className="hover:text-white/40 transition-colors duration-300">Terms</a>
                <a href="#" className="hover:text-white/40 transition-colors duration-300">Privacy</a>
                <a href="#" className="hover:text-white/40 transition-colors duration-300">Contact</a>
              </div>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse" />
                System Status: Operational
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
