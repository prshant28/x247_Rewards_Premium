import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500), // Reveal X
      setTimeout(() => setPhase(2), 1500), // Reveal 247
      setTimeout(() => setPhase(3), 2800), // Exit
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative flex items-center justify-center">
        {/* Glow behind X */}
        <motion.div
          className="absolute w-[30vw] h-[30vw] bg-white/5 rounded-full blur-3xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />

        <motion.div 
          className="flex items-center space-x-2"
          initial={{ x: '5vw' }}
          animate={phase >= 2 ? { x: 0 } : { x: '5vw' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* The X */}
          <motion.span
            className="text-[12vw] font-bold leading-none text-white tracking-tighter"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, scale: 0.8, rotate: -10, filter: 'blur(20px)' }}
            animate={phase >= 1 ? { opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' } : { opacity: 0, scale: 0.8, rotate: -10, filter: 'blur(20px)' }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            X
          </motion.span>
          
          {/* 247 */}
          <motion.span
            className="text-[8vw] font-medium leading-none text-white/80 tracking-tight overflow-hidden flex"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {'247'.split('').map((char, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: '100%' }}
                animate={phase >= 2 ? { opacity: 1, y: '0%' } : { opacity: 0, y: '100%' }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
}
