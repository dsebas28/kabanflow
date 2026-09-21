"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/** Soft violet halo that trails the mouse. Fine pointers only; off for reduced motion. */
export default function CursorGlow() {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(-600);
  const y = useMotionValue(-600);
  const sx = useSpring(x, { stiffness: 110, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 110, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX - 260);
      y.set(e.clientY - 260);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [reduceMotion, x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.16),transparent_65%)]"
      style={{ x: sx, y: sy }}
    />
  );
}
