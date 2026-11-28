"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import {
  CheckpointId,
  NavigationOrigin,
  PassportProgressSummary,
} from "@/types/state";
import { Container } from "@/components/ui/Container";
import { Chip } from "@/components/ui/Chip";
import { OceanHorizonAtmosphere } from "./OceanHorizonAtmosphere";
import { JourneyPassport } from "./JourneyPassport";
import { MapPin, Camera } from "lucide-react";

export interface KanyakumariFinaleProps {
  activeStopId: CheckpointId;
  onSelectStop: (id: CheckpointId, origin?: NavigationOrigin) => void;
  exploredIds: CheckpointId[];
  summary: PassportProgressSummary;
  isHydrated: boolean;
  markCheckpointExplored: (id: CheckpointId) => void;
  resetProgress: () => void;
  isExplored: (id: CheckpointId) => boolean;
}

/**
 * Phase 1C Step 5: KanyakumariFinale (Sunlit Sandstone & Terracotta)
 */
export function KanyakumariFinale({
  activeStopId,
  onSelectStop,
  exploredIds,
  summary,
  isHydrated,
  markCheckpointExplored,
  resetProgress,
  isExplored,
}: KanyakumariFinaleProps) {
  const prefersReducedMotion = useSafeReducedMotion();
  return (
    <section
      id="finale"
      className="relative py-24 sm:py-32 bg-[#F9F7F6] border-t border-[#E3DAC9] text-[#12313A] overflow-hidden"
      aria-labelledby="finale-heading"
    >
      {/* Sunlit Coastal Tri-Ocean Backdrop */}
      <OceanHorizonAtmosphere />

      <Container size="wide" className="relative z-10">
        {/* Destination Climax Widescreen Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Authentic Pilot Photographic Display */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col"
          >
            <div className="relative rounded-3xl overflow-hidden border border-[#E3DAC9] bg-white shadow-xl group">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F7F3EA]">
                <Image
                  src="/images/nh44/14-kanyakumari-rock-memorial.webp"
                  alt="Vivekananda Rock Memorial and Thiruvalluvar Statue at Kanyakumari tri-ocean confluence"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  priority={false}
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12313A]/55 via-transparent to-transparent" />
              </div>

              <div className="p-5 sm:p-6 bg-white">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Chip label="Verified Local Pilot Asset" variant="saffron">
                    <Camera className="h-3 w-3 mr-1" />
                  </Chip>
                  <Chip label="3,810 KM Listed Benchmark" variant="primary" />
                  <Chip label="Southern Terminus" variant="green" />
                </div>

                <h4 className="font-serif text-lg sm:text-xl font-bold text-[#12313A]">
                  Vivekananda Rock Memorial &amp; Thiruvalluvar Statue
                </h4>
                <p className="mt-1 font-sans text-xs text-[#445A62] leading-relaxed">
                  Cape Comorin, Tamil Nadu · Where the Arabian Sea, the Bay of Bengal, and the Indian Ocean converge.
                </p>

                <div className="mt-3 pt-3 border-t border-[#E3DAC9] flex items-center justify-between text-[10px] font-mono text-[#5D7279]">
                  <span>Photograph: Shivani</span>
                  <a
                    href="https://creativecommons.org/licenses/by-sa/4.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#12313A] transition-colors underline underline-offset-2"
                  >
                    CC BY-SA 4.0 via Wikimedia Commons
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Concluding Narrative & Journey Recap */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#8C6226] mb-3">
              <MapPin className="h-4 w-4 text-[#12313A]" />
              <span>Southern Terminus · Cape Comorin · 08°04′ N, 77°32′ E</span>
            </div>

            <h2
              id="finale-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#12313A] leading-tight"
            >
              Where Three Oceans Converge
            </h2>

            <blockquote className="mt-6 font-serif italic text-base sm:text-lg text-[#12313A] leading-relaxed border-l-2 border-[#12313A] pl-4 sm:pl-5">
              &ldquo;Here, at the tapering granite wedge of the Indian peninsula, the road ends where
              three great bodies of water meet. From the snow-capped Pir Panjal to Cape Comorin,
              National Highway 44 binds a subcontinent together — 3,810 kilometres of changing earth,
              living cultures, and continuous human movement.&rdquo;
            </blockquote>

            <p className="mt-4 font-sans text-sm sm:text-base text-[#445A62] leading-relaxed">
              Having traversed twelve states and union territories across five continuous physiographic zones,
              the traveler reaches the southernmost tip of the Indian mainland. Behind lies the vast
              expanse of the subcontinent; ahead lies the open southern ocean.
            </p>

            {/* Continental Milestone Grid */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#E3DAC9]">
              <div className="p-3 rounded-xl bg-white border border-[#E3DAC9] shadow-sm">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#12313A]">
                  3,810
                </span>
                <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#5D7279] mt-0.5">
                  Listed KM (MoRTH)
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E3DAC9] shadow-sm">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#12313A]">
                  3,613.79
                </span>
                <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#5D7279] mt-0.5">
                  Projection KM
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E3DAC9] shadow-sm">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#12313A]">
                  14
                </span>
                <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#5D7279] mt-0.5">
                  Checkpoints
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E3DAC9] shadow-sm">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#1B4B52]">
                  5
                </span>
                <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#5D7279] mt-0.5">
                  Physiographic Zones
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section 2: Interactive 5-Zone Journey Passport */}
        <JourneyPassport
          activeStopId={activeStopId}
          onSelectStop={onSelectStop}
          exploredIds={exploredIds}
          summary={summary}
          isHydrated={isHydrated}
          markCheckpointExplored={markCheckpointExplored}
          resetProgress={resetProgress}
          isExplored={isExplored}
        />
      </Container>
    </section>
  );
}
