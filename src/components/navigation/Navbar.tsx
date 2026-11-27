"use client";

import React, { useState, useEffect } from "react";
import { states } from "@content/states";
import { CheckpointId, NavigationOrigin, isValidCheckpointId } from "@/types/state";
import { getJourneyProgress } from "@/data/journeyProgress";
import { Compass, ChevronDown, MapPin, Menu, X, ArrowUpRight, Check } from "lucide-react";

export interface NavbarProps {
  activeStopId?: CheckpointId | string;
  onSelectStop?: (id: CheckpointId | string, origin?: NavigationOrigin) => void;
  visitedCount?: number;
}

export function Navbar({ activeStopId = "srinagar", onSelectStop }: NavbarProps) {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  // Derive pure, non-mutating journey progression metrics
  const journey = getJourneyProgress(activeStopId || "srinagar");
  const currentOrder = journey.currentIndex;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      const sections = ["hero", "corridor-explorer", "chapters"];
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#091522]/90 backdrop-blur-md border-b border-[#D9B88F]/20 py-3 shadow-xl"
          : "bg-gradient-to-b from-[#091522]/90 via-[#091522]/40 to-transparent py-5 border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <button
          onClick={() => scrollTo("hero")}
          aria-label="The Grand Bharat Highway - Scroll to top"
          className="group flex items-center gap-2.5 sm:gap-3 text-left rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C] min-w-0"
        >
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#101F2E] border border-[#D9B88F]/30 text-[#E9A15C] shadow-md group-hover:border-[#E9A15C] transition-colors">
            <Compass className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-500 group-hover:rotate-45 text-[#E9A15C]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-serif text-xs sm:text-base font-bold tracking-tight text-[#F2EBDD] group-hover:text-[#E9A15C] transition-colors truncate">
              THE GRAND BHARAT HIGHWAY
            </span>
            <span className="font-sans text-[9px] sm:text-[11px] font-semibold tracking-wider sm:tracking-widest uppercase text-[#D9B88F]/90 truncate">
              NH44 · KASHMIR TO KANYAKUMARI
            </span>
          </div>
        </button>

        {/* Desktop Anchor Navigation */}
        <nav
          aria-label="Highway section navigation"
          className="hidden lg:flex items-center gap-1.5 rounded-full border border-[#D9B88F]/20 bg-[#101F2E]/80 backdrop-blur-md px-2 py-1.5 shadow-lg"
        >
          <button
            onClick={() => scrollTo("hero")}
            className={`rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C] ${
              activeSection === "hero"
                ? "bg-[#E9A15C] text-[#091522] font-bold shadow-sm"
                : "text-[#F2EBDD]/80 hover:text-[#F2EBDD] hover:bg-[#142638]"
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => scrollTo("corridor-explorer")}
            className={`rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C] ${
              activeSection === "corridor-explorer"
                ? "bg-[#E9A15C] text-[#091522] font-bold shadow-sm"
                : "text-[#F2EBDD]/80 hover:text-[#F2EBDD] hover:bg-[#142638]"
            }`}
          >
            Corridor Explorer
          </button>

          <button
            onClick={() => scrollTo("chapters")}
            className={`rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C] ${
              activeSection === "chapters"
                ? "bg-[#E9A15C] text-[#091522] font-bold shadow-sm"
                : "text-[#F2EBDD]/80 hover:text-[#F2EBDD] hover:bg-[#142638]"
            }`}
          >
            Destinations
          </button>

          {/* Checkpoints Popover Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold text-[#D9B88F] hover:text-[#F2EBDD] hover:bg-[#142638] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C]"
            >
              <span>14 Checkpoints</span>
              <span className="font-mono text-[10px] text-[#E9A15C] bg-[#E9A15C]/15 px-1.5 py-0.2 rounded-full border border-[#E9A15C]/30">
                {journey.currentIndex}/14
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute top-full right-0 mt-3 w-80 rounded-2xl border border-[#D9B88F]/30 bg-[#101F2E]/95 p-2 shadow-2xl backdrop-blur-xl z-50 max-h-[460px] overflow-y-auto">
                <div className="px-3 py-2 border-b border-[#D9B88F]/15 mb-1.5 flex items-center justify-between">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#D9B88F]">
                    Corridor Alignment
                  </span>
                  <span className="font-mono text-[10px] text-[#A2B3C4]">
                    {journey.checkpointCountProgressPercent}% Completed
                  </span>
                </div>
                {states.map((s) => {
                  const isPassed = s.order < currentOrder;
                  const isCurrent = s.id === activeStopId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectCheckpoint(s.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-sans text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E9A15C] ${
                        isCurrent
                          ? "bg-[#142638] text-[#E9A15C] font-bold border border-[#E9A15C]/40 shadow-sm"
                          : isPassed
                          ? "text-[#F2EBDD]/80 hover:bg-[#142638]/70 hover:text-[#F2EBDD]"
                          : "text-[#A2B3C4] hover:bg-[#142638] hover:text-[#F2EBDD]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E9A15C] text-[#091522] text-[9px] font-bold">
                            {s.order}
                          </span>
                        ) : isPassed ? (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#294A3B]/40 border border-[#294A3B] text-[#D9B88F]">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-[#A2B3C4]/60 w-4 text-center">
                            {s.order < 10 ? `0${s.order}` : s.order}
                          </span>
                        )}
                        <span className={isCurrent ? "text-[#E9A15C] font-bold" : ""}>{s.stop}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#A2B3C4]">{s.name}</span>
                        {isCurrent && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#E9A15C] animate-pulse" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right CTA & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => scrollTo("corridor-explorer")}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#E9A15C] px-3.5 sm:px-4 py-2 font-sans text-xs font-bold text-[#091522] shadow-md hover:bg-[#F2BC85] transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C]"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Explore Route</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#D9B88F]/30 bg-[#101F2E]/80 text-[#F2EBDD] hover:bg-[#142638] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C]"
          >
            {mobileDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bottom-0 bg-[#091522]/98 backdrop-blur-2xl border-t border-[#D9B88F]/20 p-5 overflow-y-auto z-40 animate-in fade-in duration-200">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 border-b border-[#D9B88F]/20 pb-4">
              <button
                onClick={() => scrollTo("hero")}
                className="flex items-center justify-between rounded-xl p-3 text-left font-serif text-lg font-bold text-[#F2EBDD] hover:bg-[#101F2E]"
              >
                <span>Overview</span>
                <ArrowUpRight className="h-4 w-4 text-[#D9B88F]" />
              </button>
              <button
                onClick={() => scrollTo("corridor-explorer")}
                className="flex items-center justify-between rounded-xl p-3 text-left font-serif text-lg font-bold text-[#F2EBDD] hover:bg-[#101F2E]"
              >
                <span>Corridor Explorer</span>
                <ArrowUpRight className="h-4 w-4 text-[#D9B88F]" />
              </button>
              <button
                onClick={() => scrollTo("chapters")}
                className="flex items-center justify-between rounded-xl p-3 text-left font-serif text-lg font-bold text-[#F2EBDD] hover:bg-[#101F2E]"
              >
                <span>Destinations (14 Chapters)</span>
                <ArrowUpRight className="h-4 w-4 text-[#D9B88F]" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#D9B88F]">
                  Official 14 Checkpoints
                </span>
                <span className="font-mono text-[10px] text-[#A2B3C4]">
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
                      className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs font-semibold transition-all ${
                        isCurrent
                          ? "border-[#E9A15C] bg-[#142638] text-[#E9A15C] shadow-md"
                          : isPassed
                          ? "border-[#294A3B]/40 bg-[#101F2E] text-[#F2EBDD]/90 hover:border-[#D9B88F]"
                          : "border-[#D9B88F]/15 bg-[#101F2E]/60 text-[#A2B3C4] hover:border-[#D9B88F]/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E9A15C] text-[#091522] text-[9px] font-bold">
                            {s.order}
                          </span>
                        ) : isPassed ? (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#294A3B]/40 border border-[#294A3B] text-[#D9B88F]">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        ) : (
                          <span className="font-mono text-[#D9B88F] text-[10px] mr-0.5">
                            {s.order < 10 ? `0${s.order}` : s.order}
                          </span>
                        )}
                        <span className={isCurrent ? "font-bold text-[#E9A15C]" : ""}>{s.stop}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#A2B3C4]">{s.name}</span>
                        {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-[#E9A15C] animate-pulse" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtle 2px Journey Progression Indicator along the Navbar bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#101F2E] overflow-hidden"
        role="progressbar"
        aria-valuenow={journey.checkpointCountProgressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Highway journey progress: ${journey.checkpointCountProgressPercent}%`}
      >
        <div
          className="h-full bg-gradient-to-r from-[#D9B88F] via-[#E9A15C] to-[#E9A15C] transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${journey.checkpointCountProgressPercent}%` }}
        />
      </div>
    </header>
  );
}
