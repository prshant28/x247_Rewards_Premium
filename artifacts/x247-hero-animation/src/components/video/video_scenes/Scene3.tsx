import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),  // Words appear
      setTimeout(() => setPhase(2), 1500), // Badges stagger in
      setTimeout(() => setPhase(3), 3800), // Exit prep
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const words = ['Earn.', 'Refer.', 'Win.'];
  const badges = ['DAILY DRAWS', 'VERIFIED MEMBERS', 'REAL PRIZES'];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Tagline */}
      <div className="flex space-x-4 mb-12">
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="text-[5vw] font-bold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, filter: 'blur(20px)', y: 20 }}
            animate={phase >= 1 ? { opacity: 1, filter: 'blur(0px)', y: 0 } : { opacity: 0, filter: 'blur(20px)', y: 20 }}
            transition={{ duration: 1, delay: i * 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        ))}
      </div>

      {/* Pill Badges */}
      <div className="flex space-x-6">
        {badges.map((badge, i) => (
          <motion.div
            key={i}
            className="px-6 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-[1vw] text-white/80 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-mono)' }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.6, delay: i * 0.15, type: 'spring', stiffness: 300, damping: 25 }}
          >
            {badge}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
