"use client";

import dynamic from "next/dynamic";
import Scene3D from "@/components/three/Scene3D";
import LandingBoardMockup from "@/components/LandingBoardMockup";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

export default function HeroVisual() {
  return (
    <Scene3D className="h-[420px] w-full sm:h-[480px]" fallback={<LandingBoardMockup />}>
      <HeroScene />
    </Scene3D>
  );
}
