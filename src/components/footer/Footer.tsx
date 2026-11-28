"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Compass, MapPin, ShieldCheck } from "lucide-react";

/**
 * Phase 1C Step 5: Footer (Sunlit Sandstone & Terracotta Clean Colophon)
 */
export function Footer() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      id="site-footer"
      className="border-t border-[#E3DAC9] bg-[#F7F3EA] py-14 sm:py-20 text-[#12313A]"
    >
      <Container size="wide">
        {/* Main Colophon Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-[#D8CEBC]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E3DAC9] text-[#12313A] shadow-sm">
              <Compass className="h-5 w-5 text-[#12313A]" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#12313A]">
                The Grand Bharat Highway
              </h3>
              <p className="font-sans text-xs font-medium text-[#8C6226]">
                NH44 · Srinagar to Kanyakumari · 3,810 KM Listed Benchmark
              </p>
            </div>
          </div>

          {/* Quick Anchor Navigation */}
          <nav
            aria-label="Footer quick links"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-[#445A62]"
          >
            <button
              onClick={() => scrollTo("hero")}
              className="hover:text-[#12313A] transition-colors focus:outline-none focus-visible:underline"
            >
              Overview
            </button>
            <button
              onClick={() => scrollTo("corridor-explorer")}
              className="hover:text-[#12313A] transition-colors focus:outline-none focus-visible:underline"
            >
              Corridor Explorer
            </button>
            <button
              onClick={() => scrollTo("chapters")}
              className="hover:text-[#12313A] transition-colors focus:outline-none focus-visible:underline"
            >
              14 Destinations
            </button>
            <button
              onClick={() => scrollTo("finale")}
              className="text-[#8C6226] hover:text-[#12313A] transition-colors focus:outline-none focus-visible:underline font-bold"
            >
              Kanyakumari Finale
            </button>
            <Link
              href="/styleguide"
              className="hover:text-[#12313A] transition-colors focus:outline-none focus-visible:underline"
            >
              Design System
            </Link>
            <Link
              href="/map-test"
              className="hover:text-[#12313A] transition-colors focus:outline-none focus-visible:underline"
            >
              Map Visualizer
            </Link>
          </nav>
        </div>

        {/* Provenance, Licensing & Disclaimers */}
        <div className="pt-8 space-y-4 text-sm font-sans text-[#445A62] leading-relaxed">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm font-sans text-[#12313A]">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#12313A]" />
              <span>3,810 KM Listed Benchmark · 3,613.79 KM Checkpoint Projection Reference</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#1B4B52]" />
              <span>100% Cryptographic GIS &amp; Basemap Invariance</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm max-w-4xl">
            <strong className="text-[#12313A]">Geospatial &amp; Data Provenance Notice:</strong> The 3,810 KM figure reflects the official Srinagar–Kanyakumari National Corridor alignment listed under Ministry of Road Transport and Highways (MoRTH) Annexure II(d). Checkpoint milestone distances, municipal coordinates, and elevations are geographic and editorial estimates for expedition storytelling, not a surveyed turn-by-turn road centerline.
          </p>

          <p className="text-xs sm:text-sm max-w-4xl text-[#5D7279]">
            All 14 checkpoint photographs are locally hosted Creative Commons / Public Domain verified assets sourced via Wikimedia Commons with attribution preserved in the project image licensing ledger.
          </p>
        </div>
      </Container>
    </footer>
  );
}
