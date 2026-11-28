"use client";

import React from "react";
import { motion } from "framer-motion";
import { INTRO_TIMING } from "./introConfig";

interface IntroCurtainProps {
  isExiting: boolean;
  onFinished: () => void;
  children: React.ReactNode;
}

/**
 * Full-screen split curtain (z-[70] so Navbar never clips the intro odometer)
 */
export function IntroCurtain({ isExiting, onFinished, children }: IntroCurtainProps) {
  return (
    <div
      className="fixed inset-0 z-[70] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="National Highway 44 Expedition Introduction"
    >
      {/* Left Split Curtain Panel */}
      <motion.div
        initial={{ x: "0%" }}
        animate={isExiting ? { x: "-100%" } : { x: "0%" }}
        transition={{
          duration: INTRO_TIMING.curtainSlideDuration,
          ease: INTRO_TIMING.curtainEase,
        }}
        onAnimationComplete={() => {
          if (isExiting) onFinished();
        }}
        className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-br from-[#0B2027] via-[#102A33] to-[#173E4B] border-r border-[#F29F3D]/35 shadow-2xl z-10"
      />

      {/* Right Split Curtain Panel */}
      <motion.div
        initial={{ x: "0%" }}
        animate={isExiting ? { x: "100%" } : { x: "0%" }}
        transition={{
          duration: INTRO_TIMING.curtainSlideDuration,
          ease: INTRO_TIMING.curtainEase,
        }}
        className="absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-bl from-[#0B2027] via-[#102A33] to-[#173E4B] border-l border-[#F29F3D]/35 shadow-2xl z-10"
      />

      {/* Sunburst Horizon Glow & Content */}
      <motion.div
        animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.28 }}
        className="relative z-20 w-full h-full"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,159,61,0.22)_0%,rgba(217,83,56,0.08)_35%,rgba(11,32,39,0)_72%)]"
        />
        {children}
      </motion.div>
    </div>
  );
}
