"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { states } from "@content/states";
import { StateChapter, GeoJsonData } from "@/types/state";
import {
  CHECKPOINTS_GIS_MAP,
  NH44_LOD_CONFIGS,
} from "@/data/nh44GisData";
import { ZoomIn, ZoomOut, RotateCcw, Layers, Loader2, Info } from "lucide-react";

export type { GeoJsonData };

interface RouteMapProps {
  geoData: GeoJsonData;
  activeStopId?: string;
  onSelectStop?: (stop: StateChapter) => void;
  className?: string;
}

export function RouteMap({
  geoData,
  activeStopId = "srinagar",
  onSelectStop,
  className = "",
}: RouteMapProps) {
  const width = 800;
  const height = 980;

  // Multi-resolution LOD state (default: LOD 1 Balanced - 4,032 vertices)
  const [lodLevel, setLodLevel] = useState<0 | 1 | 2>(1);
  const [lodGeoData, setLodGeoData] = useState<GeoJsonData | null>(null);
  const [lodLoading, setLodLoading] = useState<boolean>(false);
  const lodCache = useRef<Map<number, GeoJsonData>>(new Map());

  // Interactive Zoom and Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Pointer tracking refs for smooth touch/mouse panning and drag suppression
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragMovedRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Fetch / load LOD GeoJSON on level change or mount
  useEffect(() => {
    let isMounted = true;
    const config = NH44_LOD_CONFIGS[lodLevel];

    if (lodCache.current.has(lodLevel)) {
      setLodGeoData(lodCache.current.get(lodLevel)!);
      return;
    }

    setLodLoading(true);
    fetch(config.path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${config.filename}`);
        return res.json();
      })
      .then((data: GeoJsonData) => {
        if (isMounted) {
          lodCache.current.set(lodLevel, data);
          setLodGeoData(data);
          setLodLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load LOD data", err);
        if (isMounted) setLodLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lodLevel]);

  // d3-geo Mercator projection fit to India boundary GeoJSON
  const projection = useMemo(() => {
    return geoMercator().fitSize(
      [width, height],
      geoData as unknown as GeoPermissibleObjects
    );
  }, [geoData]);

  // D3 geoPath generator
  const pathGenerator = useMemo(() => {
    return geoPath().projection(projection);
  }, [projection]);

  // Pre-project India boundaries
  const stateBoundaries = useMemo(() => {
    return geoData.features.map((feature, idx) => {
      const d = pathGenerator(feature as unknown as GeoPermissibleObjects);
      return {
        id: feature.id ?? idx,
        d,
      };
    });
  }, [geoData, pathGenerator]);

  // Project NH44 MultiLineString road geometry
  // D3 naturally emits disjoint subpaths with distinct 'M' commands for all 5 sections,
  // preserving the 4 structural gaps without synthetic straight lines.
  const routePathD = useMemo(() => {
    if (!lodGeoData || !lodGeoData.features || lodGeoData.features.length === 0) {
      return "";
    }
    const highwayFeature = lodGeoData.features[0];
    return pathGenerator(highwayFeature as unknown as GeoPermissibleObjects) || "";
  }, [lodGeoData, pathGenerator]);

  // Project 14 Checkpoints to road coordinates [snappedLng, snappedLat]
  const projectedStops = useMemo(() => {
    return states.map((stop) => {
      const gis = CHECKPOINTS_GIS_MAP.get(stop.id) || {
        id: stop.id,
        order: stop.order,
        name: stop.name,
        jurisdiction: stop.name,
        snappedLat: stop.lat,
        snappedLng: stop.lng,
        centroidLat: stop.lat,
        centroidLng: stop.lng,
        offsetMeters: 0,
        cumulativeHighwayKm: stop.distanceFromStartKm,
        highwayRef: "NH44",
        labelAlign: (stop.lng > 77.5 ? "start" : "end") as "start" | "end",
        labelDx: stop.lng > 77.5 ? 16 : -16,
        labelDy: 4,
        isOrigin: stop.order === 1,
        isTerminus: stop.order === 14,
      };

      const roadCoords = projection([gis.snappedLng, gis.snappedLat]);
      const centroidCoords = projection([gis.centroidLng, gis.centroidLat]);

      return {
        ...stop,
        gis,
        x: roadCoords ? roadCoords[0] : 0,
        y: roadCoords ? roadCoords[1] : 0,
        cx: centroidCoords ? centroidCoords[0] : 0,
        cy: centroidCoords ? centroidCoords[1] : 0,
      };
    });
  }, [projection]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(4, Math.round((z + 0.5) * 10) / 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const next = Math.max(1, Math.round((z - 0.5) * 10) / 10);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Unified Pointer Events for mouse, touch, and stylus panning
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (zoom <= 1) return;
    // For mouse, only respond to primary left button; touch/pen are inherently primary
    if (e.pointerType === "mouse" && e.button !== 0) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    dragMovedRef.current = false;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    activePointerIdRef.current = e.pointerId;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Graceful fallback if setPointerCapture is unsupported
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current || zoom <= 1) return;
    if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) return;

    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    const maxPanX = (width * (zoom - 1)) / 2;
    const maxPanY = (height * (zoom - 1)) / 2;

    const clampedX = Math.max(-maxPanX, Math.min(maxPanX, newX));
    const clampedY = Math.max(-maxPanY, Math.min(maxPanY, newY));

    // Register movement threshold (> 4px) to suppress click selection after drag
    if (Math.hypot(clampedX - pan.x, clampedY - pan.y) > 4) {
      dragMovedRef.current = true;
    }

    setPan({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Safe no-op
      }
      activePointerIdRef.current = null;
      // Brief timeout to suppress immediate click firing from the same pointer interaction
      setTimeout(() => {
        dragMovedRef.current = false;
      }, 60);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Safe no-op
      }
      activePointerIdRef.current = null;
      dragMovedRef.current = false;
    }
  };

  // Center on active checkpoint when selected, if zoomed in
  const focusOnCheckpoint = (stop: (typeof projectedStops)[0], isKeyboard = false) => {
    // If pointer was dragging, prevent accidental selection
    if (!isKeyboard && dragMovedRef.current) {
      return;
    }

    if (onSelectStop) onSelectStop(stop);
    if (zoom > 1) {
      const targetPanX = (width / 2 - stop.x) * (zoom - 1);
      const targetPanY = (height / 2 - stop.y) * (zoom - 1);
      const maxPanX = (width * (zoom - 1)) / 2;
      const maxPanY = (height * (zoom - 1)) / 2;
      setPan({
        x: Math.max(-maxPanX, Math.min(maxPanX, targetPanX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, targetPanY)),
      });
    }
  };

  const currentLodConfig = NH44_LOD_CONFIGS[lodLevel];

  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      {/* Top Map Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: LOD Multi-Resolution Switcher & High-Zoom Guidance */}
        <div className="flex flex-col gap-2 pointer-events-none">
          <div className="pointer-events-auto flex items-center rounded-2xl border border-[#D9B88F]/25 bg-[#091522]/95 backdrop-blur-md p-1 shadow-xl">
            <div className="flex items-center gap-1 px-2 text-[#A2B3C4]">
              <Layers className="h-3.5 w-3.5 text-[#E9A15C]" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
                LOD
              </span>
            </div>

            {([2, 1, 0] as const).map((lvl) => {
              const cfg = NH44_LOD_CONFIGS[lvl];
              const isActive = lodLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setLodLevel(lvl)}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 font-sans text-[11px] font-medium transition-all ${
                    isActive
                      ? "bg-[#E9A15C] text-[#091522] font-bold shadow-sm"
                      : "text-[#F2EBDD]/80 hover:bg-[#142638] hover:text-[#F2EBDD]"
                  }`}
                  title={cfg.description}
                  aria-label={`Switch to ${cfg.label} (${cfg.actualVertices.toLocaleString()} vertices, ${cfg.toleranceDisplay})`}
                >
                  <span>{cfg.shortLabel}</span>
                  <span className="hidden md:inline font-mono text-[9px] opacity-80">
                    ({cfg.actualVertices > 1000 ? `${Math.round(cfg.actualVertices / 1000)}k` : cfg.actualVertices})
                  </span>
                </button>
              );
            })}

            {lodLoading && (
              <div className="px-2">
                <Loader2 className="h-3 w-3 animate-spin text-[#E9A15C]" />
              </div>
            )}
          </div>

          {/* High-Zoom Guidance for LOD 2 (Subtle advisory; no automatic download) */}
          {lodLevel === 2 && zoom >= 2.5 && (
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-auto flex items-center gap-2 rounded-xl border border-[#E9A15C]/40 bg-[#091522]/95 backdrop-blur-md px-3 py-1.5 shadow-xl text-left max-w-[360px]"
            >
              <Info className="h-3.5 w-3.5 text-[#E9A15C] shrink-0" />
              <p className="font-sans text-[10px] text-[#A2B3C4] leading-tight">
                <strong className="text-[#E9A15C]">Overview LOD active:</strong> At {zoom.toFixed(1)}x zoom, consider selecting{" "}
                <button
                  type="button"
                  onClick={() => setLodLevel(1)}
                  className="text-[#E9A15C] font-bold underline hover:text-[#F2EBDD] focus:outline-none focus:ring-1 focus:ring-[#E9A15C]"
                >
                  LOD 1
                </button>{" "}
                or{" "}
                <button
                  type="button"
                  onClick={() => setLodLevel(0)}
                  className="text-[#E9A15C] font-bold underline hover:text-[#F2EBDD] focus:outline-none focus:ring-1 focus:ring-[#E9A15C]"
                >
                  LOD 0
                </button>{" "}
                for turn-by-turn road curves.
              </p>
            </div>
          )}
        </div>

        {/* Right: Zoom & View Controls */}
        <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-[#D9B88F]/25 bg-[#091522]/95 backdrop-blur-md p-1 shadow-xl">
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            className="rounded-xl p-1.5 text-[#F2EBDD]/80 hover:bg-[#142638] hover:text-[#E9A15C] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Zoom In"
            aria-label="Zoom into map"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-[10px] font-bold text-[#D9B88F] px-1 min-w-[28px] text-center">
            {zoom.toFixed(1)}x
          </span>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="rounded-xl p-1.5 text-[#F2EBDD]/80 hover:bg-[#142638] hover:text-[#E9A15C] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Zoom Out"
            aria-label="Zoom out of map"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          {zoom > 1 && (
            <button
              onClick={handleResetView}
              className="rounded-xl p-1.5 text-[#A2B3C4] hover:bg-[#142638] hover:text-[#F2EBDD] transition-colors ml-0.5 border-l border-[#D9B88F]/20 pl-2"
              title="Reset View"
              aria-label="Reset zoom and center view"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SVG Interactive Map with Unified Pointer Events and Conditional Touch-Action */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className={`h-auto w-full select-none ${
          zoom > 1 ? "cursor-grab active:cursor-grabbing touch-none" : "touch-pan-y"
        }`}
        style={{ touchAction: zoom > 1 ? "none" : "pan-y" }}
        role="region"
        aria-label="Interactive map of India displaying verified National Highway 44 centerline geometry and 14 major checkpoints from Srinagar to Kanyakumari"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handlePointerCancel}
      >
        <defs>
          {/* Luminous Highway Spine Outer Radiation Bloom */}
          <filter id="spine-ambient-radiation" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.91  0 1 0 0 0.63  0 0 1 0 0.36  0 0 0 0.7 0" />
          </filter>

          {/* Luminous Highway Spine Core Incandescence */}
          <filter id="spine-core-luminescence" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F4BA7A" floodOpacity="0.95" />
            <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#FFF7ED" floodOpacity="0.8" />
          </filter>

          {/* Saffron highway drop-shadow glow */}
          <filter id="corridor-glow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#E9A15C" floodOpacity="0.85" />
          </filter>

          {/* Active checkpoint pulse aura */}
          <filter id="active-pulse" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#E9A15C" floodOpacity="0.95" />
          </filter>

          {/* Saffron highway linear gradient */}
          <linearGradient id="nh44-core-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5D0A9" />
            <stop offset="35%" stopColor="#E9A15C" />
            <stop offset="85%" stopColor="#E2863B" />
            <stop offset="100%" stopColor="#D97232" />
          </linearGradient>

          {/* Enhanced Luminous Glowing Spine Multi-Stop Gradient */}
          <linearGradient id="nh44-luminous-spine-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF3E0" />
            <stop offset="20%" stopColor="#F4BA7A" />
            <stop offset="55%" stopColor="#E9A15C" />
            <stop offset="85%" stopColor="#E2863B" />
            <stop offset="100%" stopColor="#D97232" />
          </linearGradient>

          {/* Radial oceanic depth background */}
          <radialGradient id="subcontinental-glow" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#101F2E" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#091522" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Background Subtle Radial Tint */}
        <rect width={width} height={height} fill="url(#subcontinental-glow)" />

        {/* Zoom & Pan Container Group */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{
            transformOrigin: `${width / 2}px ${height / 2}px`,
            transition: isDragging ? "none" : "transform 0.25s ease-out",
          }}
        >
          {/* Layer 1: Subcontinental State Boundaries */}
          <g className="states-layer">
            {stateBoundaries.map((b) => {
              if (!b.d) return null;
              return (
                <path
                  key={b.id}
                  d={b.d}
                  className="fill-[#101F2E] stroke-[#D9B88F]/25 stroke-[0.75] transition-colors duration-200 hover:fill-[#14273A]"
                />
              );
            })}
          </g>

          {/* Layer 2: Verified NH44 Road Centerline — Restrained Glowing Highway Spine */}
          {routePathD && (
            <g className="highway-layer">
              {/* Pass 2A: Deep Contrast Road Trench / Base Casing */}
              <path
                d={routePathD}
                fill="none"
                stroke="#050C14"
                strokeWidth={zoom > 2 ? 5.5 : 7.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Pass 2B: Ambient Luminous Spine Bloom (Diffuse Outer Saffron Radiation) */}
              <path
                d={routePathD}
                fill="none"
                stroke="#E9A15C"
                strokeOpacity={0.35}
                strokeWidth={zoom > 2 ? 10 : 15}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#spine-ambient-radiation)"
              />

              {/* Pass 2C: Luminous Amber Phosphor Halo Band */}
              <path
                d={routePathD}
                fill="none"
                stroke="#F4BA7A"
                strokeOpacity={0.65}
                strokeWidth={zoom > 2 ? 3.8 : 5.0}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#corridor-glow)"
              />

              {/* Pass 2D: Primary Incandescent Saffron Spine Core */}
              <path
                d={routePathD}
                fill="none"
                stroke="url(#nh44-luminous-spine-gradient)"
                strokeWidth={zoom > 2 ? 1.8 : 2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#spine-core-luminescence)"
              />

              {/* Pass 2E: Restrained Arterial Luminous Pulse Vector (Respects reduced motion) */}
              <path
                d={routePathD}
                fill="none"
                stroke="#FFF7ED"
                strokeOpacity={0.4}
                strokeWidth={zoom > 2 ? 1.0 : 1.3}
                strokeDasharray="14 36"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="motion-safe:animate-[pulse_3s_ease-in-out_infinite] motion-reduce:animate-none pointer-events-none"
              />
            </g>
          )}

          {/* Layer 3: 14 Major-City Checkpoint Nodes & Collision-Free Labels */}
          <g className="checkpoints-layer">
            {projectedStops.map((stop) => {
              const isActive = stop.id === activeStopId;
              const isOrigin = stop.gis.isOrigin;
              const isTerminus = stop.gis.isTerminus;

              return (
                <g
                  key={stop.id}
                  transform={`translate(${stop.x}, ${stop.y})`}
                  onClick={(e) => {
                    if (dragMovedRef.current) {
                      e.stopPropagation();
                      return;
                    }
                    focusOnCheckpoint(stop, false);
                  }}
                  className="cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  aria-label={`Checkpoint ${stop.order}: ${stop.stop}, ${stop.name} (${stop.gis.cumulativeHighwayKm.toFixed(0)} KM from Srinagar)`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      focusOnCheckpoint(stop, true);
                    }
                  }}
                >
                  {/* Active Radar Spinning Ring (Respects reduced-motion preference via motion-reduce:animate-none) */}
                  {isActive && (
                    <circle
                      r={isOrigin || isTerminus ? 16 : 13}
                      fill="none"
                      stroke="#E9A15C"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      className="animate-spin motion-reduce:animate-none"
                      style={{ animationDuration: "8s", transformOrigin: "center" }}
                    />
                  )}

                  {/* Origin / Terminus Distinct Concentric Outer Ring */}
                  {(isOrigin || isTerminus) && (
                    <circle
                      r={isActive ? 11 : 8.5}
                      fill="none"
                      stroke={isOrigin ? "#E9A15C" : "#D97232"}
                      strokeWidth={isActive ? 2.5 : 1.75}
                      strokeOpacity={0.85}
                    />
                  )}

                  {/* Node Outer Circle */}
                  <circle
                    r={isActive ? 8.5 : isOrigin || isTerminus ? 6.5 : 5}
                    className={`transition-all duration-300 ${
                      isActive
                        ? "fill-[#E9A15C] stroke-[#091522] stroke-2"
                        : isOrigin || isTerminus
                        ? "fill-[#14273A] stroke-[#E9A15C] stroke-2 group-hover:fill-[#E9A15C]"
                        : "fill-[#101F2E] stroke-[#D9B88F] stroke-1.5 group-hover:fill-[#E9A15C] group-hover:stroke-white"
                    }`}
                  />

                  {/* Node Inner Core Dot */}
                  <circle
                    r={isActive ? 3.8 : 2.2}
                    className={
                      isActive
                        ? "fill-[#091522]"
                        : isOrigin || isTerminus
                        ? "fill-[#E9A15C]"
                        : "fill-[#D9B88F]"
                    }
                  />

                  {/* Collision-Free Checkpoint Label */}
                  <g
                    transform={`translate(${stop.gis.labelDx}, ${stop.gis.labelDy})`}
                    className="pointer-events-none"
                  >
                    {/* High-contrast label backdrop pill for legibility */}
                    <text
                      x={0}
                      y={0}
                      textAnchor={stop.gis.labelAlign}
                      dominantBaseline="middle"
                      stroke="#091522"
                      strokeWidth={4}
                      strokeLinejoin="round"
                      className="font-sans text-[10px] font-bold"
                    >
                      {stop.order < 10 ? `0${stop.order}` : stop.order}. {stop.stop}
                      {isOrigin ? " [ORIGIN]" : isTerminus ? " [TERMINUS]" : ""}
                    </text>

                    {/* Primary Label Text */}
                    <text
                      x={0}
                      y={0}
                      textAnchor={stop.gis.labelAlign}
                      dominantBaseline="middle"
                      className={`font-sans text-[10px] tracking-wide transition-all duration-200 ${
                        isActive
                          ? "font-bold fill-[#E9A15C] text-[11px]"
                          : isOrigin || isTerminus
                          ? "font-semibold fill-[#F2EBDD]"
                          : "fill-[#F2EBDD]/85 group-hover:fill-[#F2EBDD]"
                      }`}
                    >
                      {stop.order < 10 ? `0${stop.order}` : stop.order}. {stop.stop}
                      {isOrigin ? " [ORIGIN]" : isTerminus ? " [TERMINUS]" : ""}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Map Legend Overlay (Bottom Left) */}
      <div className="absolute bottom-3 left-3 rounded-2xl border border-[#D9B88F]/25 bg-[#091522]/95 backdrop-blur-md px-3.5 py-2.5 shadow-xl text-left pointer-events-none max-w-[310px]">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-6 rounded-full bg-[#E9A15C] shadow-sm" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#F2EBDD]">
            Verified NH44 Road Geometry
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 font-mono text-[9px] text-[#A2B3C4]">
          <span className="text-[#E9A15C] font-semibold">{currentLodConfig.label}</span>
          <span>·</span>
          <span>{currentLodConfig.actualVertices.toLocaleString()} vertices</span>
          <span>·</span>
          <span>{currentLodConfig.toleranceDisplay}</span>
        </div>
        <p className="mt-1 font-sans text-[9px] text-[#A2B3C4]/90 leading-tight">
          OSM Relation 11568320 · MultiLineString road centerline · 5 sections &amp; 4 verified gaps preserved
        </p>
      </div>

      {/* OpenStreetMap Attribution Pill (Bottom Right) */}
      <div className="absolute bottom-3 right-3 rounded-xl border border-[#D9B88F]/20 bg-[#091522]/90 backdrop-blur-md px-2.5 py-1.5 text-right shadow-lg pointer-events-auto">
        <a
          href="https://www.openstreetmap.org/relation/11568320"
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans text-[9px] text-[#A2B3C4] hover:text-[#E9A15C] transition-colors inline-flex items-center gap-1"
        >
          <span>© OpenStreetMap contributors (ODbL)</span>
        </a>
      </div>
    </div>
  );
}
