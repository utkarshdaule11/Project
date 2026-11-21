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
    <div className="min-h-screen bg-background py-8 px-4 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 text-center">
          <h1 className="font-serif text-3xl font-bold text-text sm:text-4xl">
            The Grand Bharat Highway
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Route Map Visualizer: Kashmir to Kanyakumari (d3-geo + GeoJSON)
          </p>
        </header>

        {loading && (
          <div className="flex h-96 items-center justify-center rounded-xl bg-surface p-8 shadow-sm">
            <p className="font-sans text-sm text-text-muted">Loading India GeoJSON...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            <p className="font-sans font-semibold">Error loading map: {error}</p>
          </div>
        )}

        {!loading && geoData && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Map Canvas Card */}
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm lg:col-span-2">
              <RouteMap
                geoData={geoData as Parameters<typeof RouteMap>[0]["geoData"]}
                activeStopId={selectedStop?.id}
                onSelectStop={(stop) => setSelectedStop(stop)}
              />
            </div>

            {/* Sidebar Stop Details */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-text">
                  {selectedStop ? selectedStop.name : "Highway Stops"}
                </h2>
                <p className="mt-1 font-sans text-xs font-medium uppercase tracking-wider text-primary">
                  {selectedStop ? `Stop 0${selectedStop.order} • ${selectedStop.stop}` : "Select a marker"}
                </p>

                <p className="mt-4 font-sans text-sm leading-relaxed text-text-muted">
                  {selectedStop
                    ? selectedStop.intro
                    : "Click any numbered marker on the map to inspect the state's details and specialities."}
                </p>

                {selectedStop && (
                  <div className="mt-6 border-t border-border pt-4">
                    <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-text">
                      Two State Specialities
                    </h3>
                    <ul className="mt-3 space-y-3 font-sans text-xs">
                      {selectedStop.specialities.map((item, idx) => (
                        <li key={idx} className="rounded-lg bg-surface-subtle p-3">
                          <span className="font-semibold text-text">{item.title}: </span>
                          <span className="text-text-muted">{item.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Stop Checklist */}
              <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-text">
                  All 6 Highway Checkpoints
                </span>
                <div className="mt-3 space-y-2">
                  {states.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStop(s)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-sans text-xs transition-colors ${
                        selectedStop?.id === s.id
                          ? "bg-primary text-white font-semibold"
                          : "bg-surface-subtle text-text hover:bg-surface-primary"
                      }`}
                    >
                      <span>
                        0{s.order}. {s.name}
                      </span>
                      <span className="text-[11px] opacity-75">{s.stop}</span>
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
