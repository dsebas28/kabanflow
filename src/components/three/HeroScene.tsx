"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles, Text } from "@react-three/drei";
import * as THREE from "three";

const CARDS = [
  { position: [-1.6, 0.6, 0.4] as const, rotation: [0.1, 0.35, -0.08] as const, color: "#7c3aed", label: "Diseño UI" },
  { position: [1.3, 1.1, -0.3] as const, rotation: [-0.05, -0.3, 0.06] as const, color: "#14b8a6", label: "Lanzamiento" },
  { position: [0.4, -0.9, 0.9] as const, rotation: [0.15, -0.15, 0.1] as const, color: "#f59e0b", label: "Reunión" },
  { position: [-1.1, -1.3, -0.5] as const, rotation: [-0.08, 0.2, -0.05] as const, color: "#ec4899", label: "Revisión" },
];

function FloatingCard({
  position,
  rotation,
  color,
  label,
  speed,
}: {
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  color: string;
  label: string;
  speed: number;
}) {
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.1}>
      <group position={position as unknown as THREE.Vector3Tuple} rotation={rotation as unknown as THREE.EulerTuple}>
        <RoundedBox args={[1.7, 1.05, 0.06]} radius={0.09} smoothness={4}>
          <meshStandardMaterial color="#131320" roughness={0.35} metalness={0.15} />
        </RoundedBox>
        <RoundedBox args={[1.7, 0.14, 0.07]} radius={0.06} smoothness={4} position={[0, 0.45, 0.005]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.3} />
        </RoundedBox>
        <Text
          position={[-0.72, 0.02, 0.04]}
          anchorX="left"
          anchorY="middle"
          fontSize={0.15}
          color="#f4f4f8"
          maxWidth={1.4}
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

function Rig() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const { pointer } = state;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.35, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.2, 0.04);
  });

  return (
    <group ref={group}>
      {CARDS.map((card, i) => (
        <FloatingCard key={card.label} {...card} speed={1.4 + i * 0.3} />
      ))}
    </group>
  );
}

export default function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 6]} intensity={1.4} color="#c4b5fd" />
      <directionalLight position={[-4, -3, -4]} intensity={0.5} color="#5eead4" />
      <Sparkles count={40} scale={7} size={2.4} speed={0.25} opacity={0.5} color="#a78bfa" />
      <Rig />
    </>
  );
}
