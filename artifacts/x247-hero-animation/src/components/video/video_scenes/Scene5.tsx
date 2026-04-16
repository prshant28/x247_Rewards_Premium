import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),  // Cards start sliding
      setTimeout(() => setPhase(2), 2700), // Exit prep
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const cards = [
    { num: '10,000+', label: 'MEMBERS' },
    { num: '₹5L+', label: 'PRIZES GIVEN' },
    { num: '50+', label: 'CONTESTS RUN' }
  ];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col space-y-6 w-full max-w-[40vw]">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            className="relative bg-white/3 border border-white/6 rounded-xl p-6 flex flex-col overflow-hidden"
            initial={{ opacity: 0, x: -100 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
            transition={{ duration: 0.8, delay: i * 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <span className="text-white font-bold" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5vw' }}>
                {card.num}
              </span>
              <span className="text-white/45 tracking-widest uppercase" style={{ fontFamily: 'var(--font-body)', fontSize: '0.8vw' }}>
                {card.label}
              </span>
            </div>
            
            {/* Progress bar pulse */}
            <motion.div
              className="absolute bottom-0 left-0 h-[1px] bg-white/20"
              initial={{ width: 0 }}
              animate={phase >= 1 ? { width: '100%' } : { width: 0 }}
              transition={{ duration: 2, delay: i * 0.3 + 0.5, ease: 'easeInOut' }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}