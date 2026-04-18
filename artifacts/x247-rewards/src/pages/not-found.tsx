import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion, MotionConfig } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Home,
  Search,
  AlertCircle,
  Trophy,
  Gift,
  Crown,
  Users,
  Compass,
  ArrowUpRight,
  Wifi,
} from "lucide-react";

const SUGGESTIONS = [
  { href: "/giveaway", icon: Gift, title: "Giveaways", desc: "Live draws & daily prizes" },
  { href: "/winners", icon: Trophy, title: "Winners", desc: "See who took home the loot" },
  { href: "/pricing", icon: Crown, title: "Membership", desc: "Silver · Gold · Black tiers" },
  { href: "/community", icon: Users, title: "Community", desc: "Players, profiles & leaderboards" },
];

const POPULAR = [
  { label: "iPhone 15 Pro Giveaway", href: "/giveaway" },
  { label: "Black Tier Perks", href: "/pricing" },
  { label: "Winners This Week", href: "/winners" },
  { label: "How It Works", href: "/" },
];

export default function NotFound() {
  const [location, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hhmmss = useMemo(
    () =>
      time.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [time],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return [...SUGGESTIONS, ...POPULAR.map((p) => ({ ...p, icon: Compass, title: p.label, desc: "Quick link" }))]
      .filter((s) => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
      .slice(0, 5);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filtered.length > 0) {
      setLocation(filtered[0].href);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="x404">
      {/* Ambient layers — subtle, single layer */}
      <div className="x404-grid" />
      <div className="x404-scanline" />

      <motion.div
        className="x404-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="x404-badge"
        >
          <span className="x404-badge-dot" />
          <AlertCircle className="w-3 h-3" />
          <span>HTTP 404 · Resource Not Found</span>
        </motion.div>

        {/* Big glitch 404 */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="x404-number"
          data-text="404"
        >
          <span className="x404-num-char">4</span>
          <span className="x404-num-char x404-num-zero">
            <Sparkles className="x404-sparkle" />
            0
          </span>
          <span className="x404-num-char">4</span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.5 }}
          className="x404-title"
        >
          Looks like this page <span className="x404-title-italic">disappeared</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="x404-subtitle"
        >
          The link you followed may be broken, or the page may have been moved.
          Try one of the destinations below — or just head home.
        </motion.p>

        {/* Terminal-style missing path display */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46, duration: 0.5 }}
          className="x404-terminal"
        >
          <div className="x404-terminal-header">
            <span className="x404-term-dot" />
            <span className="x404-term-dot" />
            <span className="x404-term-dot" />
            <span className="x404-term-title">x247.app · request log</span>
            <span className="x404-term-status">
              <Wifi className="w-3 h-3" />
              {hhmmss}
            </span>
          </div>
          <div className="x404-terminal-body">
            <div className="x404-term-line">
              <span className="x404-term-prompt">›</span>
              <span className="x404-term-method">GET</span>
              <span className="x404-term-path">{location || "/"}</span>
              <span className="x404-term-code">404</span>
            </div>
            <div className="x404-term-line x404-term-line-muted">
              <span className="x404-term-prompt">›</span>
              <span className="x404-term-method">SUGGEST</span>
              <span className="x404-term-path">try /giveaway · /winners · /pricing</span>
            </div>
          </div>
        </motion.div>

        {/* Search bar */}
        <motion.form
          onSubmit={handleSearchSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="x404-search-wrap"
        >
          <Search className="x404-search-icon w-4 h-4" />
          <input
            type="text"
            placeholder="Search for giveaways, tiers, winners…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="x404-search-input"
            aria-label="Search the site"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="x404-search-clear" aria-label="Clear search">
              ×
            </button>
          )}
          {filtered.length > 0 && (
            <div className="x404-search-results">
              {filtered.map((r, i) => {
                const Icon = r.icon;
                return (
                  <Link key={`${r.href}-${i}`} href={r.href} className="x404-search-result">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="x404-search-result-title">{r.title}</span>
                    <span className="x404-search-result-desc">{r.desc}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-40" />
                  </Link>
                );
              })}
            </div>
          )}
        </motion.form>

        {/* Primary actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62, duration: 0.5 }}
          className="x404-actions"
        >
          <Link href="/" className="x404-btn x404-btn-primary">
            <Home className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <button onClick={() => window.history.back()} className="x404-btn x404-btn-secondary">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </motion.div>

        {/* Suggestion cards */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.55 }}
          className="x404-suggest"
        >
          <div className="x404-suggest-label">
            <Compass className="w-3 h-3" />
            <span>Where to next?</span>
          </div>
          <div className="x404-suggest-grid">
            {SUGGESTIONS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.78 + i * 0.06, duration: 0.4 }}
                >
                  <Link href={s.href} className="x404-suggest-card">
                    <div className="x404-suggest-icon">
                      <Icon className="w-4 h-4" strokeWidth={1.6} />
                    </div>
                    <div className="x404-suggest-text">
                      <div className="x404-suggest-title">{s.title}</div>
                      <div className="x404-suggest-desc">{s.desc}</div>
                    </div>
                    <ArrowUpRight className="x404-suggest-arrow w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Popular searches chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="x404-popular"
        >
          <span className="x404-popular-label">Popular:</span>
          {POPULAR.map((p) => (
            <Link key={p.label} href={p.href} className="x404-popular-chip">
              {p.label}
            </Link>
          ))}
        </motion.div>
      </motion.div>
    </div>
    </MotionConfig>
  );
}
