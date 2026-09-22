"use client";

import { createPortal } from "react-dom";
import { motion } from "framer-motion";

export type WipeOrigin = { x: number; y: number };

const clip = (o: WipeOrigin, r: string) => `circle(${r} at ${o.x}px ${o.y}px)`;

/**
 * Full-screen circular reveal that grows out of the clicked button. The inner
 * layer matches the app background, so when navigation swaps the page the cut
 * is invisible. Rendered in a portal: the auth card has backdrop-filter and
 * overflow-hidden, which would otherwise trap and clip `position: fixed`.
 */
export default function RouteWipe({ origin }: { origin: WipeOrigin | null }) {
  if (!origin) return null;

  return createPortal(
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[100] bg-gradient-to-br from-[#b3261e] to-[#7a1a14]"
        initial={{ clipPath: clip(origin, "0px") }}
        animate={{ clipPath: clip(origin, "150vmax") }}
        transition={{ duration: 0.75, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[101] bg-background"
        initial={{ clipPath: clip(origin, "0px") }}
        animate={{ clipPath: clip(origin, "150vmax") }}
        transition={{ duration: 0.75, delay: 0.14, ease: [0.65, 0, 0.35, 1] }}
      />
    </>,
    document.body,
  );
}
