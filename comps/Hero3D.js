"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial } from "@react-three/drei";

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE FIELD — 2000 floating green particles rotating slowly
// ─────────────────────────────────────────────────────────────────────────────
function ParticleField() {
  const mesh = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return arr;
  }, []);

  useFrame((s) => {
    if (mesh.current) {
      mesh.current.rotation.y = s.clock.elapsedTime * 0.03;
      mesh.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.015) * 0.08;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00FFA3" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOW ORB — wireframe distorted sphere floating gently
// ─────────────────────────────────────────────────────────────────────────────
function GlowOrb() {
  const mesh = useRef();
  useFrame((s) => {
    if (mesh.current) {
      mesh.current.position.y = Math.sin(s.clock.elapsedTime * 0.5) * 0.4;
      mesh.current.rotation.z = s.clock.elapsedTime * 0.2;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={mesh} position={[2, 0, -3]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <MeshDistortMaterial
          color="#00FFA3"
          distort={0.4}
          speed={2}
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>
    </Float>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS SCENE — combines particles, orb, and star field
// ─────────────────────────────────────────────────────────────────────────────
function ThreeScene() {
  return (
    <>
      <ParticleField />
      <GlowOrb />
      <Stars radius={120} depth={60} count={1000} factor={3} saturation={0} fade speed={0.4} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO 3D BACKGROUND — full-viewport Canvas for hero sections
// Pass as a child of a position:relative container with position:absolute inset:0
// ─────────────────────────────────────────────────────────────────────────────
export default function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }} style={{ position: "absolute", inset: 0 }}>
      <ThreeScene />
    </Canvas>
  );
}
