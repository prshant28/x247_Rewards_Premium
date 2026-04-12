import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  Check, 
  ChevronRight, 
  Mouse,
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
  Globe
} from "lucide-react";
import { SiGoogle, SiWhatsapp } from "react-icons/si";

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

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  
  const [winnerCount, setWinnerCount] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setWinnerCount(prev => (prev < 21 ? prev + 1 : prev));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-white/20 font-sans">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-black/40 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-display font-light text-xl tracking-wide text-white">X247 Rewards</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-white transition-colors duration-300">How it Works</a>
            <a href="#rewards" className="hover:text-white transition-colors duration-300">Rewards</a>
            <a href="#dashboard" className="hover:text-white transition-colors duration-300">Dashboard</a>
            <a href="#faq" className="hover:text-white transition-colors duration-300">FAQ</a>
          </div>
          <a href="#register" className="glass-button h-10 px-6 text-sm">
            Get Started
          </a>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section id="register" className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
          {/* Background - Pure black with animated white smoke */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-black">
            <SmokeCanvas />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center"
          >
            <div className="glass-pill-badge mb-8 mt-12 font-display">
              <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse mr-3 inline-block"></span>
              Unlocking Exclusive Google Event Rewards
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-light mb-8 leading-[1.1] tracking-tight text-white whitespace-pre-line">
              Rewards that you{"\n"}need Indeed
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Elevate your rewards with verified referrals and exclusive access. Join the premier Google event program for daily swag, gift cards, and hackathon invites.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 w-full sm:w-auto">
              <a href="#register" className="glass-button h-14 px-8 text-base w-full sm:w-auto" data-testid="btn-hero-start">
                Get Started Now
              </a>
              <a href="#rewards" className="glass-button h-14 px-8 text-base w-full sm:w-auto bg-transparent" data-testid="btn-hero-rewards">
                See Rewards
              </a>
            </div>
          </motion.div>

          {/* Scroll Down Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-12 z-10 flex items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-widest font-display"
          >
            <span>Scroll down</span>
            <div className="w-8 h-12 rounded-full border border-white/20 flex justify-center pt-2">
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-1 h-1.5 rounded-full bg-white/60"
              />
            </div>
            <span>to see rewards</span>
          </motion.div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-32 relative bg-black">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8"
            >
              <div className="max-w-2xl">
                <div className="glass-pill-badge mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                  The Process
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight">How it Works</h2>
                <p className="text-muted-foreground text-lg font-light leading-relaxed">
                  A streamlined protocol to secure your position and unlock premium tiers. Follow the sequence precisely.
                </p>
              </div>
              <div className="flex gap-4">
                <a href="#register" className="glass-button h-12 px-6">Get Started</a>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {[
                { step: "01", title: "Register", desc: "Click both referral links and complete your Google event registration with precise details.", icon: <SiGoogle className="w-6 h-6" /> },
                { step: "02", title: "Verify", desc: "Submit the official form with your details and unique referral code for validation.", icon: <ShieldCheck className="w-6 h-6" /> },
                { step: "03", title: "Join Community", desc: "Get added to the private WhatsApp network for live drops and insider alpha.", icon: <SiWhatsapp className="w-6 h-6" /> },
                { step: "04", title: "Claim Rewards", desc: "Earn swag, unlock milestones, and claim your exclusive event access passes.", icon: <Trophy className="w-6 h-6" /> }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  className="glass-card p-8 md:p-10 group"
                >
                  <div className="flex justify-between items-start mb-12">
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:bg-white/10 transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-2xl font-display font-light text-white/20 group-hover:text-white/40 transition-colors">{item.step}</span>
                  </div>
                  <h3 className="text-2xl font-display font-light text-white mb-4">{item.title}</h3>
                  <p className="text-muted-foreground font-light leading-relaxed text-lg">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* REWARDS SHOWCASE */}
        <section id="rewards" className="py-32 relative bg-black">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-center mb-24"
            >
              <div className="glass-pill-badge mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Reward Tiers
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight">Rewards</h2>
              <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl mx-auto">
                Real rewards for real influence. Level up your referrals to unlock premium tiers and exclusive opportunities.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
              {/* Card 1 */}
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="glass-card p-10 flex flex-col justify-between group h-full"
              >
                <div>
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-8">
                    <Gift />
                  </div>
                  <h4 className="text-xs font-medium text-white/50 mb-3 uppercase tracking-widest font-display">Daily Drop</h4>
                  <h3 className="text-3xl font-display font-light text-white mb-4">$50 Daily Swag</h3>
                  <p className="text-muted-foreground font-light mb-8">21 winners selected daily. Premium hoodies, bottles, and tech accessories shipped worldwide.</p>
                </div>
                <ul className="space-y-3 text-sm text-white/70">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/40" /> Daily randomized drawings</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/40" /> No minimum referral required</li>
                </ul>
              </motion.div>

              {/* Card 2 */}
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="glass-card p-10 flex flex-col justify-between group h-full"
              >
                <div>
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-8">
                    <Target />
                  </div>
                  <h4 className="text-xs font-medium text-white/50 mb-3 uppercase tracking-widest font-display">Milestone I</h4>
                  <h3 className="text-3xl font-display font-light text-white mb-4">$50 Gift Card</h3>
                  <p className="text-muted-foreground font-light mb-8">Guaranteed reward for every 10 verified referrals. No limits. Choose from Amazon, Steam, or Xbox.</p>
                </div>
                <ul className="space-y-3 text-sm text-white/70">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/40" /> 10 Verified = Unlock</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/40" /> Unlimited redemptions</li>
                </ul>
              </motion.div>

              {/* Card 3 */}
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="glass-card p-10 flex flex-col justify-between group h-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
                <div className="absolute top-0 right-0 p-6">
                  <div className="glass-pill-badge text-[10px]">PREMIUM</div>
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-8">
                    <Cpu />
                  </div>
                  <h4 className="text-xs font-medium text-white/50 mb-3 uppercase tracking-widest font-display">Milestone II</h4>
                  <h3 className="text-3xl font-display font-light text-white mb-4">$99 AI Voucher</h3>
                  <p className="text-muted-foreground font-light mb-8">Hit 50 verified referrals to unlock the exclusive Gen AI Leader package with premium cloud credits.</p>
                </div>
                <ul className="space-y-3 text-sm text-white/70 relative z-10">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/40" /> 50 Verified = Unlock</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/40" /> Premium cloud infrastructure</li>
                </ul>
              </motion.div>

              {/* Card 4 */}
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="glass-card p-10 flex flex-col justify-between group h-full"
              >
                <div>
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-8">
                    <TerminalSquare />
                  </div>
                  <h4 className="text-xs font-medium text-white/50 mb-3 uppercase tracking-widest font-display">Exclusive Access</h4>
                  <h3 className="text-3xl font-display font-light text-white mb-4">Hackathons</h3>
                  <p className="text-muted-foreground font-light mb-8">Free entry to invite-only technical events. Mentorship priority and VIP registration lanes.</p>
                </div>
                <ul className="space-y-3 text-sm text-white/70">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/40" /> VIP Registration</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-3 text-white/40" /> ₹499 equivalent value</li>
                </ul>
              </motion.div>
            </div>

            {/* Ticker / Marquee */}
            <div className="w-full overflow-hidden py-8 border-y border-white/[0.06] bg-white/[0.01]">
              <div className="marquee-container">
                <div className="marquee-content">
                  {["Exclusive Access", "Daily Swag Drops", "Google Event Invites", "Verified Influence", "Global Leaderboard", "$50 Gift Cards", "Premium Cloud Credits", "VIP Hackathons"].map((text, i) => (
                    <div key={`m1-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                      <span className="text-2xl font-display font-light text-white/60 uppercase tracking-wider">{text}</span>
                      <span className="text-white/20 text-xl font-light">*</span>
                    </div>
                  ))}
                </div>
                <div className="marquee-content">
                  {["Exclusive Access", "Daily Swag Drops", "Google Event Invites", "Verified Influence", "Global Leaderboard", "$50 Gift Cards", "Premium Cloud Credits", "VIP Hackathons"].map((text, i) => (
                    <div key={`m2-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                      <span className="text-2xl font-display font-light text-white/60 uppercase tracking-wider">{text}</span>
                      <span className="text-white/20 text-xl font-light">*</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DASHBOARD PREVIEW */}
        <section id="dashboard" className="py-32 relative bg-black">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="lg:w-5/12"
              >
                <div className="glass-pill-badge mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                  Analytics
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-light mb-6 text-white tracking-tight">Live Tracking Dashboard</h2>
                <p className="text-muted-foreground text-lg font-light mb-10 leading-relaxed">
                  Monitor your impact in real-time. Track clicks, verify signups, and watch your rank climb on the global leaderboard.
                </p>
                <ul className="space-y-6 mb-12">
                  {[
                    { icon: <Activity className="w-4 h-4" />, text: "Real-time referral validation status" },
                    { icon: <Trophy className="w-4 h-4" />, text: "Automated milestone unlocking" },
                    { icon: <Users className="w-4 h-4" />, text: "Competitive global leaderboard ranking" }
                  ].map((item, i) => (
                    <li key={i} className="flex items-center">
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mr-4 text-white/80 shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-white/80 font-light">{item.text}</span>
                    </li>
                  ))}
                </ul>
                <a href="#register" className="glass-button h-14 px-8 text-base">
                  Start Tracking
                </a>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="lg:w-7/12 w-full"
              >
                <div className="glass-card p-8 shadow-2xl relative">
                  {/* Dashboard Header */}
                  <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                    <div>
                      <h3 className="font-display font-light text-xl text-white">Agent_X24</h3>
                      <p className="text-sm text-muted-foreground font-light">ID: X247-9982</p>
                    </div>
                    <div className="glass-pill-badge !text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-white mr-2 animate-pulse" /> ACTIVE
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
                      <div className="text-muted-foreground text-xs uppercase tracking-widest font-display mb-2">Verified</div>
                      <div className="text-4xl font-display font-light text-white">18</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
                      <div className="text-muted-foreground text-xs uppercase tracking-widest font-display mb-2">Total Clicks</div>
                      <div className="text-4xl font-display font-light text-white">247</div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-10">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-muted-foreground font-light">Milestone I Progress</span>
                      <span className="text-white font-light">18 / 20</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white/80 w-[90%] rounded-full" />
                    </div>
                  </div>

                  {/* Feed */}
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-display text-muted-foreground mb-4">Recent Activity</h4>
                    <div className="space-y-4">
                      {[
                        { text: "User ***891 verified", time: "2m ago", icon: <CheckCircle2 className="w-4 h-4" /> },
                        { text: "User ***342 verified", time: "15m ago", icon: <CheckCircle2 className="w-4 h-4" /> },
                        { text: "Link 2 click recorded", time: "1h ago", icon: <Activity className="w-4 h-4" /> }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center text-sm">
                          <div className="text-white/60 mr-3">{item.icon}</div>
                          <span className="text-white/80 font-light">{item.text}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* VERIFICATION POLICY */}
        <section id="verify" className="py-24 relative bg-black">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="glass-card p-10 border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-white/20"></div>
              <h3 className="text-2xl font-display font-light mb-6 text-white">Verification Protocol</h3>
              <p className="text-muted-foreground font-light leading-relaxed mb-8">
                To maintain the integrity of the ecosystem, strict verification measures are in place. Fraudulent referrals will result in permanent disqualification.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-white/[0.06]">
                <div>
                  <h4 className="text-sm font-display uppercase tracking-widest text-white mb-4 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Authorized
                  </h4>
                  <ul className="space-y-3 text-sm text-white/70 font-light">
                    <li>• Real attendees</li>
                    <li>• Completed registrations</li>
                    <li>• Valid contact details</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-display uppercase tracking-widest text-white/50 mb-4 flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2" /> Disqualified
                  </h4>
                  <ul className="space-y-3 text-sm text-muted-foreground font-light">
                    <li>• Bot/Script traffic</li>
                    <li>• Duplicate IPs</li>
                    <li>• Fake registrations</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* COMMUNITY & FUTURE */}
        <section className="py-32 relative bg-black">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="text-center mb-24"
            >
              <div className="glass-pill-badge mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Inner Circle
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-light mb-6 text-white tracking-tight">The Ecosystem</h2>
              <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl mx-auto">
                Beyond individual rewards lies a network of top-tier developers and event access.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {[
                { title: "Hackathons", desc: "Access to private building sessions." },
                { title: "Workshops", desc: "Expert-led technical deep dives." },
                { title: "Mentorship", desc: "Direct access to industry leaders." }
              ].map((item, i) => (
                <motion.div 
                  key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="glass-card p-8 text-center"
                >
                  <h3 className="text-xl font-display font-light text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground font-light">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="flex justify-center"
            >
              <a href="#register" className="glass-button h-14 px-8 text-base">
                <SiWhatsapp className="mr-3 w-5 h-5" /> Join the Network
              </a>
            </motion.div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-32 relative bg-black border-t border-white/[0.06]">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="text-center mb-16"
            >
              <div className="glass-pill-badge mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2 inline-block"></span>
                Intel
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-light text-white tracking-tight">FAQ</h2>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="glass-card p-8 md:p-12"
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
                  <AccordionItem key={i} value={`item-${i}`} className="border-b border-white/10 last:border-0 px-2">
                    <AccordionTrigger className="text-left font-display font-light text-lg text-white hover:text-white/80 py-6">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] bg-black py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
            <div className="text-2xl font-display font-light text-white">X247 Rewards</div>
            <div className="flex gap-6 text-sm font-light text-muted-foreground">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-white/40">
            <p>© 2024 X247 Rewards Protocol. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <Globe className="w-3 h-3" /> System Status: Operational
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
