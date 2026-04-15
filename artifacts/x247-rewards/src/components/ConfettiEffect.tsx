import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiEffectProps {
  active: boolean;
  duration?: number;
}

function Particle({ index }: { index: number }) {
  const x = (Math.random() - 0.5) * 300;
  const y = -(100 + Math.random() * 200);
  const rotation = Math.random() * 720 - 360;
  const scale = 0.5 + Math.random() * 0.8;
  const shade = Math.floor(120 + Math.random() * 135);

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{
        left: "50%",
        top: "50%",
        backgroundColor: `rgb(${shade}, ${shade}, ${shade})`,
        opacity: 0.8,
      }}
      initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
      animate={{
        x,
        y: [y, y + 400],
        scale: [0, scale, scale * 0.5],
        rotate: rotation,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 1.5 + Math.random() * 0.5,
        delay: index * 0.02,
        ease: [0.22, 1, 0.36, 1],
      }}
    />
  );
}

export default function ConfettiEffect({ active, duration = 2000 }: ConfettiEffectProps) {
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!active) return;
    setShow(true);
    setKey((k) => k + 1);
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [active, duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={key}
          className="absolute inset-0 pointer-events-none overflow-hidden z-[10]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <Particle key={i} index={i} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
