"use client";

import React from "react";
import { motion } from "framer-motion";
import { NH44_INTRO_MILESTONES, INTRO_TIMING, type RouteMilestoneBadge } from "./introConfig";

interface IntroLandmarksProps {
  isMobile: boolean;
  reducedMotion: boolean;
}

/**
 * Legacy landmark stream kept in sync with NH44_INTRO_MILESTONES for optional parallax overlays.
 */
export function IntroLandmarks({ isMobile, reducedMotion }: IntroLandmarksProps) {
  const leftMilestones = NH44_INTRO_MILESTONES.filter((_, i) => i % 2 === 0);
  const rightMilestones = NH44_INTRO_MILESTONES.filter((_, i) => i % 2 === 1);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      <motion.div
        initial={reducedMotion ? { opacity: 0.6, y: 0 } : { opacity: 0, y: -120 }}
        animate={
          reducedMotion
            ? { opacity: 0.6, y: 0 }
            : {
                opacity: [0, 0.7, 0.7, 0],
                y: ["-10%", "110%"],
              }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : {
                delay: INTRO_TIMING.landmarksStart,
                duration: INTRO_TIMING.landmarksDuration,
                ease: "linear",
              }
        }
        className="absolute left-4 sm:left-12 lg:left-24 top-0 flex flex-col gap-20 w-36 sm:w-44"
      >
        {leftMilestones.map((item: RouteMilestoneBadge) => (
          <div
            key={item.label}
            className="rounded-xl border border-[#D8CEBC]/70 bg-white/85 px-3 py-2 shadow-sm"
          >
            <div className="font-mono text-[10px] font-bold text-[#12313A]">{item.km}</div>
            <div className="font-serif text-xs font-bold text-[#12313A]">{item.label}</div>
            <div className="text-[10px] text-[#5D7279]">{item.region}</div>
          </div>
        ))}
      </motion.div>

      {!isMobile && (
        <motion.div
          initial={reducedMotion ? { opacity: 0.6, y: 0 } : { opacity: 0, y: -100 }}
          animate={
            reducedMotion
              ? { opacity: 0.6, y: 0 }
              : {
                  opacity: [0, 0.7, 0.7, 0],
                  y: ["-5%", "115%"],
                }
          }
          transition={
            reducedMotion
              ? { duration: 0 }
              : {
                  delay: INTRO_TIMING.landmarksStart + 0.3,
                  duration: INTRO_TIMING.landmarksDuration * 1.15,
                  ease: "linear",
                }
          }
          className="absolute right-4 sm:right-12 lg:right-24 top-0 flex flex-col gap-20 w-36 sm:w-44"
        >
          {rightMilestones.map((item: RouteMilestoneBadge) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#D8CEBC]/70 bg-white/85 px-3 py-2 shadow-sm"
            >
              <div className="font-mono text-[10px] font-bold text-[#1B4B52]">{item.km}</div>
              <div className="font-serif text-xs font-bold text-[#12313A]">{item.label}</div>
              <div className="text-[10px] text-[#5D7279]">{item.region}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
