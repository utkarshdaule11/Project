"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { StateChapter, CheckpointId, NavigationOrigin } from "@/types/state";
import { states } from "@content/states";
import { getJourneyProgress } from "@/data/journeyProgress";
import {
  Compass,
  MapPin,
  Sparkles,
  Landmark,
  UtensilsCrossed,
  ArrowLeft,
  ArrowRight,
  Route,
  Check,
  Mountain,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface StateChapterCardProps {
  chapter: StateChapter;
  isEven: boolean;
  totalChapters: number;
  isActive?: boolean;
  checkpointStatus?: "passed" | "current" | "upcoming";
  onSelectStop?: (id: CheckpointId, origin?: NavigationOrigin) => void;
}

/**
 * Phase 1C Step 4: Cinematic Chapter Card Evolution
 * 
 * Evolved editorial storytelling card communicating:
 * - Immediate geographic identity & prominent milestone numbers
 * - Official Five Physiographic Zone classification & badges (from Step 2)
 * - Factual elevation (~m Approx. City-Centre Reference Elevation)
 * - Restrained typography and visual hierarchy matching Step 3 Hero
 * - Full reduced-motion and keyboard accessibility compliance
 */
export function StateChapterCard({
  chapter,
  isEven,
  totalChapters,
  isActive = false,
  checkpointStatus = "upcoming",
  onSelectStop,
}: StateChapterCardProps) {
  const [img1, img2] = chapter.images;
  const shouldReduceMotion = useReducedMotion();

  // Pure journey progression metrics for this specific chapter
  const journey = getJourneyProgress(chapter.id);

  const prevCheckpoint = chapter.order > 1 ? chapter.order - 1 : null;
  const nextCheckpoint = chapter.order < totalChapters ? chapter.order + 1 : null;

  const handleNavigate = (targetId: CheckpointId) => {
    if (onSelectStop) {
      onSelectStop(targetId, "card");
    }
    const el = document.getElementById(`chapter-${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
    }
  };

  const handleLocateOnMap = () => {
    if (onSelectStop) {
      onSelectStop(chapter.id as CheckpointId, "card");
    }
    const el = document.getElementById("corridor-explorer");
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
    }
  };

  // Check if image is a verified local pilot asset
  const isLocalPilotAsset = (src: string) => src.startsWith("/images/nh44/");

  return (
    <article
      id={`chapter-${chapter.id}`}
      className="relative scroll-mt-28 py-12 sm:py-16"
      aria-label={`Chapter ${chapter.order}: ${chapter.stop}, ${chapter.name}`}
    >
      {/* Central Road Marker Node & Milestone Spine Anchor */}
      <div className="flex items-center gap-3 mb-8 lg:justify-center">
        {/* Milestone Number Shield */}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-sm font-bold transition-all duration-300 ${
            isActive
              ? "bg-[#E9A15C] text-[#091522] scale-110 shadow-[0_0_25px_rgba(233,161,92,0.45)] ring-4 ring-[#E9A15C]/40"
              : checkpointStatus === "passed"
              ? "bg-[#101F2E] text-[#D9B88F] border-2 border-[#294A3B] shadow-md ring-2 ring-[#091522]"
              : "bg-[#142638] text-[#A2B3C4] border border-[#D9B88F]/20 ring-2 ring-[#091522]"
          }`}
        >
          <span>{chapter.order < 10 ? `0${chapter.order}` : chapter.order}</span>
        </div>

        {/* Checkpoint Name & Jurisdiction Pill */}
        <div
          className={`rounded-full border px-4 py-1.5 shadow-md flex items-center gap-2.5 transition-all duration-300 ${
            isActive
              ? "border-[#E9A15C]/60 bg-[#142638] text-[#E9A15C] ring-1 ring-[#E9A15C]/40"
              : checkpointStatus === "passed"
              ? "border-[#294A3B] bg-[#101F2E] text-[#D9B88F]"
              : "border-[#D9B88F]/25 bg-[#101F2E] text-[#A2B3C4]"
          }`}
        >
          <span className="font-serif text-sm font-bold text-[#F2EBDD]">
            {chapter.stop}
          </span>
          <span className="text-xs text-[#D9B88F] font-sans">
            · {chapter.name}
          </span>
          <span className="text-[10px] font-mono text-[#A2B3C4] border-l border-[#D9B88F]/20 pl-2">
            ~{journey.morthMilestoneKm} KM (MoRTH)
          </span>
        </div>
      </div>

      {/* Main Chapter Card Box */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`rounded-3xl border bg-[#101F2E] p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all duration-300 ${
          isActive
            ? "border-[#E9A15C]/60 shadow-[0_0_35px_rgba(233,161,92,0.18)] ring-1 ring-[#E9A15C]/30"
            : checkpointStatus === "passed"
            ? "border-[#294A3B]/50 hover:border-[#D9B88F]/40"
            : "border-[#D9B88F]/20 hover:border-[#D9B88F]/35"
        }`}
      >
        {/* Subtle decorative background tint */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-radial from-[#E9A15C]/5 via-transparent to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start relative z-10">
          {/* Narrative Column */}
          <div className={`space-y-6 lg:col-span-6 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
            {/* Header / Subtitle & Action Bar */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Indicator Badge */}
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E9A15C] border border-[#E9A15C] px-3 py-0.5 font-mono text-[10px] font-bold text-[#091522] shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#091522] animate-pulse" />
                      Active Focus
                    </span>
                  ) : checkpointStatus === "passed" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#294A3B]/40 border border-[#294A3B] px-3 py-0.5 font-mono text-[10px] font-bold text-[#D9B88F]">
                      <Check className="h-3 w-3 text-[#E9A15C]" />
                      Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#142638] border border-[#D9B88F]/20 px-3 py-0.5 font-mono text-[10px] font-semibold text-[#A2B3C4]">
                      Upcoming
                    </span>
                  )}

                  <span className="rounded-full bg-[#101F2E] border border-[#D9B88F]/25 px-3 py-0.5 font-mono text-[10px] font-bold text-[#D9B88F]">
                    Stop {chapter.order < 10 ? `0${chapter.order}` : chapter.order} of {totalChapters}
                  </span>

                  {/* Elevation Badge with Exact Step 2 Terminology */}
                  <span className="rounded-full bg-[#294A3B]/30 border border-[#294A3B]/60 px-3 py-0.5 font-mono text-[10px] font-bold text-[#D9B88F] flex items-center gap-1">
                    <Mountain className="h-3 w-3 text-[#E9A15C]" />
                    Elev. ~{chapter.elevation}
                  </span>
                </div>

                {/* Locate on Highway Map Action Button */}
                <button
                  type="button"
                  onClick={handleLocateOnMap}
                  aria-label={`Locate ${chapter.stop} on highway map`}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-[#D9B88F]/30 bg-[#142638] px-3.5 py-1.5 min-h-[36px] font-sans text-xs font-semibold text-[#F2EBDD] hover:bg-[#E9A15C] hover:text-[#091522] hover:border-[#E9A15C] transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C]"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#E9A15C] group-hover:text-[#091522] transition-colors" />
                  <span>Locate on Map</span>
                </button>
              </div>

              {/* Master Headline & Tagline */}
              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F2EBDD]">
                {chapter.stop}
              </h3>
              <p className="mt-1.5 font-serif text-base italic text-[#D9B88F]">
                &ldquo;{chapter.tagline}&rdquo;
              </p>
            </div>

            {/* Physiographic Highway Zone Identification Badge (Step 2 Integration) */}
            <div className="rounded-2xl border border-saffron-500/25 bg-earth-900/60 p-3.5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-saffron-400 font-bold">
                  <Compass className="h-3.5 w-3.5 text-saffron-400" />
                  Physiographic Highway Zone
                </span>
                <span className="font-mono text-[10px] text-sand-400 px-2 py-0.5 rounded bg-earth-950/60 border border-sand-500/20">
                  {chapter.biome.id}
                </span>
              </div>
              <div className="font-serif text-sm font-semibold text-sand-100">
                {chapter.biome.name}
              </div>
              {chapter.biome.description && (
                <p className="mt-1 font-sans text-xs text-sand-400/90 leading-relaxed border-l-2 border-saffron-500/50 pl-2.5">
                  {chapter.biome.description}
                </p>
              )}
            </div>

            {/* Highway Corridor Milestones Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 rounded-2xl border border-[#D9B88F]/15 bg-[#142638]/60 p-3">
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-[#A2B3C4]">
                  MoRTH Milestone
                </span>
                <span className="font-mono text-xs font-bold text-[#F2EBDD]">
                  ~{journey.morthMilestoneKm} KM
                </span>
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-[#A2B3C4]">
                  Physical Road Distance
                </span>
                <span className="font-mono text-xs font-bold text-[#E9A15C]">
                  ~{journey.physicalCompletedKm.toFixed(0)} KM (OSM)
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block font-mono text-[9px] uppercase tracking-wider text-[#A2B3C4]">
                  Remaining to Cape
                </span>
                <span className="font-mono text-xs font-bold text-[#D9B88F]">
                  ~{journey.physicalRemainingKm.toFixed(0)} KM
                </span>
              </div>
            </div>

            {/* Editorial Intro */}
            <p className="font-sans text-sm sm:text-base leading-relaxed text-[#F2EBDD]/90">
              {chapter.intro}
            </p>

            {/* Highway Route Context */}
            <div className="rounded-2xl border border-[#D9B88F]/15 bg-[#142638] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Route className="h-4 w-4 text-[#E9A15C]" />
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#D9B88F]">
                  Route Context along NH44
                </h4>
              </div>
              <p className="font-sans text-xs leading-relaxed text-[#A2B3C4]">
                {chapter.routeContext}
              </p>
            </div>

            {/* Cultural Highlights */}
            <div className="space-y-3 pt-1">
              <h4 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-[#F2EBDD]">
                <Sparkles className="h-3.5 w-3.5 text-[#E9A15C]" />
                <span>Cultural Highlights</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {chapter.culturalHighlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#D9B88F]/15 bg-[#142638]/70 p-3"
                  >
                    <h5 className="font-sans text-xs font-bold text-[#F2EBDD]">
                      {item.title}
                    </h5>
                    <p className="mt-1 font-sans text-[11px] leading-relaxed text-[#A2B3C4]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Famous Landmarks & Food Experiences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Famous Landmarks */}
              <div className="rounded-2xl border border-[#D9B88F]/15 bg-[#142638]/40 p-4">
                <h4 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-[#D9B88F] mb-2.5">
                  <Landmark className="h-3.5 w-3.5 text-[#E9A15C]" />
                  <span>Landmarks</span>
                </h4>
                <div className="space-y-2">
                  {chapter.famousLandmarks.map((lm, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="font-semibold text-[#F2EBDD] block">{lm.name}</span>
                      <span className="text-[11px] text-[#A2B3C4] block">{lm.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Food & Local Experiences */}
              <div className="rounded-2xl border border-[#D9B88F]/15 bg-[#142638]/40 p-4">
                <h4 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-[#D9B88F] mb-2.5">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-[#E9A15C]" />
                  <span>Local Flavours</span>
                </h4>
                <div className="space-y-2">
                  {chapter.foodAndExperiences.map((food, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="font-semibold text-[#F2EBDD] block">{food.name}</span>
                      <span className="text-[11px] text-[#A2B3C4] block">{food.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Previous / Next Checkpoint Navigation */}
            <div className="flex items-center justify-between border-t border-[#D9B88F]/15 pt-4">
              {prevCheckpoint ? (
                <button
                  type="button"
                  onClick={() => handleNavigate(states[prevCheckpoint - 1].id as CheckpointId)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D9B88F] hover:text-[#E9A15C] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E9A15C] rounded px-2.5 py-1.5 min-h-[36px]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>
                    Stop {prevCheckpoint < 10 ? `0${prevCheckpoint}` : prevCheckpoint}: {states[prevCheckpoint - 1].stop}
                  </span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-[#A2B3C4]">Corridor North Origin</span>
              )}

              {nextCheckpoint ? (
                <button
                  type="button"
                  onClick={() => handleNavigate(states[nextCheckpoint - 1].id as CheckpointId)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D9B88F] hover:text-[#E9A15C] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E9A15C] rounded px-2.5 py-1.5 min-h-[36px]"
                >
                  <span>
                    Stop {nextCheckpoint < 10 ? `0${nextCheckpoint}` : nextCheckpoint}: {states[nextCheckpoint - 1].stop}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <span className="text-[11px] font-mono text-[#E9A15C]">Southern Terminus (~3,810 KM Listed Length)</span>
              )}
            </div>

            {/* Geographical Estimate Clarification Footnote */}
            <p className="font-sans text-[10px] text-[#A2B3C4]/70 border-t border-[#D9B88F]/10 pt-2.5">
              * Note: Checkpoint milestone distance (~KM) and elevation (~m) are geographic estimates for expedition planning. The official Srinagar–Kanyakumari corridor length listed under MoRTH Annexure II(d) is 3,810 KM; physical highway centerline mapped under OSM relation 11568320 is 3,613.79 KM.
            </p>
          </div>

          {/* Photography Column */}
          <div className={`space-y-4 lg:col-span-6 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
            {/* Primary Landmark Image */}
            <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#D9B88F]/25 bg-[#091522] shadow-xl">
              <Image
                src={img1.src}
                alt={img1.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                loading="lazy"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#091522]/90 via-transparent to-transparent" />
              
              {/* Category & Provenance Pill */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="rounded-full bg-[#091522]/85 border border-[#D9B88F]/30 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#E9A15C] backdrop-blur-md">
                  {img1.type}
                </span>
                {isLocalPilotAsset(img1.src) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#294A3B]/85 border border-[#294A3B] px-2 py-0.5 font-mono text-[9px] font-semibold text-[#D9B88F] backdrop-blur-md">
                    <ShieldCheck className="h-3 w-3 text-[#E9A15C]" />
                    Local Verified
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-4 right-4">
                <p className="font-sans text-xs font-medium text-[#F2EBDD] drop-shadow-md">
                  {img1.caption}
                </p>
              </div>
            </div>

            {/* Secondary Nature / Highway Image (Optional) */}
            {img2 && (
              <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#D9B88F]/25 bg-[#091522] shadow-xl">
                <Image
                  src={img2.src}
                  alt={img2.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  loading="lazy"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#091522]/90 via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="rounded-full bg-[#091522]/85 border border-[#D9B88F]/30 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#D9B88F] backdrop-blur-md">
                    {img2.type}
                  </span>
                  {isLocalPilotAsset(img2.src) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#294A3B]/85 border border-[#294A3B] px-2 py-0.5 font-mono text-[9px] font-semibold text-[#D9B88F] backdrop-blur-md">
                      <ShieldCheck className="h-3 w-3 text-[#E9A15C]" />
                      Local Verified
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <p className="font-sans text-xs font-medium text-[#F2EBDD] drop-shadow-md">
                    {img2.caption}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </article>
  );
}

export default StateChapterCard;
