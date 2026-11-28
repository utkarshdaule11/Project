"use client";

import React from "react";
import { motion } from "framer-motion";
import { INTRO_TIMING, NH44_INTRO_MILESTONES } from "./introConfig";

interface IntroRoadProps {
  isMobile: boolean;
  reducedMotion: boolean;
}

/**
 * Topographic Contour Vector Loader & Flanking Milestone Shields
 */
export function IntroRoad({ isMobile, reducedMotion }: IntroRoadProps) {
  const roadWidth = isMobile ? 54 : 88;

  return (
    <div className="absolute inset-0 flex justify-center pointer-events-none overflow-hidden">
      {/* Topographic Contours & Sweeping Golden Highway Path */}
      <svg
        className="absolute inset-0 w-full h-full opacity-55"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          d="M-80 150 Q 340 60, 720 180 T 1520 120"
          stroke="#F29F3D"
          strokeOpacity="0.25"
          strokeWidth="1.4"
          strokeDasharray="6 6"
        />
        <path
          d="M-80 330 Q 410 430, 720 300 T 1520 380"
          stroke="#FBF7EE"
          strokeOpacity="0.16"
          strokeWidth="1.2"
        />
        <path
          d="M-80 540 Q 380 440, 720 560 T 1520 500"
          stroke="#FACC15"
          strokeOpacity="0.22"
          strokeWidth="1.3"
          strokeDasharray="4 8"
        />
        <path
          d="M-80 740 Q 420 820, 720 710 T 1520 770"
          stroke="#FBF7EE"
          strokeOpacity="0.15"
          strokeWidth="1.2"
        />

        {/* Animated Sweeping Route Vector */}
        <motion.path
          d="M720 55 C 630 185, 810 300, 725 445 C 655 565, 785 690, 720 855"
          stroke="#F29F3D"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: reducedMotion ? 1 : 0, opacity: 0.4 }}
          animate={{ pathLength: 1, opacity: 0.9 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: INTRO_TIMING.counterDuration, ease: "easeInOut" }
          }
        />
      </svg>

      {/* Center Asphalt Highway Spine */}
      <motion.div
        initial={reducedMotion ? { width: roadWidth, scaleY: 1, opacity: 0.35 } : { width: 4, scaleY: 0, opacity: 0.4 }}
        animate={{ width: roadWidth, scaleY: 1, opacity: 0.38 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : {
                scaleY: { duration: INTRO_TIMING.lineGrowthDuration, ease: "easeOut" },
                width: {
                  delay: INTRO_TIMING.lineGrowthDuration * 0.65,
                  duration: INTRO_TIMING.roadWidenDuration,
                  ease: "easeInOut",
                },
              }
        }
        style={{ originY: 0 }}
        className="relative h-full bg-[#091920] border-x-2 border-[#F29F3D]/45"
      >
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#F29F3D]/80" />
        <div className="absolute top-0 bottom-0 right-0 w-1.5 bg-[#F29F3D]/80" />

        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 overflow-hidden">
          <motion.div
            initial={{ y: 0 }}
            animate={reducedMotion ? { y: 0 } : { y: [0, 48] }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    repeat: Infinity,
                    duration: 0.55,
                    ease: "linear",
                  }
            }
            className="w-full h-[200%] flex flex-col items-center"
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="w-1.5 h-6 bg-[#FACC15]/85 mb-6 shrink-0 rounded-sm" />
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Wide-Clearance Milestone Beacons (Outside the centered card on xl screens) */}
      {!isMobile && (
        <div className="hidden xl:flex absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1180px] flex-col justify-between py-16 pointer-events-none">
          {NH44_INTRO_MILESTONES.map((m, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <motion.div
                key={m.label}
                initial={reducedMotion ? { opacity: 0.95, x: 0 } : { opacity: 0, x: isLeft ? -22 : 22 }}
                animate={{ opacity: 0.95, x: 0 }}
                transition={{
                  delay: reducedMotion ? 0 : 0.25 + idx * 0.25,
                  duration: 0.45,
                  ease: "easeOut",
                }}
                className={`flex items-center gap-3 ${
                  isLeft ? "self-start text-left" : "self-end text-right flex-row-reverse"
                }`}
              >
                <div className="rounded-2xl border-2 border-[#F29F3D]/55 bg-[#FBF7EE]/95 px-4 py-2.5 shadow-xl backdrop-blur-sm min-w-[170px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-block rounded bg-[#FACC15] px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-[#102A33]">
                      {m.km}
                    </span>
                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#D95338]">
                      {m.tag}
                    </span>
                  </div>
                  <span className="mt-1 block font-serif text-base font-bold text-[#102A33]">
                    {m.label}
                  </span>
                  <span className="block text-xs font-medium text-[#445A62]">{m.region}</span>
                </div>
                <div className="h-3.5 w-3.5 rounded-full bg-[#FACC15] ring-4 ring-[#102A33] shadow-md shrink-0" />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
