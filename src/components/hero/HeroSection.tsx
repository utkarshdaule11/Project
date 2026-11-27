'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  Compass,
  ArrowDown,
  Navigation,
  MapPin,
  Route,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { heroContent } from '../../../content/states';
import { DynamicHorizon } from './DynamicHorizon';

/**
 * Cinematic Hero Prologue & Dynamic Horizon Staging
 * Phase 1C Step 3: The Grand Bharat Highway (NH44)
 * 
 * Communicates continental scale (3,810 km), forward momentum,
 * geographic zones, and connects seamlessly to the interactive GIS map.
 */
export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Restrained parallax transforms (disabled when prefersReducedMotion is active)
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReducedMotion ? '0%' : '18%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, prefersReducedMotion ? 1 : 0]);

  const scrollToExplorer = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById('corridor-explorer');
    if (target) {
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  const scrollToChapters = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById('chapters');
    if (target) {
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  // Five Physiographic Highway Zones along NH44 corridor
  const physiographicZones = [
    {
      code: '01',
      name: 'Northern Mountain Descent & Submontane Gateway',
      span: 'Srinagar — Jalandhar (Stops 01–02)',
      badge: 'Alpine to Gateway'
    },
    {
      code: '02',
      name: 'Indo-Gangetic Alluvial Plains & Capital',
      span: 'Ludhiana — Delhi (Stops 03–05)',
      badge: 'Alluvial Corridor'
    },
    {
      code: '03',
      name: 'Central Ravines, Bundelkhand & Zero Mile',
      span: 'Gwalior — Nagpur (Stops 06–08)',
      badge: 'Vindhyan & Zero Mile'
    },
    {
      code: '04',
      name: 'Granite Deccan Tablelands & Ghat Passes',
      span: 'Hyderabad — Salem (Stops 09–11)',
      badge: 'Peninsular Craton'
    },
    {
      code: '05',
      name: 'Kaveri Basin, Sangam Plain & Ocean Littoral',
      span: 'Namakkal — Kanyakumari (Stops 12–14)',
      badge: 'Converging Seas'
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] w-full flex flex-col justify-between overflow-hidden bg-earth-950 text-sand-50"
      aria-label="Cinematic Highway Prologue"
    >
      {/* Dynamic Horizon Staging Canvas */}
      <DynamicHorizon />

      {/* Subtle authentic photographic texture blend (Kashmir mountain highway entrance) */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none opacity-20 mix-blend-screen"
        aria-hidden="true"
      >
        <Image
          src="/images/nh44/01-srinagar-dal-lake.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter grayscale contrast-125 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-earth-950 via-earth-950/70 to-transparent" />
      </div>

      {/* Deep atmospheric vignettes & gradient scrims */}
      <div 
        className="absolute inset-0 z-15 pointer-events-none bg-gradient-to-b from-earth-950/80 via-transparent to-earth-950" 
        aria-hidden="true"
      />
      <div 
        className="absolute inset-0 z-15 pointer-events-none radial-vignette opacity-70" 
        aria-hidden="true"
      />

      {/* Top Meta Bar */}
      <header className="relative z-20 pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-between gap-4 py-3 px-5 rounded-full border border-[#D9B88F]/20 bg-[#101F2E]/80 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#E9A15C]/20 border border-[#E9A15C]/40 text-[#E9A15C] font-mono text-xs font-semibold">
              44
            </span>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#D9B88F]">
              <span className="font-semibold text-[#F2EBDD]">National Highway 44</span>
              <span className="text-[#A2B3C4]">•</span>
              <span className="hidden sm:inline text-[#A2B3C4]">North–South Corridor</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#A2B3C4]">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#E9A15C] animate-[spin_20s_linear_infinite]" />
              <span>34°05′N → 08°05′N</span>
            </div>
            <span className="hidden md:inline text-[#D9B88F]/40">|</span>
            <div className="hidden md:flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-[#E9A15C]" />
              <span>3,810 KM Listed Length</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Main Cinematic Prologue Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full my-auto py-12 sm:py-16"
      >
        <div className="max-w-4xl space-y-6 sm:space-y-8">
          {/* Saffron Horizon Kicker */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#E9A15C]/30 bg-[#E9A15C]/10 text-[#E9A15C] text-xs sm:text-sm font-medium tracking-wide backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E9A15C]" />
            <span>The Grand Bharat Highway • Kashmir to Kanyakumari</span>
          </motion.div>

          {/* Master Editorial Title */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-2 sm:space-y-3"
          >
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-normal tracking-tight text-[#F2EBDD] leading-[1.05]">
              KASHMIR TO <br className="hidden sm:inline" />
              <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#F2BC85] via-[#F2EBDD] to-[#E9A15C]">
                KANYAKUMARI.
              </span>
            </h1>
            <p className="text-lg sm:text-2xl font-light text-[#D9B88F] max-w-2xl leading-relaxed">
              3,810 kilometres across the spine of the subcontinent. From Himalayan snowlines to where three oceans meet.
            </p>
          </motion.div>

          {/* Narrative Micro-Manifesto */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base text-[#A2B3C4] max-w-2xl leading-relaxed border-l-2 border-[#E9A15C]/60 pl-4 py-1"
          >
            Trace India&apos;s longest artery through 12 states and union territories, across five great physiographic zones, 
            and over 14 historical checkpoints. Experience the changing terrain, climate, architecture, and living geography.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <a
              href="#corridor-explorer"
              onClick={scrollToExplorer}
              className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-lg bg-gradient-to-r from-[#E9A15C] to-[#D48439] text-[#091522] font-semibold text-sm sm:text-base tracking-wide shadow-lg shadow-[#E9A15C]/20 hover:shadow-[#E9A15C]/35 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E9A15C] focus:ring-offset-2 focus:ring-offset-[#091522]"
            >
              <Navigation className="w-4 h-4 transition-transform group-hover:rotate-45 duration-300" />
              <span>EXPLORE HIGHWAY MAP</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 duration-200" />
            </a>

            <a
              href="#chapters"
              onClick={scrollToChapters}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg border border-[#D9B88F]/30 bg-[#101F2E]/60 hover:bg-[#101F2E]/90 text-[#F2EBDD] font-medium text-sm sm:text-base tracking-wide backdrop-blur-sm hover:border-[#D9B88F]/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D9B88F] focus:ring-offset-2 focus:ring-offset-[#091522]"
            >
              <Layers className="w-4 h-4 text-[#E9A15C]" />
              <span>DISCOVER 14 CHAPTERS</span>
            </a>
          </motion.div>
        </div>

        {/* Five Physiographic Zones Strip */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 pt-8 border-t border-[#D9B88F]/15"
        >
          <div className="flex items-center justify-between mb-3 text-xs tracking-wider uppercase text-[#A2B3C4] font-mono">
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#E9A15C]" />
              Physiographic Highway Zones
            </span>
            <span className="text-[#A2B3C4]/60 hidden sm:inline">North → South Highway Sequence</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {physiographicZones.map((zone) => (
              <div
                key={zone.code}
                className="group relative p-3 rounded-lg border border-[#D9B88F]/15 bg-[#101F2E]/40 hover:bg-[#101F2E]/80 hover:border-[#E9A15C]/40 transition-colors backdrop-blur-sm"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-mono text-[10px] text-[#E9A15C] font-bold">{zone.code}</span>
                  <span className="text-[10px] text-[#A2B3C4] group-hover:text-[#F2EBDD] transition-colors truncate max-w-[90px]">
                    {zone.badge}
                  </span>
                </div>
                <div className="font-medium text-xs text-[#F2EBDD] group-hover:text-[#E9A15C] line-clamp-1">
                  {zone.name}
                </div>
                <div className="text-[11px] text-[#A2B3C4]/80 truncate mt-0.5">
                  {zone.span}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Highway Metrics & Scroll Prompt Footer */}
      <footer className="relative z-20 pb-8 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="pt-6 border-t border-[#D9B88F]/15 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Factual Metrics Strip */}
          <div className="grid grid-cols-4 gap-4 sm:gap-8 w-full sm:w-auto text-left">
            <div>
              <div className="text-lg sm:text-2xl font-serif font-bold text-[#F2EBDD]">
                3,810 KM
              </div>
              <div className="text-[10px] sm:text-xs text-[#A2B3C4] uppercase tracking-wider font-mono">
                Listed Length
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-serif font-bold text-[#F2EBDD]">
                12
              </div>
              <div className="text-[10px] sm:text-xs text-[#A2B3C4] uppercase tracking-wider font-mono">
                States & UTs
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-serif font-bold text-[#F2EBDD]">
                14
              </div>
              <div className="text-[10px] sm:text-xs text-[#A2B3C4] uppercase tracking-wider font-mono">
                Checkpoints
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-serif font-bold text-[#F2EBDD]">
                5
              </div>
              <div className="text-[10px] sm:text-xs text-[#A2B3C4] uppercase tracking-wider font-mono">
                Geographic Zones
              </div>
            </div>
          </div>

          {/* Scroll Down Prompter */}
          <a
            href="#corridor-explorer"
            onClick={scrollToExplorer}
            aria-label="Scroll to highway map explorer"
            className="group inline-flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-[#A2B3C4] hover:text-[#E9A15C] transition-colors focus:outline-none"
          >
            <span>Begin Highway Journey</span>
            <div className="w-8 h-8 rounded-full border border-[#D9B88F]/30 flex items-center justify-center group-hover:border-[#E9A15C] transition-colors">
              <ArrowDown className="w-3.5 h-3.5 text-[#A2B3C4] group-hover:text-[#E9A15C] group-hover:translate-y-0.5 transition-transform" />
            </div>
          </a>
        </div>
      </footer>
    </section>
  );
}

export default HeroSection;
