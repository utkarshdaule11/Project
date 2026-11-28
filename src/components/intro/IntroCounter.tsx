"use client";

import React, { useState, useEffect } from "react";
import { INTRO_TIMING, INTRO_COPY } from "./introConfig";

interface IntroCounterProps {
  reducedMotion: boolean;
}

function getLiveRegionTag(km: number): string {
  if (km < 400) return "Kashmir Snowlines";
  if (km < 900) return "Punjab & Capital";
  if (km < 1700) return "Zero Mile Heart";
  if (km < 2800) return "Deccan Tablelands";
  return "Three Oceans Finale";
}

export function IntroCounter({ reducedMotion }: IntroCounterProps) {
  const [km, setKm] = useState<number>(reducedMotion ? INTRO_COPY.targetKm : 0);
  const [visible, setVisible] = useState<boolean>(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setKm(INTRO_COPY.targetKm);
      setVisible(true);
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
      const start = performance.now();
      const durationMs = INTRO_TIMING.counterDuration * 1000;
      const target = INTRO_COPY.targetKm;

      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setKm(Math.round(eased * target));

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    }, INTRO_TIMING.counterStart * 1000);

    return () => clearTimeout(timer);
  }, [reducedMotion]);

  if (!visible) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="flex flex-col items-center pointer-events-none text-center"
    >
      <div className="inline-flex items-center gap-3 rounded-full border-2 border-[#F29F3D] bg-[#FBF7EE] px-4 sm:px-5 py-2 shadow-2xl">
        {/* Authentic Indian Highway Shield Pill */}
        <span className="inline-flex items-center gap-1 rounded-full bg-[#1C6E5A] border border-[#FACC15]/70 px-3 py-1 font-mono text-xs font-extrabold tracking-widest text-[#FACC15]">
          NH 44
        </span>
        <div className="flex items-baseline gap-1 font-mono text-xl sm:text-2xl font-extrabold tabular-nums text-[#102A33]">
          <span>{km.toLocaleString()}</span>
          <span className="text-xs sm:text-sm font-bold text-[#D95338] uppercase">
            KM
          </span>
        </div>
        <span className="hidden sm:inline font-sans text-xs font-bold uppercase tracking-wider text-[#1C6E5A] border-l border-[#D8CEBC] pl-3">
          {getLiveRegionTag(km)}
        </span>
      </div>
    </div>
  );
}
