"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { HeroSection } from "@/components/hero/HeroSection";
import { MapSection } from "@/components/map/MapSection";
import { ChaptersList } from "@/components/chapters/ChaptersList";
import { Footer } from "@/components/footer/Footer";

export default function HomePage() {
  const [activeStopId, setActiveStopId] = useState<string>("kashmir");

  return (
    <div className="min-h-screen bg-background text-text selection:bg-accent-saffron selection:text-white">
      <Navbar
        activeStopId={activeStopId}
        onSelectStop={setActiveStopId}
        visitedCount={6}
      />
      <main>
        <HeroSection />
        <MapSection
          activeStopId={activeStopId}
          onSelectStop={setActiveStopId}
        />
        <ChaptersList />
      </main>
      <Footer />
    </div>
  );
}
