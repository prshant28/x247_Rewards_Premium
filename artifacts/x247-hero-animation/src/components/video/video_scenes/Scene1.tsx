import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  const orbitingParticles = useMemo(() => {
    return Array.from({ length: 200 }).map((_, i) => {
      const radius = 20 + Math.random() * 40;
      const angle = Math.random() * Math.PI * 2;
      return {
        id: i,
        radius,
        angle,
        size: Math.random() * 2 + 1,
        speed: (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1)
      };
    });
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),   // Start SVG tracing
      setTimeout(() => setPhase(2), 2500),  // Particles scatter, X fully forms
      setTimeout(() => setPhase(3), 3500),  // Exit prep
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Orbiting / Converging / Scattering Particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {orbitingParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white opacity-60"
            style={{ width: p.size, height: p.size }}
            initial={{
              x: Math.cos(p.angle) * p.radius + 'vw',
              y: Math.sin(p.angle) * p.radius + 'vw',
            }}
            animate={
              phase >= 2 
                ? {
                    x: Math.cos(p.angle) * (p.radius * 3) + 'vw',
                    y: Math.sin(p.angle) * (p.radius * 3) + 'vw',
                    opacity: 0,
                    scale: 0
                  }
                : {
                    x: [
                      Math.cos(p.angle) * p.radius + 'vw',
                      Math.cos(p.angle + p.speed * 2) * (p.radius * 0.5) + 'vw',
                      Math.cos(p.angle + p.speed * 4) * (p.radius * 0.1) + 'vw'
                    ],
                    y: [
                      Math.sin(p.angle) * p.radius + 'vw',
                      Math.sin(p.angle + p.speed * 2) * (p.radius * 0.5) + 'vw',
                      Math.sin(p.angle + p.speed * 4) * (p.radius * 0.1) + 'vw'
                    ],
                  }
            }
            transition={
              phase >= 2 
                ? { duration: 1, ease: 'easeOut' }
                : { duration: 2.5, ease: 'easeInOut' }
            }
          />
        ))}
      </div>

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
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={phase >= 1 ? { pathLength: 1, opacity: phase >= 2 ? 1 : 0.8 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.svg>
        
        {/* Solid X overlay that fades in perfectly at the end of trace */}
        <motion.div
          className="text-[20vw] font-bold leading-none text-white tracking-tighter"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, filter: 'blur(20px)' }}
          animate={phase >= 2 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(20px)' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          X
        </motion.div>
      </div>
    </motion.div>
  );
}
