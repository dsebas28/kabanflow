"use client";

import { useRef, type ReactNode } from "react";

/** Card with a soft light that follows the pointer across its surface. */
export default function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className={`group relative overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-xl backdrop-blur-xl ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(360px circle at var(--mx, 50%) var(--my, 0%), rgba(124,58,237,0.14), transparent 65%)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
