"use client";

import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { heroContent } from "@content/states";
import { ArrowDown, MapPin } from "lucide-react";

// Lazy-load React Three Fiber Canvas with ssr: false and lightweight static fallback
const HeroCanvas = dynamic(
  () => import("./HeroCanvas").then((mod) => mod.HeroCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-[360px] w-full sm:h-[440px] md:h-[500px] overflow-hidden rounded-3xl border border-border bg-background shadow-xs">
        <Image
          src={heroContent.fallbackImage.src}
          alt={heroContent.fallbackImage.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-contain p-4 sm:p-8"
        />
      </div>
    ),
  }
);

export function HeroSection() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative pt-24 pb-16 sm:pt-28 sm:pb-20">
      <Container size="wide">
        {/* Eyebrow Kicker */}
        <div className="text-center">
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-primary">
            {heroContent.kicker}
          </span>
        </div>

        {/* Title & Tagline from content store */}
        <div className="mt-4 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-text sm:text-6xl lg:text-7xl">
            {heroContent.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-sans text-base leading-relaxed text-text-muted sm:text-lg">
            {heroContent.tagline}
          </p>
        </div>

        {/* 3 Stat Chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Chip
            label={`${heroContent.stats[0].label}: ${heroContent.stats[0].value}`}
            variant="saffron"
          />
          <Chip
            label={`${heroContent.stats[1].label}: ${heroContent.stats[1].value}`}
            variant="primary"
          />
          <Chip
            label={`${heroContent.stats[2].label}: ${heroContent.stats[2].value}`}
            variant="green"
          />
        </div>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            variant="saffron"
            size="lg"
            onClick={() => scrollTo("interactive-map")}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" />
            <span>Explore Route Map</span>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => scrollTo("chapter-kashmir")}
            className="gap-2"
          >
            <ArrowDown className="h-4 w-4" />
            <span>Begin Highway Journey</span>
          </Button>
        </div>

        {/* 3D Scene / Static Fallback Container */}
        <div className="mt-12">
          <HeroCanvas />
        </div>
      </Container>
    </section>
  );
}
