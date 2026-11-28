"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { CheckpointId, NavigationOrigin } from "@/types/state";
import { getJourneyProgress } from "@/data/journeyProgress";
import { VehicleType, VEHICLE_OPTIONS } from "@/hooks/useVehicleChoice";
import { VehicleGraphic } from "@/components/ui/VehicleGraphic";
import {
  ChevronLeft,
  ChevronRight,
  Navigation,
  Volume2,
  VolumeX,
  BellRing,
} from "lucide-react";

interface HighwayCruiseHudProps {
  activeStopId: CheckpointId;
  onSelectStop: (id: CheckpointId, origin?: NavigationOrigin) => void;
  vehicle: VehicleType;
  onSelectVehicle: (v: VehicleType) => void;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
  onPlayHorn?: () => void;
}

/**
 * HighwayCruiseHud — Properly Centered Road-Trip Companion Bar with Animated Vehicle Track
 */
export function HighwayCruiseHud({
  activeStopId,
  onSelectStop,
  vehicle,
  onSelectVehicle,
  audioEnabled = false,
  onToggleAudio,
  onPlayHorn,
}: HighwayCruiseHudProps) {
  const [visible, setVisible] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [honked, setHonked] = useState(false);
  const shouldReduceMotion = useSafeReducedMotion();

  const journey = getJourneyProgress(activeStopId);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 420);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navigateStop = (targetId: CheckpointId | null) => {
    if (!targetId) return;
    onSelectStop(targetId, "nav");
    const el = document.getElementById(`chapter-${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
    }
  };

  const handleHonk = () => {
    onPlayHorn?.();
    setHonked(true);
    setTimeout(() => setHonked(false), 950);
  };

  const currentVehicleObj =
    VEHICLE_OPTIONS.find((v) => v.id === vehicle) || VEHICLE_OPTIONS[2];

  // Clamp mini-track position between 4% and 92% so vehicle graphic stays cleanly inside track
  const trackPct = Math.min(92, Math.max(4, journey.checkpointCountProgressPercent));

  return (
    <AnimatePresence>
      {visible && (
        /* Fixed full-width flex wrapper prevents Framer Motion transform from breaking centering */
        <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-3 pointer-events-none">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            role="region"
            aria-label="Highway Cruise Companion"
            className="relative w-full max-w-3xl pointer-events-auto"
          >
            {/* Mini Live Highway Route Bar above HUD pill */}
            <div className="mx-auto mb-1.5 w-[92%] hidden sm:block">
              <div className="relative h-2 rounded-full bg-[#102A33]/90 border border-[#F29F3D]/50 shadow-md overflow-visible">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FACC15] via-[#F29F3D] to-[#D95338] transition-all duration-500"
                  style={{ width: `${journey.checkpointCountProgressPercent}%` }}
                />
                <div
                  className="absolute -top-4 transition-all duration-500 ease-out"
                  style={{ left: `calc(${trackPct}% - 18px)` }}
                >
                  <VehicleGraphic
                    type={vehicle}
                    driving={!shouldReduceMotion}
                    className="w-9 h-6 drop-shadow"
                  />
                </div>
              </div>
            </div>

            <div className="relative rounded-full border-2 border-[#E3DAC9] bg-[#FBF7EE]/95 backdrop-blur-lg px-2.5 sm:px-3.5 py-2 shadow-[0_18px_40px_-10px_rgba(16,42,51,0.35)] flex items-center justify-between gap-2 sm:gap-3">
              {/* Left: Ride Switcher, Audio & Playful Horn */}
              <div className="relative flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPickerOpen((prev) => !prev)}
                  aria-expanded={pickerOpen}
                  aria-label={`Change expedition vehicle (currently ${currentVehicleObj.label})`}
                  className="flex items-center gap-1.5 rounded-full border border-[#F29F3D]/60 bg-[#FEF3C7] px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#102A33] hover:bg-[#FACC15] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D]"
                >
                  <VehicleGraphic type={vehicle} className="w-7 h-4 shrink-0" />
                  <span className="hidden md:inline whitespace-nowrap">
                    {currentVehicleObj.label}
                  </span>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={handleHonk}
                    title="Honk highway horn!"
                    aria-label="Honk highway horn"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E3DAC9] bg-white text-[#D95338] hover:border-[#D95338] hover:bg-[#FFF1EE] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D95338]"
                  >
                    <BellRing className={`h-3.5 w-3.5 ${honked ? "animate-ping" : ""}`} />
                  </button>
                  {honked && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#102A33] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#FACC15] shadow-md">
                      Beep!
                    </span>
                  )}
                </div>

                {onToggleAudio && (
                  <button
                    type="button"
                    onClick={onToggleAudio}
                    aria-label={audioEnabled ? "Mute highway soundscape" : "Play highway soundscape"}
                    aria-pressed={audioEnabled}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D] ${
                      audioEnabled
                        ? "border-[#1C6E5A] bg-[#1C6E5A] text-[#FACC15]"
                        : "border-[#E3DAC9] bg-white text-[#445A62] hover:border-[#F29F3D]"
                    }`}
                  >
                    {audioEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  </button>
                )}

                {pickerOpen && (
                  <div className="absolute bottom-full left-0 mb-3 w-64 rounded-2xl border-2 border-[#E3DAC9] bg-white p-2 shadow-2xl">
                    <div className="px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#8C6226]">
                      Swap Highway Ride
                    </div>
                    {VEHICLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onSelectVehicle(opt.id);
                          setPickerOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-colors ${
                          vehicle === opt.id
                            ? "bg-[#102A33] text-[#FBF7EE] font-bold"
                            : "text-[#102A33] hover:bg-[#F6EFE0]"
                        }`}
                      >
                        <VehicleGraphic type={opt.id} className="w-9 h-5 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold leading-tight text-xs sm:text-sm">
                            {opt.label}
                          </div>
                          <div
                            className={`text-[10px] ${
                              vehicle === opt.id ? "text-[#FACC15]" : "text-[#5D7279]"
                            }`}
                          >
                            {opt.tagline}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Center: Live Checkpoint & Odometer */}
              <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
                <span className="hidden xs:inline-flex items-center gap-1 font-mono tabular-nums text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#102A33] text-[#FACC15] shrink-0">
                  <Navigation className="h-3 w-3" />
                  {journey.currentIndex < 10 ? `0${journey.currentIndex}` : journey.currentIndex}/14
                </span>
                <div className="min-w-0 text-center sm:text-left">
                  <div className="font-serif text-sm sm:text-base font-extrabold text-[#102A33] truncate">
                    {journey.currentStopName}
                    <span className="hidden lg:inline font-sans font-normal text-[#5D7279] text-xs">
                      {" "}· {journey.currentJurisdiction}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 font-mono text-xs font-extrabold text-[#102A33] tabular-nums bg-[#FACC15]/85 border border-[#E5842A]/50 px-2.5 py-1 rounded-full">
                  {journey.morthMilestoneKm.toLocaleString()} KM
                </div>
              </div>

              {/* Right: Prev / Next Pit-Stop Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={!journey.prevStopId}
                  onClick={() => navigateStop(journey.prevStopId)}
                  aria-label="Cruise to previous checkpoint"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-[#E3DAC9] bg-white text-[#102A33] hover:border-[#F29F3D] disabled:opacity-30 disabled:pointer-events-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={!journey.nextStopId}
                  onClick={() => navigateStop(journey.nextStopId)}
                  aria-label="Cruise to next checkpoint"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#F29F3D] text-[#102A33] hover:bg-[#FACC15] disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102A33]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
