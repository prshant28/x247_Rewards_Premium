import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Ticket, MapPin } from "lucide-react";

const ENTRIES = [
  { name: "A. Kumar", city: "Mumbai", action: "entered Mega Cash Giveaway" },
  { name: "S. Reddy", city: "Hyderabad", action: "entered Tech Gadgets Bonanza" },
  { name: "P. Singh", city: "Delhi", action: "registered with Solution Challenge" },
  { name: "R. Sharma", city: "Jaipur", action: "entered Gaming Paradise" },
  { name: "M. Gupta", city: "Pune", action: "won ₹10,000 Cash Prize" },
  { name: "K. Patel", city: "Ahmedabad", action: "entered Student Special" },
  { name: "V. Nair", city: "Kochi", action: "registered with Unstop AI Challenge" },
  { name: "N. Das", city: "Kolkata", action: "entered Mega Cash Giveaway" },
  { name: "D. Joshi", city: "Chandigarh", action: "won PS5 Gaming Bundle" },
  { name: "T. Verma", city: "Lucknow", action: "registered with Devfolio Hackathon" },
];

export default function SocialProofToast() {
  const [current, setCurrent] = useState<typeof ENTRIES[0] | null>(null);
  const [visible, setVisible] = useState(false);

  const showNext = useCallback(() => {
    const entry = ENTRIES[Math.floor(Math.random() * ENTRIES.length)];
    setCurrent(entry);
    setVisible(true);
    setTimeout(() => setVisible(false), 4000);
  }, []);

  useEffect(() => {
    const initial = setTimeout(showNext, 8000);
    const interval = setInterval(showNext, 15000 + Math.random() * 10000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [showNext]);

  const isWinner = current?.action.startsWith("won");

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-24 left-4 z-[55] max-w-xs"
        >
          <div className="glass-card p-3 pr-5 border border-white/[0.08] shadow-2xl">
            <div className="card-shine" />
            <div className="relative z-[2] flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isWinner ? "bg-white/[0.1]" : "bg-white/[0.05]"
              }`}>
                {isWinner
                  ? <Trophy className="w-4 h-4 text-white/70" />
                  : <Ticket className="w-4 h-4 text-white/40" />
                }
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white/80 font-light truncate">
                  <strong className="font-medium">{current.name}</strong> {current.action}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-white/25" />
                  <span className="text-[10px] text-white/30">{current.city}</span>
                  <span className="text-[10px] text-white/20 ml-1">just now</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
