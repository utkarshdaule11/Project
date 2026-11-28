"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { IntroSequence } from "@/components/intro/IntroSequence";
import { HeroSection } from "@/components/hero/HeroSection";
import { MapSection } from "@/components/map/MapSection";
import { ChaptersList } from "@/components/chapters/ChaptersList";
import { KanyakumariFinale } from "@/components/finale/KanyakumariFinale";
import { HighwayCruiseHud } from "@/components/navigation/HighwayCruiseHud";
import { Footer } from "@/components/footer/Footer";
import { usePassportProgress } from "@/hooks/usePassportProgress";
import { useVehicleChoice } from "@/hooks/useVehicleChoice";
import { useHighwayAudio } from "@/hooks/useHighwayAudio";
import {
  CheckpointId,
  NavigationOrigin,
  isValidCheckpointId,
} from "@/types/state";

export default function HomePage() {
  const [activeStopId, setActiveStopIdState] = useState<CheckpointId>("srinagar");
  const passport = usePassportProgress();
  const { vehicle, selectVehicle } = useVehicleChoice();
  const audio = useHighwayAudio();

  // Programmatic scroll guard to prevent scroll-spy feedback loops during deliberate navigation
  const programmaticTargetRef = useRef<CheckpointId | null>(null);
  const scrollSettleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const armScrollSettleListener = useCallback(() => {
    if (scrollSettleTimeoutRef.current) {
      clearTimeout(scrollSettleTimeoutRef.current);
    }

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

  const handleSelectStop = useCallback(
    (id: CheckpointId | string, origin: NavigationOrigin = "map") => {
      if (!isValidCheckpointId(id)) return;

      setActiveStopIdState(id);

      if (origin === "map" || origin === "nav" || origin === "card") {
        programmaticTargetRef.current = id;

        if (typeof window !== "undefined") {
          window.history.pushState(null, "", `#chapter-${id}`);

          if (origin === "map" || origin === "nav") {
            const el = document.getElementById(`chapter-${id}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
          }
        }

        armScrollSettleListener();
      } else if (origin === "scroll") {
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const parseAndApplyHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#chapter-")) {
        const candidateId = hash.replace("#chapter-", "");
        if (isValidCheckpointId(candidateId)) {
          setActiveStopIdState(candidateId);
          programmaticTargetRef.current = candidateId;
          armScrollSettleListener();
          const el = document.getElementById(`chapter-${candidateId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    };

    parseAndApplyHash();

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
    <div className="min-h-screen bg-[#FBF7EE] text-[#102A33] selection:bg-[#FACC15] selection:text-[#102A33]">
      <IntroSequence
        vehicle={vehicle}
        onSelectVehicle={selectVehicle}
        onEnterWithAudio={audio.startAudio}
      />
      <Navbar
        activeStopId={activeStopId}
        onSelectStop={handleSelectStop}
        visitedCount={14}
        audioEnabled={audio.audioEnabled}
        onToggleAudio={audio.toggleAudio}
      />
      <main>
        <HeroSection
          onSelectStop={handleSelectStop}
          vehicle={vehicle}
          onSelectVehicle={selectVehicle}
          onPlayChime={audio.playStampChime}
        />
        <MapSection
          activeStopId={activeStopId}
          onSelectStop={handleSelectStop}
          onPlayChime={audio.playStampChime}
        />
        <ChaptersList
          activeStopId={activeStopId}
          onSelectStop={handleSelectStop}
          programmaticTargetRef={programmaticTargetRef}
          onExploreCheckpoint={passport.markCheckpointExplored}
          isExplored={passport.isExplored}
          vehicle={vehicle}
          onPlayChime={audio.playStampChime}
        />
        <KanyakumariFinale
          activeStopId={activeStopId}
          onSelectStop={handleSelectStop}
          exploredIds={passport.exploredIds}
          summary={passport.summary}
          isHydrated={passport.isHydrated}
          markCheckpointExplored={passport.markCheckpointExplored}
          resetProgress={passport.resetProgress}
          isExplored={passport.isExplored}
        />
      </main>
      <Footer />
      <HighwayCruiseHud
        activeStopId={activeStopId}
        onSelectStop={handleSelectStop}
        vehicle={vehicle}
        onSelectVehicle={selectVehicle}
        audioEnabled={audio.audioEnabled}
        onToggleAudio={audio.toggleAudio}
        onPlayHorn={audio.playHornBeep}
      />
    </div>
  );
}
