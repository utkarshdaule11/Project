"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { RouteMap } from "./RouteMap";
import { states } from "@content/states";
import { StateChapter, GeoJsonData, CheckpointId, NavigationOrigin } from "@/types/state";
import { CHECKPOINTS_GIS_MAP } from "@/data/nh44GisData";
import { getJourneyProgress } from "@/data/journeyProgress";
import { Container } from "@/components/ui/Container";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  MapPin,
  TrendingUp,
  Info,
  Check,
  Dices,
} from "lucide-react";

interface MapSectionProps {
  activeStopId: CheckpointId | string;
  onSelectStop: (id: CheckpointId | string, origin?: NavigationOrigin) => void;
  onPlayChime?: () => void;
}

export function MapSection({ activeStopId, onSelectStop, onPlayChime }: MapSectionProps) {
  const [geoData, setGeoData] = useState<GeoJsonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGisDetails, setShowGisDetails] = useState(false);

  useEffect(() => {
    fetch("/data/india.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load map data");
        return res.json();
      })
      .then((data) => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentStop =
    states.find((s) => s.id === activeStopId) || states[0];

  const journey = getJourneyProgress(currentStop.id);

  const currentGis = CHECKPOINTS_GIS_MAP.get(currentStop.id) || {
    id: currentStop.id,
    order: currentStop.order,
    name: currentStop.name,
    jurisdiction: currentStop.name,
    snappedLat: currentStop.lat,
    snappedLng: currentStop.lng,
    centroidLat: currentStop.lat,
    centroidLng: currentStop.lng,
    offsetMeters: 0,
    cumulativeHighwayKm: currentStop.distanceFromStartKm,
    highwayRef: "NH44",
    labelAlign: "start" as const,
    labelDx: 16,
    labelDy: 4,
  };

  const handleScrollToChapter = (id: string) => {
    onPlayChime?.();
    onSelectStop(id, "map");
    const el = document.getElementById(`chapter-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleRandomStop = () => {
    onPlayChime?.();
    const candidates = states.filter((s) => s.id !== currentStop.id);
    const pick = candidates[Math.floor(Math.random() * candidates.length)] || states[0];
    onSelectStop(pick.id, "map");
  };

  return (
    <section
      id="corridor-explorer"
      className="relative py-16 sm:py-24 bg-[#F6EFE0] border-t border-[#E3DAC9]"
    >
      <Container size="wide">
        {/* Energetic Road-Trip Atlas Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-3 rounded-full bg-[#102A33] px-4 py-1.5 shadow-sm">
            <span className="rounded bg-[#FACC15] px-1.5 py-0.5 font-mono text-[10px] font-black text-[#102A33]">
              NH 44
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#FBF7EE]">
              Interactive Subcontinental Map
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-black tracking-tight text-[#102A33]">
            Track the 3,810 KM Spine
          </h2>

          <p className="mt-3 font-sans text-sm sm:text-base leading-relaxed text-[#445A62]">
            Click any milestone pin along India&apos;s longest highway — or roll the dice for a surprise pit-stop!
          </p>

          {/* Compact Toggleable GIS Provenance Badge */}
          <div className="mt-4 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowGisDetails((v) => !v)}
              aria-expanded={showGisDetails}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#D8CEBC] bg-white/90 px-3.5 py-1 font-mono text-[11px] font-semibold text-[#445A62] hover:border-[#F29F3D] hover:text-[#102A33] transition-colors"
            >
              <Info className="h-3.5 w-3.5 text-[#1C6E5A]" />
              <span>Verified OpenStreetMap Geometry · Relation 11568320</span>
            </button>
            {showGisDetails && (
              <div className="mt-2.5 max-w-2xl rounded-2xl border border-[#E3DAC9] bg-white p-3.5 text-left font-sans text-xs text-[#445A62] shadow-md leading-relaxed">
                Map centerline derived from OpenStreetMap master relation{" "}
                <span className="font-mono font-bold text-[#D95338]">11568320</span>. All 5 discrete continuous
                sections and 4 structural gaps are preserved without synthetic straight lines, with 14 MoRTH
                Annexure II(d) checkpoints geodetically snapped to the highway centerline.
              </div>
            )}
          </div>
        </div>

        {/* 14 Checkpoint Quick Selection Ribbon */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-5xl mx-auto">
          {states.map((s) => {
            const isActive = activeStopId === s.id;
            const isPassed = s.order < journey.currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => {
                  onPlayChime?.();
                  onSelectStop(s.id, "map");
                }}
                aria-label={`Select Stop ${s.order}: ${s.stop}`}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 min-h-[36px] font-sans text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102A33] ${
                  isActive
                    ? "bg-[#102A33] text-[#FACC15] shadow-md scale-105 ring-2 ring-[#F29F3D]"
                    : isPassed
                    ? "border border-[#99D5C9] bg-[#E6F4F1] text-[#1C6E5A] hover:border-[#1C6E5A]"
                    : "border border-[#E3DAC9] bg-white text-[#102A33] hover:border-[#F29F3D] hover:bg-[#FEF3C7]/40"
                }`}
              >
                {isPassed && !isActive ? (
                  <Check className="h-3 w-3 text-[#1C6E5A]" />
                ) : (
                  <span className="font-mono text-[10px] opacity-85">
                    {s.order < 10 ? `0${s.order}` : s.order}
                  </span>
                )}
                <span>{s.stop}</span>
              </button>
            );
          })}
        </div>

        {/* Map & Navigator Sidebar Grid */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Map Column */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border-2 border-[#E3DAC9] bg-[#FBF7EE] p-3 sm:p-5 shadow-xl overflow-hidden">
              {loading || !geoData ? (
                <div className="flex h-[560px] items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Compass className="h-8 w-8 text-[#102A33] animate-spin" />
                    <span className="font-mono text-xs font-bold tracking-wider uppercase text-[#445A62]">
                      Loading Subcontinental Atlas...
                    </span>
                  </div>
                </div>
              ) : (
                <RouteMap
                  geoData={geoData}
                  activeStopId={activeStopId}
                  onSelectStop={(stop: StateChapter) => {
                    onPlayChime?.();
                    onSelectStop(stop.id, "map");
                  }}
                />
              )}
            </div>
          </div>

          {/* Active Checkpoint Copilot Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="rounded-3xl border-2 border-[#E3DAC9] bg-white p-6 sm:p-7 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FACC15] via-[#D95338] to-[#1C6E5A]" />

              {/* Checkpoint Header + Prev/Next/Random Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] border border-[#F29F3D]/50 px-3 py-1 font-mono text-xs font-extrabold text-[#9A4B14]">
                  STOP {journey.currentIndex < 10 ? `0${journey.currentIndex}` : journey.currentIndex} / 14
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!journey.prevStopId}
                    onClick={() => journey.prevStopId && onSelectStop(journey.prevStopId, "map")}
                    aria-label="Previous map stop"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E3DAC9] bg-[#FBF7EE] text-[#102A33] hover:border-[#F29F3D] disabled:opacity-30"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRandomStop}
                    title="Random Pit-Stop!"
                    aria-label="Pick random highway stop on map"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D95338] text-white hover:bg-[#C24229] transition-colors shadow-sm"
                  >
                    <Dices className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={!journey.nextStopId}
                    onClick={() => journey.nextStopId && onSelectStop(journey.nextStopId, "map")}
                    aria-label="Next map stop"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E3DAC9] bg-[#FBF7EE] text-[#102A33] hover:border-[#F29F3D] disabled:opacity-30"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-[#102A33]">
                  {currentStop.stop}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="font-mono text-xs font-extrabold uppercase tracking-widest text-[#D95338]">
                    {currentStop.name}
                  </p>
                  <span className="text-[#D8CEBC]">·</span>
                  <span className="font-sans text-xs font-bold text-[#1C6E5A]">
                    {currentStop.biome.name}
                  </span>
                </div>
                <p className="mt-2 font-serif text-sm italic text-[#445A62]">
                  &ldquo;{currentStop.tagline}&rdquo;
                </p>
              </div>

              {/* Verified GIS Milestones */}
              <div className="mt-5 grid grid-cols-2 gap-3 py-3 border-y border-[#E3DAC9]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#D95338]" />
                  <div className="text-left">
                    <span className="block font-mono text-[10px] text-[#5D7279] uppercase font-bold">
                      Road Distance
                    </span>
                    <span className="font-mono tabular-nums text-sm font-extrabold text-[#102A33]">
                      ~{journey.physicalCompletedKm.toFixed(0)} KM (OSM)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#1C6E5A]" />
                  <div className="text-left">
                    <span className="block font-mono text-[10px] text-[#5D7279] uppercase font-bold">
                      Junction Pin
                    </span>
                    <span className="font-mono tabular-nums text-sm font-extrabold text-[#102A33]">
                      {currentGis.snappedLat.toFixed(2)}°N, {currentGis.snappedLng.toFixed(2)}°E
                    </span>
                  </div>
                </div>
              </div>

              {/* Corridor Sub-panel */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-left bg-[#FBF7EE] rounded-2xl p-3 border border-[#E3DAC9]">
                <div>
                  <span className="block font-mono text-[10px] uppercase text-[#5D7279]">Route</span>
                  <span className="font-mono text-sm font-extrabold text-[#D95338]">{currentGis.highwayRef}</span>
                </div>
                <div>
                  <span className="block font-mono text-[10px] uppercase text-[#5D7279]">City Offset</span>
                  <span className="font-mono text-sm font-extrabold text-[#102A33]">
                    {currentGis.offsetMeters < 1000
                      ? `${Math.round(currentGis.offsetMeters)} m`
                      : `${(currentGis.offsetMeters / 1000).toFixed(1)} km`}
                  </span>
                </div>
                <div>
                  <span className="block font-mono text-[10px] uppercase text-[#5D7279]">To Cape</span>
                  <span className="font-mono text-sm font-extrabold text-[#1C6E5A]">
                    ~{journey.physicalRemainingKm.toFixed(0)} KM
                  </span>
                </div>
              </div>

              {/* Introduction Text */}
              <p className="mt-4 font-sans text-sm leading-relaxed text-[#445A62] line-clamp-4">
                {currentStop.intro}
              </p>

              {/* Image Preview Thumbnail */}
              <div className="mt-4 relative h-44 w-full overflow-hidden rounded-2xl border border-[#E3DAC9]">
                <Image
                  src={currentStop.images[0].src}
                  alt={currentStop.images[0].alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102A33]/85 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-left">
                  <span className="font-mono text-[10px] font-bold uppercase text-[#FACC15] tracking-wider block">
                    Featured Pit-Stop
                  </span>
                  <span className="text-xs font-semibold text-white truncate block">
                    {currentStop.images[0].caption}
                  </span>
                </div>
              </div>

              {/* CTA to Chapter */}
              <div className="mt-5">
                <button
                  onClick={() => handleScrollToChapter(currentStop.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F29F3D] to-[#E5842A] hover:from-[#FACC15] hover:to-[#F29F3D] py-3.5 font-sans text-sm font-extrabold uppercase tracking-wider text-[#102A33] shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102A33]"
                >
                  <span>Jump to {currentStop.stop} Story</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
