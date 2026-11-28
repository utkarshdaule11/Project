"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";

export default function StyleguidePage() {
  return (
    <div className="min-h-screen bg-[#F9F7F6] text-[#12313A] py-16">
      <Container size="default">
        <SectionHeading
          kicker="Design System"
          title="The Grand Bharat Highway Styleguide"
          subtitle="Sunlit Sandstone & Terracotta expedition palette tokens, typography, radii, and high-contrast UI primitives."
        />

        {/* Color Palette Section */}
        <section className="mt-12 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#12313A]">
            Sunlit Sandstone &amp; Terracotta Travel Palette
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            <div className="rounded-2xl border border-[#E3DAC9] bg-white p-4 text-center shadow-sm">
              <div className="h-12 w-full rounded-xl bg-[#F9F7F6] border border-[#E3DAC9]" />
              <p className="mt-2 font-sans text-xs font-bold text-[#12313A]">Travertine Ivory</p>
              <p className="text-[11px] text-[#5D7279]">#F9F7F6</p>
            </div>
            <div className="rounded-2xl border border-[#E3DAC9] bg-white p-4 text-center shadow-sm">
              <div className="h-12 w-full rounded-xl bg-[#F7F3EA] border border-[#E3DAC9]" />
              <p className="mt-2 font-sans text-xs font-bold text-[#12313A]">Warm Sandstone</p>
              <p className="text-[11px] text-[#5D7279]">#F7F3EA</p>
            </div>
            <div className="rounded-2xl border border-[#E3DAC9] bg-white p-4 text-center shadow-sm">
              <div className="h-12 w-full rounded-xl bg-[#12313A]" />
              <p className="mt-2 font-sans text-xs font-bold text-[#12313A]">Espresso Ink</p>
              <p className="text-[11px] text-[#5D7279]">#12313A</p>
            </div>
            <div className="rounded-2xl border border-[#E3DAC9] bg-white p-4 text-center shadow-sm">
              <div className="h-12 w-full rounded-xl bg-[#12313A]" />
              <p className="mt-2 font-sans text-xs font-bold text-[#12313A]">Terracotta</p>
              <p className="text-[11px] text-[#5D7279]">#12313A</p>
            </div>
            <div className="rounded-2xl border border-[#E3DAC9] bg-white p-4 text-center shadow-sm">
              <div className="h-12 w-full rounded-xl bg-[#D6A15D]" />
              <p className="mt-2 font-sans text-xs font-bold text-[#12313A]">Amber Saffron</p>
              <p className="text-[11px] text-[#5D7279]">#D6A15D</p>
            </div>
            <div className="rounded-2xl border border-[#E3DAC9] bg-white p-4 text-center shadow-sm">
              <div className="h-12 w-full rounded-xl bg-[#1B4B52]" />
              <p className="mt-2 font-sans text-xs font-bold text-[#12313A]">Forest Pine</p>
              <p className="text-[11px] text-[#5D7279]">#1B4B52</p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="mt-12 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#12313A]">Buttons</h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="md">
              Primary Terracotta
            </Button>
            <Button variant="secondary" size="md">
              Secondary Surface
            </Button>
            <Button variant="outline" size="md">
              Outline Terracotta
            </Button>
            <Button variant="saffron" size="md">
              Saffron Accent
            </Button>
          </div>
        </section>

        {/* Chips Section */}
        <section className="mt-12 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#12313A]">Chips</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Chip label="NH44 Corridor" variant="primary" />
            <Chip label="3,810 KM Listed" variant="saffron" />
            <Chip label="Verified Geography" variant="green" />
            <Chip label="Checkpoint 01" variant="subtle" />
          </div>
        </section>

        {/* Cards Section */}
        <section className="mt-12 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#12313A]">Cards</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card hoverEffect>
              <h4 className="font-serif text-lg font-bold text-[#12313A]">
                Interactive Card Primitive
              </h4>
              <p className="mt-2 font-sans text-sm text-[#445A62] leading-relaxed">
                Structured with sandstone hairline border, crisp ivory-white surface, and subtle hover elevation.
              </p>
            </Card>
            <Card>
              <h4 className="font-serif text-lg font-bold text-[#12313A]">
                Static Surface Card
              </h4>
              <p className="mt-2 font-sans text-sm text-[#445A62] leading-relaxed">
                Clean, high-contrast content presentation designed for sustained long-form travel reading.
              </p>
            </Card>
          </div>
        </section>
      </Container>
    </div>
  );
}
