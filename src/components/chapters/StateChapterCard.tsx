"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { StateChapter } from "@/types/state";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Compass, Sparkles } from "lucide-react";

interface StateChapterCardProps {
  chapter: StateChapter;
  isEven: boolean;
}

export function StateChapterCard({ chapter, isEven }: StateChapterCardProps) {
  const [landmarkImg, natureImg] = chapter.images;

  // Narrative side: Heading, Tagline, Intro, Two Specialities
  const narrativeContent = (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Chip label={`Stop 0${chapter.order}`} variant="saffron" />
        <span className="flex items-center gap-1 font-sans text-xs font-semibold uppercase tracking-wider text-text-muted">
          <Compass className="h-3.5 w-3.5 text-primary" />
          {chapter.stop}
        </span>
      </div>

      <div>
        <h3 className="font-serif text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {chapter.name}
        </h3>
        <p className="mt-1 font-sans text-sm font-semibold italic text-primary-dark">
          &ldquo;{chapter.tagline}&rdquo;
        </p>
      </div>

      <p className="font-sans text-base leading-relaxed text-text-muted">
        {chapter.intro}
      </p>

      {/* Two State Specialities */}
      <div className="space-y-3 pt-2">
        <h4 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-text">
          <Sparkles className="h-3.5 w-3.5 text-accent-saffron" />
          <span>Two State Specialities</span>
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {chapter.specialities.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-surface-subtle p-3.5"
            >
              <h5 className="font-sans text-xs font-bold text-text">
                {item.title}
              </h5>
              <p className="mt-1 font-sans text-xs leading-relaxed text-text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Images side: Exactly Two Images (1 Landmark + 1 Nature) with captions
  const imagesContent = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Landmark Image */}
      <div className="flex flex-col gap-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-subtle shadow-xs">
          <Image
            src={landmarkImg.src}
            alt={landmarkImg.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
            loading="lazy"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-2.5 left-2.5">
            <span className="rounded-full bg-surface/90 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-primary shadow-xs backdrop-blur-xs">
              Landmark
            </span>
          </div>
        </div>
        <p className="font-sans text-xs font-medium text-text-muted">
          {landmarkImg.caption}
        </p>
      </div>

      {/* Nature Image */}
      <div className="flex flex-col gap-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-subtle shadow-xs">
          <Image
            src={natureImg.src}
            alt={natureImg.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
            loading="lazy"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-2.5 left-2.5">
            <span className="rounded-full bg-surface/90 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-accent-green shadow-xs backdrop-blur-xs">
              Nature
            </span>
          </div>
        </div>
        <p className="font-sans text-xs font-medium text-text-muted">
          {natureImg.caption}
        </p>
      </div>
    </div>
  );

  return (
    <article
      id={`chapter-${chapter.id}`}
      className="relative scroll-mt-28 py-12 sm:py-16"
    >
      {/* Numbered Road Marker Node on Central Highway Line */}
      <div className="flex items-center gap-3 mb-6 lg:mb-10 lg:justify-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-saffron text-text font-bold shadow-xs ring-4 ring-background">
          <span className="font-sans text-xs font-bold tracking-wider">
            0{chapter.order}
          </span>
        </div>
        <div className="rounded-full border border-border bg-surface px-3 py-1 shadow-xs">
          <span className="font-sans text-xs font-semibold text-text">
            {chapter.name} • {chapter.stop}
          </span>
        </div>
      </div>

      {/* Alternating Framer Motion Scroll Container */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <Card className="p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            {isEven ? (
              <>
                <div className="order-2 lg:order-1">{imagesContent}</div>
                <div className="order-1 lg:order-2">{narrativeContent}</div>
              </>
            ) : (
              <>
                <div className="order-1">{narrativeContent}</div>
                <div className="order-2">{imagesContent}</div>
              </>
            )}
          </div>
        </Card>
      </motion.div>
    </article>
  );
}
