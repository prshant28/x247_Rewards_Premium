import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Offers from "@/pages/Offers";
import Partners from "@/pages/Partners";
import PartnerDetail from "@/pages/PartnerDetail";
import AdminLogin from "@/pages/AdminLogin";
import AdminPanel from "@/pages/AdminPanel";
import GiveawayEntry from "@/pages/GiveawayEntry";
import Giveaway from "@/pages/Giveaway";
import Winners from "@/pages/Winners";
import Account from "@/pages/Account";
import Community from "@/pages/Community";
import PageLoader from "@/components/PageLoader";
import ChatBot from "@/components/ChatBot";

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
};

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
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <PageLoader>
            <Router />
          </PageLoader>
        </WouterRouter>
        <ChatBot />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
