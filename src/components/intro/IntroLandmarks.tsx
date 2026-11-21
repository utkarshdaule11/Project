"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { LEFT_LANDMARKS, RIGHT_LANDMARKS, INTRO_TIMING } from "./introConfig";

interface IntroLandmarksProps {
  isMobile: boolean;
  reducedMotion: boolean;
}

export function IntroLandmarks({ isMobile, reducedMotion }: IntroLandmarksProps) {
  // Mobile: show left column only; Desktop: show both left and right columns
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* Left Column Landmarks (Speed A) */}
      <motion.div
        initial={reducedMotion ? { opacity: 0.6, y: 0 } : { opacity: 0, y: -200 }}
        animate={
          reducedMotion
            ? { opacity: 0.6, y: 0 }
            : {
                opacity: [0, 0.6, 0.6, 0],
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
        className="absolute left-4 sm:left-12 lg:left-24 top-0 flex flex-col gap-24 sm:gap-32 w-28 sm:w-44 text-text/60"
      >
        {LEFT_LANDMARKS.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={item.src}
                alt=""
                aria-hidden="true"
                fill
                className="object-contain filter contrast-125"
              />
            </div>
            <span className="mt-1 font-sans text-[10px] font-bold uppercase tracking-wider text-text-muted/70">
              {item.name}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Right Column Landmarks (Speed B - Desktop only) */}
      {!isMobile && (
        <motion.div
          initial={reducedMotion ? { opacity: 0.6, y: 0 } : { opacity: 0, y: -120 }}
          animate={
            reducedMotion
              ? { opacity: 0.6, y: 0 }
              : {
                  opacity: [0, 0.6, 0.6, 0],
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
          className="absolute right-4 sm:right-12 lg:right-24 top-0 flex flex-col gap-24 sm:gap-32 w-28 sm:w-44 text-text/60"
        >
          {RIGHT_LANDMARKS.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={item.src}
                  alt=""
                  aria-hidden="true"
                  fill
                  className="object-contain filter contrast-125"
                />
              </div>
              <span className="mt-1 font-sans text-[10px] font-bold uppercase tracking-wider text-text-muted/70">
                {item.name}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
