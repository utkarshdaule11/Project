"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface DynamicHorizonProps {
  className?: string;
}

export function DynamicHorizon({ className = "" }: DynamicHorizonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position between -1 and 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [shouldReduceMotion]);

  // Motion offset multipliers for depth layers (disabled if reduced motion)
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
      {/* LAYER 1: Deep Celestial Atmosphere & Warm Horizon Dawn Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050C14] via-[#091522] to-[#142436]" />
      
      {/* Atmospheric Dawn Glow / Horizon Haze behind mountains */}
      <div 
        className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-[160%] sm:w-[120%] h-[320px] rounded-full blur-3xl opacity-40 bg-gradient-to-t from-saffron-500/40 via-amber-500/20 to-transparent pointer-events-none" 
      />

      {/* Stars / Dust Constellation micro-dots in upper troposphere */}
      <div 
        className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_25%,rgba(242,235,221,0.6)_1px,transparent_1px),radial-gradient(circle_at_75%_35%,rgba(242,235,221,0.5)_1px,transparent_1px),radial-gradient(circle_at_45%_15%,rgba(242,235,221,0.7)_1px,transparent_1px)] bg-[length:240px_240px]" 
      />

      {/* LAYER 2: Distant High Montane Ridge (Himalayas / Pir Panjal Silhouette) */}
      <motion.div
        animate={calcOffset(0.25)}
        transition={{ type: "spring", stiffness: 45, damping: 25, mass: 0.5 }}
        className="absolute inset-x-0 bottom-[32%] h-[280px] w-full"
      >
        <svg
          viewBox="0 0 1440 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full opacity-60 filter drop-shadow-sm"
        >
          {/* Jagged distant alpine serrations */}
          <path
            d="M0 280 L0 185 L95 145 L180 170 L285 105 L370 140 L490 85 L580 135 L685 95 L780 150 L890 90 L1010 130 L1130 75 L1240 120 L1350 95 L1440 140 L1440 280 Z"
            fill="url(#distant-alpine-grad)"
          />
          <defs>
            <linearGradient id="distant-alpine-grad" x1="720" y1="75" x2="720" y2="280" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1B2E42" stopOpacity="0.85" />
              <stop offset="0.6" stopColor="#12202E" stopOpacity="0.95" />
              <stop offset="1" stopColor="#0B1520" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* LAYER 3: Submontane Piedmont & Vindhyan Mid-Range Escarpments */}
      <motion.div
        animate={calcOffset(0.5)}
        transition={{ type: "spring", stiffness: 50, damping: 22, mass: 0.6 }}
        className="absolute inset-x-0 bottom-[24%] h-[240px] w-full"
      >
        <svg
          viewBox="0 0 1440 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full opacity-75"
        >
          {/* Stepped plateau and foothill silhouettes */}
          <path
            d="M0 240 L0 155 Q120 130 240 145 T480 125 T720 140 T960 115 T1200 135 T1440 125 L1440 240 Z"
            fill="url(#midrange-grad)"
          />
          <defs>
            <linearGradient id="midrange-grad" x1="720" y1="115" x2="720" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E3347" />
              <stop offset="0.7" stopColor="#111E2B" />
              <stop offset="1" stopColor="#0A121A" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* LAYER 4: Peninsular Deccan Tors & Piedmont Rolling Foreland */}
      <motion.div
        animate={calcOffset(0.8)}
        transition={{ type: "spring", stiffness: 55, damping: 20, mass: 0.7 }}
        className="absolute inset-x-0 bottom-[15%] h-[200px] w-full"
      >
        <svg
          viewBox="0 0 1440 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full opacity-90"
        >
          {/* Granite tors and rolling peninsular terrain */}
          <path
            d="M0 200 L0 110 C180 95 320 135 520 105 C700 80 840 125 1060 95 C1220 75 1350 110 1440 95 L1440 200 Z"
            fill="url(#tors-grad)"
          />
          <defs>
            <linearGradient id="tors-grad" x1="720" y1="80" x2="720" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#162636" />
              <stop offset="1" stopColor="#080E14" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* LAYER 5: The Vanishing Highway Vector (Perspective Corridor to Infinity) */}
      <div className="absolute inset-x-0 bottom-0 h-[38%] w-full flex justify-center items-end pointer-events-none">
        <svg
          viewBox="0 0 1000 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full max-w-5xl h-full"
        >
          {/* Corridor Asphalt Perspective Trapezoid */}
          <path
            d="M488 65 L512 65 L760 400 L240 400 Z"
            fill="url(#highway-asphalt-grad)"
          />
          
          {/* Left Paved Shoulder / Kerb Line */}
          <line
            x1="488"
            y1="65"
            x2="240"
            y2="400"
            stroke="#4A6572"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />

          {/* Right Paved Shoulder / Kerb Line */}
          <line
            x1="512"
            y1="65"
            x2="760"
            y2="400"
            stroke="#4A6572"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />

          {/* Saffron Luminous Highway Centerline (Vanishing Dashed Vector) */}
          <path
            d="M500 65 L500 400"
            stroke="#E9A15C"
            strokeWidth="3.5"
            strokeDasharray="16 22"
            strokeLinecap="round"
            className="opacity-85"
            filter="url(#saffron-glow)"
          />

          {/* Highway Horizon Convergence Spot / Radiance Point */}
          <circle cx="500" cy="65" r="4" fill="#F4BA7A" />
          <circle cx="500" cy="65" r="14" fill="#E9A15C" fillOpacity="0.3" filter="url(#saffron-glow)" />

          <defs>
            <linearGradient id="highway-asphalt-grad" x1="500" y1="65" x2="500" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="#101C27" stopOpacity="0.9" />
              <stop offset="0.5" stopColor="#0B131C" stopOpacity="0.95" />
              <stop offset="1" stopColor="#05090E" stopOpacity="1" />
            </linearGradient>

            <filter id="saffron-glow" x="480" y="50" width="40" height="360" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Atmospheric Baseline Vignette (Seamless fade into page content) */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-earth-950 via-earth-950/70 to-transparent pointer-events-none" />
    </div>
  );
}

export default DynamicHorizon;
