"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { StateChapter, CheckpointId, NavigationOrigin, BiomeId } from "@/types/state";
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
  ShieldCheck,
  Stamp,
} from "lucide-react";

interface StateChapterCardProps {
  chapter: StateChapter;
  isEven: boolean;
  totalChapters: number;
  isActive?: boolean;
  isExplored?: boolean;
  checkpointStatus?: "passed" | "current" | "upcoming";
  onSelectStop?: (id: CheckpointId, origin?: NavigationOrigin) => void;
  onExploreCheckpoint?: (id: CheckpointId) => void;
  onPlayChime?: () => void;
}

const BIOME_PALETTE: Record<
  BiomeId,
  {
    accentBadge: string;
    cardHighlight: string;
    bentoHeader: string;
  }
> = {
  "himalayan-alpine": {
    accentBadge: "bg-[#1C6E5A] text-[#FACC15]",
    cardHighlight: "border-[#1C6E5A]/30",
    bentoHeader: "text-[#1C6E5A]",
  },
  "indo-gangetic": {
    accentBadge: "bg-[#D97706] text-white",
    cardHighlight: "border-[#D97706]/30",
    bentoHeader: "text-[#B45309]",
  },
  "central-india": {
    accentBadge: "bg-[#D95338] text-white",
    cardHighlight: "border-[#D95338]/30",
    bentoHeader: "text-[#D95338]",
  },
  "deccan-tablelands": {
    accentBadge: "bg-[#312E81] text-[#FACC15]",
    cardHighlight: "border-[#312E81]/30",
    bentoHeader: "text-[#312E81]",
  },
  "southern-basins": {
    accentBadge: "bg-[#0E7490] text-[#FEF3C7]",
    cardHighlight: "border-[#0E7490]/30",
    bentoHeader: "text-[#0E7490]",
  },
};

function formatShortElevation(raw: string): string {
  return raw.replace(/\s*\(.*?\)\s*/g, "").trim();
}

/**
 * StateChapterCard — Energetic Road-Trip Postcard Spread with Interactive Passport Stamping
 */
