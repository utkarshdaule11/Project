"use client";

import React, { useState, useEffect } from "react";
import { states } from "@content/states";
import { CheckpointId, NavigationOrigin } from "@/types/state";
import { getJourneyProgress } from "@/data/journeyProgress";
import { Compass, ChevronDown, MapPin, Menu, X, ArrowUpRight, Check, Volume2, VolumeX } from "lucide-react";

export interface NavbarProps {
  activeStopId?: CheckpointId | string;
  onSelectStop?: (id: CheckpointId | string, origin?: NavigationOrigin) => void;
  visitedCount?: number;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
}

export function Navbar({
  activeStopId = "srinagar",
  onSelectStop,
  audioEnabled = false,
  onToggleAudio,
}: NavbarProps) {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  const journey = getJourneyProgress(activeStopId || "srinagar");
  const currentOrder = journey.currentIndex;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = ["hero", "corridor-explorer", "chapters", "finale"];
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
    setMobileDrawerOpen(false);
  };

  const handleSelectCheckpoint = (id: string) => {
    if (onSelectStop) onSelectStop(id, "nav");
    scrollTo(`chapter-${id}`);
  };

  const isOverHero = !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOverHero
          ? "bg-[#102A33]/75 backdrop-blur-md py-3.5 border-b border-white/10 text-[#FBF7EE]"
          : "bg-[#FBF7EE]/95 backdrop-blur-md py-3 border-b border-[#E3DAC9] shadow-sm text-[#102A33]"
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-2 xl:gap-4">
        {/* Brand Identity */}
        <button
          onClick={() => scrollTo("hero")}
          aria-label="The Grand Bharat Highway - Scroll to top"
          className="group flex items-center gap-2.5 sm:gap-3 text-left rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D] min-w-0 lg:shrink-0"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-colors ${
              isOverHero
                ? "bg-[#1C6E5A] border-[#FACC15] text-[#FACC15]"
                : "bg-[#102A33] border-[#F29F3D] text-[#FACC15] shadow-sm"
            }`}
          >
            <Compass className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45" />
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className={`font-serif text-sm sm:text-base xl:text-lg font-black tracking-tight transition-colors whitespace-nowrap ${
                isOverHero ? "text-[#FBF7EE]" : "text-[#102A33]"
              }`}
            >
              The Grand Bharat Highway
            </span>
            <span
              className={`font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase whitespace-nowrap ${
                isOverHero ? "text-[#FACC15]" : "text-[#D95338]"
              }`}
            >
              NH44 · Kashmir to Kanyakumari
            </span>
          </div>
        </button>

        {/* Desktop Anchor Navigation */}
        <nav
          aria-label="Highway section navigation"
          className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0"
        >
          {[
            { id: "hero", label: "Overview" },
            { id: "corridor-explorer", label: "Corridor Map" },
            { id: "chapters", label: "Destinations" },
            { id: "finale", label: "Finale" },
          ].map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`whitespace-nowrap px-3 xl:px-4 py-2 font-sans text-sm font-bold transition-all border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D] ${
                  active
                    ? isOverHero
                      ? "border-[#FACC15] text-[#FACC15]"
                      : "border-[#D95338] text-[#102A33]"
                    : isOverHero
                    ? "border-transparent text-[#FBF7EE]/85 hover:text-[#FACC15]"
                    : "border-transparent text-[#445A62] hover:text-[#102A33]"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Checkpoints Popover Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className={`whitespace-nowrap flex items-center gap-2 rounded-full px-3.5 py-1.5 font-sans text-sm font-bold border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D] ${
                isOverHero
                  ? "border-white/25 bg-white/10 text-[#FBF7EE] hover:border-[#FACC15]"
                  : "border-[#E3DAC9] bg-white text-[#102A33] hover:border-[#F29F3D]"
              }`}
            >
              <span>14 Checkpoints</span>
              <span className="font-mono tabular-nums text-xs bg-[#FACC15] text-[#102A33] px-2 py-0.5 rounded-full font-extrabold">
                {journey.currentIndex}/14
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute top-full right-0 mt-3 w-80 rounded-2xl border-2 border-[#E3DAC9] bg-[#FBF7EE] p-2.5 shadow-2xl z-50 max-h-[460px] overflow-y-auto text-[#102A33]">
                <div className="px-3 py-2 border-b border-[#E3DAC9] mb-1.5 flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#D95338]">
                    Corridor Alignment
                  </span>
                  <span className="font-mono tabular-nums text-xs font-bold text-[#1C6E5A]">
                    {journey.checkpointCountProgressPercent}% South
                  </span>
                </div>
                {states.map((s) => {
                  const isPassed = s.order < currentOrder;
                  const isCurrent = s.id === activeStopId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectCheckpoint(s.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-sans text-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#F29F3D] ${
                        isCurrent
                          ? "bg-[#102A33] text-[#FBF7EE] font-bold shadow-sm"
                          : isPassed
                          ? "text-[#102A33] hover:bg-[#F6EFE0]"
                          : "text-[#445A62] hover:bg-[#F6EFE0] hover:text-[#102A33]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FACC15] text-[#102A33] text-xs font-extrabold">
                            {s.order}
                          </span>
                        ) : isPassed ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E6F4F1] border border-[#99D5C9] text-[#1C6E5A]">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="font-mono tabular-nums text-xs text-[#445A62] w-5 text-center">
                            {s.order < 10 ? `0${s.order}` : s.order}
                          </span>
                        )}
                        <span className={isCurrent ? "text-[#FACC15] font-bold" : ""}>{s.stop}</span>
                      </div>
                      <span className={`text-xs ${isCurrent ? "text-[#E3DAC9]" : "text-[#5D7279]"}`}>
                        {s.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right Audio Toggle, CTA & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {onToggleAudio && (
            <button
              type="button"
              onClick={onToggleAudio}
              aria-label={audioEnabled ? "Mute ambient highway sound" : "Enable ambient highway sound"}
              aria-pressed={audioEnabled}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 font-sans text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D] ${
                audioEnabled
                  ? "border-[#FACC15] bg-[#1C6E5A] text-[#FACC15]"
                  : isOverHero
                  ? "border-white/25 bg-white/10 text-[#FBF7EE] hover:border-[#FACC15]"
                  : "border-[#E3DAC9] bg-white text-[#445A62] hover:border-[#F29F3D] hover:text-[#102A33]"
              }`}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="hidden xl:inline">{audioEnabled ? "Road Vibe On" : "Sound Off"}</span>
            </button>
          )}

          <button
            onClick={() => scrollTo("corridor-explorer")}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F29F3D] to-[#E5842A] hover:from-[#FACC15] hover:to-[#F29F3D] px-5 py-2.5 font-sans text-sm font-extrabold text-[#102A33] shadow-md transition-all hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D]"
          >
            <MapPin className="h-4 w-4" />
            <span>Explore Route</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-label="Toggle mobile menu"
            className={`lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D] ${
              isOverHero
                ? "border-white/25 bg-[#102A33] text-[#FBF7EE]"
                : "border-[#E3DAC9] bg-white text-[#102A33]"
            }`}
          >
            {mobileDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[68px] bottom-0 bg-[#FBF7EE] backdrop-blur-xl border-t border-[#E3DAC9] p-5 overflow-y-auto z-40 text-[#102A33]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 border-b border-[#E3DAC9] pb-4">
              {[
                { id: "hero", label: "Overview" },
                { id: "corridor-explorer", label: "Corridor Explorer" },
                { id: "chapters", label: "Destinations (14 Chapters)" },
                { id: "finale", label: "Kanyakumari Finale" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="flex items-center justify-between rounded-xl p-3 text-left font-serif text-lg font-bold text-[#102A33] hover:bg-[#F6EFE0]"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="h-4 w-4 text-[#D95338]" />
                </button>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#D95338]">
                  Official 14 Checkpoints
                </span>
                <span className="font-mono tabular-nums text-xs font-bold text-[#445A62]">
                  Stop {currentOrder}/14 ({journey.checkpointCountProgressPercent}%)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {states.map((s) => {
                  const isPassed = s.order < currentOrder;
                  const isCurrent = s.id === activeStopId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectCheckpoint(s.id)}
                      className={`flex items-center justify-between rounded-xl border p-3 text-left text-sm font-semibold transition-all ${
                        isCurrent
                          ? "border-[#102A33] bg-[#102A33] text-[#FBF7EE] shadow-sm"
                          : isPassed
                          ? "border-[#99D5C9] bg-white text-[#102A33]"
                          : "border-[#E3DAC9] bg-white text-[#445A62]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isCurrent ? "text-[#FACC15] font-bold" : "text-xs"}>
                          {s.order < 10 ? `0${s.order}` : s.order}
                        </span>
                        <span>{s.stop}</span>
                      </div>
                      <span className={`text-xs ${isCurrent ? "text-[#E3DAC9]" : "text-[#5D7279]"}`}>
                        {s.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vibrant Highway Progress Bar along Navbar Bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-transparent overflow-hidden"
        role="progressbar"
        aria-valuenow={journey.checkpointCountProgressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Highway journey progress: ${journey.checkpointCountProgressPercent}%`}
      >
        <div
          className="h-full bg-gradient-to-r from-[#FACC15] via-[#F29F3D] to-[#D95338] transition-all duration-300 ease-out"
          style={{ width: `${journey.checkpointCountProgressPercent}%` }}
        />
      </div>
    </header>
  );
}
