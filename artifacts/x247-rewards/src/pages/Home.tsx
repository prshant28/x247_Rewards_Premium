import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, type Variants } from "framer-motion";
import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Check, 
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
  CreditCard,
  Ticket,
  Package
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import Silk from "@/components/Silk";


function AnimatedCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const glass = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", move);

    let raf: number;
    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      glass.current.x += (pos.current.x - glass.current.x) * 0.08;
      glass.current.y += (pos.current.y - glass.current.y) * 0.08;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 5}px, ${pos.current.y - 5}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px)`;
      }
      if (glassRef.current) {
        glassRef.current.style.transform = `translate(${glass.current.x - 50}px, ${glass.current.y - 50}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={glassRef} className="cursor-glass" />
    </>
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

function MagneticWrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 200, damping: 20 });
  const y = useSpring(rawY, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rawX.set((e.clientX - cx) * 0.06);
    rawY.set((e.clientY - cy) * 0.06);
  };

  const handleMouseLeave = () => { rawX.set(0); rawY.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}


function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(rawRotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rawRotateX.set(0);
    rawRotateY.set(0);
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
      <div
        ref={glareRef}
        className="absolute inset-0 rounded-[24px] pointer-events-none z-[3] transition-opacity duration-300"
      />
    </motion.div>
  );
}

