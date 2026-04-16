import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audio } from '@/lib/video/audio';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),  // Card + Explosion appear
      setTimeout(() => setPhase(2), 1200), // Stat 1
      setTimeout(() => setPhase(3), 1600), // Stat 2
      setTimeout(() => setPhase(4), 2000), // Stat 3
      setTimeout(() => setPhase(5), 4500), // Exit prep
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  useEffect(() => {
    if (phase === 2 || phase === 3 || phase === 4) {
      audio.playSparkle();
    }
  }, [phase]);

  const stats = [
    { num: '₹3,00,000+', label: 'PRIZES', phaseReq: 2 },
    { num: '30+', label: 'CONTESTS', phaseReq: 3 },
    { num: '15', label: 'PARTNERS', phaseReq: 4 }
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background explosion image */}
      <motion.img
        src={`${import.meta.env.BASE_URL}images/prize-burst.png`}
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        initial={{ scale: 0, opacity: 0 }}
        animate={phase >= 1 ? { scale: 1, opacity: 0.8 } : { scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      />

      {/* Trophy silhouette */}
      <motion.img
        src={`${import.meta.env.BASE_URL}images/trophy.png`}
        className="absolute right-[10vw] top-[50%] -translate-y-1/2 w-[30vw] object-contain opacity-15"
        initial={{ opacity: 0, x: 50 }}
        animate={phase >= 1 ? { opacity: 0.15, x: 0 } : { opacity: 0, x: 50 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />

      {/* Glass Card */}
      <motion.div
        className="relative bg-white/4 border border-white/8 backdrop-blur-md rounded-2xl p-12 flex flex-col space-y-8 min-w-[30vw]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <motion.div
              className="text-white font-bold"
              style={{ fontFamily: 'var(--font-display)', fontSize: '3vw' }}
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= stat.phaseReq ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
            >
              {stat.num}
            </motion.div>
            <motion.div
              className="text-white/50 uppercase tracking-widest mt-1"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.9vw' }}
              initial={{ opacity: 0 }}
              animate={phase >= stat.phaseReq ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {stat.label}
            </motion.div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}