"use client";

import dynamic from "next/dynamic";
import Scene3D from "@/components/three/Scene3D";

const AuthScene = dynamic(() => import("@/components/three/AuthScene"), { ssr: false });

// Ambient 3D background for the auth pages. The fallback is an empty div —
// the pages already have their own gradient/blob background underneath, so
// on reduced-motion/mobile it just quietly isn't there instead of degrading.
export default function AuthVisual({ className = "" }: { className?: string }) {
  return (
    <Scene3D className={`pointer-events-none absolute inset-0 ${className}`} fallback={<div />}>
      <AuthScene />
    </Scene3D>
  );
}