export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const heroY = useTransform(smoothProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

      <nav className="fixed top-0 w-full z-50 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5">
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`nav-pill transition-all duration-700 ${navScrolled ? 'nav-pill-scrolled' : 'nav-pill-transparent'}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-light text-base sm:text-lg tracking-wide text-white">X247 Rewards</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-[13px] font-display font-normal text-white/50">
            <a href="#register" className="nav-link">Home</a>
            <a href="#rewards" className="nav-link">Rewards</a>
            <Link href="/offers" className="nav-link">Offers</Link>
            <a href="#dashboard" className="nav-link">Dashboard</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </div>
          <a href="#register" className="nav-cta-btn group glass-btn-effect">
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </a>
        </motion.div>
      </nav>

      <main className="relative z-10">
        
        <section id="register" className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden bg-black">
            <Silk speed={5} scale={1} color="#3a1a1a" noiseIntensity={1.8} rotation={0} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black z-[1]" />
          </div>
          <FloatingParticles />

          <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="glass-pill-badge mb-8 mt-12 font-display"
            >
              <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse mr-3 inline-block"></span>
              Exclusive Partner Rewards Giveaway
            </motion.div>
            
            <div className="relative mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-light leading-[1.05] tracking-tight text-white whitespace-pre-line relative z-[1]"
              >
                <span className="text-gradient">Rewards that you</span>{"\n"}<span className="text-gradient">need Indeed</span>
              </motion.h1>
              <div aria-hidden="true" className="hero-text-stroke text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-light leading-[1.05] tracking-tight whitespace-pre-line">
                Rewards that you{"\n"}need Indeed
              </div>
            </div>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-base sm:text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto font-display font-light leading-relaxed px-4 tracking-wide"
            >
              Enter our exclusive giveaway by registering with our partner links. Complete the steps, earn entries, and win daily prizes — gift cards, premium swag, cloud credits, and more.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 w-full sm:w-auto px-4"
            >
              <MagneticWrap>
                <a href="#register" className="premium-btn premium-btn-lg glass-btn-effect group w-full sm:w-auto">
                  <span className="premium-btn-glow" />
                  <span className="premium-btn-text">Get Started Now</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                </a>
              </MagneticWrap>
              <MagneticWrap>
                <a href="#rewards" className="premium-btn premium-btn-lg premium-btn-ghost glass-btn-effect group w-full sm:w-auto">
                  <span className="premium-btn-text">See Rewards</span>
                </a>
              </MagneticWrap>
            </motion.div>
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
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-light mb-6 text-white tracking-tight whitespace-nowrap"><TextReveal text="How to Enter" /></h2>
              <p className="text-white/50 text-base sm:text-lg font-display font-light leading-relaxed tracking-wide max-w-2xl mx-auto">
                Follow each step carefully to enter the giveaway. Complete the full process to confirm your entry.
              </p>
            </motion.div>

            <div className="relative">
              <div className="absolute left-[23px] sm:left-[27px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

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
                    tip: "Earn as a partner"
                  },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} className="relative flex gap-5 sm:gap-7 pb-10 sm:pb-12 last:pb-0">
                    <div className="relative z-[2] shrink-0">
                      <div className="w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] rounded-2xl bg-black border border-white/8 flex items-center justify-center text-white/40 transition-colors duration-300 group-hover:border-white/15">
                        {item.icon}
                      </div>
                    </div>
                    <div className="relative z-[2] pt-1 flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[11px] font-display font-medium text-white/15 tracking-widest">{item.step}</span>
                        {item.tip && (
                          <span className="text-[10px] font-display font-medium text-white/40 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-0.5 tracking-wide">{item.tip}</span>
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
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight"><TextReveal text="What You Can Win" /></h2>
              <p className="text-white/50 text-base sm:text-lg font-display font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
                Real rewards, no gimmicks. Every entry gives you a shot at these prizes — from daily swag drops to premium tech, gift cards, and exclusive event access.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-16 sm:mb-24"
            >
              {[
                { tier: "Daily Drop", title: "Premium Swag Kit", desc: "21 winners every day. Branded hoodies, tech bottles, stickers, and accessories shipped worldwide. Just enter — no minimum required.", checks: ["Daily random draw", "No minimum entries needed"], featured: false, icon: <Package className="w-5 h-5" /> },
                { tier: "Gift Cards", title: "₹500 – ₹2000 Gift Cards", desc: "Win Amazon, Flipkart, or Google Play gift cards. Multiple gift cards given out daily across different entry pools.", checks: ["Amazon / Flipkart / Google Play", "Multiple winners per day"], featured: false, icon: <CreditCard className="w-5 h-5" /> },
                { tier: "Tech Gear", title: "Wireless Earbuds & Gadgets", desc: "Premium wireless earbuds, power banks, smart bands, and tech accessories up for grabs in weekly mega draws.", checks: ["Weekly mega draws", "Top-tier brands only"], featured: false, icon: <Headphones className="w-5 h-5" /> },
                { tier: "Event Access", title: "Hackathon & Workshop Passes", desc: "Free entry to invite-only hackathons, workshops, and tech events. VIP registration and mentorship priority included.", checks: ["VIP event access", "Worth ₹499–₹1999"], featured: false, icon: <Ticket className="w-5 h-5" /> },
                { tier: "Partner Link", title: "Register & Enter Instantly", desc: "Click the partner registration link, complete signup, and you're in. Your entry is confirmed the moment your registration is verified.", checks: ["Instant giveaway entry", "All listed partners valid"], featured: false, icon: <ExternalLink className="w-5 h-5" /> },
                { tier: "Partner Exclusive", title: "Partner Program Perks", desc: "Join as an official X247 partner and unlock monthly payouts, exclusive merch, early access to new giveaways, and direct support.", checks: ["Monthly partner payouts", "Exclusive early access"], featured: false, icon: <Star className="w-5 h-5" /> }
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <TiltCard className={`glass-card ${item.featured ? 'glass-card-featured' : ''} p-5 sm:p-8 group h-full`}>
                    {item.featured && (
                      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-[5]">
                        <div className="premium-badge">
                          <Star className="w-3 h-3 mr-1" />
                          PREMIUM
                        </div>
                      </div>
                    )}
                    <div className="relative z-[2] flex flex-col h-full">
                      <div className="flex-1">
                        <div className="icon-circle mb-6 sm:mb-8">
                          {item.icon}
                        </div>
                        <h4 className="text-[10px] sm:text-xs font-medium text-white/30 mb-2 uppercase tracking-widest font-display">{item.tier}</h4>
                        <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-3">{item.title}</h3>
                        <p className="text-white/50 font-light mb-6 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                      </div>
                      <ul className="space-y-3 text-xs sm:text-sm text-white/50">
                        {item.checks.map((c, ci) => (
                          <li key={ci} className="flex items-center"><Check className="w-3.5 h-3.5 mr-3 text-white/20" /> {c}</li>
                        ))}
                      </ul>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>

            <div className="w-full overflow-hidden py-6 sm:py-8 border-y border-white/[0.04] bg-white/[0.01] rounded-2xl">
              <div className="marquee-container">
                <div className="marquee-content">
                  {["Daily Swag Drops", "Gift Cards", "Wireless Earbuds", "Hackathon Passes", "Partner Perks", "Tech Gadgets", "Exclusive Merch", "Workshop Access", "Premium Hoodies"].map((text, i) => (
                    <div key={`m1-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                      <span className="text-lg sm:text-2xl font-display font-light text-white/40 uppercase tracking-wider">{text}</span>
                      <span className="text-white/10 text-xl font-light">✦</span>
                    </div>
                  ))}
                </div>
                <div className="marquee-content">
                  {["Daily Swag Drops", "Gift Cards", "Wireless Earbuds", "Hackathon Passes", "Partner Perks", "Tech Gadgets", "Exclusive Merch", "Workshop Access", "Premium Hoodies"].map((text, i) => (
                    <div key={`m2-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                      <span className="text-lg sm:text-2xl font-display font-light text-white/40 uppercase tracking-wider">{text}</span>
                      <span className="text-white/10 text-xl font-light">✦</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light mb-6 text-white tracking-tight"><TextReveal text="Live Tracking Dashboard" /></h2>
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
                <MagneticWrap>
                  <a href="#register" className="premium-btn premium-btn-lg glass-btn-effect group">
                    <span className="premium-btn-glow" />
                    <span className="premium-btn-text">Start Tracking</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-[2]" />
                  </a>
                </MagneticWrap>
              </motion.div>

              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideRight}
                className="lg:w-7/12 w-full"
              >
                <TiltCard className="glass-card p-6 sm:p-8 shadow-2xl relative">
                  <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-white/10 gap-3 relative z-[2]">
                    <div>
                      <h3 className="font-display font-light text-lg sm:text-xl text-white">Agent_X24</h3>
                      <p className="text-xs sm:text-sm text-white/30 font-light">ID: X247-9982</p>
                    </div>
                    <div className="glass-pill-badge !text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-white mr-2 animate-pulse" /> ACTIVE
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-10 relative z-[2]">
                    <div className="stat-card">
                      <div className="text-white/30 text-[10px] sm:text-xs uppercase tracking-widest font-display mb-2">Verified</div>
                      <motion.div 
                        className="text-2xl sm:text-4xl font-display font-light text-white"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      >18</motion.div>
                    </div>
                    <div className="stat-card">
                      <div className="text-white/30 text-[10px] sm:text-xs uppercase tracking-widest font-display mb-2">Total Clicks</div>
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
                      <span className="text-white/30 font-light">Milestone I Progress</span>
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
                    <h4 className="text-[10px] sm:text-xs uppercase tracking-widest font-display text-white/30 mb-4">Recent Activity</h4>
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
                          <div className="text-white/40 mr-3">{item.icon}</div>
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
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white/30 via-white/10 to-transparent"></div>
                <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
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
                      <h4 className="text-xs sm:text-sm font-display uppercase tracking-widest text-white/40 mb-4 flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-2 text-white/30" /> Disqualified
                      </h4>
                      <ul className="space-y-3 text-xs sm:text-sm text-white/30 font-light">
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/20" /> Bot/Script traffic</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/20" /> Duplicate IPs</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-white/20" /> Fake registrations</li>
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
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight"><TextReveal text="The Ecosystem" /></h2>
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
                    <div className="relative z-[2]">
                      <div className="icon-circle mx-auto mb-5">
                        {item.icon}
                      </div>
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
              <MagneticWrap>
                <a href="#register" className="premium-btn premium-btn-lg glass-btn-effect group">
                  <span className="premium-btn-glow" />
                  <SiWhatsapp className="mr-3 w-5 h-5 relative z-[2]" />
                  <span className="premium-btn-text">Join the Network</span>
                </a>
              </MagneticWrap>
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light text-white tracking-tight">FAQ</h2>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
            >
              <TiltCard className="glass-card p-5 sm:p-8 md:p-12">
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
              <h4 className="text-xs font-display font-medium uppercase tracking-widest text-white/40 mb-5">Quick Links</h4>
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
              <h4 className="text-xs font-display font-medium uppercase tracking-widest text-white/40 mb-5">Program Info</h4>
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
              <p>&copy; 2025 X247 Rewards Protocol. All rights reserved.</p>
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
