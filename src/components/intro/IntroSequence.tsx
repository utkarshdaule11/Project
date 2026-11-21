"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INTRO_TIMING, INTRO_COPY } from "./introConfig";
import { IntroCurtain } from "./IntroCurtain";
import { IntroRoad } from "./IntroRoad";
import { IntroCounter } from "./IntroCounter";
import { IntroLandmarks } from "./IntroLandmarks";
import { Button } from "@/components/ui/Button";
import { ArrowRight, FastForward } from "lucide-react";

export function IntroSequence() {
  const [shouldShow, setShouldShow] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [titleVisible, setTitleVisible] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    document.body.style.overflow = "";
    document.documentElement.classList.remove("intro-pending");
    try {
      sessionStorage.setItem(INTRO_TIMING.sessionKey, "true");
    } catch {
      // Ignore storage errors in restricted iframe/private mode
    }
  }, []);

  useEffect(() => {
    // Check sessionStorage
    try {
      const seen = sessionStorage.getItem(INTRO_TIMING.sessionKey);
      if (seen) {
        document.documentElement.classList.remove("intro-pending");
        return;
      }
    } catch {
      // Fallback
    }

    setShouldShow(true);

    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mqMotion.matches);
    setIsMobile(window.innerWidth < 768);

    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Escape key listener to skip immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", handleKeyDown);

    // Title fade-in timer & auto-curtain dismiss
    const titleTimer = setTimeout(() => {
      setTitleVisible(true);
      primaryBtnRef.current?.focus();
    }, mqMotion.matches ? 100 : INTRO_TIMING.titleFadeStart * 1000);

    const autoDismissTimer = setTimeout(
      handleDismiss,
      mqMotion.matches ? 2000 : INTRO_TIMING.autoCurtainDelay * 1000
    );

    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.classList.remove("intro-pending");
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
          document.body.style.overflow = "";
          setShouldShow(false);
        }}
      >
        {/* Preload hero image & resources */}
        <link rel="preload" as="image" href="/images/hero-compass-fallback.svg" />

        {/* Visible Skip Button from First Frame */}
        <div className="absolute top-6 right-6 z-40">
          <button
            onClick={handleDismiss}
            aria-label="Skip introductory road sequence"
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3.5 py-1.5 font-sans text-xs font-semibold text-text shadow-xs backdrop-blur-xs hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>{INTRO_COPY.skipLabel}</span>
            <FastForward className="h-3.5 w-3.5 text-accent-saffron-dark" />
          </button>
        </div>

        {/* 2D Moving Highway Road */}
        <IntroRoad isMobile={isMobile} reducedMotion={reducedMotion} />

        {/* Tabular Eased Counter */}
        <IntroCounter reducedMotion={reducedMotion} />

        {/* Parallax Landmarks Line Art */}
        <IntroLandmarks isMobile={isMobile} reducedMotion={reducedMotion} />

        {/* Title & Start Journey Button Over the Road */}
        {titleVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center pointer-events-auto"
          >
            <div className="max-w-xl rounded-3xl border border-border/80 bg-surface/95 p-8 shadow-xl backdrop-blur-md">
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-text">
                {INTRO_COPY.title}
              </h2>
              <p className="mt-2 font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase text-primary-dark">
                {INTRO_COPY.subtitle} • {INTRO_COPY.targetKm.toLocaleString()} KM
              </p>

              <div className="mt-6 flex justify-center">
                <Button ref={primaryBtnRef} variant="saffron" size="lg" onClick={handleDismiss} className="gap-2 shadow-md">
                  <span>{INTRO_COPY.startLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </IntroCurtain>
    </AnimatePresence>
  );
}
