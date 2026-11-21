"use client";

import React, { useState, useEffect } from "react";
import { INTRO_TIMING, INTRO_COPY } from "./introConfig";

interface IntroCounterProps {
  reducedMotion: boolean;
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
        // Eased count: cubic ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(eased * target);
        setKm(currentVal);

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
      className="absolute top-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none text-center"
    >
      {/* Distance in Tabular Numbers */}
      <div className="flex items-baseline gap-1.5 font-mono text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight text-text">
        <span>{km.toLocaleString()}</span>
        <span className="font-sans text-sm sm:text-base font-bold text-primary-dark uppercase">
          KM
        </span>
      </div>

      {/* Label Badge */}
      <div className="mt-1 rounded-full border border-border bg-surface/90 px-3.5 py-1 shadow-xs backdrop-blur-xs">
        <span className="font-sans text-xs font-semibold tracking-wide text-text-muted">
          {INTRO_COPY.subtitle}
        </span>
      </div>
    </div>
  );
}
