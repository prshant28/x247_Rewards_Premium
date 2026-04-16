import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300), // Logo small top
      setTimeout(() => setPhase(2), 1000), // Tagline P1
      setTimeout(() => setPhase(3), 1800), // Tagline P2
      setTimeout(() => setPhase(4), 3500), // Exit
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute top-[20vh] text-white/40 text-[2vw] tracking-[0.5em] font-medium uppercase"
        style={{ fontFamily: 'var(--font-mono)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        X247 Rewards
      </motion.div>

      <div className="flex flex-col items-center gap-4 text-[6vw] font-bold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
        <div className="overflow-hidden">
          <motion.div
            initial={{ y: '100%', opacity: 0, rotateX: 45 }}
            animate={phase >= 2 ? { y: '0%', opacity: 1, rotateX: 0 } : { y: '100%', opacity: 0, rotateX: 45 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-white"
          >
            Your Rewards.
          </motion.div>
        </div>
        <div className="overflow-hidden">
          <motion.div
            initial={{ y: '100%', opacity: 0, rotateX: 45 }}
            animate={phase >= 3 ? { y: '0%', opacity: 1, rotateX: 0 } : { y: '100%', opacity: 0, rotateX: 45 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/60 italic"
          >
            Your Way.
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
