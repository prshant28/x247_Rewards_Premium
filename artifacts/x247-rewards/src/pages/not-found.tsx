import { Link } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Home, Search, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="x247-404">
      <div className="x247-404-grid" />
      <div className="x247-404-glow" />

      <motion.div
        className="x247-404-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="x247-404-badge">
          <AlertCircle className="w-3 h-3" />
          <span>Error 404</span>
        </div>

        <h1 className="x247-404-number">
          <span>4</span>
          <span className="x247-404-zero">
            <Sparkles className="x247-404-sparkle" />
            0
          </span>
          <span>4</span>
        </h1>

        <h2 className="x247-404-title">Page Not Found</h2>
        <p className="x247-404-subtitle">
          The page you're looking for has wandered off. Let's get you back on track.
        </p>

        <div className="x247-404-actions">
          <Link href="/" className="x247-404-btn x247-404-btn-primary">
            <Home className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <button onClick={() => window.history.back()} className="x247-404-btn x247-404-btn-secondary">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>

        <div className="x247-404-links">
          <span className="x247-404-links-label">Or explore:</span>
          <Link href="/giveaway" className="x247-404-link">Giveaways</Link>
          <span className="x247-404-link-sep">·</span>
          <Link href="/partners" className="x247-404-link">Partners</Link>
          <span className="x247-404-link-sep">·</span>
          <Link href="/account" className="x247-404-link">Account</Link>
          <span className="x247-404-link-sep">·</span>
          <Link href="/winners" className="x247-404-link">Winners</Link>
        </div>
      </motion.div>
    </div>
  );
}