export function StateChapterCard({
  chapter,
  isEven,
  totalChapters,
  isActive = false,
  isExplored = false,
  checkpointStatus = "upcoming",
  onSelectStop,
  onExploreCheckpoint,
  onPlayChime,
}: StateChapterCardProps) {
  const [img1, img2] = chapter.images;
  const shouldReduceMotion = useSafeReducedMotion();
  const journey = getJourneyProgress(chapter.id);
  const palette = BIOME_PALETTE[chapter.biome.id];
  const shortElev = formatShortElevation(chapter.elevation);

  const prevCheckpoint = chapter.order > 1 ? chapter.order - 1 : null;
  const nextCheckpoint = chapter.order < totalChapters ? chapter.order + 1 : null;

  const handleNavigate = (targetId: CheckpointId) => {
    onPlayChime?.();
    if (onSelectStop) {
      onSelectStop(targetId, "card");
    }
    const el = document.getElementById(`chapter-${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
    }
  };

  const handleLocateOnMap = () => {
    onPlayChime?.();
    if (onExploreCheckpoint) {
      onExploreCheckpoint(chapter.id as CheckpointId);
    }
    if (onSelectStop) {
      onSelectStop(chapter.id as CheckpointId, "card");
    }
    const el = document.getElementById("corridor-explorer");
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
    }
  };

  const handleStampStop = () => {
    onPlayChime?.();
    if (onExploreCheckpoint) {
      onExploreCheckpoint(chapter.id as CheckpointId);
    }
  };

  const isLocalPilotAsset = (src: string) => src.startsWith("/images/nh44/");

  return (
    <article
      id={`chapter-${chapter.id}`}
      className="relative scroll-mt-20 w-full bg-[#FBF7EE] pb-12 sm:pb-16"
      aria-label={`Chapter ${chapter.order}: ${chapter.stop}, ${chapter.name}`}
    >
      {/* BAND 1: FULL-BLEED PANORAMA WITH SUNLIT ROAD-TRIP ENERGY */}
      <div
        onClick={handleStampStop}
        title={`Click to collect passport stamp for ${chapter.stop}`}
        className="group relative w-full min-h-[440px] sm:min-h-[520px] lg:min-h-[560px] overflow-hidden bg-[#102A33] cursor-pointer flex flex-col justify-between"
      >
        <Image
          src={img1.src}
          alt={img1.alt}
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C2229]/90 via-[#102A33]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C2229]/95 via-[#102A33]/20 to-[#0C2229]/45 pointer-events-none" />

        {/* Top Bar Inside Panorama */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Indian Highway Milepost Pill */}
            <div className="inline-flex items-center gap-2 rounded-xl border-2 border-[#102A33] bg-[#FACC15] px-3 py-1 text-[#102A33] shadow-md">
              <span className="font-mono text-xs font-black">
                STOP {chapter.order < 10 ? `0${chapter.order}` : chapter.order}
              </span>
              <span className="text-xs font-mono tabular-nums font-extrabold border-l border-[#102A33]/35 pl-2">
                {journey.morthMilestoneKm.toLocaleString()} KM
              </span>
            </div>

            {isActive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D95338] px-3.5 py-1.5 font-sans text-xs font-extrabold uppercase tracking-wider text-white shadow">
                <span className="h-2 w-2 rounded-full bg-[#FACC15] animate-pulse" />
                Cruising Here
              </span>
            ) : checkpointStatus === "passed" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1C6E5A] px-3.5 py-1.5 font-sans text-xs font-bold text-white shadow">
                <Check className="h-3.5 w-3.5 text-[#FACC15]" />
                Passed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-[#102A33]/75 backdrop-blur-md px-3.5 py-1.5 font-sans text-xs font-semibold text-[#FBF7EE]">
                Stop {chapter.order} of {totalChapters}
              </span>
            )}

            <span
              title={chapter.elevation}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-[#102A33]/75 backdrop-blur-md px-3 py-1.5 font-mono text-xs font-bold text-[#FACC15]"
            >
              <Mountain className="h-3.5 w-3.5" />
              ~{shortElev}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 font-mono text-xs font-extrabold uppercase tracking-wider shadow ${palette.accentBadge}`}>
              {img1.type}
            </span>
            {isLocalPilotAsset(img1.src) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FBF7EE]/95 px-2.5 py-1 font-sans text-xs font-bold text-[#102A33] shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-[#1C6E5A]" />
                <span className="hidden sm:inline">Verified</span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom Headline Lockup inside Panorama */}
        <div
          className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24 pt-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="inline-block font-mono text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-[#FACC15] mb-1.5">
                {chapter.name} · {chapter.biome.name}
              </span>
              <h3 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#FBF7EE] leading-[1.02] drop-shadow-xl">
                {chapter.stop}
              </h3>
              <p className="mt-2 font-serif text-lg sm:text-2xl italic text-[#FEF3C7] max-w-3xl drop-shadow">
                &ldquo;{chapter.tagline}&rdquo;
              </p>
              <p className="mt-1.5 font-sans text-xs sm:text-sm text-[#E3DAC9]">
                {img1.caption}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleLocateOnMap}
                aria-label={`Locate ${chapter.stop} on highway map`}
                className="inline-flex items-center gap-2 rounded-full bg-[#FBF7EE] hover:bg-white px-5 py-2.5 min-h-[42px] font-sans text-sm font-bold text-[#102A33] shadow-lg transition-all hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]"
              >
                <MapPin className="h-4 w-4 text-[#D95338]" />
                <span>Locate on Map</span>
              </button>

              <button
                type="button"
                onClick={handleStampStop}
                aria-label={`Stamp ${chapter.stop} in expedition passport`}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 min-h-[42px] font-sans text-sm font-extrabold shadow-lg transition-all hover:scale-[1.03] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FBF7EE] ${
                  isExplored
                    ? "bg-[#1C6E5A] text-[#FACC15] border-2 border-[#FACC15]"
                    : "bg-gradient-to-r from-[#F29F3D] to-[#E5842A] hover:from-[#FACC15] hover:to-[#F29F3D] text-[#102A33]"
                }`}
              >
                {isExplored ? <Check className="h-4 w-4 stroke-[3]" /> : <Stamp className="h-4 w-4" />}
                <span>{isExplored ? "Passport Stamped!" : "Stamp This Stop"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BAND 2: TACTILE POSTCARD & ROAD-TRIP EDITORIAL SPREAD */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 -mt-12 sm:-mt-14 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8"
      >
        <div
          className={`rounded-3xl border-2 bg-white p-5 sm:p-9 shadow-2xl transition-colors ${
            isActive
              ? "border-[#F29F3D] ring-2 ring-[#FACC15]/40"
              : palette.cardHighlight
          }`}
        >
          {/* ROW 1: Story & Route Context paired with Postcard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className={`space-y-5 lg:col-span-7 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
              {/* Symmetrical 4-Tile Road Telemetry Strip (Zero Ugly Wrapping!) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-[#E3DAC9] bg-[#FBF7EE] p-4">
                <div>
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#5D7279]">
                    MoRTH Milepost
                  </span>
                  <span className="font-mono tabular-nums text-base font-extrabold text-[#102A33]">
                    {journey.morthMilestoneKm.toLocaleString()} KM
                  </span>
                </div>
                <div>
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#5D7279]">
                    OSM Road Track
                  </span>
                  <span className="font-mono tabular-nums text-base font-extrabold text-[#D95338]">
                    {journey.physicalCompletedKm.toFixed(0)} KM
                  </span>
                </div>
                <div title={chapter.elevation}>
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#5D7279]">
                    City Elevation
                  </span>
                  <span className="font-mono tabular-nums text-base font-extrabold text-[#102A33]">
                    ~{shortElev}
                  </span>
                </div>
                <div>
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#5D7279]">
                    Coordinates
                  </span>
                  <span className="font-mono tabular-nums text-sm sm:text-base font-extrabold text-[#1C6E5A]">
                    {chapter.lat.toFixed(2)}°N, {chapter.lng.toFixed(2)}°E
                  </span>
                </div>
              </div>

              <p className="font-sans text-base sm:text-lg leading-relaxed text-[#102A33]">
                {chapter.intro}
              </p>

              <div className="rounded-2xl border border-[#E3DAC9] bg-[#F6EFE0]/80 p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-[#D95338]" />
                    <h4 className="font-mono text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#102A33]">
                      On the Road · NH44 Log
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#1C6E5A]">
                    <Compass className="h-3.5 w-3.5" />
                    {chapter.biome.id}
                  </span>
                </div>
                <p className="font-sans text-sm sm:text-base leading-relaxed text-[#37515B]">
                  {chapter.routeContext}
                </p>
              </div>
            </div>

            {img2 && (
              <div className={`lg:col-span-5 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                <div
                  onClick={handleStampStop}
                  title={`Click to stamp ${chapter.stop} in your Passport`}
                  className={`relative group cursor-pointer rounded-2xl border-2 border-[#E3DAC9] bg-[#FBF7EE] p-3 shadow-xl transition-transform duration-500 ${
                    isEven ? "lg:-rotate-2 hover:rotate-0" : "lg:rotate-2 hover:rotate-0"
                  }`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#EAE3D5]">
                    <Image
                      src={img2.src}
                      alt={img2.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 520px"
                      loading="lazy"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="rounded-full bg-[#FBF7EE]/95 border border-[#E3DAC9] px-3 py-1 font-mono text-[11px] font-extrabold uppercase tracking-wider text-[#102A33] shadow-sm">
                        {img2.type}
                      </span>
                    </div>

                    {/* Visual Ink Passport Stamp Overlay when Explored! */}
                    {isExplored && (
                      <div className="animate-stamp-pop pointer-events-none absolute bottom-3 right-3 flex h-20 w-20 flex-col items-center justify-center rounded-full border-[3px] border-dashed border-[#FACC15] bg-[#102A33]/90 text-[#FACC15] shadow-xl">
                        <span className="font-mono text-[9px] font-bold uppercase tracking-widest">
                          NH44 STAMP
                        </span>
                        <span className="font-serif text-xs font-black text-white">
                          {chapter.stop}
                        </span>
                        <span className="font-mono text-[9px] font-bold text-[#F29F3D]">
                          {chapter.distanceFromStartKm} KM
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 px-1 flex items-center justify-between gap-2">
                    <p className="font-serif text-sm sm:text-base font-bold text-[#102A33]">
                      {img2.caption}
                    </p>
                    <span className="shrink-0 rounded-md bg-[#FACC15] px-2 py-0.5 font-mono text-xs font-black text-[#102A33]">
                      #{chapter.order < 10 ? `0${chapter.order}` : chapter.order}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ROW 2: Vibrant 3-Column Road-Trip Bento */}
          <div className="mt-8 pt-8 border-t border-[#E3DAC9] grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-[#E3DAC9] bg-[#FBF7EE] p-5 flex flex-col hover:border-[#F29F3D] hover:-translate-y-0.5 transition-all">
              <h4 className={`flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-wider mb-3.5 ${palette.bentoHeader}`}>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#D97706]">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span>Roadside Culture</span>
              </h4>
              <div className="space-y-3.5 flex-1">
                {chapter.culturalHighlights.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <h5 className="font-bold text-[#102A33]">{item.title}</h5>
                    <p className="mt-1 leading-relaxed text-[#445A62]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E3DAC9] bg-[#FBF7EE] p-5 flex flex-col hover:border-[#F29F3D] hover:-translate-y-0.5 transition-all">
              <h4 className="flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-wider text-[#D95338] mb-3.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEE2E2] text-[#D95338]">
                  <Landmark className="h-4 w-4" />
                </span>
                <span>Must-See Landmarks</span>
              </h4>
              <div className="space-y-3.5 flex-1">
                {chapter.famousLandmarks.map((lm, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-bold text-[#102A33] block">{lm.name}</span>
                    <span className="mt-1 leading-relaxed text-[#445A62] block">{lm.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E3DAC9] bg-[#FBF7EE] p-5 flex flex-col hover:border-[#F29F3D] hover:-translate-y-0.5 transition-all">
              <h4 className="flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-wider text-[#1C6E5A] mb-3.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E6F4F1] text-[#1C6E5A]">
                  <UtensilsCrossed className="h-4 w-4" />
                </span>
                <span>Dhaba &amp; Local Flavours</span>
              </h4>
              <div className="space-y-3.5 flex-1">
                {chapter.foodAndExperiences.map((food, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-bold text-[#102A33] block">{food.name}</span>
                    <span className="mt-1 leading-relaxed text-[#445A62] block">{food.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clean Road-Sign Footer Navigation */}
          <div className="mt-8 pt-5 border-t border-[#E3DAC9] flex flex-wrap items-center justify-between gap-4">
            {prevCheckpoint ? (
              <button
                type="button"
                onClick={() => handleNavigate(states[prevCheckpoint - 1].id as CheckpointId)}
                className="inline-flex items-center gap-2 rounded-full border border-[#E3DAC9] bg-[#FBF7EE] hover:border-[#102A33] px-4 py-2 text-sm font-bold text-[#102A33] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D]"
              >
                <ArrowLeft className="h-4 w-4 text-[#D95338]" />
                <span>
                  Back: {states[prevCheckpoint - 1].stop}
                </span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3.5 py-1.5 font-mono text-xs font-extrabold text-[#9A4B14]">
                Mile 0 · Northern Origin
              </span>
            )}

            {nextCheckpoint ? (
              <button
                type="button"
                onClick={() => handleNavigate(states[nextCheckpoint - 1].id as CheckpointId)}
                className="inline-flex items-center gap-2 rounded-full bg-[#102A33] hover:bg-[#1C6E5A] px-5 py-2.5 text-sm font-extrabold text-[#FACC15] shadow-md transition-all hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D]"
              >
                <span>
                  Next Stop {nextCheckpoint < 10 ? `0${nextCheckpoint}` : nextCheckpoint}: {states[nextCheckpoint - 1].stop}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  document.getElementById("finale")?.scrollIntoView({
                    behavior: shouldReduceMotion ? "auto" : "smooth",
                  });
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#D95338] hover:bg-[#C24229] px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition-all"
              >
                <span>Enter Kanyakumari Finale</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </article>
  );
}
