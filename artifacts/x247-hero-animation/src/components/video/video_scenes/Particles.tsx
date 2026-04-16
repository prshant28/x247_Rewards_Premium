import { useMemo } from 'react';
import { motion } from 'framer-motion';

export function Particles({ count = 80 }: { count?: number }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1 + 1, // 1-2px dots
      opacity: Math.random() * 0.21 + 0.04, // 0.04 - 0.25
      duration: Math.random() * 20 + 10,
      delay: Math.random() * -20,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: ['0vh', '-20vh', '10vh', '0vh'],
            x: ['0vw', `${(Math.random() - 0.5) * 10}vw`, `${(Math.random() - 0.5) * 10}vw`, '0vw'],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity * 0.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}