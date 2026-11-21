"use client";

import React, { useState, useEffect } from "react";
import { states } from "@content/states";
import { Button } from "@/components/ui/Button";
import { Compass, ChevronDown, MapPin } from "lucide-react";

export interface NavbarProps {
  activeStopId?: string;
  onSelectStop?: (id: string) => void;
  visitedCount?: number;
}

export function Navbar({
  onSelectStop,
}: NavbarProps) {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ["hero", "interactive-map", "chapters"];
      const scrollPosition = window.scrollY + 160;

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
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-surface/95 shadow-xs backdrop-blur-md border-b border-border"
          : "bg-surface/90 border-b border-border/60"
        }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Logo & Highway Shield */}
        <button
          onClick={() => scrollTo("hero")}
          aria-label="The Grand Bharat Highway - Scroll to top"
          className="flex items-center gap-2.5 sm:gap-3 text-left rounded-xl p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary-dark text-white shadow-xs">
            <Compass className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xs font-bold tracking-tight text-text sm:text-base truncate max-w-[160px] sm:max-w-none">
              The Grand Bharat Highway
            </span>
            <span className="font-sans text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase text-text-muted">
              NH 44 • K2K 3,700 KM
            </span>
          </div>
        </button>

        {/* Anchor Nav with Active-Section Highlighting */}
        <nav
          aria-label="Highway section navigation"
          className="hidden md:flex items-center gap-1 rounded-full border border-border bg-surface-subtle p-1"
        >
          <button
            onClick={() => scrollTo("hero")}
            className={`rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeSection === "hero"
                ? "bg-primary-dark text-white shadow-xs"
                : "text-text-muted hover:text-text hover:bg-surface"
              }`}
          >
            Overview
          </button>

          <button
            onClick={() => scrollTo("interactive-map")}
            className={`rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeSection === "interactive-map"
                ? "bg-primary-dark text-white shadow-xs"
                : "text-text-muted hover:text-text hover:bg-surface"
              }`}
          >
            Route Map
          </button>

          <button
            onClick={() => scrollTo("chapters")}
            className={`rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeSection === "chapters"
                ? "bg-primary-dark text-white shadow-xs"
                : "text-text-muted hover:text-text hover:bg-surface"
              }`}
          >
            6 Chapters
          </button>

          {/* States Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="flex items-center gap-1 rounded-full px-3 py-1.5 font-sans text-xs font-semibold text-text-muted hover:text-text hover:bg-surface transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>Stops</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {menuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-border bg-surface p-2 shadow-lg z-50">
                {states.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(`chapter-${s.id}`)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-sans text-xs transition-colors hover:bg-surface-subtle text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span>
                      0{s.order}. {s.name}
                    </span>
                    <span className="text-[10px] text-text-muted">{s.stop}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <Button
            variant="saffron"
            size="sm"
            onClick={() => scrollTo("interactive-map")}
            className="gap-1.5 px-3 py-1.5 text-xs sm:px-4 sm:py-2"
          >
            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Explore Route</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
