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
  MapPin,
  TrendingUp,
  Info,
  Check,
} from "lucide-react";

interface MapSectionProps {
  activeStopId: CheckpointId | string;
  onSelectStop: (id: CheckpointId | string, origin?: NavigationOrigin) => void;
}

export function MapSection({ activeStopId, onSelectStop }: MapSectionProps) {
  const [geoData, setGeoData] = useState<GeoJsonData | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Derive pure, non-mutating journey metrics for consistent corridor reporting
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
    onSelectStop(id, "map");
    const el = document.getElementById(`chapter-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="corridor-explorer"
      className="relative py-20 sm:py-28 bg-[#091522] border-t border-[#D9B88F]/15"
    >
      <Container size="wide">
        {/* Editorial Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-0.5 w-6 bg-[#E9A15C]" />
            <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#E9A15C]">
              OFFICIAL NATIONAL CORRIDOR
            </span>
            <div className="h-0.5 w-6 bg-[#E9A15C]" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#F2EBDD]">
            The 3,810 KM Highway Corridor
          </h2>

          <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-[#A2B3C4]">
            Follow the official Ministry of Road Transport &amp; Highways (MoRTH) North–South alignment.
            Explore all 14 major municipal checkpoints from the high Himalaya to the tri-ocean cape,
            rendered using verified OpenStreetMap centerline geometry.
          </p>
        </div>

        {/* GIS Provenance & Corridor Context Pill */}
        <div className="mt-6 mx-auto max-w-3xl rounded-2xl border border-[#D9B88F]/20 bg-[#101F2E]/60 backdrop-blur-sm p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-[#E9A15C] shrink-0 mt-0.5" />
          <div className="text-left font-sans text-xs text-[#F2EBDD]/80 leading-relaxed">
            <strong className="text-[#E9A15C]">Verified MultiLineString Highway Geometry:</strong>{" "}
            Map centerline derived from OpenStreetMap master relation{" "}
            <span className="font-mono text-[#D9B88F]">11568320</span>. All 5 discrete continuous
            sections and 4 structural gaps are preserved without synthetic straight lines. The 14
            checkpoints represent the official MoRTH Annexure II(d) major corridor sequence, geodetically
            snapped to the highway centerline.
          </div>
        </div>

        {/* 14 Checkpoint Quick Selection Ribbon */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto">
          {states.map((s) => {
            const isActive = activeStopId === s.id;
            const isPassed = s.order < journey.currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => onSelectStop(s.id, "map")}
                aria-label={`Select Stop ${s.order}: ${s.stop}`}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 min-h-[36px] font-sans text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C] ${
                  isActive
                    ? "bg-[#E9A15C] text-[#091522] font-bold shadow-md scale-105 ring-2 ring-[#E9A15C]/50"
                    : isPassed
                    ? "border border-[#294A3B] bg-[#101F2E]/80 text-[#D9B88F] hover:border-[#D9B88F]"
                    : "border border-[#D9B88F]/25 bg-[#101F2E]/70 text-[#F2EBDD]/90 hover:border-[#D9B88F] hover:bg-[#142638]"
                }`}
              >
                {isPassed && !isActive ? (
                  <Check className="h-3 w-3 text-[#E9A15C]" />
                ) : (
                  <span className="font-mono text-[10px] opacity-80">
                    {s.order < 10 ? `0${s.order}` : s.order}
                  </span>
                )}
                <span>{s.stop}</span>
              </button>
            );
          })}
        </div>

        {/* Map & Detail Card Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Map Column */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[#D9B88F]/25 bg-[#101F2E] p-3 sm:p-6 shadow-2xl overflow-hidden">
              {loading || !geoData ? (
                <div className="flex h-[560px] items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Compass className="h-8 w-8 text-[#E9A15C] animate-spin" />
                    <span className="font-sans text-xs font-semibold tracking-wider uppercase text-[#A2B3C4]">
                      Loading Subcontinental Map Geometry...
                    </span>
                  </div>
                </div>
              ) : (
                <RouteMap
                  geoData={geoData}
                  activeStopId={activeStopId}
                  onSelectStop={(stop: StateChapter) => onSelectStop(stop.id, "map")}
                />
              )}
            </div>
          </div>

          {/* Active Checkpoint Detail Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="rounded-3xl border border-[#D9B88F]/30 bg-[#101F2E] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              {/* Decorative top accent border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D9B88F] via-[#E9A15C] to-[#294A3B]" />

              {/* Checkpoint Header Info */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E9A15C]/15 border border-[#E9A15C]/30 px-3 py-1 font-mono text-xs font-bold text-[#E9A15C]">
                  CHECKPOINT {journey.currentIndex < 10 ? `0${journey.currentIndex}` : journey.currentIndex} OF 14
                </span>
                <span className="font-mono text-xs text-[#D9B88F]">
                  ~{journey.morthMilestoneKm} KM (MoRTH Listed)
                </span>
              </div>

              <div className="mt-4">
                <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#F2EBDD]">
                  {currentStop.stop}
                </h3>
                <p className="mt-1 font-sans text-xs font-bold uppercase tracking-widest text-[#D9B88F]">
                  {currentStop.name}
                </p>
                <p className="mt-2 font-serif text-sm italic text-[#A2B3C4]">
                  &ldquo;{currentStop.tagline}&rdquo;
                </p>
              </div>

              {/* Verified GIS Milestones & Coordinates Ribbon */}
              <div className="mt-5 grid grid-cols-2 gap-3 py-3 border-y border-[#D9B88F]/15">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#E9A15C]" />
                  <div className="text-left">
                    <span className="block text-[10px] text-[#A2B3C4] uppercase">Verified Road Km</span>
                    <span className="font-mono text-xs font-bold text-[#F2EBDD]">
                      ~{journey.physicalCompletedKm.toFixed(0)} KM (OSM)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#D9B88F]" />
                  <div className="text-left">
                    <span className="block text-[10px] text-[#A2B3C4] uppercase">Highway Junction</span>
                    <span className="font-mono text-xs font-bold text-[#F2EBDD]">
                      {currentGis.snappedLat.toFixed(3)}°N, {currentGis.snappedLng.toFixed(3)}°E
                    </span>
                  </div>
                </div>
              </div>

              {/* Geographic Offset, Alignment & Remaining Distance Sub-panel */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-left bg-[#091522]/60 rounded-xl p-2.5 border border-[#D9B88F]/10">
                <div>
                  <span className="block font-mono text-[9px] uppercase text-[#A2B3C4]">Corridor Ref</span>
                  <span className="font-mono text-[11px] font-semibold text-[#E9A15C]">{currentGis.highwayRef}</span>
                </div>
                <div>
                  <span className="block font-mono text-[9px] uppercase text-[#A2B3C4]">City Offset</span>
                  <span className="font-mono text-[11px] font-semibold text-[#F2EBDD]">
                    {currentGis.offsetMeters < 1000
                      ? `${Math.round(currentGis.offsetMeters)} m`
                      : `${(currentGis.offsetMeters / 1000).toFixed(1)} km`}
                  </span>
                </div>
                <div>
                  <span className="block font-mono text-[9px] uppercase text-[#A2B3C4]">Remaining</span>
                  <span className="font-mono text-[11px] font-semibold text-[#D9B88F]">
                    ~{journey.physicalRemainingKm.toFixed(0)} KM
                  </span>
                </div>
              </div>

              {/* Introduction Text */}
              <p className="mt-4 font-sans text-xs sm:text-sm leading-relaxed text-[#F2EBDD]/90">
                {currentStop.intro}
              </p>

              {/* Highway Route Context */}
              <div className="mt-4 rounded-xl border border-[#D9B88F]/15 bg-[#142638] p-3 text-left">
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#D9B88F]">
                  Highway Route Context
                </span>
                <p className="mt-1 font-sans text-xs text-[#A2B3C4] leading-relaxed">
                  {currentStop.routeContext}
                </p>
              </div>

              {/* Image Preview Thumbnail */}
              <div className="mt-5 relative h-40 w-full overflow-hidden rounded-2xl border border-[#D9B88F]/20">
                <Image
                  src={currentStop.images[0].src}
                  alt={currentStop.images[0].alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#091522]/90 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-left">
                  <span className="text-[10px] font-bold uppercase text-[#E9A15C] tracking-wider block">
                    Featured Landmark
                  </span>
                  <span className="text-xs font-medium text-[#F2EBDD] truncate block">
                    {currentStop.images[0].caption}
                  </span>
                </div>
              </div>

              {/* CTA to Chapter */}
              <div className="mt-6">
                <button
                  onClick={() => handleScrollToChapter(currentStop.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E9A15C] py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-[#091522] shadow-md hover:bg-[#F2BC85] transition-all hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C]"
                >
                  <span>Explore {currentStop.stop} Chapter</span>
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
