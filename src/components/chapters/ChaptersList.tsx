"use client";

import React from "react";
import { states } from "@content/states";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StateChapterCard } from "./StateChapterCard";

export function ChaptersList() {
  return (
    <section id="chapters" className="relative py-20 sm:py-24 bg-surface/40 overflow-hidden">
      <Container size="wide">
        <SectionHeading
          kicker="State Chapters"
          title="Six Stories Along the Subcontinental Spine"
          subtitle="A continuous highway from Kashmir down to Kanyakumari. Follow the road line south through all six checkpoints."
        />

        {/* Continuous Highway Road Line with Dashed Center running down the section */}
        <div className="relative mt-12 sm:mt-16">
          {/* Desktop Central Vertical Road Line */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 rounded-full bg-road-surface/15"
          >
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 border-r-2 border-dashed border-accent-saffron/80" />
          </div>

          {/* Mobile Left-Aligned Vertical Road Line */}
          <div
            aria-hidden="true"
            className="lg:hidden absolute left-5 top-0 bottom-0 w-2.5 rounded-full bg-road-surface/15"
          >
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 border-r-2 border-dashed border-accent-saffron/80" />
          </div>

          {/* Chapter Cards along the highway */}
          <div className="relative z-10 space-y-4">
            {states.map((chapter, idx) => (
              <StateChapterCard
                key={chapter.id}
                chapter={chapter}
                isEven={idx % 2 === 1}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
