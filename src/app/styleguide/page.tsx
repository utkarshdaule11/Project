"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";

export default function StyleguidePage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <Container size="default">
        <SectionHeading
          kicker="Design System"
          title="The Grand Bharat Highway Styleguide"
          subtitle="All semantic color tokens, typography, radii, and UI primitives."
        />

        {/* Color Palette Section */}
        <section className="mt-12 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-text">
            Color Tokens
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
            <div className="rounded-xl border border-border bg-background p-4 text-center">
              <div className="h-12 w-full rounded-lg bg-background border border-border" />
              <p className="mt-2 font-sans text-xs font-bold text-text">Background</p>
              <p className="text-[11px] text-text-muted">#E6F4FA</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <div className="h-12 w-full rounded-lg bg-surface border border-border" />
              <p className="mt-2 font-sans text-xs font-bold text-text">Surface</p>
              <p className="text-[11px] text-text-muted">#FFFFFF</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <div className="h-12 w-full rounded-lg bg-primary" />
              <p className="mt-2 font-sans text-xs font-bold text-text">Primary</p>
              <p className="text-[11px] text-text-muted">#1CA7B8</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <div className="h-12 w-full rounded-lg bg-primary-light" />
              <p className="mt-2 font-sans text-xs font-bold text-text">Primary Light</p>
              <p className="text-[11px] text-text-muted">#5CC8D7</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <div className="h-12 w-full rounded-lg bg-accent-saffron" />
              <p className="mt-2 font-sans text-xs font-bold text-text">Accent Saffron</p>
              <p className="text-[11px] text-text-muted">#F59A4B</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <div className="h-12 w-full rounded-lg bg-accent-green" />
              <p className="mt-2 font-sans text-xs font-bold text-text">Accent Green</p>
              <p className="text-[11px] text-text-muted">#3E9B6A</p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="mt-12 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-text">Buttons</h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="md">
              Primary Button
            </Button>
            <Button variant="secondary" size="md">
              Secondary Button
            </Button>
            <Button variant="outline" size="md">
              Outline Button
            </Button>
            <Button variant="saffron" size="md">
              Saffron Action
            </Button>
          </div>
        </section>

        {/* Chips Section */}
        <section className="mt-12 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-text">Chips</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Chip label="Highway Route" variant="primary" />
            <Chip label="Saffron Route" variant="saffron" />
            <Chip label="Verified Eco" variant="green" />
            <Chip label="Stop 01" variant="subtle" />
          </div>
        </section>

        {/* Cards Section */}
        <section className="mt-12 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-text">Cards</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card hoverEffect>
              <h4 className="font-serif text-lg font-bold text-text">
                Card Primitive
              </h4>
              <p className="mt-2 font-sans text-sm text-text-muted leading-relaxed">
                Structured with border token, surface fill, subtle shadow, and
                smooth hover elevation.
              </p>
            </Card>
            <Card>
              <h4 className="font-serif text-lg font-bold text-text">
                Static Surface Card
              </h4>
              <p className="mt-2 font-sans text-sm text-text-muted leading-relaxed">
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
