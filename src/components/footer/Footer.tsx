"use client";

import React from "react";
import Link from "next/link";
import { states } from "@content/states";
import { Container } from "@/components/ui/Container";
import { Compass, ArrowUp, CheckCircle2, MapPin } from "lucide-react";

export function Footer() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[#D9B88F]/20 bg-[#091522] py-20 text-[#F2EBDD]">
      <Container size="wide">
        {/* Expedition Completion Card */}
        <div className="rounded-3xl border border-[#D9B88F]/30 bg-[#101F2E] p-8 text-center sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D9B88F] via-[#E9A15C] to-[#294A3B]" />

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9A15C] text-[#091522] font-bold shadow-xl">
            <Compass className="h-7 w-7" />
          </div>

          <h3 className="mt-6 font-serif text-3xl font-bold text-[#F2EBDD] sm:text-5xl">
            The Subcontinental Highway Spine
          </h3>
          <p className="mx-auto mt-4 max-w-2xl font-sans text-sm sm:text-base leading-relaxed text-[#A2B3C4]">
            From the Pir Panjal mountains of Kashmir to the tri-ocean waters of
            Kanyakumari, explore the complete 14-checkpoint national corridor along
            NH44 — 3,810 KM through India&apos;s extraordinary cultural and geographical landscape.
          </p>

          {/* 14 Checkpoint Stamp Grid */}
          <div className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-7">
            {states.map((s) => (
              <a
                key={s.id}
                href={`#chapter-${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(`chapter-${s.id}`);
                }}
                className="group flex flex-col items-center rounded-2xl border border-[#D9B88F]/15 bg-[#142638] p-3 text-center shadow-md transition-all hover:-translate-y-1 hover:border-[#E9A15C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C]"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E9A15C]/15 text-[#E9A15C] group-hover:bg-[#E9A15C] group-hover:text-[#091522] transition-colors">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span className="mt-2 font-mono text-[11px] font-bold text-[#F2EBDD]">
                  {s.order < 10 ? `0${s.order}` : s.order}. {s.stop}
                </span>
                <span className="text-[10px] text-[#A2B3C4] truncate max-w-[90px]">{s.name}</span>
              </a>
            ))}
          </div>

          {/* Return to Top Button */}
          <div className="mt-10">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 rounded-full bg-[#E9A15C] px-6 py-3 font-sans text-xs font-bold uppercase tracking-wider text-[#091522] shadow-xl hover:bg-[#F2BC85] transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A15C]"
            >
              <ArrowUp className="h-4 w-4" />
              <span>Return to Northern Terminus</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation & Credits */}
        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-[#D9B88F]/15 pt-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#101F2E] border border-[#D9B88F]/30 text-[#E9A15C]">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <span className="font-serif text-sm font-bold text-[#F2EBDD]">
                The Grand Bharat Highway
              </span>
              <p className="text-[11px] text-[#D9B88F]">
                NH44 · Srinagar to Kanyakumari
              </p>
            </div>
          </div>

          <nav aria-label="Footer quick links" className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#A2B3C4]">
            <button onClick={() => scrollTo("hero")} className="hover:text-[#E9A15C] transition-colors">
              Overview
            </button>
            <button onClick={() => scrollTo("corridor-explorer")} className="hover:text-[#E9A15C] transition-colors">
              Corridor Explorer
            </button>
            <button onClick={() => scrollTo("chapters")} className="hover:text-[#E9A15C] transition-colors">
              14 Destinations
            </button>
            <Link href="/styleguide" className="hover:text-[#E9A15C] transition-colors">
              Design System
            </Link>
            <Link href="/map-test" className="hover:text-[#E9A15C] transition-colors">
              Map Visualizer
            </Link>
          </nav>

          <div className="flex items-center gap-2 text-xs font-mono text-[#D9B88F]">
            <MapPin className="h-3.5 w-3.5 text-[#E9A15C]" />
            <span>3,810 KM Listed · 14 Checkpoints</span>
          </div>
        </div>

        {/* Footnote & Provenance Disclaimer */}
        <div className="mt-8 border-t border-[#D9B88F]/10 pt-6 text-center sm:text-left">
          <p className="font-sans text-[11px] leading-relaxed text-[#A2B3C4]/70 max-w-4xl">
            <strong className="text-[#D9B88F]">Geospatial & Data Provenance Notice:</strong> The 3,810 KM figure reflects the official Srinagar–Kanyakumari National Corridor alignment listed under Ministry of Road Transport and Highways (MoRTH) Annexure II(d). Checkpoint milestone distances, municipal coordinates, and elevations are geographic and editorial estimates for expedition storytelling, not a surveyed turn-by-turn road centerline.
          </p>
        </div>
      </Container>
    </footer>
  );
}
