"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INTRO_TIMING, INTRO_COPY } from "./introConfig";
import { IntroCurtain } from "./IntroCurtain";
import { IntroRoad } from "./IntroRoad";
import { IntroCounter } from "./IntroCounter";
import { VehicleType, VEHICLE_OPTIONS } from "@/hooks/useVehicleChoice";
import { VehicleGraphic } from "@/components/ui/VehicleGraphic";
import { Volume2, VolumeX, FastForward, ArrowRight, Sparkles } from "lucide-react";

interface IntroSequenceProps {
  vehicle?: VehicleType;
  onSelectVehicle?: (v: VehicleType) => void;
  onEnterWithAudio?: () => void;
}

export function IntroSequence({
  vehicle = "suv",
  onSelectVehicle,
  onEnterWithAudio,
}: IntroSequenceProps) {
  const [shouldShow, setShouldShow] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [titleVisible, setTitleVisible] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [videoReady, setVideoReady] = useState<boolean>(false);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  const handleDismiss = useCallback((enableAudio = false) => {
    if (enableAudio && onEnterWithAudio) {
      onEnterWithAudio();
    }
    setIsExiting(true);
    try {
      sessionStorage.setItem(INTRO_TIMING.sessionKey, "true");
    } catch {
      // Ignore storage restrictions
    }
  }, [onEnterWithAudio]);

  useEffect(() => {
    if (!isExiting) return;
    const fallback = setTimeout(() => {
      setShouldShow(false);
    }, (INTRO_TIMING.curtainSlideDuration + 0.1) * 1000);
    return () => clearTimeout(fallback);
  }, [isExiting]);

  const triggerReplay = useCallback(() => {
    setIsExiting(false);
    setTitleVisible(true);
    setShouldShow(true);
  }, []);

  useEffect(() => {
    const onReplay = () => triggerReplay();
    window.addEventListener("nh44-replay-intro", onReplay);
    return () => window.removeEventListener("nh44-replay-intro", onReplay);
  }, [triggerReplay]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("skipIntro") === "1") return;

      const seen = sessionStorage.getItem(INTRO_TIMING.sessionKey);
      if (seen) return;
    } catch {
      // Fallback
    }

    setShouldShow(true);

    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mqMotion.matches);
    setIsMobile(window.innerWidth < 768);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    const titleTimer = setTimeout(() => {
      setTitleVisible(true);
    }, mqMotion.matches ? 80 : INTRO_TIMING.titleFadeStart * 1000);

    const autoDismissTimer = setTimeout(
      () => handleDismiss(false),
      INTRO_TIMING.autoCurtainDelay * 1000
    );

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(titleTimer);
      clearTimeout(autoDismissTimer);
    };
  }, [handleDismiss]);

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <IntroCurtain
        isExiting={isExiting}
        onFinished={() => {
          setShouldShow(false);
        }}
      >
        {/* Subtle Atmospheric HD Aerial Highway Video behind Topographic Contours */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <video
            src="/videos/nh44-aerial-corridor.mp4"
            poster="/images/nh44/00-hero-kashmir-dawn.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onCanPlay={() => setVideoReady(true)}
            className={`h-full w-full object-cover transition-opacity duration-1000 ${
              videoReady && !isExiting ? "opacity-35" : "opacity-0"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B2027]/70 via-[#102A33]/55 to-[#0B2027]/80" />
        </div>

        {/* Top Right Quick Skip */}
        <div className="absolute top-5 right-5 z-40">
          <button
            type="button"
            onClick={() => handleDismiss(false)}
            aria-label="Skip introductory road sequence"
            className="flex items-center gap-1.5 rounded-full border-2 border-[#F29F3D]/60 bg-[#FBF7EE] px-4 py-2 font-sans text-xs sm:text-sm font-bold text-[#102A33] shadow-lg hover:bg-[#FACC15] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]"
          >
            <span>{INTRO_COPY.skipLabel}</span>
            <FastForward className="h-4 w-4 text-[#D95338]" />
          </button>
        </div>

        {/* Full-Bleed Topographic Vector & Milestones */}
        <IntroRoad isMobile={isMobile} reducedMotion={reducedMotion} />

        {/* Centered Vertical Stack: Live Odometer Above Ticket Card */}
        <div className="relative z-30 flex h-full w-full flex-col items-center justify-center gap-4 px-4 sm:px-6 overflow-y-auto py-8">
          <IntroCounter reducedMotion={reducedMotion} />

          {titleVisible && (
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl"
            >
              <div className="relative rounded-[28px] bg-[#FBF7EE]/95 backdrop-blur-md border-2 border-[#F29F3D]/60 p-6 sm:p-9 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.55)] text-center overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#D95338] via-[#F29F3D] to-[#1C6E5A]" />

                <div className="inline-flex items-center gap-2 rounded-full border border-[#F29F3D]/50 bg-[#FEF3C7] px-3.5 py-1 text-xs font-sans font-extrabold uppercase tracking-wider text-[#9A4B14]">
                  <Sparkles className="h-3.5 w-3.5 text-[#D95338]" />
                  <span>India&apos;s Greatest Road Trip · 14 Epic Stops</span>
                </div>

                <h2 className="mt-3 font-serif text-3xl sm:text-5xl font-black tracking-tight text-[#102A33] leading-[1.06]">
                  {INTRO_COPY.title}
                </h2>

                <p className="mt-2.5 mx-auto max-w-lg font-sans text-sm sm:text-base font-medium text-[#37515B] leading-relaxed">
                  Pack your curiosity! Roll 3,810 km from Himalayan snowlines &amp; highway dhabas down to where three oceans collide.
                </p>

                {/* Playful Custom Vehicle Chooser */}
                {onSelectVehicle && (
                  <div className="mt-5">
                    <span className="block font-mono text-[11px] font-bold uppercase tracking-widest text-[#8C6226] mb-2.5">
                      Choose Your Highway Ride
                    </span>
                    <div className="mx-auto max-w-xl grid grid-cols-3 gap-2.5 sm:gap-3">
                      {VEHICLE_OPTIONS.map((opt) => {
                        const active = vehicle === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => onSelectVehicle(opt.id)}
                            className={`group flex flex-col items-center rounded-2xl border-2 p-2.5 sm:p-3 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D] ${
                              active
                                ? "border-[#102A33] bg-[#102A33] text-[#FBF7EE] shadow-lg -translate-y-0.5"
                                : "border-[#E3DAC9] bg-white text-[#102A33] hover:border-[#F29F3D] hover:-translate-y-0.5"
                            }`}
                          >
                            <VehicleGraphic
                              type={opt.id}
                              driving={active && !reducedMotion}
                              className="w-14 h-8 sm:w-16 sm:h-9 mb-1"
                            />
                            <span className="font-sans text-xs sm:text-sm font-bold leading-tight">
                              {opt.label}
                            </span>
                            <span
                              className={`hidden sm:block text-[10px] mt-0.5 ${
                                active ? "text-[#FACC15]" : "text-[#5D7279]"
                              }`}
                            >
                              {opt.tagline}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Joyful Entry Actions */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    ref={primaryBtnRef}
                    type="button"
                    onClick={() => handleDismiss(true)}
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#F29F3D] to-[#E5842A] hover:from-[#FACC15] hover:to-[#F29F3D] px-7 py-3.5 font-sans text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#102A33] shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102A33]"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>{INTRO_COPY.startWithAudioLabel}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDismiss(false)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#102A33]/25 bg-white hover:bg-[#F6EFE0] px-6 py-3.5 font-sans text-sm font-bold text-[#102A33] shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102A33]"
                  >
                    <VolumeX className="h-4 w-4 text-[#5D7279]" />
                    <span>{INTRO_COPY.startSilentLabel}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </IntroCurtain>
    </AnimatePresence>
  );
}
