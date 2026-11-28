"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { states } from "@content/states";
import { Container } from "@/components/ui/Container";
import { StateChapterCard } from "./StateChapterCard";
import {
  CheckpointId,
  CHECKPOINT_IDS,
  NavigationOrigin,
  isValidCheckpointId,
  BiomeId,
} from "@/types/state";
import { getJourneyProgress } from "@/data/journeyProgress";
import { VehicleType } from "@/hooks/useVehicleChoice";
import { VehicleGraphic } from "@/components/ui/VehicleGraphic";
import { Check, Compass, Sparkles } from "lucide-react";

interface ChaptersListProps {
  activeStopId: CheckpointId;
  onSelectStop: (id: CheckpointId, origin?: NavigationOrigin) => void;
  programmaticTargetRef?: React.MutableRefObject<CheckpointId | null>;
  onExploreCheckpoint?: (id: CheckpointId) => void;
  isExplored?: (id: CheckpointId) => boolean;
  vehicle?: VehicleType;
  onPlayChime?: () => void;
}

const ZONE_META: Record<
  BiomeId,
  {
    code: string;
    span: string;
    bannerBg: string;
    badgeBg: string;
    tagline: string;
  }
> = {
  "himalayan-alpine": {
    code: "01",
    span: "Stops 01–02 · Alpine to Foothills",
    bannerBg: "bg-gradient-to-r from-[#102A33] via-[#173D4A] to-[#1C6E5A]",
    badgeBg: "bg-[#FACC15] text-[#102A33]",
    tagline: "Crisp snowlines, saffron terraces & the Pir Panjal tunnel",
  },
  "indo-gangetic": {
    code: "02",
    span: "Stops 03–05 · Plains & Imperial Capital",
    bannerBg: "bg-gradient-to-r from-[#8C4D16] via-[#B45309] to-[#D97706]",
    badgeBg: "bg-[#FBF7EE] text-[#92400E]",
    tagline: "Mustard horizons, tandoori dhabas & Grand Trunk heritage",
  },
  "central-india": {
    code: "03",
    span: "Stops 06–08 · Ravines & Zero Mile",
    bannerBg: "bg-gradient-to-r from-[#7C2D12] via-[#9A3412] to-[#C2410C]",
    badgeBg: "bg-[#FEF3C7] text-[#7C2D12]",
    tagline: "Sandstone citadels, tiger forest flyways & the center of India",
  },
  "deccan-tablelands": {
    code: "04",
    span: "Stops 09–11 · Peninsular Tablelands",
    bannerBg: "bg-gradient-to-r from-[#1E293B] via-[#312E81] to-[#4338CA]",
    badgeBg: "bg-[#F29F3D] text-[#102A33]",
    tagline: "Granite tors, Charminar nights & misty Eastern Ghats bends",
  },
  "southern-basins": {
    code: "05",
    span: "Stops 12–14 · Kaveri to Three Oceans",
    bannerBg: "bg-gradient-to-r from-[#134E4A] via-[#0F766E] to-[#0E7490]",
    badgeBg: "bg-[#FACC15] text-[#102A33]",
    tagline: "Temple towers, Kaveri palms & Cape Comorin ocean surf",
  },
};

/**
 * ChaptersList — Route 66-Inspired Vertical Highway Stream with Indian KM Milestones
 */
