"use client";

import React from "react";
import { motion } from "framer-motion";
import { INTRO_TIMING } from "./introConfig";

interface IntroCurtainProps {
  isExiting: boolean;
  onFinished: () => void;
  children: React.ReactNode;
}

export function IntroCurtain({ isExiting, onFinished, children }: IntroCurtainProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Left Curtain Panel */}
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
        className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-b from-background to-primary-light shadow-2xl z-10"
      />

      {/* Right Curtain Panel */}
      <motion.div
        initial={{ x: "0%" }}
        animate={isExiting ? { x: "100%" } : { x: "0%" }}
        transition={{
          duration: INTRO_TIMING.curtainSlideDuration,
          ease: INTRO_TIMING.curtainEase,
        }}
        className="absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-b from-background to-primary-light shadow-2xl z-10"
      />

      {/* Content Layer (Fades out when curtain splits) */}
      <motion.div
        animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-20 w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
