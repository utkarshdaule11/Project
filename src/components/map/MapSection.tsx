"use client";

import React, { useEffect, useState } from "react";
import { RouteMap } from "./RouteMap";
import { states } from "@content/states";
import { StateChapter, GeoJsonData } from "@/types/state";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowRight, Compass } from "lucide-react";

interface MapSectionProps {
  activeStopId: string;
  onSelectStop: (id: string) => void;
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

  const handleScrollToChapter = (id: string) => {
    onSelectStop(id);
    const el = document.getElementById(`chapter-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="interactive-map" className="py-20 sm:py-24">
      <Container size="wide">
        <SectionHeading
          kicker="Route Visualizer"
          title="The 3,700 KM Highway Spline"
          subtitle="Explore the six checkpoints from Srinagar in the Himalayas down to Kanyakumari. Click any chip to inspect the map and jump to its chapter."
        />

        {/* Checkpoint Quick Select Pills linked to chapter anchors */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {states.map((s) => (
            <a
              key={s.id}
              href={`#chapter-${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleScrollToChapter(s.id);
              }}
              className={`rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                activeStopId === s.id
                  ? "bg-accent-saffron text-text font-bold shadow-xs"
                  : "bg-surface border border-border text-text hover:bg-surface-subtle"
              }`}
            >
              0{s.order}. {s.name}
            </a>
          ))}
        </div>

        {/* Map & Detail Card Grid */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Map Column */}
          <div className="lg:col-span-7">
            <Card className="p-3 sm:p-6 overflow-hidden">
              {loading || !geoData ? (
                <div className="flex h-[520px] items-center justify-center">
                  <span className="font-sans text-xs font-semibold uppercase text-text-muted">
                    Loading Subcontinental Map...
                  </span>
                </div>
              ) : (
                <RouteMap
                  geoData={geoData}
                  activeStopId={activeStopId}
                  onSelectStop={(stop: StateChapter) => onSelectStop(stop.id)}
                />
              )}
            </Card>
          </div>

          {/* Active Stop Detail Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <Card className="border-t-4 border-t-accent-saffron">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-accent-saffron">
                  Stop 0{currentStop.order} • {currentStop.stop}
                </span>
                <span className="flex items-center gap-1 font-sans text-xs font-medium text-text-muted">
                  <Compass className="h-3.5 w-3.5 text-primary" />
                  {currentStop.lat.toFixed(2)}° N, {currentStop.lng.toFixed(2)}° E
                </span>
              </div>

              <h3 className="mt-2 font-serif text-2xl font-bold text-text sm:text-3xl">
                {currentStop.name}
              </h3>
              <p className="mt-1 font-sans text-sm font-semibold italic text-primary-dark">
                &ldquo;{currentStop.tagline}&rdquo;
              </p>

              <p className="mt-4 font-sans text-sm leading-relaxed text-text-muted">
                {currentStop.intro}
              </p>

              {/* Two State Specialities */}
              <div className="mt-6 border-t border-border pt-4">
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-text">
                  Signature Specialities
                </h4>
                <div className="mt-3 space-y-3">
                  {currentStop.specialities.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border/80 bg-surface-subtle p-3.5"
                    >
                      <h5 className="font-sans text-xs font-bold text-text">
                        {item.title}
                      </h5>
                      <p className="mt-1 font-sans text-xs leading-relaxed text-text-muted">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jump to Chapter Button */}
              <div className="mt-6">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full gap-2"
                  onClick={() => handleScrollToChapter(currentStop.id)}
                >
                  <span>Explore Chapter 0{currentStop.order}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
