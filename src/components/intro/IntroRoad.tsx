"use client";

import React from "react";
import { motion } from "framer-motion";
import { INTRO_TIMING } from "./introConfig";

interface IntroRoadProps {
  isMobile: boolean;
  reducedMotion: boolean;
}

export function IntroRoad({ isMobile, reducedMotion }: IntroRoadProps) {
  const roadWidth = isMobile ? 80 : 140;

  return (
    <div className="absolute inset-0 flex justify-center pointer-events-none overflow-hidden">
      {/* Expanding Road Ribbon Container */}
      <motion.div
        initial={reducedMotion ? { width: roadWidth, scaleY: 1 } : { width: 3, scaleY: 0 }}
        animate={{ width: roadWidth, scaleY: 1 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : {
                scaleY: { duration: INTRO_TIMING.lineGrowthDuration, ease: "easeOut" },
                width: {
                  delay: INTRO_TIMING.lineGrowthDuration,
                  duration: INTRO_TIMING.roadWidenDuration,
                  ease: "easeInOut",
                },
              }
        }
        style={{ originY: 0 }}
        className="relative h-full bg-text shadow-xl"
      >
        {/* Tricolor Accent Stripe on Left Curb */}
        <div className="absolute top-0 bottom-0 left-0 w-1.5 flex flex-col">
          <div className="w-0.5 h-full bg-accent-saffron" />
          <div className="w-0.5 h-full bg-surface" />
          <div className="w-0.5 h-full bg-accent-green" />
        </div>

        {/* Tricolor Accent Stripe on Right Curb */}
        <div className="absolute top-0 bottom-0 right-0 w-1.5 flex flex-col">
          <div className="w-0.5 h-full bg-accent-green" />
          <div className="w-0.5 h-full bg-surface" />
          <div className="w-0.5 h-full bg-accent-saffron" />
        </div>

        {/* Dashed White Center Line with Continuous Driving Motion */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 overflow-hidden">
          <motion.div
            initial={{ y: 0 }}
            animate={reducedMotion ? { y: 0 } : { y: [0, 48] }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    repeat: Infinity,
                    duration: 0.75,
                    ease: "linear",
                    delay: INTRO_TIMING.lineGrowthDuration + INTRO_TIMING.roadWidenDuration * 0.5,
                  }
            }
            className="w-full h-[200%] flex flex-col items-center"
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="w-1 h-6 bg-surface mb-6 shrink-0 rounded-xs" />
            ))}
          </motion.div>
        </div>

        {/* Small Fixed Traveler Car Icon near Lower Centre */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: reducedMotion ? 0 : INTRO_TIMING.lineGrowthDuration + 0.4,
            duration: 0.5,
            ease: "easeOut",
          }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
        >
          {/* Subtle Headlight Beams */}
          <div className="w-12 h-16 bg-gradient-to-t from-surface/20 to-transparent clip-path-polygon rounded-t-full opacity-60 pointer-events-none" />

          {/* Car Chassis (Saffron with Navy Windshield) */}
          <div className="relative w-8 h-14 bg-accent-saffron rounded-lg shadow-md border border-surface flex flex-col items-center justify-between p-1">
            {/* Front windshield */}
            <div className="w-6 h-2.5 bg-surface-dark rounded-xs" />
            {/* Roof */}
            <div className="w-5 h-4 bg-accent-saffron-dark rounded-xs opacity-90" />
            {/* Rear window */}
            <div className="w-6 h-1.5 bg-surface-dark rounded-xs" />

            {/* Wheels */}
            <div className="absolute -left-1 top-2 w-1 h-3 bg-surface-dark rounded-xs" />
            <div className="absolute -right-1 top-2 w-1 h-3 bg-surface-dark rounded-xs" />
            <div className="absolute -left-1 bottom-2 w-1 h-3 bg-surface-dark rounded-xs" />
            <div className="absolute -right-1 bottom-2 w-1 h-3 bg-surface-dark rounded-xs" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
