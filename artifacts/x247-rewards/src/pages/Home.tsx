import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useReducedMotion, type Variants } from "framer-motion";
import { Link } from "wouter";
import { storeReferralCode } from "@/lib/api";
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
  Gem,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { SiWhatsapp, SiTelegram, SiInstagram } from "react-icons/si";
import Silk from "@/components/Silk";
import SiteFooter from "@/components/SiteFooter";
import BorderGlow from "@/components/BorderGlow";
import DotGrid from "@/components/DotGrid";

import SocialProofToast from "@/components/SocialProofToast";
import AnimatedCounter from "@/components/AnimatedCounter";
import "@/components/DotGrid.css";


function GlowOrb({ className = "", size = 200, opacity = 0.06 }: { className?: string; size?: number; opacity?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(255,255,255,${opacity}) 0%, transparent 70%)`,
        filter: "blur(40px)",
      }}
      animate={reducedMotion ? {} : {
        scale: [1, 1.2, 1],
        opacity: [opacity, opacity * 1.5, opacity],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function FloatingIcon({ icon, delay = 0, className = "" }: { icon: React.ReactNode; delay?: number; className?: string }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;
  return (
    <motion.div
      className={`absolute pointer-events-none text-white/[0.04] ${className}`}
      animate={{
        y: [0, -15, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {icon}
    </motion.div>
  );
}

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

const heroBannerSlides = [
  {
    badge: "About X247",
    title: "Your Gateway to Daily Rewards",
    desc: "X247 is a gamified rewards platform where every registration earns you a shot at winning premium prizes — gift cards, gadgets, and exclusive swag, drawn every single day.",
    icon: <Sparkles className="w-5 h-5" />,
    features: ["Daily Prize Draws", "Zero Cost Entry", "Real Rewards"],
    cta: "Get Started",
    href: "/giveaway",
  },
  {
    badge: "How It Works",
    title: "Register. Enter. Win.",
    desc: "Sign up through our partner links, complete a quick registration form, and you're automatically entered into the daily giveaway. More registrations = more entries = higher chances.",
    icon: <Target className="w-5 h-5" />,
    features: ["Partner Signups", "Verified Entries", "Auto Draw System"],
    cta: "Enter Now",
    href: "#partners",
  },
  {
    badge: "Live Rewards",
    title: "Premium Prizes Every Day",
    desc: "From wireless earbuds and tech gadgets to gift cards and exclusive merch — our reward pool refreshes daily with items worth winning. No catches, no hidden fees.",
    icon: <Gift className="w-5 h-5" />,
    features: ["Gift Cards", "Tech Gadgets", "Exclusive Merch"],
    cta: "View Rewards",
    href: "#rewards",
  },
  {
    badge: "Partner Program",
    title: "Earn While You Share",
    desc: "Become a referral partner and track every click, signup, and conversion in real-time. Hit milestones, climb leaderboards, and unlock bonus rewards for your network.",
    icon: <Users className="w-5 h-5" />,
    features: ["Live Analytics", "Milestone Bonuses", "Leaderboard Ranks"],
    cta: "Open Dashboard",
    href: "/referral/dashboard",
  },
  {
    badge: "What's New",
    title: "Daily Drops & Flash Events",
    desc: "Stay tuned for surprise flash giveaways, double-entry weekends, and limited-edition reward drops. The more active you are, the more you win.",
    icon: <Zap className="w-5 h-5" />,
    features: ["Flash Giveaways", "Bonus Events", "Limited Drops"],
    cta: "See Winners",
    href: "/winners",
  },
];

const testimonialRowOne = [
  { name: "A***sh K.", handle: "@akumar_x247", avatar: "AK", text: "Won a ₹1,000 Amazon gift card on my very first day. The whole process was seamless — signed up, entered, and won. Absolutely legit.", prize: "₹1,000 Gift Card" },
  { name: "S***ti R.", handle: "@shweta_r", avatar: "SR", text: "Got my wireless earbuds delivered within 3 days of winning. The quality is premium. X247 actually delivers on its promises.", prize: "Wireless Earbuds" },
  { name: "R***ya S.", handle: "@riya_s24", avatar: "RS", text: "I've been entering daily for 2 weeks and already won twice. The swag kit is fire — premium hoodie, stickers, and tech accessories.", prize: "Premium Swag Kit" },
  { name: "V***sh P.", handle: "@vivek_p", avatar: "VP", text: "Best referral program I've ever seen. Clean dashboard, real-time tracking, and the payouts are actually real. This is the future.", prize: null },
  { name: "M***na J.", handle: "@meena_j", avatar: "MJ", text: "The hackathon VIP pass I won through X247 changed my career. Met incredible mentors and even got a job offer. Unreal.", prize: "VIP Hackathon Pass" },
];

const testimonialRowTwo = [
  { name: "P***av M.", handle: "@pranav_m", avatar: "PM", text: "Zero cost, zero catches. Signed up through the partner link and won ₹500 Google Play credit the next day. Totally recommend.", prize: "₹500 Google Play" },
  { name: "K***ti V.", handle: "@kirti_v", avatar: "KV", text: "The UI is insanely clean. Feels like a premium product. And the fact that winners are announced daily keeps me coming back.", prize: null },
  { name: "D***ep S.", handle: "@deep_s", avatar: "DS", text: "I referred 15 friends and earned ₹1,500 in referral bonuses. Plus my friends are winning too. Everyone benefits.", prize: "₹1,500 Referral Bonus" },
  { name: "N***ha G.", handle: "@neha_g", avatar: "NG", text: "Won a Flipkart voucher yesterday. Already used it to buy headphones. The whole experience is buttery smooth.", prize: "₹2,000 Flipkart Voucher" },
  { name: "A***j R.", handle: "@anuj_r247", avatar: "AR", text: "As a partner, the analytics dashboard is next level. Real-time clicks, conversions, and milestone tracking. Very professional.", prize: null },
];

const testimonialRowThree = [
  { name: "T***ja P.", handle: "@tanuja_p", avatar: "TP", text: "I was skeptical at first, but after winning twice in one week, I'm a believer. X247 is the real deal.", prize: "₹1,000 Amazon Card" },
  { name: "R***sh K.", handle: "@rajesh_k", avatar: "RK", text: "The daily drops keep the excitement alive. Won a premium tech accessory kit — quality was top-notch.", prize: "Tech Kit" },
  { name: "S***ya B.", handle: "@shreya_b", avatar: "SB", text: "Love the monochrome aesthetic. Finally a rewards platform that doesn't look like a scam. Clean, minimal, premium.", prize: null },
  { name: "H***sh M.", handle: "@harsh_m", avatar: "HM", text: "Entered with my college friends and we all won different prizes within a week. The odds are genuinely fair.", prize: "₹500 Gift Card" },
  { name: "I***ra D.", handle: "@ishita_d", avatar: "ID", text: "The partner program payouts hit my account within 48 hours. No delays, no excuses. Professional operation.", prize: "Partner Payout" },
];

function HeroBannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const totalSlides = heroBannerSlides.length;

  useEffect(() => {
    if (isHovered || reducedMotion) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, reducedMotion, totalSlides]);

  const goTo = useCallback((idx: number) => {
    setCurrentSlide(idx);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-3xl mx-auto mb-8 sm:mb-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative rounded-2xl overflow-hidden hero-banner-container">
        <div className="absolute inset-0 hero-banner-glow pointer-events-none" />

        <div
          ref={trackRef}
          className="hero-banner-track"
          style={{
            transform: `translate3d(-${currentSlide * 100}%, 0, 0)`,
            transition: reducedMotion ? "none" : "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {heroBannerSlides.map((slide, i) => {
            const isInternal = slide.href.startsWith("/");
            return (
              <div
                key={i}
                className="hero-banner-slide"
                aria-hidden={i !== currentSlide}
              >
                <div className="absolute inset-0 hero-banner-slide-bg pointer-events-none" />
                <div className="absolute -top-8 -right-8 w-64 h-64 sm:w-80 sm:h-80 opacity-[0.03] pointer-events-none">
                  <div className="w-full h-full flex items-center justify-center">
                    {React.cloneElement(slide.icon as React.ReactElement, { className: "w-full h-full" })}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.015] pointer-events-none blur-3xl bg-white rounded-full" />
                <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.015] pointer-events-none blur-2xl bg-white rounded-full" />

                <div className="relative z-[2] p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center min-h-[260px] sm:min-h-[300px]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="glass-pill-badge !text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/80 mr-2 inline-block animate-pulse" />
                      {slide.badge}
                    </div>
                    <span className="text-[10px] text-white/20 font-mono tracking-wider">{String(i + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-light text-white mb-3 tracking-tight leading-tight">
                    {slide.title}
                  </h3>

                  <p className="text-sm sm:text-base text-white/55 font-light leading-relaxed mb-6 max-w-lg">
                    {slide.desc}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {slide.features.map((feat, fi) => (
                      <span
                        key={fi}
                        className="hero-banner-pill"
                      >
                        {feat}
                      </span>
                    ))}

                    <span className="hidden sm:block w-px h-5 bg-white/[0.08] mx-1" />

                    {isInternal ? (
                      <Link href={slide.href} className="hero-banner-cta group">
                        <span>{slide.cta}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    ) : (
                      <a
                        href={slide.href}
                        onClick={(e) => {
                          if (slide.href.startsWith("#")) {
                            e.preventDefault();
                            document.querySelector(slide.href)?.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        className="hero-banner-cta group"
                      >
                        <span>{slide.cta}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hero-image-shimmer" />
      </div>

      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 hero-banner-arrow"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={goNext}
        aria-label="Next slide"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 hero-banner-arrow"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-center gap-2 mt-5">
        {heroBannerSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`hero-banner-dot ${i === currentSlide ? "hero-banner-dot-active" : ""}`}
          />
        ))}
      </div>

      <div className="hero-banner-progress mt-3">
        <div
          className="hero-banner-progress-bar"
          style={{
            animationDuration: isHovered ? "0s" : "5s",
            animationPlayState: isHovered ? "paused" : "running",
          }}
          key={currentSlide}
        />
      </div>
    </motion.div>
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
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.06) 25%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.06) 75%, rgba(255, 255, 255, 0.1) 100%)",
          boxShadow: "0 0 8px 1px rgba(255, 255, 255, 0.08), 0 0 16px 2px rgba(255, 255, 255, 0.04)",
          opacity: glowOpacity,
        }}
      />
      <motion.div
        className="absolute left-[20px] sm:left-[24px] w-[6px] h-[6px] rounded-full z-[3]"
        style={{
          top: height,
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%)",
          boxShadow: "0 0 10px 3px rgba(255, 255, 255, 0.12), 0 0 20px 5px rgba(255, 255, 255, 0.06)",
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
      return `rgba(255, 255, 255, 0.2)`;
    }
    return "rgba(255, 255, 255, 0.06)";
  });
  const shadowColor = useTransform(scrollYProgress, (v) => {
    if (v >= threshold - 0.02) {
      return `0 0 12px 1px rgba(255, 255, 255, 0.06), 0 0 24px 2px rgba(255, 255, 255, 0.03)`;
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

const rewardItems = [
  { tier: "Daily Drop", title: "Premium Swag Kit", desc: "11 winners every day. Branded hoodies, tech accessories shipped worldwide.", icon: <Package className="w-5 h-5" />, img: "/images/reward-gift.png" },
  { tier: "Gift Cards", title: "₹500 – ₹2,000", desc: "Amazon, Flipkart, or Google Play gift cards given out daily.", icon: <Gift className="w-5 h-5" />, img: "/images/reward-gift.png" },
  { tier: "Event Access", title: "VIP Passes", desc: "Invite-only hackathons, workshops, and tech events with mentorship.", icon: <Ticket className="w-5 h-5" />, img: "/images/shield-emblem.png" },
  { tier: "Partner Perks", title: "Monthly Payouts", desc: "Join as a partner — unlock payouts, merch, and early access.", icon: <Gem className="w-5 h-5" />, img: "/images/reward-trophy.png" },
  { tier: "Tech Prizes", title: "Wireless Earbuds", desc: "Premium wireless earbuds and tech gadgets — weekly drops for top entries.", icon: <Headphones className="w-5 h-5" />, img: "/images/reward-headphones.png" },
  { tier: "Grand Prize", title: "₹10,000 Cash", desc: "Monthly grand draw for the ultimate reward. More entries = higher chances.", icon: <Trophy className="w-5 h-5" />, img: "/images/abstract-sphere.png" },
];

function RewardsCarousel() {
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const total = rewardItems.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    rewardItems.forEach((item) => {
      const img = new Image();
      img.src = item.img;
    });
    requestAnimationFrame(() => setIsReady(true));
  }, []);

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (isPaused || reducedMotion) {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      autoplayRef.current = null;
      return;
    }
    autoplayRef.current = setInterval(next, 4500);
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [isPaused, next, reducedMotion]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (touchDelta.current < -40) next();
    else if (touchDelta.current > 40) prev();
    touchDelta.current = 0;
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    else if (e.key === "ArrowRight") next();
  }, [prev, next]);

  const [visibleCount, setVisibleCount] = useState(3);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisibleCount(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const cardWidthPercent = 100 / visibleCount;
  const maxOffset = total - visibleCount;
  const clampedCurrent = Math.min(current, Math.max(maxOffset, 0));
  const offset = -(clampedCurrent * cardWidthPercent);

  return (
    <div
      className="relative outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Prizes and rewards"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-live="polite"
      >
        <div
          ref={trackRef}
          className="flex carousel-track"
          style={{
            transform: `translate3d(${offset}%, 0, 0)`,
            opacity: isReady ? 1 : 0,
          }}
        >
          {rewardItems.map((item, i) => {
            const isActive = i === current;
            const isAdjacent = i === ((current - 1 + total) % total) || i === ((current + 1) % total);
            return (
              <div
                key={i}
                className="carousel-slide"
                style={{ width: `${cardWidthPercent}%`, minWidth: `${cardWidthPercent}%`, padding: "0 8px" }}
              >
                <div
                  className={`glass-card group h-full overflow-hidden carousel-card ${isActive ? "carousel-card-active" : isAdjacent ? "carousel-card-adjacent" : "carousel-card-distant"}`}
                  onClick={() => !isActive && goTo(i)}
                  style={{ cursor: isActive ? "default" : "pointer" }}
                >
                  <div className="card-top-accent" />
                  <div className="card-shine" />
                  <div className="relative z-[2] flex flex-col h-full">
                    <div className="relative h-36 sm:h-44 overflow-hidden">
                      <img
                        src={item.img}
                        alt={`${item.tier}: ${item.title}`}
                        className="w-full h-full object-cover opacity-40 reward-card-image"
                        loading="eager"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,6,6,0.98)] via-[rgba(6,6,6,0.5)] to-transparent" />
                      <div className="absolute top-3 right-3">
                        <BorderGlow borderRadius={10} glowRadius={8} cardBg="rgba(0,0,0,0.6)" className="icon-circle icon-circle-sm backdrop-blur-sm">
                          {item.icon}
                        </BorderGlow>
                      </div>
                      {isActive && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full bg-white/[0.08] backdrop-blur-md text-[9px] uppercase tracking-widest text-white/60 font-display border border-white/[0.06]">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 sm:p-6 pt-3 flex-1 flex flex-col">
                      <h4 className="text-[10px] sm:text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest font-display">{item.tier}</h4>
                      <h3 className="text-lg sm:text-xl font-display font-light text-white mb-2">{item.title}</h3>
                      <p className="text-white/40 font-light text-xs sm:text-sm leading-relaxed flex-1">{item.desc}</p>
                      <a
                        href="#rewards"
                        className="mt-4 flex items-center text-white/30 text-xs font-display group-hover:text-white/50 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("rewards")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                      >
                        <span>Learn more</span>
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/[0.15] hover:bg-black/80 transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/[0.15] hover:bg-black/80 transition-all duration-300 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      <div className="flex items-center justify-center mt-8 sm:mt-10 gap-2" role="tablist" aria-label="Slide navigation">
        {rewardItems.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            role="tab"
            aria-selected={idx === current}
            aria-label={`Slide ${idx + 1}: ${rewardItems[idx].title}`}
            className="group relative p-1"
          >
            <div
              className={`h-1 rounded-full transition-all duration-500 ease-out ${
                idx === current
                  ? "w-8 bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                  : "w-2 bg-white/[0.1] group-hover:bg-white/20"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center mt-4 gap-3 text-white/20 text-[10px] font-display tracking-widest uppercase">
        <span>{String(current + 1).padStart(2, "0")}</span>
        <div className="w-8 h-px bg-white/10 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-white/30 carousel-progress"
            key={current}
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
          />
        </div>
        <span>{String(total).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const heroY = useTransform(smoothProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      storeReferralCode(ref);
    }
  }, []);

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
              activeColor="#666666"
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
              <BorderGlow as="a" href="#partners" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-lg glass-btn-effect group w-full sm:w-auto">
                <span className="relative z-[2]">Enter the Giveaway</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
              </BorderGlow>
              <BorderGlow as="a" href="#rewards" borderRadius={16} glowRadius={20} cardBg="rgba(10,10,10,0.6)" className="premium-btn premium-btn-lg premium-btn-ghost glass-btn-effect group w-full sm:w-auto">
                <span className="relative z-[2]">See Rewards</span>
              </BorderGlow>
            </motion.div>

            <HeroBannerSlider />

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
          <GlowOrb className="top-32 left-[5%] hidden lg:block" size={180} opacity={0.025} />
          <FloatingIcon icon={<Target className="w-10 h-10" />} className="top-20 right-[10%] hidden lg:block" delay={1.5} />
          <FloatingIcon icon={<Star className="w-8 h-8" />} className="bottom-24 left-[12%] hidden lg:block" delay={4} />
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
                    desc: "Winners are announced daily. Check our social channels and the Winners page regularly — your name could appear anytime.",
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
                <div className="card-top-accent" />
                <div className="card-shine" />
                <div className="relative z-[2] flex flex-col items-center">
                  <BorderGlow borderRadius={14} glowRadius={12} cardBg="rgba(255,255,255,0.05)" className="icon-circle w-16 h-16 mb-6">
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
          <GlowOrb className="top-16 right-[8%] hidden lg:block" size={220} opacity={0.03} />
          <FloatingIcon icon={<Gift className="w-10 h-10" />} className="top-28 left-[8%] hidden lg:block" delay={0.5} />
          <FloatingIcon icon={<Package className="w-8 h-8" />} className="bottom-16 right-[12%] hidden lg:block" delay={2} />
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
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="mb-16 sm:mb-24 px-6 sm:px-8"
            >
              <RewardsCarousel />
            </motion.div>
          </div>
        </section>

        <GlowLine />

        <section id="dashboard" className="py-20 sm:py-32 relative">
          <FloatingParticles />
          <GlowOrb className="top-20 right-10 hidden lg:block" size={250} opacity={0.03} />
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="text-center mb-16 sm:mb-24"
            >
              <div className="glass-pill-badge mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Partner Analytics
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight"><TextReveal text="Track Everything" /></h2>
              <p className="text-white/50 text-base sm:text-lg font-display font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
                Monitor your referral performance in real-time. Track link clicks, verified signups, giveaway entries, and conversion rates.
              </p>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="bento-grid"
            >
              <motion.div variants={fadeUp} className="bento-card bento-card-wide">
                <div className="card-top-accent" />
                <div className="card-shine" />
                <div className="relative z-[2] flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-2">Real-Time Analytics</h3>
                      <p className="text-sm text-white/40 font-light max-w-sm">Monitor every click, signup, and conversion as it happens. Your performance data, always live.</p>
                    </div>
                    <BorderGlow borderRadius={12} glowRadius={10} cardBg="rgba(255,255,255,0.04)" className="icon-circle shrink-0">
                      <Activity className="w-5 h-5" />
                    </BorderGlow>
                  </div>
                  <div className="flex items-end gap-1.5 h-20 sm:h-24 mt-auto">
                    {[25, 40, 30, 55, 45, 70, 60, 80, 50, 65, 75, 85].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-md relative overflow-hidden"
                        style={{ background: "linear-gradient(to top, rgba(255,255,255,0.06), rgba(255,255,255,0.18))" }}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.06, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="absolute inset-0 shimmer-bar" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="bento-card">
                <div className="card-top-accent" />
                <div className="card-shine" />
                <div className="relative z-[2] flex flex-col h-full">
                  <BorderGlow borderRadius={12} glowRadius={10} cardBg="rgba(255,255,255,0.04)" className="icon-circle mb-5">
                    <BarChart3 className="w-5 h-5" />
                  </BorderGlow>
                  <h3 className="text-lg font-display font-light text-white mb-2">Performance Trends</h3>
                  <p className="text-xs text-white/40 font-light mb-5">Daily & weekly breakdowns of your referral metrics.</p>
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    {[
                      { label: "Clicks", value: "2.4K" },
                      { label: "Conv.", value: "17%" },
                    ].map((s, i) => (
                      <div key={i} className="stat-card text-center py-3">
                        <div className="text-lg font-display font-light text-white">{s.value}</div>
                        <div className="text-[8px] text-white/25 uppercase tracking-widest font-display mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="bento-card">
                <div className="card-top-accent" />
                <div className="card-shine" />
                <div className="relative z-[2] flex flex-col h-full">
                  <BorderGlow borderRadius={12} glowRadius={10} cardBg="rgba(255,255,255,0.04)" className="icon-circle mb-5">
                    <Trophy className="w-5 h-5" />
                  </BorderGlow>
                  <h3 className="text-lg font-display font-light text-white mb-2">Milestones</h3>
                  <p className="text-xs text-white/40 font-light mb-5">Automated progress tracking with milestone rewards.</p>
                  <div className="mt-auto space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-white/35 font-light">Milestone I</span>
                        <span className="text-white/50 font-display">18/20</span>
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
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-white/35 font-light">Milestone II</span>
                        <span className="text-white/50 font-display">5/50</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "10%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                          className="h-full rounded-full relative overflow-hidden"
                          style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.5))" }}
                        >
                          <div className="absolute inset-0 shimmer-bar" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="bento-card">
                <div className="card-top-accent" />
                <div className="card-shine" />
                <div className="relative z-[2] flex flex-col h-full">
                  <BorderGlow borderRadius={12} glowRadius={10} cardBg="rgba(255,255,255,0.04)" className="icon-circle mb-5">
                    <Users className="w-5 h-5" />
                  </BorderGlow>
                  <h3 className="text-lg font-display font-light text-white mb-2">Share & Earn</h3>
                  <p className="text-xs text-white/40 font-light mb-5">Distribute your link across WhatsApp, Telegram, and social platforms.</p>
                  <div className="mt-auto flex items-center gap-3">
                    {[SiWhatsapp, SiTelegram, SiInstagram].map((Icon, i) => (
                      <motion.div
                        key={i}
                        className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 3, delay: i * 0.6, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Icon className="w-4 h-4 text-white/40" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="bento-card bento-card-wide">
                <div className="card-top-accent" />
                <div className="card-shine" />
                <div className="relative z-[2] flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-2">Ready to start earning?</h3>
                    <p className="text-sm text-white/40 font-light">Join the partner program and unlock your personal analytics dashboard.</p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <BorderGlow as={Link} href="/referral/dashboard" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-md glass-btn-effect group">
                      <BarChart3 className="w-4 h-4 mr-2 relative z-[2]" />
                      <span className="relative z-[2]">Open Dashboard</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                    </BorderGlow>
                    <BorderGlow as={Link} href="/referral" borderRadius={16} glowRadius={20} cardBg="rgba(10,10,10,0.6)" className="premium-btn premium-btn-md premium-btn-ghost glass-btn-effect group hidden sm:flex">
                      <span className="relative z-[2]">Become a Partner</span>
                    </BorderGlow>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <GlowLine />

        <section id="verify" className="py-16 sm:py-24 relative">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
            >
              <TiltCard className="glass-card p-6 sm:p-10 border-white/10 relative overflow-hidden">
                <div className="card-top-accent" />
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
          <GlowOrb className="top-10 left-[5%] hidden lg:block" size={220} opacity={0.03} />
          <GlowOrb className="bottom-20 right-[8%] hidden lg:block" size={180} opacity={0.025} />
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
              className="bento-grid"
            >
              <motion.div variants={fadeUp} className="bento-card bento-card-wide bento-card-featured">
                <div className="card-top-accent" />
                <div className="card-shine" />
                <div className="relative z-[2]">
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <BorderGlow borderRadius={12} glowRadius={10} cardBg="rgba(255,255,255,0.04)" className="icon-circle">
                          <Globe className="w-5 h-5" />
                        </BorderGlow>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-display">Network</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-display font-light text-white mb-3">A Community Built Different</h3>
                      <p className="text-sm sm:text-base text-white/40 font-light leading-relaxed mb-6">
                        X247 isn't just a rewards platform — it's an ecosystem of builders, early adopters, and tech enthusiasts who believe in growing together.
                      </p>
                      <div className="flex gap-6">
                        {[
                          { value: "2.4K+", label: "Members" },
                          { value: "180+", label: "Partners" },
                          { value: "₹5L+", label: "Distributed" },
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                          >
                            <div className="text-xl sm:text-2xl font-display font-light text-white">{stat.value}</div>
                            <div className="text-[9px] text-white/25 uppercase tracking-widest font-display mt-1">{stat.label}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="lg:w-[280px] w-full shrink-0">
                      <div className="relative rounded-2xl overflow-hidden aspect-square max-w-[220px] mx-auto border border-white/[0.06]">
                        <img src="/images/abstract-sphere.png" alt="" className="w-full h-full object-cover opacity-25" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center backdrop-blur-sm"
                            animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Sparkles className="w-7 h-7 text-white/50" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {[
                {
                  title: "Hackathons & Build Sessions",
                  desc: "Access to private building sessions, coding sprints, and team challenges with real prizes.",
                  icon: <TerminalSquare className="w-5 h-5" />,
                  metric: "12+",
                  metricLabel: "Events/Year",
                },
                {
                  title: "Expert Workshops",
                  desc: "Industry-led technical deep dives on Web3, AI, cloud infrastructure, and product growth.",
                  icon: <Zap className="w-5 h-5" />,
                  metric: "24+",
                  metricLabel: "Sessions",
                },
                {
                  title: "1:1 Mentorship",
                  desc: "Direct access to industry leaders, founders, and senior engineers for career guidance.",
                  icon: <Users className="w-5 h-5" />,
                  metric: "50+",
                  metricLabel: "Mentors",
                },
                {
                  title: "Partner Network",
                  desc: "Collaborate with verified partners, access exclusive deals, and grow your reach together.",
                  icon: <Star className="w-5 h-5" />,
                  metric: "180+",
                  metricLabel: "Partners",
                },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="bento-card group">
                  <div className="card-top-accent" />
                  <div className="card-shine" />
                  <div className="relative z-[2] flex flex-col h-full">
                    <div className="flex items-start justify-between mb-5">
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 4, delay: i * 0.7, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <BorderGlow borderRadius={12} glowRadius={10} cardBg="rgba(255,255,255,0.04)" className="icon-circle">
                          {item.icon}
                        </BorderGlow>
                      </motion.div>
                      <div className="text-right">
                        <div className="text-lg font-display font-light text-white">{item.metric}</div>
                        <div className="text-[8px] text-white/20 uppercase tracking-widest font-display">{item.metricLabel}</div>
                      </div>
                    </div>
                    <h3 className="text-lg font-display font-light text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-white/40 font-light leading-relaxed">{item.desc}</p>
                    <div className="mt-auto pt-5">
                      <div className="h-px w-full bg-gradient-to-r from-white/[0.06] via-white/[0.12] to-white/[0.06]" />
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.div variants={fadeUp} className="bento-card bento-card-wide">
                <div className="card-top-accent" />
                <div className="card-shine" />
                <div className="relative z-[2] flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {["AK", "SR", "VP", "MJ", "DP"].map((initials, i) => (
                        <motion.div
                          key={i}
                          className="w-9 h-9 rounded-xl bg-white/[0.06] border-2 border-black flex items-center justify-center"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                        >
                          <span className="text-[8px] font-display font-bold text-white/50">{initials}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-display font-light text-white">Join 2,400+ members</h3>
                      <p className="text-xs text-white/35 font-light">Be part of the fastest-growing rewards community</p>
                    </div>
                  </div>
                  <BorderGlow as="a" href="#register" borderRadius={16} glowRadius={20} cardBg="rgba(6,6,6,0.95)" className="premium-btn premium-btn-md glass-btn-effect group shrink-0">
                    <SiWhatsapp className="mr-2 w-4 h-4 relative z-[2]" />
                    <span className="relative z-[2]">Join the Network</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                  </BorderGlow>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <GlowLine />

        <section className="py-20 sm:py-32 relative overflow-hidden">
          <GlowOrb className="top-10 left-[5%] hidden lg:block" size={200} opacity={0.025} />
          <GlowOrb className="bottom-20 right-[8%] hidden lg:block" size={160} opacity={0.02} />
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-center mb-14 sm:mb-20"
            >
              <div className="glass-pill-badge mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Testimonials
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight"><TextReveal text="What Our Winners Say" /></h2>
              <p className="text-white/50 text-base sm:text-lg font-display font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
                Real feedback from real winners. Hear what our community has to say about the X247 experience.
              </p>
            </motion.div>
          </div>

          <div className="testimonial-marquee-wrapper">
            <div className="testimonial-marquee-row">
              <div className="testimonial-marquee-track testimonial-marquee-left">
                {[...testimonialRowOne, ...testimonialRowOne].map((t, i) => (
                  <div key={`r1-${i}`} className="testimonial-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-display font-bold text-white/50">{t.avatar}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-display font-light text-white">{t.name}</h4>
                        <span className="text-[10px] text-white/25 font-mono">{t.handle}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/50 font-light leading-relaxed">{t.text}</p>
                    {t.prize && (
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30 font-display">
                        <Trophy className="w-3 h-3" />
                        <span>Won: {t.prize}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="testimonial-marquee-row mt-4">
              <div className="testimonial-marquee-track testimonial-marquee-right">
                {[...testimonialRowTwo, ...testimonialRowTwo].map((t, i) => (
                  <div key={`r2-${i}`} className="testimonial-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-display font-bold text-white/50">{t.avatar}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-display font-light text-white">{t.name}</h4>
                        <span className="text-[10px] text-white/25 font-mono">{t.handle}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/50 font-light leading-relaxed">{t.text}</p>
                    {t.prize && (
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30 font-display">
                        <Trophy className="w-3 h-3" />
                        <span>Won: {t.prize}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="testimonial-marquee-row mt-4">
              <div className="testimonial-marquee-track testimonial-marquee-left" style={{ animationDuration: "50s" }}>
                {[...testimonialRowThree, ...testimonialRowThree].map((t, i) => (
                  <div key={`r3-${i}`} className="testimonial-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-display font-bold text-white/50">{t.avatar}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-display font-light text-white">{t.name}</h4>
                        <span className="text-[10px] text-white/25 font-mono">{t.handle}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/50 font-light leading-relaxed">{t.text}</p>
                    {t.prize && (
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30 font-display">
                        <Trophy className="w-3 h-3" />
                        <span>Won: {t.prize}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="testimonial-fade-left" />
            <div className="testimonial-fade-right" />
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
                      { q: "When are daily winners announced?", a: "Winners are selected and announced daily. Check the Winners page and our social channels regularly — your name could appear anytime." },
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
      <SiteFooter links={[
        { label: "Terms", href: "#" },
        { label: "Privacy", href: "#" },
        { label: "Contact", href: "#" },
      ]}>
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
      </SiteFooter>
      <SocialProofToast />
    </div>
  );
}
