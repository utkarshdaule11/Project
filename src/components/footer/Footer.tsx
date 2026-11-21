"use client";

import React from "react";
import Link from "next/link";
import { states } from "@content/states";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
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
    <footer className="border-t border-border bg-surface py-16 sm:py-20">
      <Container size="wide">
        {/* Expedition Completion Card */}
        <div className="rounded-3xl border border-accent-saffron/30 bg-surface-subtle p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-saffron text-text font-bold shadow-xs">
            <Compass className="h-7 w-7" />
          </div>

          <h3 className="mt-4 font-serif text-3xl font-bold text-text sm:text-4xl">
            Expedition Complete: K2K 3,700 KM
          </h3>
          <p className="mx-auto mt-2 max-w-2xl font-sans text-sm text-text-muted leading-relaxed sm:text-base">
            From the Pir Panjal mountains of Kashmir to the tri-ocean waters of
            Kanyakumari, you have completed the six-checkpoint expedition along
            India&apos;s historic highway corridor.
          </p>

          {/* 6 State Checkpoint Stamps */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {states.map((s) => (
              <a
                key={s.id}
                href={`#chapter-${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(`chapter-${s.id}`);
                }}
                className="group flex flex-col items-center rounded-2xl border border-border bg-surface p-3 text-center shadow-xs transition-all hover:-translate-y-1 hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-green/15 text-accent-green group-hover:bg-primary/15 group-hover:text-primary transition-colors">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="mt-2 font-sans text-[11px] font-bold text-text">
                  0{s.order}. {s.stop}
                </span>
                <span className="text-[10px] text-text-muted">{s.name}</span>
              </a>
            ))}
          </div>

          {/* Return to Top Button */}
          <div className="mt-8">
            <Button
              variant="saffron"
              size="md"
              onClick={scrollToTop}
              className="gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              <span>Return to Top</span>
            </Button>
          </div>
        </div>

        {/* Footer Navigation & Links */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-border/60 pt-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <span className="font-serif text-sm font-bold text-text">
                The Grand Bharat Highway
              </span>
              <p className="text-[11px] text-text-muted">
                Kashmir to Kanyakumari • NH 44
              </p>
            </div>
          </div>

          <nav aria-label="Footer quick links" className="flex flex-wrap items-center gap-5 text-xs font-semibold text-text-muted">
            <button onClick={() => scrollTo("hero")} className="hover:text-primary transition-colors">
              Overview
            </button>
            <button onClick={() => scrollTo("interactive-map")} className="hover:text-primary transition-colors">
              Route Map
            </button>
            <button onClick={() => scrollTo("chapters")} className="hover:text-primary transition-colors">
              6 Chapters
            </button>
            <Link href="/styleguide" className="hover:text-primary transition-colors">
              Styleguide
            </Link>
            <Link href="/map-test" className="hover:text-primary transition-colors">
              Map Visualizer
            </Link>
          </nav>

          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <MapPin className="h-3.5 w-3.5 text-accent-saffron" />
            <span>3,700 KM • 6 States</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
