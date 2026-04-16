import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { audio } from '@/lib/video/audio';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  const particles = useMemo(() => {
    return Array.from({ length: 300 }).map((_, i) => {
      const angle = (i / 300) * Math.PI * 20; // spiral
      const radius = 60 + Math.random() * 40; // start outside
      return {
        id: i,
        angle,
        radius,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 0.5
      };
    });
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),   // Start converging
      setTimeout(() => setPhase(2), 2500),  // Trace complete, EXPLODE
      setTimeout(() => {
        setPhase(3); // Exit prep
      }, 4000),  
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  useEffect(() => {
    if (phase === 2) {
      audio.playBoom();
    }
  }, [phase]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.8 } }}
    >
      {/* Background Image */}
      <motion.img 
        src={`${import.meta.env.BASE_URL}images/smoke-bg.png`}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ opacity: 0 }}
        animate={phase >= 1 ? { opacity: 0.08 } : { opacity: 0 }}
        transition={{ duration: 2 }}
      />

      {/* Particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white opacity-80"
            style={{ width: p.size, height: p.size }}
            initial={{
              x: Math.cos(p.angle) * p.radius + 'vw',
              y: Math.sin(p.angle) * p.radius + 'vw',
            }}
            animate={
              phase >= 2 
                ? {
                    x: Math.cos(p.angle) * (p.radius * 2) + 'vw',
                    y: Math.sin(p.angle) * (p.radius * 2) + 'vw',
                    opacity: 0,
                    scale: 0
                  }
                : phase >= 1
                ? {
                    x: 0,
                    y: 0,
                  }
                : {
                    x: Math.cos(p.angle) * p.radius + 'vw',
                    y: Math.sin(p.angle) * p.radius + 'vw',
                  }
            }
            transition={
              phase >= 2 
                ? { duration: 1.5, ease: 'easeOut' }
                : { duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: p.delay }
            }
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        {/* SVG X Trace */}
        <div className="relative w-[20vw] h-[20vw] flex items-center justify-center">
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full overflow-visible"
          >
            <motion.path
              d="M 10 10 L 90 90 M 90 10 L 10 90"
              fill="transparent"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={phase >= 1 ? { pathLength: 1, opacity: phase >= 2 ? 1 : 0.8 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.svg>
        </div>

        {/* REWARDS text */}
        <motion.div
          className="absolute -bottom-[2vw] text-white tracking-[0.6em]"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8vw' }}
          initial={{ opacity: 0, y: -10 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        >
          REWARDS
        </motion.div>
      </div>
    </motion.div>
  );
}