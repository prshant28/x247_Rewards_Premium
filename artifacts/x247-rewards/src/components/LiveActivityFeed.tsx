import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Ticket, MapPin, Clock } from "lucide-react";
import { getActivityFeed, type ActivityFeedItem } from "@/lib/api";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function LiveActivityFeed() {
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    getActivityFeed().then(setFeed);
    const refreshInterval = setInterval(() => getActivityFeed().then(setFeed), 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (feed.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setVisibleIndex((prev) => (prev + 1) % feed.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [feed.length]);

  if (feed.length === 0) return null;

  const items = feed.slice(visibleIndex, visibleIndex + 3).length >= 3
    ? feed.slice(visibleIndex, visibleIndex + 3)
    : [...feed.slice(visibleIndex), ...feed.slice(0, 3 - (feed.length - visibleIndex))].slice(0, 3);

  return (
    <div className="glass-card p-5 sm:p-6 overflow-hidden">
      <div className="card-shine" />
      <div className="relative z-[2]">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
          <span className="text-[10px] font-display uppercase tracking-[0.2em] text-white/40">Live Activity</span>
        </div>
        <div className="space-y-3 min-h-[120px]">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.div
                key={`${item.name}-${item.time}-${i}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  item.type === "winner" ? "bg-white/[0.08]" : "bg-white/[0.04]"
                }`}>
                  {item.type === "winner"
                    ? <Trophy className="w-3.5 h-3.5 text-white/60" />
                    : <Ticket className="w-3.5 h-3.5 text-white/40" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 font-light truncate">
                    {item.type === "winner" ? (
                      <><strong className="font-medium text-white/90">{item.name}</strong> won {item.prize}</>
                    ) : (
                      <><strong className="font-medium text-white/80">{item.name}</strong> entered {item.contest}</>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-white/20" />
                    <span className="text-[10px] text-white/30">{item.city}</span>
                    <Clock className="w-2.5 h-2.5 text-white/20 ml-1" />
                    <span className="text-[10px] text-white/30">{timeAgo(item.time)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
