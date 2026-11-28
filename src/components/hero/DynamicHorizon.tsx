"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface DynamicHorizonProps {
  className?: string;
}

/**
 * Sunlit Sandstone & Terracotta Himalayan Horizon Backdrop
 *
 * Layered daylight-to-dawn vector mountain ridges and vanishing highway perspective
 * matching the warm editorial travel theme.
 */
export function DynamicHorizon({ className = "" }: DynamicHorizonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [shouldReduceMotion]);

  const calcOffset = (depthMultiplier: number) => {
    if (shouldReduceMotion) return { x: 0, y: 0 };
    return {
      x: mousePos.x * depthMultiplier * 12,
      y: mousePos.y * depthMultiplier * 6,
    };
  };

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
    >
      {/* LAYER 1: Sunlit Warm Ivory Sky to Golden Sandstone Horizon */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F9F7F6] via-[#F7EFE2] to-[#EFE3D0]" />

      {/* Warm Sunlight Horizon Bloom behind mountain ridges */}
      <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-[150%] sm:w-[110%] h-[320px] rounded-full blur-3xl opacity-55 bg-gradient-to-t from-[#F4B886]/45 via-[#F9DCBA]/35 to-transparent pointer-events-none" />

      {/* LAYER 2: Distant High Montane Ridge (Himalayas / Pir Panjal Silhouette) */}
      <motion.div
        animate={calcOffset(0.25)}
        transition={{ type: "spring", stiffness: 45, damping: 25, mass: 0.5 }}
        className="absolute inset-x-0 bottom-[28%] h-[260px] w-full"
      >
        <svg
          viewBox="0 0 1440 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full opacity-55"
        >
          <path
            d="M0 280 L0 185 L95 145 L180 170 L285 105 L370 140 L490 85 L580 135 L685 95 L780 150 L890 90 L1010 130 L1130 75 L1240 120 L1350 95 L1440 140 L1440 280 Z"
            fill="url(#distant-alpine-grad)"
          />
          <defs>
            <linearGradient id="distant-alpine-grad" x1="720" y1="75" x2="720" y2="280" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D6C6B0" stopOpacity="0.7" />
              <stop offset="0.7" stopColor="#E4D6C1" stopOpacity="0.85" />
              <stop offset="1" stopColor="#F7F3EA" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* LAYER 3: Submontane Piedmont & Vindhyan Mid-Range Escarpments */}
      <motion.div
        animate={calcOffset(0.5)}
        transition={{ type: "spring", stiffness: 50, damping: 22, mass: 0.6 }}
        className="absolute inset-x-0 bottom-[20%] h-[220px] w-full"
      >
        <svg
          viewBox="0 0 1440 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full opacity-70"
        >
          <path
            d="M0 240 L0 155 Q120 130 240 145 T480 125 T720 140 T960 115 T1200 135 T1440 125 L1440 240 Z"
            fill="url(#midrange-grad)"
          />
          <defs>
            <linearGradient id="midrange-grad" x1="720" y1="115" x2="720" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C8B69D" stopOpacity="0.75" />
              <stop offset="0.75" stopColor="#DFD3C1" stopOpacity="0.9" />
              <stop offset="1" stopColor="#F7F3EA" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* LAYER 4: Peninsular Deccan Tors & Piedmont Rolling Foreland */}
      <motion.div
        animate={calcOffset(0.8)}
        transition={{ type: "spring", stiffness: 55, damping: 20, mass: 0.7 }}
        className="absolute inset-x-0 bottom-[12%] h-[180px] w-full"
      >
        <svg
          viewBox="0 0 1440 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full opacity-85"
        >
          <path
            d="M0 200 L0 110 C180 95 320 135 520 105 C700 80 840 125 1060 95 C1220 75 1350 110 1440 95 L1440 200 Z"
            fill="url(#tors-grad)"
          />
          <defs>
            <linearGradient id="tors-grad" x1="720" y1="80" x2="720" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#DDD0BC" />
              <stop offset="1" stopColor="#F9F7F6" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* LAYER 5: Sunlit Expedition Highway Ribbon */}
      <div className="absolute inset-x-0 bottom-0 h-[34%] w-full flex justify-center items-end pointer-events-none opacity-45">
        <svg
          viewBox="0 0 1000 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full max-w-5xl h-full"
        >
          <path
            d="M488 75 L512 75 L760 400 L240 400 Z"
            fill="url(#highway-asphalt-grad)"
          />
          <line x1="488" y1="75" x2="240" y2="400" stroke="#9B876C" strokeWidth="1.5" strokeOpacity="0.45" />
          <line x1="512" y1="75" x2="760" y2="400" stroke="#9B876C" strokeWidth="1.5" strokeOpacity="0.45" />
          <path
            d="M500 75 L500 400"
            stroke="#12313A"
            strokeWidth="3.5"
            strokeDasharray="16 22"
            strokeLinecap="round"
          />
          <circle cx="500" cy="75" r="5" fill="#12313A" fillOpacity="0.65" />
          <defs>
            <linearGradient id="highway-asphalt-grad" x1="500" y1="75" x2="500" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E6DCCB" stopOpacity="0.5" />
              <stop offset="0.6" stopColor="#DFD2BE" stopOpacity="0.7" />
              <stop offset="1" stopColor="#F9F7F6" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Soft seamless fade at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#F9F7F6] via-[#F9F7F6]/80 to-transparent pointer-events-none" />
    </div>
  );
}

export default DynamicHorizon;
