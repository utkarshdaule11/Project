import React from "react";
import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { line, curveCatmullRom } from "d3-shape";
import { states } from "@content/states";
import { StateChapter, GeoJsonData } from "@/types/state";
export type { GeoJsonData };

interface RouteMapProps {
  geoData: GeoJsonData;
  activeStopId?: string;
  onSelectStop?: (stop: StateChapter) => void;
  className?: string;
}

export function RouteMap({
  geoData,
  activeStopId = "kashmir",
  onSelectStop,
  className = "",
}: RouteMapProps) {
  const width = 800;
  const height = 950;

  // d3-geo projection using geoMercator and fitSize to guarantee aspect ratio
  const projection = geoMercator().fitSize(
    [width, height],
    geoData as unknown as GeoPermissibleObjects
  );

  const pathGenerator = geoPath().projection(projection);

  // Project stop coordinates [lng, lat]
  const projectedStops = states.map((stop) => {
    const coords = projection([stop.lng, stop.lat]);
    return {
      ...stop,
      x: coords ? coords[0] : 0,
      y: coords ? coords[1] : 0,
    };
  });

  // d3.line with curveCatmullRom through the projected points
  const lineGenerator = line<(typeof projectedStops)[0]>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(curveCatmullRom.alpha(0.5));

  const routePathD = lineGenerator(projectedStops) || "";
  const activeStop = projectedStops.find((s) => s.id === activeStopId) || projectedStops[0];

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-auto w-full select-none"
        role="region"
        aria-label="Map of India showing the Route 66 styled highway stops from Kashmir to Kanyakumari"
      >
        <defs>
          <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F59A4B" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* State Polygons styled in soft turquoise with thin white borders */}
        <g className="states-layer">
          {geoData.features.map((feature, idx) => {
            const d = pathGenerator(feature as unknown as GeoPermissibleObjects);
            if (!d) return null;
            return (
              <path
                key={feature.id ?? idx}
                d={d}
                className="fill-primary-light/40 stroke-white stroke-[0.8] transition-colors duration-200 hover:fill-primary-light/60"
              />
            );
          })}
        </g>

        {/* Highway underlay road surface */}
        <path
          d={routePathD}
          fill="none"
          className="stroke-road-surface/30 stroke-[6]"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Primary Saffron Route Spline */}
        <path
          d={routePathD}
          fill="none"
          filter="url(#route-glow)"
          className="stroke-accent-saffron stroke-[3.5]"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dashed Center Guide */}
        <path
          d={routePathD}
          fill="none"
          className="stroke-white stroke-[1]"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />

        {/* Active Traveler Vehicle Marker on Active Stop */}
        {activeStop && (
          <g
            transform={`translate(${activeStop.x}, ${activeStop.y})`}
            className="transition-transform duration-500 ease-out pointer-events-none"
          >
            <circle r={22} className="animate-ping fill-accent-saffron/25" />
            <rect x={-14} y={-10} width={28} height={20} rx={4} className="fill-accent-saffron stroke-white stroke-[1.5]" />
            <rect x={-8} y={-7} width={16} height={6} rx={1} className="fill-text" />
            <circle cx={-8} cy={10} r={3} className="fill-text" />
            <circle cx={8} cy={10} r={3} className="fill-text" />
          </g>
        )}

        {/* Numbered Stop Markers with Accessible Keyboard Focus */}
        <g className="markers-layer">
          {projectedStops.map((stop) => {
            const isActive = activeStopId === stop.id;
            const isWest = stop.id === "rajasthan" || stop.id === "gujarat" || stop.id === "goa";
            const labelX = isWest ? stop.x - 14 : stop.x + 14;
            const textAnchor = isWest ? "end" : "start";

            return (
              <g
                key={stop.id}
                tabIndex={0}
                role="button"
                aria-label={`Highway Stop 0${stop.order}: ${stop.name}, ${stop.stop}`}
                className="cursor-pointer transition-transform duration-150 hover:scale-110 focus:outline-none focus:scale-110"
                onClick={() => onSelectStop?.(stop)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectStop?.(stop);
                  }
                }}
              >
                <circle
                  cx={stop.x}
                  cy={stop.y}
                  r={12}
                  className={
                    isActive
                      ? "fill-accent-saffron stroke-text stroke-[2.5]"
                      : "fill-primary-dark stroke-white stroke-2"
                  }
                />
                <text
                  x={stop.x}
                  y={stop.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={
                    isActive
                      ? "fill-text font-sans text-[10px] font-bold"
                      : "fill-white font-sans text-[10px] font-bold"
                  }
                >
                  {stop.order}
                </text>

                <rect
                  x={textAnchor === "end" ? labelX - 82 : labelX}
                  y={stop.y - 11}
                  width={82}
                  height={22}
                  rx={6}
                  className="fill-surface/95 stroke-border stroke-[0.8] shadow-xs"
                />
                <text
                  x={textAnchor === "end" ? labelX - 41 : labelX + 41}
                  y={stop.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-text font-sans text-[11px] font-semibold"
                >
                  {stop.stop}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
