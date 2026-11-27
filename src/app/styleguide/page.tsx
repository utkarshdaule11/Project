"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";

export default function StyleguidePage() {
  return (
    <div className="min-h-screen bg-[#091522] text-[#F2EBDD] py-16">
      <Container size="default">
        <SectionHeading
          kicker="Design System"
          title="The Grand Bharat Highway Styleguide"
          subtitle="All confirmed luxury expedition palette tokens, typography, radii, and UI primitives."
        />

        {/* Color Palette Section */}
        <section className="mt-12 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#F2EBDD]">
            Confirmed Creative Direction Palette
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            <div className="rounded-2xl border border-[#D9B88F]/25 bg-[#091522] p-4 text-center">
              <div className="h-12 w-full rounded-xl bg-[#091522] border border-[#D9B88F]/30" />
              <p className="mt-2 font-sans text-xs font-bold text-[#F2EBDD]">Midnight Navy</p>
              <p className="text-[11px] text-[#A2B3C4]">#091522</p>
            </div>
            <div className="rounded-2xl border border-[#D9B88F]/25 bg-[#101F2E] p-4 text-center">
              <div className="h-12 w-full rounded-xl bg-[#101F2E] border border-[#D9B88F]/30" />
              <p className="mt-2 font-sans text-xs font-bold text-[#F2EBDD]">Deep Charcoal</p>
              <p className="text-[11px] text-[#A2B3C4]">#101F2E</p>
            </div>
            <div className="rounded-2xl border border-[#D9B88F]/25 bg-[#101F2E] p-4 text-center">
              <div className="h-12 w-full rounded-xl bg-[#D9B88F]" />
              <p className="mt-2 font-sans text-xs font-bold text-[#F2EBDD]">Sandstone</p>
              <p className="text-[11px] text-[#A2B3C4]">#D9B88F</p>
            </div>
            <div className="rounded-2xl border border-[#D9B88F]/25 bg-[#101F2E] p-4 text-center">
              <div className="h-12 w-full rounded-xl bg-[#E9A15C]" />
              <p className="mt-2 font-sans text-xs font-bold text-[#F2EBDD]">Saffron</p>
              <p className="text-[11px] text-[#A2B3C4]">#E9A15C</p>
            </div>
            <div className="rounded-2xl border border-[#D9B88F]/25 bg-[#101F2E] p-4 text-center">
              <div className="h-12 w-full rounded-xl bg-[#F2EBDD] border border-[#D9B88F]/30" />
              <p className="mt-2 font-sans text-xs font-bold text-[#F2EBDD]">Warm Ivory</p>
              <p className="text-[11px] text-[#A2B3C4]">#F2EBDD</p>
            </div>
            <div className="rounded-2xl border border-[#D9B88F]/25 bg-[#101F2E] p-4 text-center">
              <div className="h-12 w-full rounded-xl bg-[#294A3B]" />
              <p className="mt-2 font-sans text-xs font-bold text-[#F2EBDD]">Forest Green</p>
              <p className="text-[11px] text-[#A2B3C4]">#294A3B</p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="mt-12 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#F2EBDD]">Buttons</h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="md">
              Primary Saffron
            </Button>
            <Button variant="secondary" size="md">
              Secondary Surface
            </Button>
            <Button variant="outline" size="md">
              Outline Sandstone
            </Button>
            <Button variant="saffron" size="md">
              Saffron Accent
            </Button>
          </div>
        </section>

        {/* Chips Section */}
        <section className="mt-12 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#F2EBDD]">Chips</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Chip label="NH44 Corridor" variant="primary" />
            <Chip label="3,810 KM Listed" variant="saffron" />
            <Chip label="Verified Geography" variant="green" />
            <Chip label="Checkpoint 01" variant="subtle" />
          </div>
        </section>

        {/* Cards Section */}
        <section className="mt-12 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#F2EBDD]">Cards</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card hoverEffect>
              <h4 className="font-serif text-lg font-bold text-[#F2EBDD]">
                Interactive Card Primitive
              </h4>
              <p className="mt-2 font-sans text-sm text-[#A2B3C4] leading-relaxed">
                Structured with sandstone border token, deep charcoal fill, subtle shadow, and
                smooth hover elevation.
              </p>
            </Card>
            <Card>
              <h4 className="font-serif text-lg font-bold text-[#F2EBDD]">
                Static Surface Card
              </h4>
              <p className="mt-2 font-sans text-sm text-[#A2B3C4] leading-relaxed">
                Clean and minimal content display adhering strictly to design
                system standards.
              </p>
            </Card>
          </div>
        </section>
      </Container>
    </div>
  );
}
