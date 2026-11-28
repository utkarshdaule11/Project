"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { StateChapter } from "@/types/state";
import { Check, Compass, Camera } from "lucide-react";

export interface PassportCheckpointStampProps {
  checkpoint: StateChapter;
  isActive: boolean;
  isExplored: boolean;
  onExploreAndNavigate: () => void;
}

const VERIFIED_PILOT_STOPS = new Set<string>(["srinagar", "delhi", "kanyakumari"]);

/**
 * PassportCheckpointStamp — Tactile Vintage Postage/Ink Stamp Slot
 */
export function PassportCheckpointStamp({
  checkpoint,
  isActive,
  isExplored,
  onExploreAndNavigate,
}: PassportCheckpointStampProps) {
  const prefersReducedMotion = useSafeReducedMotion();
  const hasLocalPilotAsset = VERIFIED_PILOT_STOPS.has(checkpoint.id);
  const formattedOrder =
    checkpoint.order < 10 ? `0${checkpoint.order}` : `${checkpoint.order}`;
  const shortElev = checkpoint.elevation.replace(/\s*\(.*?\)\s*/g, "").trim();

  return (
    <motion.button
      type="button"
      onClick={onExploreAndNavigate}
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 22 }}
      aria-label={`Stop ${formattedOrder}: ${checkpoint.stop}, ${checkpoint.name} — Explored: ${
        isExplored ? "Yes" : "No"
      }, Active: ${isActive ? "Yes" : "No"}`}
      className={`group relative flex flex-col justify-between w-full min-h-[148px] rounded-2xl p-3.5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102A33] focus-visible:ring-offset-2 focus-visible:ring-offset-white select-none overflow-hidden ${
        isActive
          ? "ring-2 ring-[#F29F3D] ring-offset-2 ring-offset-white shadow-lg"
          : ""
      } ${
        isExplored
          ? "bg-gradient-to-br from-[#FEF3C7]/45 via-white to-[#E6F4F1]/45 border-2 border-[#1C6E5A] shadow-md"
          : "bg-[#FBF7EE] border border-dashed border-[#D8CEBC] hover:border-solid hover:border-[#F29F3D] hover:bg-white"
      }`}
    >
      {/* Top Header Row: Order & Exploration Seal Status */}
      <div className="flex items-center justify-between w-full gap-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded-md ${
              isExplored
                ? "bg-[#1C6E5A] text-[#FACC15]"
                : "bg-white text-[#445A62] border border-[#E3DAC9]"
            }`}
          >
            {formattedOrder}
          </span>
          {hasLocalPilotAsset && (
            <span
              title="Verified Local Pilot Photography"
              className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#9A4B14] bg-[#FEF3C7] border border-[#F29F3D]/40 px-1.5 py-0.5 rounded"
            >
              <Camera className="h-2.5 w-2.5" />
              <span className="hidden sm:inline">Pilot</span>
            </span>
          )}
        </div>

        {/* Visual Ink Stamp Status */}
        <div className="flex items-center">
          {isExplored ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1C6E5A] text-[#FACC15] shadow-sm ring-2 ring-[#1C6E5A]/20">
              <Check className="h-4 w-4 stroke-[2.75]" />
            </div>
          ) : isActive ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#F29F3D] bg-[#FEF3C7] text-[#D95338]">
              <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "10s" }} />
            </div>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-[#D8CEBC]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D8CEBC]" />
            </div>
          )}
        </div>
      </div>

      {/* Decorative Circular Rubber Stamp Watermark when Explored */}
      {isExplored && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-2 bottom-7 flex h-14 w-14 -rotate-12 items-center justify-center rounded-full border-2 border-dashed border-[#D95338]/35 text-[#D95338]/40 font-mono text-[8px] font-black uppercase tracking-widest text-center leading-tight"
        >
          NH44<br />STAMPED
        </div>
      )}

      {/* Middle Body: City Stop Name & State Jurisdiction */}
      <div className="my-2 min-w-0 relative z-10">
        <h4 className="font-serif text-base sm:text-lg font-extrabold truncate text-[#102A33] group-hover:text-[#D95338] transition-colors">
          {checkpoint.stop}
        </h4>
        <p className="font-sans text-xs text-[#5D7279] truncate">
          {checkpoint.name}
        </p>
      </div>

      {/* Bottom Footer Row: Elevation & Distance Milestone */}
      <div className="pt-2 border-t border-[#E3DAC9] flex items-center justify-between text-xs font-mono text-[#5D7279] relative z-10">
        <span className="truncate max-w-[110px]" title={checkpoint.elevation}>
          ~{shortElev}
        </span>
        <span className="text-[#D95338] font-extrabold tabular-nums">
          {checkpoint.distanceFromStartKm} KM
        </span>
      </div>

      {/* Active Selection Indicator Beacon */}
      {isActive && (
        <div className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
          <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-[#D95338] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D95338]" />
        </div>
      )}
    </motion.button>
  );
}
