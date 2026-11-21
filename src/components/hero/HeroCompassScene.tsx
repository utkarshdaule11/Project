"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function HeroCompassScene() {
  const compassGroupRef = useRef<THREE.Group>(null);
  const needleRef = useRef<THREE.Group>(null);
  const roadRef = useRef<THREE.Group>(null);

  // Winding 3D road ribbon curve through and around the compass
  const roadCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.8, -1.2, 2.5),
      new THREE.Vector3(-2.6, -0.4, 1.8),
      new THREE.Vector3(-1.0, 0.2, 0.5),
      new THREE.Vector3(0.6, 0.4, -0.6),
      new THREE.Vector3(2.4, 0.8, -1.8),
      new THREE.Vector3(4.6, 1.4, -3.2),
    ]);
  }, []);

  const roadGeometry = useMemo(() => {
    return new THREE.TubeGeometry(roadCurve, 64, 0.28, 8, false);
  }, [roadCurve]);

  const stripeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(roadCurve, 64, 0.05, 6, false);
  }, [roadCurve]);

  // Cardinal tick marks at 0, 90, 180, 270 degrees
  const ticks = useMemo(() => [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2], []);

  useFrame((_, delta) => {
    // Slowly rotate compass dial and needle smoothly
    if (compassGroupRef.current) {
      compassGroupRef.current.rotation.y += delta * 0.12;
    }
    // Subtle float animation on road ribbon
    if (roadRef.current) {
      roadRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.05;
    }
  });

  return (
    <>
      {/* Studio Lighting using design token tones */}
      <ambientLight intensity={0.9} color="#E6F4FA" />
      <directionalLight
        position={[6, 10, 8]}
        intensity={1.8}
        color="#FFFFFF"
        castShadow
      />
      <directionalLight
        position={[-6, 4, -4]}
        intensity={0.6}
        color="#5CC8D7"
      />

      {/* Main Rotating Compass Assembly */}
      <group
        ref={compassGroupRef}
        rotation={[Math.PI / 6, 0, 0]}
        position={[0, 0, 0]}
      >
        {/* Outer Compass Bezel / Rim (Turquoise) */}
        <mesh position={[0, -0.05, 0]}>
          <torusGeometry args={[2.5, 0.14, 16, 64]} />
          <meshStandardMaterial
            color="#1CA7B8"
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>

        {/* Inner Secondary Bezel Ring (Light Turquoise) */}
        <mesh position={[0, -0.05, 0]}>
          <torusGeometry args={[2.3, 0.04, 12, 64]} />
          <meshStandardMaterial
            color="#5CC8D7"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>

        {/* Compass Dial Face Base (White Surface) */}
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[2.35, 2.35, 0.08, 64]} />
          <meshStandardMaterial
            color="#FFFFFF"
            roughness={0.4}
            metalness={0.05}
          />
        </mesh>

        {/* Dial Inner Groove (Baby Blue) */}
        <mesh position={[0, -0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.7, 1.76, 64]} />
          <meshBasicMaterial color="#E6F4FA" side={THREE.DoubleSide} />
        </mesh>

        {/* 4 Cardinal Point Tick Indicators */}
        {ticks.map((angle, idx) => (
          <group key={idx} rotation={[0, angle, 0]}>
            <mesh position={[0, -0.06, 2.0]}>
              <boxGeometry args={[0.08, 0.04, 0.35]} />
              <meshStandardMaterial
                color={idx === 0 ? "#F59A4B" : "#1F3A6B"}
                roughness={0.5}
              />
            </mesh>
          </group>
        ))}

        {/* 3D Compass Needle */}
        <group ref={needleRef} position={[0, 0.02, 0]}>
          {/* North Needle Point (Softened Saffron) */}
          <mesh position={[0, 0.06, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.32, 1.8, 4]} />
            <meshStandardMaterial
              color="#F59A4B"
              roughness={0.3}
              metalness={0.3}
            />
          </mesh>

          {/* South Needle Point (Navy) */}
          <mesh position={[0, 0.06, -0.9]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.32, 1.8, 4]} />
            <meshStandardMaterial
              color="#1F3A6B"
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>

          {/* Center Pivot Pin & Cap (White & Saffron) */}
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 24]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.26, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#F59A4B" roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* Winding 3D Road Ribbon gracefully crossing the scene */}
      <group ref={roadRef}>
        {/* Main Road Surface (Softened Saffron) */}
        <mesh geometry={roadGeometry}>
          <meshStandardMaterial
            color="#F59A4B"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>

        {/* Road Center Stripe (White) */}
        <mesh geometry={stripeGeometry} position={[0, 0.02, 0]}>
          <meshStandardMaterial
            color="#FFFFFF"
            roughness={0.2}
          />
        </mesh>

        {/* Highway Milestone Markers along the ribbon */}
        {[
          new THREE.Vector3(-2.6, -0.4, 1.8),
          new THREE.Vector3(0.6, 0.4, -0.6),
          new THREE.Vector3(2.4, 0.8, -1.8),
        ].map((pt, i) => (
          <group key={i} position={[pt.x, pt.y + 0.35, pt.z]}>
            <mesh>
              <sphereGeometry args={[0.14, 12, 12]} />
              <meshStandardMaterial
                color={i === 1 ? "#1CA7B8" : i === 0 ? "#3E9B6A" : "#F59A4B"}
                roughness={0.3}
              />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}
