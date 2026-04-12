import React, { useState, useEffect, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Check, 
  Gift,
  Target,
  Cpu,
  TerminalSquare,
  Activity,
  Trophy,
  Users,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Star
} from "lucide-react";
import { SiGoogle, SiWhatsapp } from "react-icons/si";
import heroVideo from "@assets/4954770_Coll_halloween_Realistic_3840x2160_1775967998660.mp4";

function SmokeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;
    let t = 0;

    function resize() {
      w = canvas!.clientWidth * window.devicePixelRatio;
      h = canvas!.clientHeight * window.devicePixelRatio;
      canvas!.width = w;
      canvas!.height = h;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function noise(x: number, y: number, z: number) {
      const n = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164) * 43758.5453;
      return n - Math.floor(n);
    }

    function smoothNoise(x: number, y: number, z: number) {
      const ix = Math.floor(x), iy = Math.floor(y);
      const fx = x - ix, fy = y - iy;
      const sx = fx * fx * (3 - 2 * fx);
      const sy = fy * fy * (3 - 2 * fy);
      const a = noise(ix, iy, z);
      const b = noise(ix + 1, iy, z);
      const c = noise(ix, iy + 1, z);
      const d = noise(ix + 1, iy + 1, z);
      return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
    }

    function draw() {
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      ctx!.clearRect(0, 0, cw, ch);
      t += 0.003;

      const cx = cw * 0.45;
      const cy = ch * 0.58;

      for (let i = 0; i < 18; i++) {
        const phase = i * 0.7 + t * 2;
        const spread = 0.3 + i * 0.06;
        const noiseX = smoothNoise(i * 0.3, t * 0.8, 0) - 0.5;
        const noiseY = smoothNoise(i * 0.3, t * 0.8, 10) - 0.5;
        const px = cx + noiseX * cw * spread * 0.9 + Math.sin(phase) * 60;
        const py = cy + noiseY * ch * spread * 0.5 + Math.cos(phase * 0.7) * 40;
        const baseRadius = 80 + i * 18 + Math.sin(phase * 0.5) * 30;
        const alphaWave = 0.5 + 0.5 * Math.sin(phase * 0.3 + i);
        const baseAlpha = (0.04 + (1 - i / 18) * 0.09) * alphaWave;
        const rx = baseRadius * (1.2 + 0.4 * Math.sin(phase * 0.4));
        const ry = baseRadius * (0.6 + 0.3 * Math.cos(phase * 0.3));
        ctx!.save();
        ctx!.translate(px, py);
        ctx!.rotate(Math.sin(phase * 0.2) * 0.4 + i * 0.2);
        ctx!.scale(1, ry / rx);
        const grad = ctx!.createRadialGradient(0, 0, 0, 0, 0, rx);
        grad.addColorStop(0, `rgba(220, 220, 220, ${baseAlpha * 1.8})`);
        grad.addColorStop(0.3, `rgba(200, 200, 200, ${baseAlpha * 1.2})`);
        grad.addColorStop(0.6, `rgba(180, 180, 180, ${baseAlpha * 0.5})`);
        grad.addColorStop(1, "rgba(150, 150, 150, 0)");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(0, 0, rx, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      for (let i = 0; i < 12; i++) {
        const phase = i * 1.1 + t * 1.5;
        const nx = smoothNoise(i * 0.5, t * 0.6, 20) - 0.5;
        const ny = smoothNoise(i * 0.5, t * 0.6, 30) - 0.5;
        const px = cx + nx * cw * 0.5 + Math.sin(phase) * 80;
        const py = cy + ny * ch * 0.35 + Math.cos(phase * 0.6) * 50;
        const r = 40 + i * 12 + Math.sin(phase * 0.4) * 20;
        const a = 0.02 + (1 - i / 12) * 0.04;
        ctx!.save();
        ctx!.translate(px, py);
        ctx!.rotate(phase * 0.15);
        ctx!.scale(1.5, 0.7);
        const grad = ctx!.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, `rgba(255, 255, 255, ${a * 1.5})`);
        grad.addColorStop(0.5, `rgba(230, 230, 230, ${a * 0.6})`);
        grad.addColorStop(1, "rgba(200, 200, 200, 0)");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(0, 0, r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ filter: "blur(8px)" }} />;
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

export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }
  };

  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-white/20 font-sans">
      
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${navScrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-transparent border-b border-transparent'}`}>
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-light text-lg sm:text-xl tracking-wide text-white">X247 Rewards</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#rewards" className="nav-link">Rewards</a>
            <a href="#dashboard" className="nav-link">Dashboard</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </div>
          <a href="#register" className="premium-btn premium-btn-sm group">
            <span className="premium-btn-text">Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </a>
        </div>
      </nav>

      <main className="relative z-10">
        
        <section id="register" className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden bg-black">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              src={heroVideo}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black z-[1]" />
            <div className="absolute inset-0 z-[2]">
              <SmokeCanvas />
            </div>
          </div>
          <FloatingParticles />

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="glass-pill-badge mb-8 mt-12 font-display"
            >
              <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse mr-3 inline-block"></span>
              Unlocking Exclusive Google Event Rewards
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-light mb-8 leading-[1.05] tracking-tight text-white whitespace-pre-line">
              <span className="text-gradient">Rewards that you</span>{"\n"}<span className="text-gradient">need Indeed</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto font-light leading-relaxed px-4">
              Elevate your rewards with verified referrals and exclusive access. Join the premier Google event program for daily swag, gift cards, and hackathon invites.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 w-full sm:w-auto px-4">
              <a href="#register" className="premium-btn premium-btn-lg group w-full sm:w-auto" data-testid="btn-hero-start">
                <span className="premium-btn-glow" />
                <span className="premium-btn-text">Get Started Now</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#rewards" className="premium-btn premium-btn-lg premium-btn-ghost group w-full sm:w-auto" data-testid="btn-hero-rewards">
                <span className="premium-btn-text">See Rewards</span>
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="absolute bottom-8 sm:bottom-12 z-10 flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest font-display"
          >
            <span>Scroll down</span>
            <div className="w-6 h-10 sm:w-8 sm:h-12 rounded-full border border-white/15 flex justify-center pt-2">
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-1 h-1.5 rounded-full bg-white/40"
              />
            </div>
            <span>to explore</span>
          </motion.div>
        </section>

        <div className="section-divider mx-3 sm:mx-4 md:mx-6 lg:mx-8 mb-8">

        <GlowLine />

        <section id="how-it-works" className="py-20 sm:py-32 relative">
          <FloatingParticles />
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 sm:mb-20 gap-8"
            >
              <div className="max-w-2xl">
                <div className="glass-pill-badge mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                  The Process
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight">How it Works</h2>
                <p className="text-white/40 text-base sm:text-lg font-light leading-relaxed">
                  A streamlined protocol to secure your position and unlock premium tiers. Follow the sequence precisely.
                </p>
              </div>
              <div className="flex gap-4">
                <a href="#register" className="premium-btn premium-btn-md group">
                  <span className="premium-btn-text">Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative"
            >
              {[
                { step: "01", title: "Register", desc: "Click both referral links and complete your Google event registration with precise details.", icon: <SiGoogle className="w-6 h-6" /> },
                { step: "02", title: "Verify", desc: "Submit the official form with your details and unique referral code for validation.", icon: <ShieldCheck className="w-6 h-6" /> },
                { step: "03", title: "Join Community", desc: "Get added to the private WhatsApp network for live drops and insider alpha.", icon: <SiWhatsapp className="w-6 h-6" /> },
                { step: "04", title: "Claim Rewards", desc: "Earn swag, unlock milestones, and claim your exclusive event access passes.", icon: <Trophy className="w-6 h-6" /> }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  variants={fadeUp}
                  className="glass-card p-6 sm:p-8 md:p-10 group cursor-default"
                >
                  <div className="flex justify-between items-start mb-8 sm:mb-12">
                    <div className="icon-circle group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-500">
                      {item.icon}
                    </div>
                    <span className="text-xl sm:text-2xl font-display font-light text-white/15 group-hover:text-white/30 transition-colors duration-500">{item.step}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-3 sm:mb-4">{item.title}</h3>
                  <p className="text-white/40 font-light leading-relaxed text-sm sm:text-lg">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
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
                Reward Tiers
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight">Rewards</h2>
              <p className="text-white/40 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
                Real rewards for real influence. Level up your referrals to unlock premium tiers and exclusive opportunities.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-16 sm:mb-24"
            >
              <motion.div variants={fadeUp} className="glass-card p-6 sm:p-10 flex flex-col justify-between group h-full">
                <div>
                  <div className="icon-circle mb-8">
                    <Gift className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-widest font-display">Daily Drop</h4>
                  <h3 className="text-2xl sm:text-3xl font-display font-light text-white mb-4">$50 Daily Swag</h3>
                  <p className="text-white/40 font-light mb-8 text-sm sm:text-base">21 winners selected daily. Premium hoodies, bottles, and tech accessories shipped worldwide.</p>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-white/60">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/30" /> Daily randomized drawings</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/30" /> No minimum referral required</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp} className="glass-card p-6 sm:p-10 flex flex-col justify-between group h-full">
                <div>
                  <div className="icon-circle mb-8">
                    <Target className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-widest font-display">Milestone I</h4>
                  <h3 className="text-2xl sm:text-3xl font-display font-light text-white mb-4">$50 Gift Card</h3>
                  <p className="text-white/40 font-light mb-8 text-sm sm:text-base">Guaranteed reward for every 10 verified referrals. No limits. Choose from Amazon, Steam, or Xbox.</p>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-white/60">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/30" /> 10 Verified = Unlock</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/30" /> Unlimited redemptions</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp} className="glass-card glass-card-featured p-6 sm:p-10 flex flex-col justify-between group h-full relative">
                <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
                  <div className="premium-badge">
                    <Star className="w-3 h-3 mr-1" />
                    PREMIUM
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="icon-circle icon-circle-featured mb-8">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-widest font-display">Milestone II</h4>
                  <h3 className="text-2xl sm:text-3xl font-display font-light text-white mb-4">$99 AI Voucher</h3>
                  <p className="text-white/40 font-light mb-8 text-sm sm:text-base">Hit 50 verified referrals to unlock the exclusive Gen AI Leader package with premium cloud credits.</p>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-white/60 relative z-10">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/30" /> 50 Verified = Unlock</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/30" /> Premium cloud infrastructure</li>
                </ul>
              </motion.div>

              <motion.div variants={fadeUp} className="glass-card p-6 sm:p-10 flex flex-col justify-between group h-full">
                <div>
                  <div className="icon-circle mb-8">
                    <TerminalSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-widest font-display">Exclusive Access</h4>
                  <h3 className="text-2xl sm:text-3xl font-display font-light text-white mb-4">Hackathons</h3>
                  <p className="text-white/40 font-light mb-8 text-sm sm:text-base">Free entry to invite-only technical events. Mentorship priority and VIP registration lanes.</p>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-white/60">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/30" /> VIP Registration</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/30" /> ₹499 equivalent value</li>
                </ul>
              </motion.div>
            </motion.div>

            <div className="w-full overflow-hidden py-6 sm:py-8 border-y border-white/[0.04] bg-white/[0.01] rounded-2xl">
              <div className="marquee-container">
                <div className="marquee-content">
                  {["Exclusive Access", "Daily Swag Drops", "Google Event Invites", "Verified Influence", "Global Leaderboard", "$50 Gift Cards", "Premium Cloud Credits", "VIP Hackathons"].map((text, i) => (
                    <div key={`m1-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                      <span className="text-lg sm:text-2xl font-display font-light text-white/40 uppercase tracking-wider">{text}</span>
                      <span className="text-white/10 text-xl font-light">✦</span>
                    </div>
                  ))}
                </div>
                <div className="marquee-content">
                  {["Exclusive Access", "Daily Swag Drops", "Google Event Invites", "Verified Influence", "Global Leaderboard", "$50 Gift Cards", "Premium Cloud Credits", "VIP Hackathons"].map((text, i) => (
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
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="lg:w-5/12 w-full"
              >
                <div className="glass-pill-badge mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                  Analytics
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light mb-6 text-white tracking-tight">Live Tracking Dashboard</h2>
                <p className="text-white/40 text-base sm:text-lg font-light mb-8 sm:mb-10 leading-relaxed">
                  Monitor your impact in real-time. Track clicks, verify signups, and watch your rank climb on the global leaderboard.
                </p>
                <ul className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                  {[
                    { icon: <Activity className="w-4 h-4" />, text: "Real-time referral validation status" },
                    { icon: <Trophy className="w-4 h-4" />, text: "Automated milestone unlocking" },
                    { icon: <Users className="w-4 h-4" />, text: "Competitive global leaderboard ranking" }
                  ].map((item, i) => (
                    <li key={i} className="flex items-center">
                      <div className="icon-circle icon-circle-sm mr-4 shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-white/60 font-light text-sm sm:text-base">{item.text}</span>
                    </li>
                  ))}
                </ul>
                <a href="#register" className="premium-btn premium-btn-lg group">
                  <span className="premium-btn-glow" />
                  <span className="premium-btn-text">Start Tracking</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>

              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
                className="lg:w-7/12 w-full"
              >
                <div className="glass-card p-6 sm:p-8 shadow-2xl relative">
                  <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-white/10 gap-3">
                    <div>
                      <h3 className="font-display font-light text-lg sm:text-xl text-white">Agent_X24</h3>
                      <p className="text-xs sm:text-sm text-white/30 font-light">ID: X247-9982</p>
                    </div>
                    <div className="glass-pill-badge !text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-white mr-2 animate-pulse" /> ACTIVE
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-10">
                    <div className="stat-card">
                      <div className="text-white/30 text-[10px] sm:text-xs uppercase tracking-widest font-display mb-2">Verified</div>
                      <div className="text-2xl sm:text-4xl font-display font-light text-white">18</div>
                    </div>
                    <div className="stat-card">
                      <div className="text-white/30 text-[10px] sm:text-xs uppercase tracking-widest font-display mb-2">Total Clicks</div>
                      <div className="text-2xl sm:text-4xl font-display font-light text-white">247</div>
                    </div>
                  </div>

                  <div className="mb-6 sm:mb-10">
                    <div className="flex justify-between text-xs sm:text-sm mb-3">
                      <span className="text-white/30 font-light">Milestone I Progress</span>
                      <span className="text-white/60 font-light">18 / 20</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "90%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-white/40 to-white/80 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
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
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <GlowLine />

        <section id="verify" className="py-16 sm:py-24 relative">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
              className="glass-card p-6 sm:p-10 border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white/30 via-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <h3 className="text-xl sm:text-2xl font-display font-light mb-4 sm:mb-6 text-white">Verification Protocol</h3>
              <p className="text-white/40 font-light leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
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
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight">The Ecosystem</h2>
              <p className="text-white/40 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
                Beyond individual rewards lies a network of top-tier developers and event access.
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
                <motion.div 
                  key={i} variants={fadeUp}
                  className="glass-card p-6 sm:p-8 text-center group"
                >
                  <div className="icon-circle mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-light text-white mb-3">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-white/30 font-light">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="flex justify-center"
            >
              <a href="#register" className="premium-btn premium-btn-lg group">
                <span className="premium-btn-glow" />
                <SiWhatsapp className="mr-3 w-5 h-5" />
                <span className="premium-btn-text">Join the Network</span>
              </a>
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
              className="glass-card p-5 sm:p-8 md:p-12"
            >
              <Accordion type="single" collapsible className="w-full">
                {[
                  { q: "How do I ensure my referrals are counted?", a: "Make sure your network uses both links to register and submits the verification form with your unique code." },
                  { q: "When are daily winners announced?", a: "Winners are drawn randomly at 18:00 UTC and announced in the community channel." },
                  { q: "How long does verification take?", a: "Manual verification typically takes 24-48 hours after form submission." },
                  { q: "Can I earn multiple gift cards?", a: "Yes. Milestone I ($50 Gift Card) unlocks for every 10 verified referrals." },
                  { q: "What is the Gen AI Leader Package?", a: "An exclusive tier for 50+ referrals including premium cloud credits, VIP event access, and custom merch." },
                  { q: "Are international participants eligible?", a: "Yes, the program and shipping are global." }
                ].map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-b border-white/[0.06] last:border-0 px-0 sm:px-2">
                    <AccordionTrigger className="text-left font-display font-light text-base sm:text-lg text-white/80 hover:text-white py-5 sm:py-6">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/40 font-light leading-relaxed pb-5 sm:pb-6 text-sm sm:text-base">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        </div>

      </main>

      <footer className="border-t border-white/[0.04] bg-black py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-display font-light text-white">X247 Rewards</span>
            </div>
            <div className="flex gap-6 text-xs sm:text-sm font-light text-white/30">
              <a href="#" className="hover:text-white/60 transition-colors duration-300">Terms</a>
              <a href="#" className="hover:text-white/60 transition-colors duration-300">Privacy</a>
              <a href="#" className="hover:text-white/60 transition-colors duration-300">Contact</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs font-light text-white/20">
            <p>&copy; 2024 X247 Rewards Protocol. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse" />
              System Status: Operational
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
