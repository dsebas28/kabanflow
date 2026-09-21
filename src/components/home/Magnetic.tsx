"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

const clamp = (n: number, max: number) => Math.max(-max, Math.min(max, n));

/** Pulls its child a few pixels toward the pointer. No-op on touch and reduced motion. */
export default function Magnetic({ children, strength = 0.25 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (reduceMotion || e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(clamp((e.clientX - (r.left + r.width / 2)) * strength, 10));
    y.set(clamp((e.clientY - (r.top + r.height / 2)) * strength, 10));
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} style={{ x: sx, y: sy }} className="inline-block">
      {children}
    </motion.div>
  );
}
