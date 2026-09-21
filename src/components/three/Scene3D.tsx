"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";

/**
 * Wraps a <Canvas> with the checks a WebGL scene needs before it's safe to
 * mount: skip on prefers-reduced-motion, skip on touch/low-power devices
 * (mobile GPUs + battery cost aren't worth it for decorative visuals), and
 * never render during SSR (no WebGL on the server). Falls back to `fallback`
 * — a plain, cheap visual — in every one of those cases.
 */
export default function Scene3D({
  children,
  fallback,
  className = "",
}: {
  children: ReactNode;
  fallback: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(true);

  useEffect(() => {
    // Reads genuine external state (viewport/pointer capabilities) once on
    // mount — there is no SSR-safe way to know this before the client runs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCoarsePointer(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
    setReady(true);
  }, []);

  if (!ready || reduceMotion || isCoarsePointer) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          camera={{ position: [0, 0, 8], fov: 40 }}
        >
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}
