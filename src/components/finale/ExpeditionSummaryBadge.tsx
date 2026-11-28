"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { PassportProgressSummary } from "@/types/state";
import { Compass, ArrowUp, Map, RotateCcw, Lock, Award, Sparkles } from "lucide-react";

export interface ExpeditionSummaryBadgeProps {
  summary: PassportProgressSummary;
  onReset: () => void;
}

/**
 * ExpeditionSummaryBadge — Interactive Subcontinental Crossing Seal & Progress Meter
 */
export function ExpeditionSummaryBadge({
  summary,
  onReset,
}: ExpeditionSummaryBadgeProps) {
  const prefersReducedMotion = useSafeReducedMotion();
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToMap = () => {
    if (typeof window !== "undefined") {
      const el = document.getElementById("corridor-explorer");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="mt-14 rounded-3xl border-2 border-[#E3DAC9] bg-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
      {/* Top Accent Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FACC15] via-[#D95338] to-[#1C6E5A]" />

      {/* Progress & Milestone Overview Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E3DAC9]">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono uppercase tracking-widest text-[#D95338] font-extrabold">
            <Compass className="h-4 w-4 text-[#1C6E5A]" />
            <span>Digital Expedition Log</span>
          </div>
          <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-black text-[#102A33]">
            Corridor Exploration Progress
          </h3>
          <p className="mt-1 font-sans text-xs sm:text-sm text-[#445A62]">
            3,810 KM Listed Benchmark · 3,613.79 KM Checkpoint Projection Reference
          </p>
        </div>

        {/* Dynamic Progress Meter */}
        <div className="w-full md:w-72 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#445A62] font-bold">
              {summary.isHydrated
                ? `${summary.exploredCount} / ${summary.totalCount} Checkpoints`
                : "— / — Checkpoints"}
            </span>
            <span className="text-[#D95338] font-extrabold">
              {summary.isHydrated ? `${summary.percentComplete}%` : "—%"}
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={summary.isHydrated ? summary.exploredCount : 0}
            aria-valuemin={0}
            aria-valuemax={summary.totalCount}
            aria-label="NH44 digital expedition progress"
            className="h-3 w-full rounded-full bg-[#F6EFE0] overflow-hidden border border-[#E3DAC9]"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FACC15] via-[#F29F3D] to-[#1C6E5A] transition-all duration-500 ease-out motion-reduce:transition-none"
              style={{
                width: summary.isHydrated ? `${summary.percentComplete}%` : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Completion Seal Container */}
      <div className="my-8 text-center">
        {summary.isFullyExplored ? (
          <motion.div
            id="subcontinental-crossing-seal"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 20 }}
            className="mx-auto max-w-xl rounded-3xl border-[3px] border-[#1C6E5A] bg-gradient-to-b from-[#FEF3C7]/70 via-white to-[#E6F4F1]/70 p-6 sm:p-9 shadow-2xl relative overflow-hidden"
          >
            {!prefersReducedMotion && (
              <motion.div
                aria-hidden="true"
                animate={{ opacity: [0.35, 0.85, 0.35] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -inset-px rounded-3xl ring-4 ring-[#FACC15]/40"
              />
            )}
            <motion.div
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.07, 1], rotate: [0, -3, 3, 0] }}
              transition={prefersReducedMotion ? undefined : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102A33] text-[#FACC15] shadow-xl relative z-10 border-2 border-[#F29F3D]"
            >
              <Award className="h-9 w-9 stroke-[2.2]" />
            </motion.div>

            <div className="mt-5 space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#D95338]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>DIGITAL EXPEDITION PASSPORT</span>
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-black text-[#102A33]">
                {summary.totalCount} / {summary.totalCount}
              </div>
              <h4 className="font-serif text-xl sm:text-2xl font-black tracking-tight text-[#102A33]">
                SUBCONTINENTAL CROSSING
              </h4>
              <p className="font-sans text-sm font-semibold text-[#102A33]">
                All {summary.totalCount} NH44 digital checkpoints explored.
              </p>
              <div className="font-sans text-xs font-bold text-[#1C6E5A]">
                5 Journey Zones
              </div>
              <div className="font-mono text-[11px] text-[#445A62] pt-2 border-t border-[#E3DAC9]">
                3,810 KM Listed Benchmark · 3,613.79 KM Checkpoint Projection Reference
              </div>
              <p className="font-sans text-[11px] text-[#5D7279] italic pt-1">
                Digital exploration milestone — not proof of physical travel.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="mx-auto max-w-lg rounded-2xl border-2 border-dashed border-[#D8CEBC] bg-[#FBF7EE] p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F29F3D]/50 bg-[#FEF3C7] text-[#D95338] shadow-sm">
              <Lock className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-serif text-lg font-extrabold text-[#102A33]">
              Subcontinental Crossing Seal Locked
            </h4>
            <p className="mt-2 font-sans text-xs sm:text-sm text-[#445A62] leading-relaxed">
              Click any stamp above (or hit &ldquo;Stamp This Stop&rdquo; in any chapter) to collect all {summary.totalCount} checkpoints and unlock your completion seal!
            </p>
            <p className="mt-2 font-mono text-xs font-extrabold text-[#D95338]">
              {summary.isHydrated
                ? `${summary.totalCount - summary.exploredCount} checkpoint${
                    summary.totalCount - summary.exploredCount === 1 ? "" : "s"
                  } remaining`
                : "Checking local progress..."}
            </p>
          </div>
        )}
      </div>

      {/* Interactive Action Controls */}
      <div className="pt-6 border-t border-[#E3DAC9] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 rounded-full bg-[#102A33] px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[#FACC15] shadow-md hover:bg-[#1C6E5A] transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102A33]"
          >
            <ArrowUp className="h-4 w-4" />
            <span>Return to Northern Terminus</span>
          </button>

          <button
            type="button"
            onClick={scrollToMap}
            className="inline-flex items-center gap-2 rounded-full border border-[#D8CEBC] bg-[#FBF7EE] px-5 py-2.5 font-sans text-xs font-bold text-[#102A33] hover:bg-white hover:border-[#F29F3D] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102A33]"
          >
            <Map className="h-4 w-4 text-[#D95338]" />
            <span>Explore Highway Map</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          title="Clear stored passport exploration progress"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5D7279] hover:text-[#D95338] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102A33] px-2.5 py-1.5 rounded-lg"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Progress</span>
        </button>
      </div>
    </div>
  );
}
