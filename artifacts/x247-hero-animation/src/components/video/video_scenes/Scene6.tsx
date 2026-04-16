import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),  // Lockup forms
      setTimeout(() => setPhase(2), 2500), // Loop prep - clip path closes
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Image Pulse */}
      <motion.img 
        src={`${import.meta.env.BASE_URL}images/smoke-bg.png`}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.08, 0.12, 0.08] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative flex flex-col items-center justify-center">
        {/* Rotating Circle */}
        <motion.div
          className="absolute border border-white/15 rounded-full"
          style={{ width: '20vw', height: '20vw' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* Lockup */}
        <div className="flex flex-col items-center z-10">
          <motion.div
            className="text-white font-black leading-none"
            style={{ fontFamily: 'var(--font-display)', fontSize: '9vw' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{ duration: 1, type: 'spring', stiffness: 200, damping: 20 }}
          >
            X247
          </motion.div>
          <motion.div
            className="text-white tracking-[0.5em] mt-2 uppercase"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '2vw' }}
            initial={{ y: 20, opacity: 0 }}
            animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            REWARDS
          </motion.div>
        </div>
      </div>

      {/* Loop transition clip-path */}
      <motion.div
        className="absolute inset-0 bg-black z-50 pointer-events-none"
        initial={{ clipPath: 'circle(100% at 50% 50%)' }}
        animate={phase >= 2 ? { clipPath: 'circle(0% at 50% 50%)' } : { clipPath: 'circle(100% at 50% 50%)' }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}