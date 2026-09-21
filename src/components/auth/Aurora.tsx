"use client";

import { motion, useReducedMotion } from "framer-motion";

const BLOBS = [
  { className: "left-[-10%] top-[10%] h-[420px] w-[420px] bg-brand-500/40", x: [0, 80, -20, 0], y: [0, 40, 90, 0], d: 18 },
  { className: "right-[-15%] top-[45%] h-[380px] w-[380px] bg-accent-500/30", x: [0, -70, 20, 0], y: [0, -60, 30, 0], d: 22 },
  { className: "bottom-[-10%] left-[25%] h-[320px] w-[320px] bg-fuchsia-500/25", x: [0, 50, -40, 0], y: [0, -40, 20, 0], d: 26 },
];

/** Slow drifting colour clouds over a faint grid — the resting state of the auth side panel. */
export default function Aurora() {
  const reduceMotion = useReducedMotion();
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[90px] ${b.className}`}
          animate={reduceMotion ? undefined : { x: b.x, y: b.y }}
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
        }}
      />
    </div>
  );
}
