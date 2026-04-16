import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  const convergingParticles = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      angle: Math.random() * Math.PI * 2,
      distance: 60 + Math.random() * 40,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.5,
      delay: Math.random() * 0.5
    }));
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),   // Text appears center
      setTimeout(() => setPhase(2), 1200),  // Shrink to watermark & particles converge
      setTimeout(() => setPhase(3), 2800),  // Exit prep
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }} // Final scene before loop
      transition={{ duration: 0.8 }}
    >
      {/* Re-converging particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {convergingParticles.map(p => (
          <motion.div
            key={p.id}
            className="absolute bg-white rounded-full"
            style={{ width: p.size, height: p.size }}
            initial={{
              x: Math.cos(p.angle) * p.distance + 'vw',
              y: Math.sin(p.angle) * p.distance + 'vw',
              opacity: 0
            }}
            animate={
              phase >= 2 
                ? {
                    x: 0,
                    y: 0,
                    scale: 0,
                    opacity: 0
                  }
                : phase >= 1 
                ? {
                    x: Math.cos(p.angle) * p.distance + 'vw',
                    y: Math.sin(p.angle) * p.distance + 'vw',
                    opacity: 0.8
                  }
                : {
                    x: Math.cos(p.angle) * p.distance + 'vw',
                    y: Math.sin(p.angle) * p.distance + 'vw',
                    opacity: 0
                  }
            }
            transition={{ duration: 1.5, ease: 'backIn', delay: p.delay }}
          />
        ))}
      </div>

      {/* Main Logo Text -> Watermark */}
      <motion.div
        className="text-white font-bold leading-none tracking-tighter flex items-center justify-center absolute"
        style={{ fontFamily: 'var(--font-display)', fontSize: '10vw' }}
        initial={{ scale: 1, left: '50%', top: '50%', x: '-50%', y: '-50%', opacity: 0, filter: 'blur(20px)' }}
        animate={
          phase >= 2
            ? { scale: 0.2, left: '90%', top: '90%', x: '-50%', y: '-50%', opacity: 0.3, filter: 'blur(0px)' }
            : phase >= 1
            ? { scale: 1, left: '50%', top: '50%', x: '-50%', y: '-50%', opacity: 1, filter: 'blur(0px)' }
            : { scale: 1, left: '50%', top: '50%', x: '-50%', y: '-50%', opacity: 0, filter: 'blur(20px)' }
        }
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        X247
      </motion.div>
    </motion.div>
  );
}
