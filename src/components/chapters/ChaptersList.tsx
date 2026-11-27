"use client";

import React, { useEffect, useRef } from "react";
import { states } from "@content/states";
import { Container } from "@/components/ui/Container";
import { StateChapterCard } from "./StateChapterCard";
import {
  CheckpointId,
  CHECKPOINT_IDS,
  NavigationOrigin,
  isValidCheckpointId,
} from "@/types/state";
import { getJourneyProgress } from "@/data/journeyProgress";
import { Check, Compass, MapPin, TrendingUp, ArrowDown, Sparkles } from "lucide-react";

interface ChaptersListProps {
  activeStopId: CheckpointId;
  onSelectStop: (id: CheckpointId, origin?: NavigationOrigin) => void;
  programmaticTargetRef?: React.MutableRefObject<CheckpointId | null>;
}

/**
 * Phase 1C Step 4: ChaptersList
 * 
 * Central corridor storytelling container orchestrating:
 * - IntersectionObserver scroll-spy across all 14 chapter cards
 * - Journey Progression Strip with dual metrics and quick-jump scrubber
 * - Luminous continuous highway spine connecting all 14 checkpoints
 */
export function ChaptersList({
  activeStopId,
  onSelectStop,
  programmaticTargetRef,
}: ChaptersListProps) {
  const activeStopIdRef = useRef<CheckpointId>(activeStopId);
  activeStopIdRef.current = activeStopId;

  // Single IntersectionObserver tracking all 14 chapter card sections
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    // Map storing currently intersecting entries by checkpoint id
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

        // If a programmatic smooth scroll is currently executing:
        if (programmaticTargetRef?.current) {
          // If the target element has arrived in view, we allow it to be processed
          if (intersectingEntries.has(programmaticTargetRef.current)) {
            // Target is in view; programmatic scroll is settling
          }
          return; // Ignore other passing chapters during programmatic transitions
        }

        if (intersectingEntries.size === 0) return;

        // Reading band center: 35% from the viewport top (primary reading focus)
        const readingBandCenterY = window.innerHeight * 0.35;
        let closestId: CheckpointId | null = null;
        let minDistance = Infinity;

        intersectingEntries.forEach((entry, id) => {
          if (!isValidCheckpointId(id)) return;
          const rect = entry.boundingClientRect;
          const entryCenterY = rect.top + rect.height * 0.5;
          const distance = Math.abs(entryCenterY - readingBandCenterY);

          if (distance < minDistance) {
            minDistance = distance;
            closestId = id as CheckpointId;
          }
        });

        // Trigger state update only when the closest chapter changes
        if (closestId && closestId !== activeStopIdRef.current) {
          onSelectStop(closestId, "scroll");
        }
      },
      {
        // Active reading band margin: upper-middle window region
        rootMargin: "-15% 0px -35% 0px",
        threshold: [0, 0.25, 0.5, 0.75],
      }
    );

    // Observe all 14 chapter articles
    for (const s of states) {
      const el = document.getElementById(`chapter-${s.id}`);
      if (el) {
        observer.observe(el);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [onSelectStop, programmaticTargetRef]);

  // Derive pure journey progression metrics
  const journey = getJourneyProgress(activeStopId);
  const activeIndex = CHECKPOINT_IDS.indexOf(activeStopId) + 1; // 1 to 14

  const handleJumpToChapter = (id: CheckpointId) => {
    onSelectStop(id, "card");
    const el = document.getElementById(`chapter-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="chapters" className="relative py-20 sm:py-28 bg-[#091522] overflow-hidden" aria-label="Highway Chapters and Checkpoints">
      <Container size="wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-3.5 px-3.5 py-1.5 rounded-full border border-saffron-500/30 bg-saffron-500/10 text-saffron-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
            <span>Corridor Storytelling • Kashmir to Kanyakumari</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#F2EBDD] leading-tight">
            Fourteen Chapters Across the Subcontinental Spine
          </h2>

          <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-[#A2B3C4] max-w-2xl mx-auto">
            A continuous 3,810 KM highway journey from Srinagar beneath Himalayan snowlines down
            to Kanyakumari where three seas meet. Follow the road south across five physiographic zones and 14 historical checkpoints.
          </p>
        </div>

        {/* Journey Progression Strip */}
        <div className="mt-10 max-w-5xl mx-auto rounded-3xl border border-[#D9B88F]/25 bg-[#101F2E]/80 backdrop-blur-md p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          {/* Subtle top accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D9B88F] via-[#E9A15C] to-[#294A3B]" />

          {/* Top Row: Current Stop & Highway Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9B88F]/15 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E9A15C] text-[#091522] font-mono text-xs font-bold shadow-md ring-2 ring-[#E9A15C]/40">
                {journey.currentIndex < 10 ? `0${journey.currentIndex}` : journey.currentIndex}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base sm:text-lg font-bold text-[#F2EBDD]">
                    {journey.currentStopName}
                  </span>
                  <span className="text-xs text-[#D9B88F] font-sans">
                    · {journey.currentJurisdiction}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#A2B3C4]">
                  Corridor Checkpoint {journey.currentIndex} of 14
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-bold ${
                  journey.isOrigin
                    ? "bg-[#D9B88F]/15 border border-[#D9B88F]/30 text-[#D9B88F]"
                    : journey.isTerminus
                    ? "bg-[#E9A15C]/20 border border-[#E9A15C]/40 text-[#E9A15C]"
                    : "bg-[#294A3B]/30 border border-[#294A3B]/60 text-[#D9B88F]"
                }`}
              >
                {journey.isOrigin
                  ? "Northern Corridor Origin (Kashmir)"
                  : journey.isTerminus
                  ? "Southern Terminus (Cape Comorin)"
                  : "En-Route National Corridor"}
              </span>
            </div>
          </div>

          {/* Progress Bar & Milestone Metrics */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#F2EBDD] font-semibold">
                Corridor Progress: {journey.checkpointCountProgressPercent}% Hubs · {journey.physicalDistanceProgressPercent}% Distance
              </span>
              <span className="text-[#E9A15C]">
                ~{journey.physicalCompletedKm.toFixed(0)} of 3,614 KM (OSM)
              </span>
            </div>

            {/* Visual dual progress bar */}
            <div
              className="h-2.5 w-full rounded-full bg-[#091522] border border-[#D9B88F]/20 p-0.5 overflow-hidden"
              role="progressbar"
              aria-valuenow={journey.checkpointCountProgressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Journey progression: ${journey.checkpointCountProgressPercent}% checkpoints completed`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#D9B88F] via-[#E9A15C] to-[#E9A15C] transition-all duration-300 ease-out motion-reduce:transition-none"
                style={{ width: `${journey.checkpointCountProgressPercent}%` }}
              />
            </div>

            {/* Metric Callout Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono">
              <div className="rounded-xl border border-[#D9B88F]/15 bg-[#091522]/60 p-2">
                <span className="block text-[9px] uppercase tracking-wider text-[#A2B3C4]">Hubs Completed</span>
                <span className="text-xs font-bold text-[#F2EBDD]">
                  {journey.checkpointsCompletedCount} / 14 Passed
                </span>
              </div>
              <div className="rounded-xl border border-[#D9B88F]/15 bg-[#091522]/60 p-2">
                <span className="block text-[9px] uppercase tracking-wider text-[#A2B3C4]">MoRTH Milestone</span>
                <span className="text-xs font-bold text-[#E9A15C]">
                  ~{journey.morthMilestoneKm} KM
                </span>
              </div>
              <div className="rounded-xl border border-[#D9B88F]/15 bg-[#091522]/60 p-2">
                <span className="block text-[9px] uppercase tracking-wider text-[#A2B3C4]">Verified Road Km</span>
                <span className="text-xs font-bold text-[#D9B88F]">
                  ~{journey.physicalCompletedKm.toFixed(0)} KM
                </span>
              </div>
              <div className="rounded-xl border border-[#D9B88F]/15 bg-[#091522]/60 p-2">
                <span className="block text-[9px] uppercase tracking-wider text-[#A2B3C4]">Distance to Cape</span>
                <span className="text-xs font-bold text-[#F2EBDD]">
                  ~{journey.physicalRemainingKm.toFixed(0)} KM
                </span>
              </div>
            </div>
          </div>

          {/* Quick-Jump Milestone Scrubber */}
          <div className="mt-5 pt-4 border-t border-[#D9B88F]/15">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#D9B88F]">
                Quick Jump along NH44 Spine
              </span>
              <span className="font-mono text-[10px] text-[#A2B3C4]">
                Select any stop to jump
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 justify-start sm:justify-between">
              {states.map((s, idx) => {
                const order = idx + 1;
                const isPassed = order < activeIndex;
                const isCurrent = order === activeIndex;

                return (
                  <button
                    key={s.id}
                    onClick={() => handleJumpToChapter(s.id as CheckpointId)}
                    aria-label={`Jump to checkpoint ${order}: ${s.stop}`}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 min-h-[32px] text-[11px] font-mono transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C] ${
                      isCurrent
                        ? "bg-[#E9A15C] text-[#091522] font-bold shadow-md scale-105 ring-2 ring-[#E9A15C]/50"
                        : isPassed
                        ? "bg-[#101F2E] border border-[#294A3B] text-[#D9B88F] hover:border-[#D9B88F]"
                        : "bg-[#091522]/80 border border-[#D9B88F]/15 text-[#A2B3C4] hover:border-[#D9B88F]/40 hover:text-[#F2EBDD]"
                    }`}
                  >
                    {isPassed ? (
                      <Check className="h-2.5 w-2.5 text-[#E9A15C]" />
                    ) : (
                      <span>{order < 10 ? `0${order}` : order}</span>
                    )}
                    <span className="hidden md:inline font-sans font-medium text-[10px]">
                      {s.stop}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Continuous Highway Road Line with Glowing Saffron Center Spine running down the section */}
        <div className="relative mt-16 sm:mt-20">
          {/* Desktop Central Vertical Road Line with Luminous Saffron Spine */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-3.5 -translate-x-1/2 rounded-full bg-[#101F2E] border border-[#D9B88F]/25 shadow-[0_0_15px_rgba(233,161,92,0.15)]"
          >
            {/* Ambient spine glow aura */}
            <div className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#E9A15C]/20 to-transparent blur-[3px]" />
            {/* Centerline dashed core */}
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 border-r-2 border-dashed border-[#E9A15C]" />
          </div>

          {/* Mobile Left-Aligned Vertical Road Line with Luminous Saffron Spine */}
          <div
            aria-hidden="true"
            className="lg:hidden absolute left-6 top-0 bottom-0 w-3 rounded-full bg-[#101F2E] border border-[#D9B88F]/25 shadow-[0_0_12px_rgba(233,161,92,0.15)]"
          >
            <div className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#E9A15C]/20 to-transparent blur-[2px]" />
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 border-r-2 border-dashed border-[#E9A15C]" />
          </div>

          {/* 14 Chapter Cards along the highway */}
          <div className="relative z-10 space-y-8">
            {states.map((chapter, idx) => {
              const chapterOrder = idx + 1;
              const checkpointStatus =
                chapterOrder < activeIndex
                  ? "passed"
                  : chapterOrder === activeIndex
                  ? "current"
                  : "upcoming";

              return (
                <StateChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  isEven={idx % 2 === 1}
                  totalChapters={states.length}
                  isActive={chapter.id === activeStopId}
                  checkpointStatus={checkpointStatus}
                  onSelectStop={onSelectStop}
                />
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default ChaptersList;
