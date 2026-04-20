import React, { useEffect, useState } from "react";
import CardNav from "@/components/CardNav";
import { Link, useLocation } from "wouter";
import {
  Sparkles,
  ExternalLink,
  Globe,
  Target,
  Trophy,
  Gift,
  Headphones,
  Users,
  Zap,
  LayoutDashboard,
  HelpCircle,
  Share2,
  Star,
  UserPlus,
} from "lucide-react";
import { getCurrentUser, logoutUser, isUserLoggedIn } from "@/lib/api";

interface SiteNavProps {
  activePage?:
    | "home"
    | "partners"
    | "offers"
    | "partner-detail"
    | "giveaway"
    | "winners"
    | "account"
    | "community"
    | "referral"
    | "how-it-works";
}

export default function SiteNav({ activePage = "home" }: SiteNavProps) {
  const isHome = activePage === "home";
  const [, navigate] = useLocation();
  const [user, setUser] = useState<{
    fullName: string;
    email: string;
    membershipTier?: string | null;
    isVerified?: boolean;
  } | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const checkAuth = () => {
    const logged = isUserLoggedIn();
    setLoggedIn(logged);
    if (logged) {
      getCurrentUser().then((u) => {
        if (u)
          setUser({
            fullName: u.fullName,
            email: u.email,
            membershipTier: (u as any).membershipTier,
            isVerified: (u as any).isVerified,
          });
        else {
          setLoggedIn(false);
          setUser(null);
        }
      });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
    const onAuthChange = () => checkAuth();
    window.addEventListener("user_auth_changed", onAuthChange);
    window.addEventListener("storage", (e: StorageEvent) => {
      if (e.key === "user_token") checkAuth();
    });
    return () => {
      window.removeEventListener("user_auth_changed", onAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  return (
    <CardNav
      logo={
        <div className="flex items-center">
          <img
            src="/x247-logo.png"
            alt="X247 Labs"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-[8px] object-cover select-none"
            draggable={false}
          />
        </div>
      }
      baseColor="var(--x-nav-bg)"
      menuColor="var(--x-nav-text)"
      buttonBgColor="var(--x-subtle-fill)"
      buttonTextColor="var(--x-nav-text)"
      isLoggedIn={loggedIn}
      user={user}
      onLogout={handleLogout}
      onNavigate={(path) => navigate(path)}
      onCtaClick={() => {
        navigate("/account");
      }}
      renderLink={(href, children, className) => (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
      items={[
        {
          label: "Pages",
          icon: <Globe className="w-3 h-3" />,
          bgColor: "rgba(255, 255, 255, 0.03)",
          textColor: "#fff",
          links: [
            {
              label: "Home",
              href: "/",
              spa: true,
              icon: <Sparkles className="w-3.5 h-3.5" />,
            },
            {
              label: "Partners",
              href: "/partners",
              spa: true,
              icon: <ExternalLink className="w-3.5 h-3.5" />,
            },
            {
              label: "Giveaways",
              href: "/giveaway",
              spa: true,
              icon: <Trophy className="w-3.5 h-3.5" />,
            },
            {
              label: "Offers",
              href: "/offers",
              spa: true,
              icon: <Gift className="w-3.5 h-3.5" />,
            },
          ],
        },
        {
          label: "Quick Links",
          icon: <Zap className="w-3 h-3" />,
          bgColor: "rgba(255, 255, 255, 0.03)",
          textColor: "#fff",
          links: [
            {
              label: "Dashboard",
              href: isHome ? "/referral/dashboard" : "referral/dashboard",
              icon: <LayoutDashboard className="w-3.5 h-3.5" />,
            },
            {
              label: "How it Works",
              href: "/how-it-works",
              spa: true,
              icon: <Target className="w-3.5 h-3.5" />,
            },
            {
              label: "Rewards",
              href: isHome ? "#rewards" : "/#rewards",
              icon: <Trophy className="w-3.5 h-3.5" />,
            },
            {
              label: "Community",
              href: "/community",
              spa: true,
              icon: <Users className="w-3.5 h-3.5" />,
            },
          ],
        },
        {
          label: "Account",
          icon: <Users className="w-3 h-3" />,
          bgColor: "rgba(255, 255, 255, 0.03)",
          textColor: "#fff",
          links: loggedIn
            ? [
                {
                  label: "My Account",
                  href: "/account",
                  spa: true,
                  icon: <UserPlus className="w-3.5 h-3.5" />,
                },
                {
                  label: "My Entries",
                  href: "/account",
                  spa: true,
                  icon: <Trophy className="w-3.5 h-3.5" />,
                },
                {
                  label: "Referral",
                  href: "/referral",
                  spa: true,
                  icon: <Share2 className="w-3.5 h-3.5" />,
                },
              ]
            : [
                {
                  label: "Get Started",
                  href: "/account",
                  spa: false,
                  icon: <UserPlus className="w-3.5 h-3.5" />,
                },
                {
                  label: "Support",
                  href: isHome ? "#faq" : "/#faq",
                  icon: <Headphones className="w-3.5 h-3.5" />,
                },
              ],
        },
      ]}
    />
  );
}
