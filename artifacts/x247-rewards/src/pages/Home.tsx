import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  Trophy, 
  Gift, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  TerminalSquare, 
  Cpu, 
  Activity, 
  Gamepad2,
  Check,
  ChevronRight,
  Target
} from "lucide-react";
import { SiGoogle, SiWhatsapp } from "react-icons/si";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  
  // Animated Counter Logic
  const [winnerCount, setWinnerCount] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setWinnerCount(prev => (prev < 21 ? prev + 1 : prev));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
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
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-t from-secondary/20 via-transparent to-transparent blur-3xl rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/5 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl tracking-wider">X247<span className="text-primary">REWARDS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <a href="#rewards" className="hover:text-primary transition-colors">Rewards</a>
            <a href="#dashboard" className="hover:text-primary transition-colors">Dashboard</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </div>
          <Button variant="outline" className="border-primary/50 hover:bg-primary/10 hover:text-primary font-display tracking-widest text-xs h-9">
            LOGIN
          </Button>
        </div>
      </nav>

      <main className="relative z-10 pt-24">
        {/* HERO SECTION */}
        <section id="register" className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-32 px-4 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto z-10"
          >
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 px-4 py-1.5 font-display tracking-widest text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2 inline-block"></span>
              Live Event Season
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight tracking-tighter">
              REGISTER. VERIFY.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-secondary text-glow">REFER. EARN.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light">
              Join the premier Google event referral program. Unlock daily swag, gift cards, and exclusive invite-only hackathon access.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button 
                size="lg" 
                className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] rounded-lg transition-all hover:scale-105"
                asChild
              >
                <a href="#register" data-testid="btn-referral-1">
                  <SiGoogle className="mr-2 h-5 w-5" />
                  Register via Referral Link 1
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-base font-bold border-secondary/50 hover:bg-secondary/10 hover:text-secondary rounded-lg transition-all hover:scale-105"
                asChild
              >
                <a href="#register" data-testid="btn-referral-2">
                  <TerminalSquare className="mr-2 h-5 w-5" />
                  Register via Referral Link 2
                </a>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto border-t border-white/5 pt-8">
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl font-display font-bold text-white mb-1 flex items-center">
                  <span className="text-accent mr-1"></span>{winnerCount}<span className="text-accent text-xl ml-1">+</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Daily Winners</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl font-display font-bold text-white mb-1">
                  $50
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Swag Value Daily</span>
              </div>
              <div className="flex flex-col items-center justify-center col-span-2 md:col-span-1">
                <div className="text-3xl font-display font-bold text-white mb-1 flex items-center">
                  <ShieldCheck className="w-8 h-8 text-primary mr-2" />
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Verified Program</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 relative bg-black/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">THE PROTOCOL</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Follow the sequence to unlock your rewards and secure your position.</p>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 relative"
            >
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 z-0" />
              
              {[
                { step: "01", title: "REGISTER", desc: "Click both referral links and complete your Google event registration.", icon: <SiGoogle className="w-8 h-8" /> },
                { step: "02", title: "VERIFY", desc: "Submit the official form with your details and unique referral code.", icon: <ShieldCheck className="w-8 h-8" /> },
                { step: "03", title: "JOIN", desc: "Get added to the private WhatsApp network for live drops.", icon: <SiWhatsapp className="w-8 h-8" /> },
                { step: "04", title: "CLAIM", desc: "Earn swag, unlock milestones, and claim exclusive access.", icon: <Trophy className="w-8 h-8" /> }
              ].map((item, i) => (
                <motion.div key={i} variants={fadeIn} className="relative z-10 group">
                  <div className="glass-card p-8 rounded-2xl border-white/5 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 box-glow h-full">
                    <div className="absolute -right-4 -top-4 text-7xl font-display font-black text-white/5 transition-colors group-hover:text-primary/10">
                      {item.step}
                    </div>
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 ring-1 ring-primary/30 group-hover:bg-primary group-hover:text-white transition-all">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 font-display">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* REWARDS SHOWCASE */}
        <section id="rewards" className="py-32 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 border-secondary/30 text-secondary bg-secondary/5 font-display tracking-widest text-xs uppercase">
                Achievement Unlocked
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-glow">REWARD TIERS</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Real rewards for real influence. Level up your referrals to unlock premium tiers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <motion.div 
                whileHover={{ y: -10, scale: 1.02 }}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-primary">
                    <Gift />
                  </div>
                  <h4 className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Daily Drop</h4>
                  <h3 className="text-2xl font-bold mb-2">$50 Swag</h3>
                  <p className="text-muted-foreground text-sm mb-4">21 winners selected daily. Premium hoodies, bottles, and tech accessories.</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center text-white/80"><Check className="w-4 h-4 mr-2 text-primary" /> Daily drawings</li>
                    <li className="flex items-center text-white/80"><Check className="w-4 h-4 mr-2 text-primary" /> Shipped worldwide</li>
                  </ul>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div 
                whileHover={{ y: -10, scale: 1.02 }}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-blue-400">
                    <Target />
                  </div>
                  <h4 className="text-sm font-semibold text-blue-400 mb-1 uppercase tracking-wider">Milestone I</h4>
                  <h3 className="text-2xl font-bold mb-2">$50 Gift Card</h3>
                  <p className="text-muted-foreground text-sm mb-4">Guaranteed reward for every 10 verified referrals. No limits.</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center text-white/80"><Check className="w-4 h-4 mr-2 text-blue-400" /> 10 Verified = Unlock</li>
                    <li className="flex items-center text-white/80"><Check className="w-4 h-4 mr-2 text-blue-400" /> Amazon / Steam / Xbox</li>
                  </ul>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div 
                whileHover={{ y: -10, scale: 1.02 }}
                className="glass-card rounded-2xl overflow-hidden border border-secondary/30 relative group shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-100" />
                <div className="absolute top-0 right-0 p-3">
                  <Badge className="bg-secondary text-white border-none">PREMIUM</Badge>
                </div>
                <div className="p-6 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4 text-secondary">
                    <Cpu />
                  </div>
                  <h4 className="text-sm font-semibold text-secondary mb-1 uppercase tracking-wider">Milestone II</h4>
                  <h3 className="text-2xl font-bold mb-2">$99 AI Voucher</h3>
                  <p className="text-muted-foreground text-sm mb-4">Hit 50 verified referrals to unlock the exclusive Gen AI Leader package.</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center text-white/80"><Check className="w-4 h-4 mr-2 text-secondary" /> 50 Verified = Unlock</li>
                    <li className="flex items-center text-white/80"><Check className="w-4 h-4 mr-2 text-secondary" /> Cloud credits included</li>
                  </ul>
                </div>
              </motion.div>

              {/* Card 4 */}
              <motion.div 
                whileHover={{ y: -10, scale: 1.02 }}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-accent">
                    <TerminalSquare />
                  </div>
                  <h4 className="text-sm font-semibold text-accent mb-1 uppercase tracking-wider">Exclusive Access</h4>
                  <h3 className="text-2xl font-bold mb-2">Hackathons</h3>
                  <p className="text-muted-foreground text-sm mb-4">Free entry to invite-only technical events. ₹499 equivalent value.</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center text-white/80"><Check className="w-4 h-4 mr-2 text-accent" /> VIP Registration</li>
                    <li className="flex items-center text-white/80"><Check className="w-4 h-4 mr-2 text-accent" /> Mentorship priority</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* DASHBOARD PREVIEW */}
        <section id="dashboard" className="py-24 relative overflow-hidden bg-black/60 border-y border-white/5">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/3">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">LIVE TRACKING <span className="text-primary block mt-2">DASHBOARD</span></h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Monitor your impact in real-time. Track clicks, verify signups, and watch your rank climb on the global leaderboard.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                      <Activity className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-white/80">Real-time referral validation status</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                      <Trophy className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-white/80">Automated milestone unlocking</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                      <Users className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-white/80">Competitive global leaderboard ranking</span>
                  </li>
                </ul>
                <Button className="font-display font-bold px-8 h-12 w-full sm:w-auto" variant="secondary" asChild>
                  <a href="#how-it-works">START TRACKING <ArrowRight className="ml-2 w-4 h-4" /></a>
                </Button>
              </div>

              <div className="lg:w-2/3 w-full">
                <div className="glass-card rounded-xl border border-white/10 p-6 shadow-2xl relative">
                  {/* Fake UI Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none z-10 rounded-xl" />
                  
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-display font-bold text-xl">Agent_X24</h3>
                      <p className="text-xs text-muted-foreground">ID: X247-9982</p>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 animate-pulse" /> STATUS: ACTIVE
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                      <div className="text-muted-foreground text-xs font-semibold mb-1">TOTAL CLICKS</div>
                      <div className="text-2xl font-display font-bold">247</div>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                      <div className="text-primary text-xs font-semibold mb-1">VERIFIED</div>
                      <div className="text-2xl font-display font-bold text-white">18</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                      <div className="text-muted-foreground text-xs font-semibold mb-1">YOUR RANK</div>
                      <div className="text-2xl font-display font-bold">#34</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                      <div className="text-muted-foreground text-xs font-semibold mb-1">NEXT REWARD</div>
                      <div className="text-2xl font-display font-bold text-secondary">2 LEFT</div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Milestone I Progress</span>
                      <span className="font-bold text-primary">18 / 20</span>
                    </div>
                    <Progress value={90} className="h-2 bg-white/10" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 relative z-20">
                    <div>
                      <h4 className="text-sm font-semibold mb-3 border-b border-white/10 pb-2">RECENT ACTIVITY</h4>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mr-2" />
                          <span className="text-white/80">User ***891 verified</span>
                          <span className="ml-auto text-xs text-muted-foreground">2m ago</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mr-2" />
                          <span className="text-white/80">User ***342 verified</span>
                          <span className="ml-auto text-xs text-muted-foreground">15m ago</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Activity className="w-4 h-4 text-blue-400 mr-2" />
                          <span className="text-white/80">Link 2 click recorded</span>
                          <span className="ml-auto text-xs text-muted-foreground">1h ago</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-3 border-b border-white/10 pb-2 flex justify-between">
                        <span>LEADERBOARD</span>
                        <span className="text-xs text-primary">GLOBAL</span>
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm bg-white/5 p-2 rounded">
                          <span className="font-bold text-yellow-400 flex items-center"><span className="w-4 inline-block">1.</span> SarahK_Dev</span>
                          <span className="font-mono">142</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-2 rounded">
                          <span className="text-zinc-300 flex items-center"><span className="w-4 inline-block">2.</span> DevRahul01</span>
                          <span className="font-mono">128</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-2 rounded">
                          <span className="text-zinc-400 flex items-center"><span className="w-4 inline-block">3.</span> AlexBuilds</span>
                          <span className="font-mono">105</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VERIFICATION POLICY */}
        <section id="verify" className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto glass-card rounded-2xl p-8 md:p-12 border border-destructive/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-destructive"></div>
              
              <div className="flex items-center gap-4 mb-6">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <h2 className="text-2xl md:text-3xl font-bold font-display">VERIFICATION PROTOCOL</h2>
              </div>
              
              <p className="text-muted-foreground mb-8 text-lg">
                We maintain a strict zero-tolerance policy for fraudulent activity to protect the integrity of the reward pool.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-black/40 rounded-lg p-5 border border-white/5">
                  <h4 className="font-bold text-white mb-2 flex items-center"><CheckCircle2 className="w-4 h-4 text-green-400 mr-2"/> Authorized</h4>
                  <p className="text-sm text-zinc-400">Only fully completed registrations through the official referral links and verified via the Google Form are counted toward milestones.</p>
                </div>
                <div className="bg-destructive/10 rounded-lg p-5 border border-destructive/20">
                  <h4 className="font-bold text-white mb-2 flex items-center"><AlertTriangle className="w-4 h-4 text-destructive mr-2"/> Disqualified</h4>
                  <p className="text-sm text-zinc-400">External registrations, automated bot submissions, and fake details will result in immediate system block and forfeiture of all accumulated rewards.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMMUNITY & FUTURE */}
        <section id="join" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-primary/10"></div>
          
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <Badge variant="outline" className="mb-6 border-green-500/30 text-green-400 bg-green-500/5 px-4 py-1.5 font-display tracking-widest text-xs uppercase">
              Restricted Access
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6">THE INNER <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">CIRCLE</span></h2>
            
            <p className="text-xl text-muted-foreground mb-12">
              Beyond the rewards lies the network. Verified participants gain entry to our private WhatsApp hub for elite Google ecosystem opportunities.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 text-left">
              <div className="glass-card p-4 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <TerminalSquare className="w-4 h-4 text-zinc-300" />
                </div>
                <div className="font-bold text-sm">Hackathons</div>
              </div>
              <div className="glass-card p-4 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <SiGoogle className="w-4 h-4 text-zinc-300" />
                </div>
                <div className="font-bold text-sm">Workshops</div>
              </div>
              <div className="glass-card p-4 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Cpu className="w-4 h-4 text-zinc-300" />
                </div>
                <div className="font-bold text-sm">Gen AI Events</div>
              </div>
              <div className="glass-card p-4 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Users className="w-4 h-4 text-zinc-300" />
                </div>
                <div className="font-bold text-sm">Mentorship</div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="h-16 px-10 text-lg font-bold bg-[#25D366] hover:bg-[#20b858] text-white shadow-[0_0_40px_-10px_rgba(37,211,102,0.6)] rounded-xl transition-all hover:scale-105"
              asChild
            >
              <a href="#join" data-testid="btn-whatsapp">
                <SiWhatsapp className="mr-3 h-6 w-6" />
                Join WhatsApp Community
              </a>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 relative bg-black/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">INTEL</h2>
              <p className="text-muted-foreground">Common queries about the platform protocol.</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {[
                { q: "Who can participate?", a: "Any active student interested in Google community events, technology, and AI can register and start referring." },
                { q: "How do I verify my registration?", a: "After registering through both referral links, you must fill out the Verification Form with your details and referral code. This is mandatory to track your progress." },
                { q: "When are winners announced?", a: "Daily swag winners are announced every 24 hours in the private WhatsApp group. Milestone rewards are processed automatically upon reaching the required verified count." },
                { q: "How are referrals tracked?", a: "We use a combination of unique referral codes and cross-referencing with official Google event registration logs to ensure 100% accuracy." },
                { q: "What happens if I use fake details?", a: "Our system detects duplicate IPs, bot patterns, and invalid emails. Any fake submission results in a permanent ban from the X247 Rewards platform." },
                { q: "How do I claim my reward?", a: "Once a milestone is reached or you win a daily drop, our team will contact you via your registered email or WhatsApp to arrange delivery or digital transfer." }
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
                  <AccordionTrigger className="text-left font-bold text-lg hover:text-primary transition-colors data-[state=open]:text-primary">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black pt-16 pb-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-primary" />
                <span className="font-display font-bold text-2xl tracking-wider">X247<span className="text-primary">REWARDS</span></span>
              </div>
              <p className="text-muted-foreground text-sm font-medium">Register. Verify. Refer. Earn.</p>
            </div>
            
            <div className="flex gap-6 text-sm font-medium">
              <a href="#how-it-works" className="text-muted-foreground hover:text-white transition-colors">Protocol</a>
              <a href="#rewards" className="text-muted-foreground hover:text-white transition-colors">Tiers</a>
              <a href="#dashboard" className="text-muted-foreground hover:text-white transition-colors">Dashboard</a>
              <a href="#faq" className="text-muted-foreground hover:text-white transition-colors">Intel</a>
            </div>

            <Button variant="default" className="font-display font-bold tracking-widest text-xs" asChild>
              <a href="#verify" data-testid="btn-verify-form">
                Submit Verification Form
              </a>
            </Button>
          </div>
          
          <Separator className="bg-white/5 mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} X247 Rewards Ecosystem. Not officially affiliated with Google LLC.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
