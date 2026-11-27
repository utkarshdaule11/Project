"use client";

import React, { useEffect, useState } from "react";
import { RouteMap } from "@/components/map/RouteMap";
import { states } from "@content/states";
import type { StateChapter } from "@/types/state";

export default function MapTestPage() {
  const [geoData, setGeoData] = useState<Parameters<typeof RouteMap>[0]["geoData"] | null>(null);
  const [selectedStop, setSelectedStop] = useState<StateChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/india.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load India GeoJSON");
        return res.json();
      })
      .then((data) => {
        setGeoData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#091522] text-[#F2EBDD] py-8 px-4 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#F2EBDD] sm:text-4xl">
            The Grand Bharat Highway
          </h1>
          <p className="mt-2 text-sm text-[#D9B88F]">
            Official NH44 Corridor Map Visualizer: 14 Major Checkpoints (3,810 KM)
          </p>
        </header>

        {loading && (
          <div className="flex h-96 items-center justify-center rounded-2xl border border-[#D9B88F]/20 bg-[#101F2E] p-8 shadow-sm">
            <p className="font-sans text-sm text-[#A2B3C4]">Loading India GeoJSON...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-6 text-center text-red-200">
            <p className="font-sans font-semibold">Error loading map: {error}</p>
          </div>
        )}

        {!loading && geoData && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Map Canvas Card */}
            <div className="rounded-3xl border border-[#D9B88F]/25 bg-[#101F2E] p-4 shadow-xl lg:col-span-7">
              <RouteMap
                geoData={geoData as Parameters<typeof RouteMap>[0]["geoData"]}
                activeStopId={selectedStop?.id || "srinagar"}
                onSelectStop={(stop) => setSelectedStop(stop)}
              />
            </div>

            {/* Sidebar Stop Details */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              <div className="rounded-3xl border border-[#D9B88F]/25 bg-[#101F2E] p-6 shadow-xl">
                <h2 className="font-serif text-2xl font-bold text-[#F2EBDD]">
                  {selectedStop ? selectedStop.stop : "NH44 Corridor Hubs"}
                </h2>
                <p className="mt-1 font-sans text-xs font-semibold uppercase tracking-wider text-[#E9A15C]">
                  {selectedStop
                    ? `Checkpoint ${selectedStop.order < 10 ? `0${selectedStop.order}` : selectedStop.order} • ${selectedStop.name}`
                    : "Select a checkpoint on the map"}
                </p>

                <p className="mt-4 font-sans text-xs leading-relaxed text-[#F2EBDD]/90">
                  {selectedStop
                    ? selectedStop.intro
                    : "Click any numbered marker on the map to inspect the official checkpoint details and cultural highlights."}
                </p>

                {selectedStop && (
                  <div className="mt-6 border-t border-[#D9B88F]/15 pt-4">
                    <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#D9B88F]">
                      Specialities & Highlights
                    </h3>
                    <ul className="mt-3 space-y-2.5 font-sans text-xs">
                      {selectedStop.specialities.map((item, idx) => (
                        <li key={idx} className="rounded-xl border border-[#D9B88F]/15 bg-[#142638] p-3">
                          <span className="font-bold text-[#F2EBDD] block">{item.title}</span>
                          <span className="text-[#A2B3C4] text-[11px] block mt-0.5">{item.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Stop Checklist */}
              <div className="rounded-3xl border border-[#D9B88F]/25 bg-[#101F2E] p-4 shadow-xl max-h-[360px] overflow-y-auto">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#D9B88F] block mb-3">
                  All 14 Official Corridor Checkpoints
                </span>
                <div className="space-y-1.5">
                  {states.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStop(s)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-sans text-xs transition-colors ${
                        (selectedStop?.id || "srinagar") === s.id
                          ? "bg-[#E9A15C] text-[#091522] font-bold"
                          : "bg-[#142638] text-[#F2EBDD]/90 hover:bg-[#182C40]"
                      }`}
                    >
                      <span>
                        <span className="font-mono opacity-80 mr-2">
                          {s.order < 10 ? `0${s.order}` : s.order}.
                        </span>
                        {s.stop}
                      </span>
                      <span className="text-[10px] opacity-75">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
