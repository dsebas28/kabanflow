"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const SHAPES = [
  { position: [-2.2, 1.4, -2] as const, scale: 1.6, color: "#7c3aed", geometry: "icosahedron" as const },
  { position: [2.4, -1.2, -3] as const, scale: 2.1, color: "#14b8a6", geometry: "torus" as const },
  { position: [0.6, 2.2, -4] as const, scale: 1.1, color: "#f59e0b", geometry: "icosahedron" as const },
  { position: [-1.6, -2, -3.5] as const, scale: 1.4, color: "#7c3aed", geometry: "sphere" as const },
];

function Shape({ position, scale, color, geometry, speed }: (typeof SHAPES)[number] & { speed: number }) {
  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh position={position as unknown as THREE.Vector3Tuple} scale={scale}>
        {geometry === "icosahedron" && <icosahedronGeometry args={[0.6, 1]} />}
        {geometry === "torus" && <torusGeometry args={[0.5, 0.18, 16, 48]} />}
        {geometry === "sphere" && <sphereGeometry args={[0.55, 32, 32]} />}
        <MeshDistortMaterial color={color} speed={1.2} distort={0.35} roughness={0.25} metalness={0.1} opacity={0.85} transparent />
      </mesh>
    </Float>
  );
}

function Rig() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const { pointer } = state;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.15, 0.03);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.1, 0.03);
  });

  return (
    <group ref={group}>
      {SHAPES.map((shape, i) => (
        <Shape key={i} {...shape} speed={1 + i * 0.25} />
      ))}
    </group>
  );
}

export default function AuthScene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#c4b5fd" />
      <directionalLight position={[-3, -2, -2]} intensity={0.5} color="#5eead4" />
      <Rig />
    </>
  );
}
