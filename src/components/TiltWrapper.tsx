"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { useReducedMotion } from "framer-motion";

const MAX_TILT = 8;

/**
 * Pure-CSS 3D tilt on hover (perspective + rotateX/rotateY), driven by
 * pointer position. Lives on an inner wrapper so it never touches a parent
 * element's own `transform` (e.g. dnd-kit's drag translate) — nested
 * transforms compose fine, hand-merged transform strings don't.
 */
export default function TiltWrapper({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(700px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg) translateZ(4px)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`[transform-style:preserve-3d] transition-transform duration-150 ease-out ${className}`}
    >
      {children}
    </div>
  );
}
