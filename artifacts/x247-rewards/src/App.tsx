import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useMemo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Home from "@/pages/Home";
import PageLoader from "@/components/PageLoader";
import ChatBot from "@/components/ChatBot";
import SiteNav from "@/components/SiteNav";
import { ThemeProvider } from "@/contexts/ThemeContext";

const Offers = lazy(() => import("@/pages/Offers"));
const Partners = lazy(() => import("@/pages/Partners"));
const PartnerDetail = lazy(() => import("@/pages/PartnerDetail"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const GiveawayEntry = lazy(() => import("@/pages/GiveawayEntry"));
const Giveaway = lazy(() => import("@/pages/Giveaway"));
const Winners = lazy(() => import("@/pages/Winners"));
const Account = lazy(() => import("@/pages/Account"));
const Community = lazy(() => import("@/pages/Community"));
const Referral = lazy(() => import("@/pages/Referral"));
const ReferralDashboard = lazy(() => import("@/pages/ReferralDashboard"));
const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));

const queryClient = new QueryClient();

function ChatBotGate() {
  const [location] = useLocation();
  if (location.startsWith("/partners/")) return null;
  return <ChatBot />;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
};

function GlobalNav() {
  const [location] = useLocation();
  const activePage = useMemo(() => {
    if (location === "/") return "home" as const;
    if (location === "/partners") return "partners" as const;
    if (location.startsWith("/partners/")) return "partner-detail" as const;
    if (location === "/offers") return "offers" as const;
    if (location.startsWith("/giveaway")) return "giveaway" as const;
    if (location === "/winners") return "winners" as const;
    if (location === "/account") return "account" as const;
    if (location === "/community") return "community" as const;
    if (location.startsWith("/referral")) return "referral" as const;
    return "home" as const;
  }, [location]);
  return <SiteNav activePage={activePage} />;
}

function AnimatedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <motion.div
      className="page-transition"
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <Component />
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AnimatePresence mode="wait">
        <Switch key={location}>
          <Route path="/">
            <AnimatedRoute component={Home} />
          </Route>
          <Route path="/offers">
            <AnimatedRoute component={Offers} />
          </Route>
          <Route path="/partners/:slug">
            <AnimatedRoute component={PartnerDetail} />
          </Route>
          <Route path="/partners">
            <AnimatedRoute component={Partners} />
          </Route>
          <Route path="/giveaway/:slug">
            <AnimatedRoute component={GiveawayEntry} />
          </Route>
          <Route path="/giveaway">
            <AnimatedRoute component={Giveaway} />
          </Route>
          <Route path="/winners">
            <AnimatedRoute component={Winners} />
          </Route>
          <Route path="/account">
            <AnimatedRoute component={Account} />
          </Route>
          <Route path="/community">
            <AnimatedRoute component={Community} />
          </Route>
          <Route path="/referral/dashboard">
            <AnimatedRoute component={ReferralDashboard} />
          </Route>
          <Route path="/referral">
            <AnimatedRoute component={Referral} />
          </Route>
          <Route path="/profile/:slug">
            <AnimatedRoute component={PublicProfile} />
          </Route>
          <Route path="/pricing">
            <AnimatedRoute component={Pricing} />
          </Route>
          <Route path="/how-it-works">
            <AnimatedRoute component={HowItWorks} />
          </Route>
          <Route path="/x247-admin-login">
            <AnimatedRoute component={AdminLogin} />
          </Route>
          <Route path="/x247-control-panel">
            <AnimatedRoute component={AdminPanel} />
          </Route>
          <Route>
            <AnimatedRoute component={NotFound} />
          </Route>
        </Switch>
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <GlobalNav />
            <PageLoader>
              <Router />
            </PageLoader>
            <ChatBotGate />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
