"use client";

import React from "react";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

/**
 * Phase 1C Step 5: OceanHorizonAtmosphere (Himalayan Dawn & Deep Teal Coastal Convergence)
 */
export function OceanHorizonAtmosphere() {
  const shouldReduceMotion = useSafeReducedMotion();

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Alabaster-to-Parchment Coastal Dawn Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F9F7F6] via-[#F7F3EA] to-[#EAE3D5]" />

      {/* SVG Tri-Ocean Horizon & Confluence Vectors */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-[360px] sm:h-[460px] md:h-[540px] opacity-60"
        viewBox="0 0 1440 540"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="horizon-glow" cx="50%" cy="68%" r="60%" fx="50%" fy="68%">
            <stop offset="0%" stopColor="#D6A15D" stopOpacity="0.28" />
            <stop offset="45%" stopColor="#12313A" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#F9F7F6" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="arabian-sea-grad" x1="0%" y1="50%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#12313A" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#E3DAC9" stopOpacity="0.45" />
          </linearGradient>

          <linearGradient id="bengal-sea-grad" x1="100%" y1="50%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#1B4B52" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#E3DAC9" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="indian-ocean-grad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#D6A15D" stopOpacity="0.2" />
            <stop offset="30%" stopColor="#12313A" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#F7F3EA" stopOpacity="0.88" />
          </linearGradient>

          <linearGradient id="cape-granite-grad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#D8CEBC" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F7F3EA" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        <rect width="1440" height="540" fill="url(#horizon-glow)" />

        <path
          d="M0 320 C 280 300, 520 370, 720 350 C 920 330, 1180 380, 1440 340 L 1440 540 L 0 540 Z"
          fill="url(#arabian-sea-grad)"
          className={shouldReduceMotion ? "" : "transition-transform duration-1000 ease-out"}
        />

        <path
          d="M0 370 C 340 400, 620 340, 720 360 C 820 380, 1120 320, 1440 375 L 1440 540 L 0 540 Z"
          fill="url(#bengal-sea-grad)"
          opacity="0.75"
        />

        <path
          d="M0 420 C 360 395, 600 435, 720 425 C 840 415, 1080 445, 1440 415 L 1440 540 L 0 540 Z"
          fill="url(#indian-ocean-grad)"
        />

        <path
          d="M680 540 L 710 440 C 718 435, 722 435, 730 440 L 760 540 Z"
          fill="url(#cape-granite-grad)"
          stroke="#12313A"
          strokeWidth="0.75"
          strokeOpacity="0.25"
        />

        <line
          x1="0"
          y1="340"
          x2="1440"
          y2="340"
          stroke="#D6A15D"
          strokeWidth="1"
          strokeDasharray="6 10"
          strokeOpacity="0.55"
        />
      </svg>
    </div>
  );
}
