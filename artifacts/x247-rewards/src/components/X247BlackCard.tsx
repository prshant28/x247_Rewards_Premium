import React from "react";
import { motion } from "framer-motion";
import { Diamond } from "lucide-react";

interface X247BlackCardProps {
  variant?: "full" | "compact";
  animate?: boolean;
}

export default function X247BlackCard({ variant = "full", animate = true }: X247BlackCardProps) {
  const isCompact = variant === "compact";
  const Wrapper = animate ? motion.div : "div" as any;
  const wrapperProps = animate ? {
    initial: { opacity: 0, y: 16, rotateX: 4, rotateY: -6 },
    whileInView: { opacity: 1, y: 0, rotateX: 2, rotateY: -3 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    whileHover: { rotateX: 0, rotateY: 0, scale: 1.02 },
  } : {};

  return (
    <Wrapper
      className={`x247-bcv ${isCompact ? "x247-bcv--compact" : ""}`}
      {...wrapperProps}
    >
      <div className="x247-bcv-shimmer" aria-hidden />
      <div className="x247-bcv-noise" aria-hidden />
      <div className="x247-bcv-edge-top" aria-hidden />
      <div className="x247-bcv-edge-bottom" aria-hidden />

      <div className="x247-bcv-toprow">
        <div className="x247-bcv-chip">
          <div className="x247-bcv-chip-lines">
            {[0, 1, 2].map(i => <div key={i} className="x247-bcv-chip-line" />)}
          </div>
        </div>
        <span className="x247-bcv-brand">X247</span>
      </div>

      <div className="x247-bcv-wordmark">
        <span className="x247-bcv-black-text">BLACK</span>
        <span className="x247-bcv-membership-text">Membership</span>
      </div>

      <div className="x247-bcv-bottomrow">
        <span className="x247-bcv-num">•••• •••• •••• 2047</span>
        <Diamond className="x247-bcv-icon" />
      </div>
    </Wrapper>
  );
}
