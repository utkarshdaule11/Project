"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { HeroSection } from "@/components/hero/HeroSection";
import { MapSection } from "@/components/map/MapSection";
import { ChaptersList } from "@/components/chapters/ChaptersList";
import { Footer } from "@/components/footer/Footer";
import {
  CheckpointId,
  NavigationOrigin,
  isValidCheckpointId,
} from "@/types/state";

export default function HomePage() {
  const [activeStopId, setActiveStopIdState] = useState<CheckpointId>("srinagar");

  // Programmatic scroll guard to prevent scroll-spy feedback loops during deliberate navigation
  const programmaticTargetRef = useRef<CheckpointId | null>(null);
  const scrollSettleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Arm listener to detect when programmatic smooth-scroll has settled.
   * Does not assume a fixed timer; checks for scroll event cessation (idle debounce)
   * while maintaining a safety timeout fallback for reduced-motion instant jumps.
   */
  const armScrollSettleListener = useCallback((targetId: CheckpointId) => {
    if (scrollSettleTimeoutRef.current) {
      clearTimeout(scrollSettleTimeoutRef.current);
    }

    // Safety timeout in case scroll events are not emitted (e.g. instant scroll under reduced motion)
    const safetyTimeout = setTimeout(() => {
      programmaticTargetRef.current = null;
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", checkScrollIdle);
      }
    }, 1200);

    let idleTimer: NodeJS.Timeout | null = null;
    const checkScrollIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        programmaticTargetRef.current = null;
        clearTimeout(safetyTimeout);
        if (typeof window !== "undefined") {
          window.removeEventListener("scroll", checkScrollIdle);
        }
      }, 150);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", checkScrollIdle, { passive: true });
    }
    scrollSettleTimeoutRef.current = safetyTimeout;
  }, []);

  /**
   * Central coordinator for selecting an active checkpoint.
   * Handles deliberate user actions (map, nav, card clicks) vs natural viewport scrolling.
   */
  const handleSelectStop = useCallback(
    (id: CheckpointId | string, origin: NavigationOrigin = "map") => {
      if (!isValidCheckpointId(id)) return;

      setActiveStopIdState(id);

      if (origin === "map" || origin === "nav" || origin === "card") {
        // Deliberate user action: engage programmatic guard and record browser history entry
        programmaticTargetRef.current = id;

        if (typeof window !== "undefined") {
          // Push history entry for deliberate checkpoint selection
          window.history.pushState(null, "", `#chapter-${id}`);

          // If coming from map or nav, smooth scroll to the target chapter card
          if (origin === "map" || origin === "nav") {
            const el = document.getElementById(`chapter-${id}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
          }
        }

        armScrollSettleListener(id);
      } else if (origin === "scroll") {
        // Natural viewport scrolling: update address bar with replaceState (no history spam)
        if (typeof window !== "undefined") {
          const currentHash = window.location.hash;
          if (currentHash !== `#chapter-${id}`) {
            window.history.replaceState(null, "", `#chapter-${id}`);
          }
        }
      }
    },
    [armScrollSettleListener]
  );

  /**
   * Deep Link & History Restoration:
   * 1. On initial mount, reads `#chapter-{id}` from URL if present.
   * 2. Listens for browser back/forward buttons (popstate and hashchange).
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const parseAndApplyHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#chapter-")) {
        const candidateId = hash.replace("#chapter-", "");
        if (isValidCheckpointId(candidateId)) {
          setActiveStopIdState(candidateId);
          programmaticTargetRef.current = candidateId;
          armScrollSettleListener(candidateId);
          // Initial scroll to deep-linked chapter
          const el = document.getElementById(`chapter-${candidateId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    };

    // Parse on initial mount
    parseAndApplyHash();

    // Listen for browser Back and Forward navigation
    window.addEventListener("hashchange", parseAndApplyHash);
    window.addEventListener("popstate", parseAndApplyHash);

    return () => {
      window.removeEventListener("hashchange", parseAndApplyHash);
      window.removeEventListener("popstate", parseAndApplyHash);
      if (scrollSettleTimeoutRef.current) {
        clearTimeout(scrollSettleTimeoutRef.current);
      }
    };
  }, [armScrollSettleListener]);

  return (
    <div className="min-h-screen bg-[#091522] text-[#F2EBDD] selection:bg-[#E9A15C] selection:text-[#091522]">
      <Navbar
        activeStopId={activeStopId}
        onSelectStop={handleSelectStop}
        visitedCount={14}
      />
      <main>
        <HeroSection />
        <MapSection
          activeStopId={activeStopId}
          onSelectStop={handleSelectStop}
        />
        <ChaptersList
          activeStopId={activeStopId}
          onSelectStop={handleSelectStop}
          programmaticTargetRef={programmaticTargetRef}
        />
      </main>
      <Footer />
    </div>
  );
}
