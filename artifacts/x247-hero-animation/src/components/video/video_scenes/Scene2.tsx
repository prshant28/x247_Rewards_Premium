import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),  // Type characters
      setTimeout(() => setPhase(2), 1500), // Horizontal rule
      setTimeout(() => setPhase(3), 2800), // Exit prep
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50, filter: 'blur(15px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative flex flex-col items-center">
        <div className="flex space-x-1 overflow-hidden" style={{ perspective: '1000px' }}>
          {'247'.split('').map((char, i) => (
            <motion.span
              key={i}
              className="text-[10vw] font-bold leading-none text-white tracking-tighter"
              style={{ fontFamily: 'var(--font-display)', transformOrigin: 'center center -50px' }}
              initial={{ opacity: 0, rotateX: -90, y: 50 }}
              animate={phase >= 1 ? { opacity: 1, rotateX: 0, y: 0 } : { opacity: 0, rotateX: -90, y: 50 }}
              transition={{ duration: 0.8, delay: i * 0.15, type: 'spring', stiffness: 200, damping: 20 }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Thin horizontal rule */}
        <motion.div
          className="h-[2px] bg-white/40 mt-4"
          initial={{ width: 0, opacity: 0 }}
          animate={phase >= 2 ? { width: '15vw', opacity: 1 } : { width: 0, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}
