import React from "react";
import CardNav from "@/components/CardNav";
import { Link } from "wouter";
import {
  Sparkles,
  ExternalLink,
  Globe,
  Target,
  Trophy,
  Gift,
  Activity,
  Headphones,
  Users,
  Zap,
} from "lucide-react";

interface SiteNavProps {
  activePage?: "home" | "partners" | "offers" | "partner-detail" | "giveaway" | "winners" | "account" | "community";
}

export default function SiteNav({ activePage = "home" }: SiteNavProps) {
  const isHome = activePage === "home";

  return (
    <CardNav
      logo={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-base sm:text-lg tracking-wide text-white font-normal">X247</span>
        </div>
      }
      baseColor="rgba(6, 6, 6, 0.92)"
      menuColor="#fff"
      buttonBgColor="rgba(255,255,255,0.06)"
      buttonTextColor="#fff"
      onCtaClick={() => {
        window.location.href = "/giveaway";
      }}
      renderLink={(href, children, className) => (
        <Link href={href} className={className}>{children}</Link>
      )}
      items={[
        {
          label: "Navigate",
          icon: <Globe className="w-3 h-3" />,
          bgColor: "rgba(20, 25, 60, 0.15)",
          textColor: "#fff",
          links: [
            { label: "Home", href: "/", spa: true, icon: <Sparkles className="w-3.5 h-3.5" /> },
            { label: "Partner Links", href: "/partners", spa: true, icon: <ExternalLink className="w-3.5 h-3.5" /> },
            { label: "How it Works", href: isHome ? "#how-it-works" : "/#how-it-works", icon: <Target className="w-3.5 h-3.5" /> },
            { label: "Giveaway", href: "/giveaway", spa: true, icon: <Trophy className="w-3.5 h-3.5" /> },
            { label: "Rewards", href: "/offers", spa: true, icon: <Trophy className="w-3.5 h-3.5" /> },
          ],
        },
        {
          label: "Explore",
          icon: <Zap className="w-3 h-3" />,
          bgColor: "rgba(120, 20, 30, 0.12)",
          textColor: "#fff",
          links: [
            { label: "Partners", href: "/partners", spa: true, icon: <ExternalLink className="w-3.5 h-3.5" /> },
            { label: "Offers", href: "/offers", spa: true, icon: <Gift className="w-3.5 h-3.5" /> },
            { label: "Winners", href: "/winners", spa: true, icon: <Trophy className="w-3.5 h-3.5" /> },
            { label: "Dashboard", href: isHome ? "#dashboard" : "/#dashboard", icon: <Activity className="w-3.5 h-3.5" /> },
            { label: "FAQ", href: isHome ? "#faq" : "/#faq", icon: <Headphones className="w-3.5 h-3.5" /> },
          ],
        },
        {
          label: "Connect",
          icon: <Users className="w-3 h-3" />,
          bgColor: "rgba(255, 255, 255, 0.03)",
          textColor: "#fff",
          links: [
            { label: "Community", href: "/community", spa: true, icon: <Users className="w-3.5 h-3.5" /> },
            { label: "My Account", href: "/account", spa: true, icon: <Sparkles className="w-3.5 h-3.5" /> },
            { label: "Support", href: isHome ? "#faq" : "/#faq", icon: <Headphones className="w-3.5 h-3.5" /> },
          ],
        },
      ]}
    />
  );
}
