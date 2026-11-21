"use client";

import React, { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { HeroCompassScene } from "./HeroCompassScene";
import { heroContent } from "@content/states";

function checkWebGlSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function HeroCanvas() {
  const [useFallback, setUseFallback] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isMobile = window.innerWidth < 768;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const hasWebGl = checkWebGlSupport();

    if (isMobile || reducedMotion || !hasWebGl) {
      setUseFallback(true);
    } else {
      setUseFallback(false);
    }
  }, []);

  // Static Fallback Image View for mobile / no WebGL / reduced motion / SSR
  if (!mounted || useFallback) {
    return (
      <div className="relative h-[360px] w-full sm:h-[440px] md:h-[500px] overflow-hidden rounded-3xl border border-border bg-background shadow-xs">
        <Image
          src={heroContent.fallbackImage.src}
          alt={heroContent.fallbackImage.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-contain p-4 sm:p-8"
        />
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-border bg-surface/80 px-3 py-1 backdrop-blur-sm">
          <span className="font-sans text-[11px] font-semibold text-text-muted">
            NH 44 Compass & Highway Corridor
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[360px] w-full sm:h-[440px] md:h-[500px] overflow-hidden rounded-3xl border border-border bg-background shadow-xs">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-surface-subtle">
            <span className="font-sans text-xs font-semibold tracking-wider uppercase text-text-muted">
              Loading 3D Compass & Route...
            </span>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 4.5, 6], fov: 42 }}
          shadows
          className="h-full w-full"
        >
          <HeroCompassScene />
        </Canvas>
      </Suspense>

      <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-border bg-surface/80 px-3 py-1 backdrop-blur-sm">
        <span className="font-sans text-[11px] font-semibold text-text-muted">
          3D Compass & Highway Spline
        </span>
      </div>
    </div>
  );
}
