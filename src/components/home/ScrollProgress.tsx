"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Thin gradient bar at the top of the page that fills as you scroll. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-brand-500 to-accent-400"
      style={{ scaleX }}
    />
  );
}