export function ChaptersList({
  activeStopId,
  onSelectStop,
  programmaticTargetRef,
  onExploreCheckpoint,
  isExplored,
  vehicle = "suv",
  onPlayChime,
}: ChaptersListProps) {
  const activeStopIdRef = useRef<CheckpointId>(activeStopId);
  activeStopIdRef.current = activeStopId;
  const prefersReducedMotion = useSafeReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const intersectingEntries = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id.replace("chapter-", "");
          if (entry.isIntersecting) {
            intersectingEntries.set(id, entry);
          } else {
            intersectingEntries.delete(id);
          }
        }

        if (intersectingEntries.size > 0) {
          const viewportCenter = window.innerHeight / 2;
          let bestId: string | null = null;
          let minDistance = Infinity;

          intersectingEntries.forEach((entry, id) => {
            const rect = entry.boundingClientRect;
            const entryCenter = rect.top + rect.height / 2;
            const dist = Math.abs(entryCenter - viewportCenter);
            if (dist < minDistance) {
              minDistance = dist;
              bestId = id;
            }
          });

          if (bestId && isValidCheckpointId(bestId)) {
            if (programmaticTargetRef && programmaticTargetRef.current !== null) {
              if (bestId === programmaticTargetRef.current) {
                programmaticTargetRef.current = null;
                if (bestId !== activeStopIdRef.current) {
                  onSelectStop(bestId, "scroll");
                }
              }
              return;
            }

            if (bestId !== activeStopIdRef.current) {
              onSelectStop(bestId, "scroll");
            }
          }
        }
      },
      {
        root: null,
        rootMargin: "-15% 0px -30% 0px",
        threshold: [0.05, 0.2, 0.45],
      }
    );

    const els = document.querySelectorAll('article[id^="chapter-"]');
    els.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      intersectingEntries.clear();
    };
  }, [onSelectStop, programmaticTargetRef]);

  const journey = getJourneyProgress(activeStopId);
  const activeIndex = CHECKPOINT_IDS.indexOf(activeStopId) + 1;

  const handleJumpToChapter = (id: CheckpointId) => {
    onPlayChime?.();
    onSelectStop(id, "card");
    const el = document.getElementById(`chapter-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  };

  return (
    <section
      id="chapters"
      className="relative pt-20 sm:pt-24 bg-[#FBF7EE] border-t border-[#E3DAC9] overflow-hidden"
      aria-label="Highway Chapters and Checkpoints"
    >
      {/* Top Intro & Live Highway Dashboard Scrubber */}
      <Container size="wide" className="pb-14 sm:pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-3.5 px-4 py-1.5 rounded-full border-2 border-[#F29F3D]/50 bg-[#FEF3C7] text-[#9A4B14] text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-[#D95338]" />
            <span>14 Stops · One Epic Road Movie</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#102A33] leading-tight">
            Hit Every Milepost South
          </h2>

          <p className="mt-4 font-sans text-base sm:text-lg leading-relaxed text-[#445A62] max-w-2xl mx-auto">
            Scroll the highway spine from Pir Panjal snowlines to the Kaveri basin and southern seas — and stamp your passport at every stop!
          </p>
        </div>

        {/* Live Road-Trip Progress Scrubber Card */}
        <div className="mt-10 max-w-6xl mx-auto rounded-3xl border-2 border-[#E3DAC9] bg-white p-5 sm:p-7 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FACC15] via-[#D95338] to-[#1C6E5A]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3DAC9] pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#102A33] text-[#FACC15] font-mono text-sm font-extrabold shadow-sm">
                {journey.currentIndex < 10 ? `0${journey.currentIndex}` : journey.currentIndex}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif text-lg sm:text-xl font-black text-[#102A33]">
                    {journey.currentStopName}
                  </span>
                  <span className="text-sm text-[#D95338] font-sans font-bold">
                    · {journey.currentJurisdiction}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#5D7279]">
                  Pit-Stop {journey.currentIndex} of 14 · ~{journey.morthMilestoneKm.toLocaleString()} KM Milestone
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <VehicleGraphic type={vehicle} driving={!prefersReducedMotion} className="w-12 h-7 hidden sm:block" />
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-xs font-extrabold ${
                  journey.isOrigin
                    ? "bg-[#FEF3C7] border border-[#F29F3D] text-[#9A4B14]"
                    : journey.isTerminus
                    ? "bg-[#102A33] text-[#FACC15]"
                    : "bg-[#E6F4F1] border border-[#99D5C9] text-[#1C6E5A]"
                }`}
              >
                {journey.isOrigin
                  ? "Origin · Kashmir"
                  : journey.isTerminus
                  ? "Terminus · Three Oceans"
                  : "Cruising NH44"}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
              <span className="text-[#102A33] font-bold">
                {journey.checkpointCountProgressPercent}% Stops · {journey.physicalDistanceProgressPercent}% Distance
              </span>
              <span className="text-[#D95338] font-extrabold">
                ~{journey.physicalCompletedKm.toFixed(0)} / 3,614 KM (OSM)
              </span>
            </div>

            <div
              className="h-3 w-full rounded-full bg-[#F6EFE0] border border-[#E3DAC9] p-0.5 overflow-hidden"
              role="progressbar"
              aria-valuenow={journey.checkpointCountProgressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Journey progression: ${journey.checkpointCountProgressPercent}% checkpoints completed`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FACC15] via-[#F29F3D] to-[#1C6E5A] transition-all duration-300 ease-out motion-reduce:transition-none"
                style={{ width: `${journey.checkpointCountProgressPercent}%` }}
              />
            </div>

            {/* 14-Stop Quick Jump Pills */}
            <div className="pt-3 flex flex-wrap items-center gap-1.5 justify-start sm:justify-between">
              {states.map((s, idx) => {
                const order = idx + 1;
                const isPassed = order < activeIndex;
                const isCurrent = order === activeIndex;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleJumpToChapter(s.id as CheckpointId)}
                    aria-label={`Jump to checkpoint ${order}: ${s.stop}`}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 min-h-[34px] text-xs font-mono transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102A33] ${
                      isCurrent
                        ? "bg-[#102A33] text-[#FACC15] font-extrabold shadow-md scale-105 ring-2 ring-[#F29F3D]"
                        : isPassed
                        ? "bg-[#E6F4F1] border border-[#99D5C9] text-[#1C6E5A] hover:border-[#1C6E5A]"
                        : "bg-[#FBF7EE] border border-[#E3DAC9] text-[#445A62] hover:border-[#F29F3D] hover:text-[#102A33]"
                    }`}
                  >
                    {isPassed ? (
                      <Check className="h-3 w-3 text-[#1C6E5A]" />
                    ) : (
                      <span>{order < 10 ? `0${order}` : order}</span>
                    )}
                    <span className="hidden md:inline font-sans font-bold text-xs">
                      {s.stop}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Container>

      {/* FULL-BLEED 100VW CHAPTERS STREAM WITH HIGHWAY SPINE & MILESTONES */}
      <div className="w-full space-y-0">
        {states.map((chapter, idx) => {
          const chapterOrder = idx + 1;
          const isNewZone = idx === 0 || chapter.biome.id !== states[idx - 1].biome.id;
          const zoneInfo = ZONE_META[chapter.biome.id];
          const checkpointStatus =
            chapterOrder < activeIndex
              ? "passed"
              : chapterOrder === activeIndex
              ? "current"
              : "upcoming";
          const stopExplored = isExplored ? isExplored(chapter.id as CheckpointId) : false;

          return (
            <React.Fragment key={chapter.id}>
              {/* Authentic Indian Highway Milepost Connector between chapters */}
              {idx > 0 && !isNewZone && (
                <div
                  aria-hidden="true"
                  className="relative flex flex-col items-center justify-center py-5 bg-[#FBF7EE]"
                >
                  <div className="w-10 h-12 bg-[#102A33] rounded-md flex justify-center py-1 shadow-inner">
                    <div className="w-1 h-full highway-centerline-vertical" />
                  </div>
                  {/* Authentic Yellow-Top Indian Highway Kilometer Stone */}
                  <div className="my-1 rounded-t-xl rounded-b-sm border-2 border-[#102A33] overflow-hidden shadow-md bg-white text-center min-w-[116px]">
                    <div className="bg-[#FACC15] px-3 py-0.5 font-mono text-[10px] font-black tracking-widest text-[#102A33] border-b border-[#102A33]">
                      NH 44
                    </div>
                    <div className="px-3 py-1 font-mono text-xs font-extrabold text-[#102A33]">
                      {chapter.distanceFromStartKm} KM · {chapter.stop.toUpperCase()}
                    </div>
                  </div>
                  <div className="w-10 h-8 bg-[#102A33] rounded-md flex justify-center py-1 shadow-inner">
                    <div className="w-1 h-full highway-centerline-vertical" />
                  </div>
                </div>
              )}

              {/* Vibrant Biome Zone Chapter Banner */}
              {isNewZone && (
                <motion.div
                  id={`zone-${chapter.biome.id}`}
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.45 }}
                  className={`scroll-mt-20 w-full border-y-4 border-[#FACC15] ${zoneInfo.bannerBg} py-6 px-4 sm:px-6 lg:px-8 text-white shadow-lg`}
                >
                  <div className="mx-auto max-w-[1380px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-xs font-black shadow ${zoneInfo.badgeBg}`}
                      >
                        <Compass className="h-3.5 w-3.5" />
                        <span>ZONE {zoneInfo.code}</span>
                      </span>
                      <div>
                        <span className="block font-serif text-xl sm:text-2xl font-black tracking-tight">
                          {chapter.biome.name}
                        </span>
                        <span className="block font-sans text-xs sm:text-sm text-white/85">
                          {zoneInfo.tagline}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs sm:text-sm font-extrabold text-[#FACC15] bg-black/25 px-3.5 py-1.5 rounded-full border border-white/20 shrink-0 self-start sm:self-center">
                      {zoneInfo.span}
                    </span>
                  </div>
                </motion.div>
              )}

              <StateChapterCard
                chapter={chapter}
                isEven={idx % 2 === 1}
                totalChapters={states.length}
                isActive={chapter.id === activeStopId}
                isExplored={stopExplored}
                checkpointStatus={checkpointStatus}
                onSelectStop={onSelectStop}
                onExploreCheckpoint={onExploreCheckpoint}
                onPlayChime={onPlayChime}
              />
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}

export default ChaptersList;
