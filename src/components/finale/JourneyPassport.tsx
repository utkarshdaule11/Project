"use client";

import React, { useMemo } from "react";
import { states } from "@content/states";
import {
  CheckpointId,
  BiomeId,
  NavigationOrigin,
  PassportProgressSummary,
  StateChapter,
} from "@/types/state";
import { PassportCheckpointStamp } from "./PassportCheckpointStamp";
import { ExpeditionSummaryBadge } from "./ExpeditionSummaryBadge";
import { Layers } from "lucide-react";

export interface JourneyPassportProps {
  activeStopId: CheckpointId;
  onSelectStop: (id: CheckpointId, origin?: NavigationOrigin) => void;
  exploredIds: CheckpointId[];
  summary: PassportProgressSummary;
  isHydrated: boolean;
  markCheckpointExplored: (id: CheckpointId) => void;
  resetProgress: () => void;
  isExplored: (id: CheckpointId) => boolean;
}

interface ZoneGrouping {
  id: BiomeId;
  code: string;
  name: string;
  span: string;
  checkpoints: StateChapter[];
}

const ZONE_CONFIG: Record<BiomeId, { code: string; name: string; span: string }> = {
  "himalayan-alpine": {
    code: "01",
    name: "Northern Mountain Descent & Submontane Gateway",
    span: "Stops 01–02 · Alpine to Gateway",
  },
  "indo-gangetic": {
    code: "02",
    name: "Indo-Gangetic Alluvial Plains & Capital",
    span: "Stops 03–05 · Alluvial Plains & NCT",
  },
  "central-india": {
    code: "03",
    name: "Central Ravines, Bundelkhand & Zero Mile",
    span: "Stops 06–08 · Vindhyan Craton & Zero Mile",
  },
  "deccan-tablelands": {
    code: "04",
    name: "Granite Deccan Tablelands & Ghat Passes",
    span: "Stops 09–11 · Peninsular Tablelands",
  },
  "southern-basins": {
    code: "05",
    name: "Kaveri Basin, Sangam Plain & Ocean Littoral",
    span: "Stops 12–14 · Kaveri Basin to Tri-Ocean Littoral",
  },
};

const ZONES_ORDER: BiomeId[] = [
  "himalayan-alpine",
  "indo-gangetic",
  "central-india",
  "deccan-tablelands",
  "southern-basins",
];

/**
 * Phase 1C Step 5: JourneyPassport (Sunlit Sandstone & Terracotta)
 */
export function JourneyPassport({
  activeStopId,
  onSelectStop,
  summary,
  markCheckpointExplored,
  resetProgress,
  isExplored,
}: JourneyPassportProps) {
  const zoneGroupings: ZoneGrouping[] = useMemo(() => {
    return ZONES_ORDER.map((biomeId) => {
      const config = ZONE_CONFIG[biomeId];
      const zoneCheckpoints = states.filter((s) => s.biome.id === biomeId);
      return {
        id: biomeId,
        code: config.code,
        name: config.name,
        span: config.span,
        checkpoints: zoneCheckpoints,
      };
    });
  }, []);

  const handleSelectCheckpoint = (id: CheckpointId) => {
    markCheckpointExplored(id);
    onSelectStop(id, "nav");
    if (typeof window !== "undefined") {
      const el = document.getElementById(`chapter-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div
      id="passport"
      className="mt-20 sm:mt-28"
      role="region"
      aria-label="Interactive Journey Passport"
    >
      {/* Passport Header Title */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#8C6226] mb-3">
          <Layers className="h-4 w-4 text-[#12313A]" />
          <span>Subcontinental Expedition Log</span>
        </div>
        <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#12313A]">
          The 14-Checkpoint Journey Passport
        </h3>
        <p className="mt-4 font-sans text-sm sm:text-base text-[#445A62] leading-relaxed">
          Traverse the five physiographic zones of NH44. Inspect checkpoints, investigate local
          photography, and collect all fourteen stamps to earn the Subcontinental Crossing seal.
        </p>
      </div>

      {/* 5-Zone Structured Passport Grid */}
      <div className="space-y-8 sm:space-y-10">
        {zoneGroupings.map((zone) => (
          <div
            key={zone.id}
            className="rounded-3xl border border-[#E3DAC9] bg-white/95 p-5 sm:p-7 shadow-md backdrop-blur-sm"
          >
            {/* Zone Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#E3DAC9] gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FBF5EB] border border-[#E8D5B3] font-mono text-xs font-bold text-[#8C6226]">
                  {zone.code}
                </span>
                <h4 className="font-serif text-base sm:text-lg font-bold text-[#12313A]">
                  {zone.name}
                </h4>
              </div>
              <span className="font-sans text-xs sm:text-sm font-semibold text-[#5D7279]">
                {zone.span}
              </span>
            </div>

            {/* Checkpoint Stamps Grid within Zone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {zone.checkpoints.map((checkpoint) => {
                const isActive = checkpoint.id === activeStopId;
                const isItemExplored = isExplored(checkpoint.id as CheckpointId);

                return (
                  <PassportCheckpointStamp
                    key={checkpoint.id}
                    checkpoint={checkpoint}
                    isActive={isActive}
                    isExplored={isItemExplored}
                    onExploreAndNavigate={() =>
                      handleSelectCheckpoint(checkpoint.id as CheckpointId)
                    }
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dual Milestone Recap & Completion Seal */}
      <ExpeditionSummaryBadge summary={summary} onReset={resetProgress} />
    </div>
  );
}
