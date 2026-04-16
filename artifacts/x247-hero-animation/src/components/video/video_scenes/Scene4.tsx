import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audio } from '@/lib/video/audio';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),  // EARN
      setTimeout(() => setPhase(2), 1100), // REFER
      setTimeout(() => setPhase(3), 1900), // WIN
      setTimeout(() => setPhase(4), 2400), // Pills
      setTimeout(() => setPhase(5), 3700), // Exit prep
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  useEffect(() => {
    if (phase >= 1 && phase <= 3) {
      audio.playWhoosh();
    }
  }, [phase]);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 p-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-[80vw] flex flex-col relative h-[60vh]">
        {/* EARN. */}
        <motion.div
          className="absolute top-0 left-0 text-white font-light uppercase"
          style={{ fontFamily: 'var(--font-display)', fontSize: '8vw' }}
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={phase >= 1 ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          EARN.
        </motion.div>

        {/* REFER. */}
        <motion.div
          className="absolute top-[25%] right-0 text-white font-light uppercase"
          style={{ fontFamily: 'var(--font-display)', fontSize: '8vw' }}
          initial={{ x: 100, opacity: 0 }}
          animate={phase >= 2 ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          REFER.
        </motion.div>

        {/* WIN. */}
        <motion.div
          className="absolute top-[50%] left-1/2 -translate-x-1/2 text-white font-black uppercase tracking-tighter"
          style={{ fontFamily: 'var(--font-display)', fontSize: '12vw' }}
          initial={{ y: -100, opacity: 0, scale: 1.2 }}
          animate={phase >= 3 ? { y: 0, opacity: 1, scale: 1 } : { y: -100, opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
        >
          WIN.
        </motion.div>

        {/* Pills */}
        <div className="absolute bottom-0 left-0 w-full flex justify-center space-x-6">
          {['DAILY DRAWS', 'VERIFIED MEMBERS', 'REAL PRIZES'].map((pill, i) => (
            <motion.div
              key={i}
              className="px-6 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-[1vw] text-white/80 uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-mono)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: i * 0.15, type: 'spring', stiffness: 300, damping: 25 }}
            >
              {pill}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}