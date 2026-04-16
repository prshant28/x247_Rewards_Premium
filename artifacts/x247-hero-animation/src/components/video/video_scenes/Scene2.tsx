import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audio } from '@/lib/video/audio';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),  // Move X, assemble 247
      setTimeout(() => setPhase(2), 2000), // Horizontal rule
      setTimeout(() => setPhase(3), 3200), // Exit prep
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  useEffect(() => {
    if (phase === 1) {
      setTimeout(() => audio.playTick(), 150);
      setTimeout(() => audio.playTick(), 300);
      setTimeout(() => audio.playTick(), 450);
    }
  }, [phase]);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative flex flex-col items-center justify-center">
        <div className="flex items-center">
          {/* X from previous scene */}
          <motion.div
            className="relative w-[8vw] h-[8vw]"
            initial={{ scale: 2.5, x: '10vw' }}
            animate={phase >= 1 ? { scale: 1, x: 0 } : { scale: 2.5, x: '10vw' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
              <path
                d="M 10 10 L 90 90 M 90 10 L 10 90"
                fill="transparent"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>

          <div className="flex ml-2" style={{ perspective: '1200px' }}>
            {'247'.split('').map((char, i) => (
              <motion.span
                key={i}
                className="text-[10vw] font-black leading-none text-white tracking-tighter"
                style={{ fontFamily: 'var(--font-display)' }}
                initial={{ opacity: 0, rotateY: 90, x: 50 }}
                animate={phase >= 1 ? { opacity: 1, rotateY: 0, x: 0 } : { opacity: 0, rotateY: 90, x: 50 }}
                transition={{ duration: 0.8, delay: 0.15 * (i + 1), type: 'spring', stiffness: 200, damping: 20 }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Below Text */}
        <motion.div
          className="text-white/40 tracking-widest mt-4 uppercase"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '1vw' }}
          initial={{ opacity: 0, y: 10 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          REWARDS PLATFORM
        </motion.div>

        {/* Horizontal rule */}
        <motion.div
          className="absolute top-1/2 h-[1px] bg-white"
          initial={{ width: 0, opacity: 0 }}
          animate={phase >= 2 ? { width: '40vw', opacity: 0.3 } : { width: 0, opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}