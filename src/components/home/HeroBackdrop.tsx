"use client";

import dynamic from "next/dynamic";
import Scene3D from "@/components/three/Scene3D";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

// Floating 3D cards drifting behind the hero. Nothing renders on mobile or
// with reduced motion — the live demo in front carries the page on its own.
export default function HeroBackdrop() {
  return (
    <Scene3D className="pointer-events-none absolute inset-0 opacity-40" fallback={<div />}>
      <HeroScene />
    </Scene3D>
  );
}
