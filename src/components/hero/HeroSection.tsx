"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import {
  MapPin,
  Compass,
  Dices,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Navigation,
  Play,
  Pause,
  Film,
  ArrowDown,
} from "lucide-react";
import { BiomeId, CheckpointId, NavigationOrigin } from "@/types/state";
import { states } from "@content/states";
import { VehicleType, VEHICLE_OPTIONS } from "@/hooks/useVehicleChoice";
import { VehicleGraphic } from "@/components/ui/VehicleGraphic";

interface HeroSectionProps {
  onSelectStop?: (id: CheckpointId, origin?: NavigationOrigin) => void;
  vehicle?: VehicleType;
  onSelectVehicle?: (v: VehicleType) => void;
  onPlayChime?: () => void;
}

interface HeroReelItem {
  kind: "video" | "image";
  src: string;
  poster?: string;
  alt: string;
  caption: string;
  mile: string;
  vibe: string;
}

const HERO_BACKDROP_REEL: HeroReelItem[] = [
  {
    kind: "video",
    src: "/videos/nh44-dawn-drive.mp4",
    poster: "/images/nh44/00-hero-kashmir-dawn.jpg",
    alt: "HD scenic highway dawn drive curving through sunlit mountain passes",
    caption: "Golden Dawn Drive · Mountain Ghat Bend",
    mile: "LIVE HD",
    vibe: "Sunrise Highway Cruise",
  },
  {
    kind: "video",
    src: "/videos/nh44-aerial-corridor.mp4",
    poster: "/images/nh44/03-ludhiana-mustard.jpg",
    alt: "HD aerial view gliding over a lush green divided highway across fertile plains",
    caption: "Aerial Highway · Subcontinental Spine",
    mile: "AERIAL HD",
    vibe: "Open Four-Lane Corridor",
  },
  {
    kind: "image",
    src: "/images/nh44/00-hero-kashmir-peaks.jpg",
    alt: "Snow-capped Himalayan peaks and emerald valley at Kashmir gateway of NH44",
    caption: "Kashmir · Himalayan Gateway",
    mile: "KM 0",
    vibe: "Alpine Snowlines & Kahwa",
  },
  {
    kind: "image",
    src: "/images/nh44/14-kanyakumari-sunrise.jpg",
    alt: "Radiant morning ocean sunrise at Cape Comorin, Kanyakumari",
    caption: "Kanyakumari · Converging Seas",
    mile: "KM 3,810",
    vibe: "Three Oceans Collide",
  },
];

// Independent Polaroid showcase cycling destination snapshots (never duplicates hero backdrop)
const POLAROID_POSTCARDS: {
  stopId: CheckpointId;
  src: string;
  alt: string;
  title: string;
  mile: string;
  vibe: string;
}[] = [
  {
    stopId: "srinagar",
    src: "/images/nh44/01-srinagar-dal-lake.webp",
    alt: "Sunrise over Dal Lake with shikaras in Srinagar",
    title: "Srinagar · Dal Lake",
    mile: "KM 0",
    vibe: "Shikaras & Saffron Kahwa",
  },
  {
    stopId: "ludhiana",
    src: "/images/nh44/03-ludhiana-mustard.jpg",
    alt: "Golden mustard fields along the Punjab plains",
    title: "Ludhiana · Punjab Plains",
    mile: "KM 360",
    vibe: "Mustard Fields & Dhabas",
  },
  {
    stopId: "delhi",
    src: "/images/nh44/05-delhi-humayuns-tomb.webp",
    alt: "Red sandstone facade of Humayun's Tomb in New Delhi",
    title: "Delhi · Imperial Pivot",
    mile: "KM 780",
    vibe: "Sandstone & Old Delhi Chai",
  },
  {
    stopId: "hyderabad",
    src: "/images/nh44/09-hyderabad-charminar.jpg",
    alt: "Charminar rising in historic Hyderabad",
    title: "Hyderabad · Deccan Jewel",
    mile: "KM 2,130",
    vibe: "Charminar & Hyderabadi Biryani",
  },
  {
    stopId: "kanyakumari",
    src: "/images/nh44/14-kanyakumari-rock-memorial.webp",
    alt: "Vivekananda Rock Memorial at Kanyakumari",
    title: "Kanyakumari · Cape Comorin",
    mile: "KM 3,810",
    vibe: "Three Oceans Converge",
  },
];

const MARQUEE_TICKER_ITEMS = [
  { km: "KM 0", text: "SRINAGAR · SHIKARA DAWN" },
  { km: "KM 360", text: "LUDHIANA · GOLDEN MUSTARD & DHABAS" },
  { km: "KM 780", text: "DELHI · IMPERIAL CAPITAL" },
  { km: "KM 1,100", text: "GWALIOR · HILLTOP CITADEL" },
  { km: "KM 1,630", text: "NAGPUR · ZERO MILE OF INDIA" },
  { km: "KM 2,130", text: "HYDERABAD · CHARMINAR & BIRYANI" },
  { km: "KM 2,700", text: "BENGALURU · GARDEN BOULEVARDS" },
  { km: "KM 3,340", text: "MADURAI · TEMPLE TOWERS" },
  { km: "KM 3,810", text: "KANYAKUMARI · THREE OCEANS" },
];

/**
 * HeroSection — Optimized Full-Bleed HD Video Road-Trip Opening & Postcard Deck
 */
export function HeroSection({
  onSelectStop,
  vehicle = "suv",
  onSelectVehicle,
  onPlayChime,
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroViewportRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const prefersReducedMotion = useSafeReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [polaroidIdx, setPolaroidIdx] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [saveDataMode, setSaveDataMode] = useState(false);
  const [isInView, setIsInView] = useState(true);

  const [selectedZone, setSelectedZone] = useState<BiomeId>("himalayan-alpine");
  const [selectedStop, setSelectedStop] = useState<CheckpointId>("srinagar");
  const [rollingStop, setRollingStop] = useState<boolean>(false);

  // Mark client mounted & respect Save-Data network preference (prevents SSR hydration mismatch)
  useEffect(() => {
    setMounted(true);
    try {
      const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
      if (conn?.saveData) setSaveDataMode(true);
    } catch {
      // Ignore unsupported connection API
    }
  }, []);

  // Auto-pause offscreen hero video for silky 60fps scrolling across map & chapters
  useEffect(() => {
    const el = heroViewportRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (!isInView || videoPaused) {
      vid.pause();
    } else {
      void vid.play().catch(() => {
        // Autoplay fallback handled smoothly by poster image underneath
      });
    }
  }, [isInView, videoPaused, slideIdx, mounted]);

  // Cycle Polaroid destination postcards smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setPolaroidIdx((prev) => (prev + 1) % POLAROID_POSTCARDS.length);
    }, 4600);
    return () => clearInterval(timer);
  }, []);

  // Reset video fade readiness when switching video reels
  useEffect(() => {
    setVideoReady(false);
  }, [slideIdx]);

  const zoneCards: {
    id: BiomeId;
    firstStopId: CheckpointId;
    code: string;
    name: string;
    hook: string;
    span: string;
    kmSpan: string;
    tilt: string;
    stampColor: string;
    img: string;
  }[] = [
    {
      id: "himalayan-alpine",
      firstStopId: "srinagar",
      code: "01",
      name: "Mountain Descent",
      hook: "Snow tunnels, pine gorges & saffron bowls",
      span: "Srinagar — Jalandhar",
      kmSpan: "0–245 KM",
      tilt: "lg:-rotate-1",
      stampColor: "bg-[#1C6E5A] text-[#FACC15]",
      img: "/images/nh44/00-hero-kashmir-peaks.jpg",
    },
    {
      id: "indo-gangetic",
      firstStopId: "ludhiana",
      code: "02",
      name: "Indo-Gangetic Plains",
      hook: "Mustard horizons, tandoori dhabas & Delhi",
      span: "Ludhiana — Delhi",
      kmSpan: "360–780 KM",
      tilt: "lg:rotate-1",
      stampColor: "bg-[#F29F3D] text-[#102A33]",
      img: "/images/nh44/03-ludhiana-mustard.jpg",
    },
    {
      id: "central-india",
      firstStopId: "gwalior",
      code: "03",
      name: "Central & Zero Mile",
      hook: "Sandstone forts, tiger flyways & Zero Mile",
      span: "Gwalior — Nagpur",
      kmSpan: "1,100–1,630 KM",
      tilt: "lg:-rotate-1",
      stampColor: "bg-[#D95338] text-white",
      img: "/images/nh44/06-gwalior-fort.jpg",
    },
    {
      id: "deccan-tablelands",
      firstStopId: "hyderabad",
      code: "04",
      name: "Deccan Tablelands",
      hook: "Granite tors, royal biryani & misty ghat passes",
      span: "Hyderabad — Salem",
      kmSpan: "2,130–2,900 KM",
      tilt: "lg:rotate-1",
      stampColor: "bg-[#102A33] text-[#F29F3D]",
      img: "/images/nh44/09-hyderabad-charminar.jpg",
    },
    {
      id: "southern-basins",
      firstStopId: "namakkal",
      code: "05",
      name: "Kaveri to Three Seas",
      hook: "Gopuram skylines, filter coffee & ocean surf",
      span: "Namakkal — Kanyakumari",
      kmSpan: "2,980–3,810 KM",
      tilt: "lg:-rotate-1",
      stampColor: "bg-[#0E7490] text-[#FEF3C7]",
      img: "/images/nh44/14-kanyakumari-rock-memorial.webp",
    },
  ];

  const handleSelectZone = (zoneId: BiomeId, firstStopId: CheckpointId) => {
    onPlayChime?.();
    if (onSelectStop) onSelectStop(firstStopId, "nav");
    const el =
      document.getElementById(`zone-${zoneId}`) ||
      document.getElementById(`chapter-${firstStopId}`);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  };

  const handleDockExplore = () => {
    onPlayChime?.();
    if (onSelectStop) onSelectStop(selectedStop, "nav");
    const target =
      document.getElementById(`chapter-${selectedStop}`) ||
      document.getElementById(`zone-${selectedZone}`);
    if (target) {
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  };

  const handleSurprisePitStop = () => {
    onPlayChime?.();
    setRollingStop(true);
    const random = states[Math.floor(Math.random() * states.length)];
    const targetId = random.id as CheckpointId;
    setSelectedStop(targetId);
    setSelectedZone(random.biome.id);
    setTimeout(() => {
      setRollingStop(false);
      if (onSelectStop) onSelectStop(targetId, "nav");
      const el = document.getElementById(`chapter-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
    }, 360);
  };

  const currentSlide = HERO_BACKDROP_REEL[slideIdx];
  const currentPolaroid = POLAROID_POSTCARDS[polaroidIdx];
  const currentRideObj = VEHICLE_OPTIONS.find((v) => v.id === vehicle) || VEHICLE_OPTIONS[2];
  const allowVideo = mounted && !saveDataMode && currentSlide.kind === "video";

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full overflow-x-clip bg-[#FBF7EE] text-[#102A33]"
      aria-label="Himalayan Dawn and Highway Launchpad"
    >
      {/* PART 1: CINEMATIC FULL-BLEED HD VIDEO OPENING */}
      <div
        ref={heroViewportRef}
        className="relative min-h-[86vh] sm:min-h-[90vh] w-full flex items-center bg-[#0B2027] pt-24 pb-24 sm:pb-28 overflow-hidden"
      >
        {/* Instant LCP Poster Image Layer + Streaming HD Video Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={currentSlide.poster || currentSlide.src}
            alt={currentSlide.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          {allowVideo && (
            <video
              ref={videoRef}
              key={currentSlide.src}
              src={currentSlide.src}
              poster={currentSlide.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              onCanPlay={() => setVideoReady(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out ${
                videoReady ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Cinematic Warm Vignette & Legible Gradient Scrims */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#091C23]/90 via-[#0E2730]/55 to-[#091C23]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091C23]/90 via-transparent to-[#091C23]/55" />
        </div>

        {/* Hero Foreground Grid */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative & Joyful CTAs */}
            <div className="lg:col-span-7 space-y-5">
              {/* Highway Shield + Live HD Film Badge */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55 }}
                className="inline-flex flex-wrap items-center gap-2.5"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1C6E5A] border-2 border-[#FACC15] px-3 py-1 font-mono text-xs font-extrabold tracking-widest text-[#FACC15] shadow-md">
                  NH 44
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102A33]/80 border border-[#F29F3D]/40 backdrop-blur-md px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-[#FACC15]">
                  <Film className="h-3 w-3 text-[#F29F3D]" />
                  <span>India&apos;s Great North–South Road Trip</span>
                </span>
              </motion.div>

              <motion.h1
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.06 }}
                className="font-serif text-5xl sm:text-6xl lg:text-[78px] font-black tracking-tight text-[#FBF7EE] leading-[1.0] drop-shadow-2xl"
              >
                Kashmir to{" "}
                <span className="block italic font-bold text-[#F29F3D] mt-1">
                  Kanyakumari.
                </span>
              </motion.h1>

              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.14 }}
                className="font-sans text-base sm:text-xl text-[#F6EFE0] max-w-xl leading-relaxed drop-shadow"
              >
                Roll down the windows for 3,810 kilometres across 12 states, 14 iconic pit-stops, chai dhabas, mountain tunnels, and three converging oceans.
              </motion.p>

              {/* High-Energy Action Buttons */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.22 }}
                className="flex flex-wrap items-center gap-3 pt-2"
              >
                <a
                  href="#chapters"
                  onClick={(e) => {
                    e.preventDefault();
                    onPlayChime?.();
                    document.getElementById("chapters")?.scrollIntoView({
                      behavior: prefersReducedMotion ? "auto" : "smooth",
                    });
                  }}
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F29F3D] to-[#E5842A] hover:from-[#FACC15] hover:to-[#F29F3D] px-7 py-3.5 font-sans text-sm sm:text-base font-extrabold text-[#102A33] shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FBF7EE]"
                >
                  <span>Start Driving South</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>

                <button
                  type="button"
                  onClick={handleSurprisePitStop}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#D95338] hover:bg-[#C24229] px-5 py-3.5 font-sans text-sm font-bold text-white shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]"
                >
                  <Dices className={`h-4 w-4 ${rollingStop ? "animate-spin" : "group-hover:rotate-12 transition-transform"}`} />
                  <span>Surprise Pit-Stop</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("nh44-replay-intro"));
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#FBF7EE]/35 bg-[#102A33]/70 hover:bg-[#102A33] px-4 py-3.5 font-sans text-sm font-semibold text-[#FBF7EE] backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D]"
                >
                  <RotateCcw className="h-4 w-4 text-[#F29F3D]" />
                  <span>Replay Intro</span>
                </button>
              </motion.div>

              {/* Interactive Backdrop Reel Switcher + Video Play/Pause Control */}
              <div className="pt-3 flex flex-wrap items-center gap-2.5">
                {allowVideo && (
                  <button
                    type="button"
                    onClick={() => setVideoPaused((p) => !p)}
                    aria-label={videoPaused ? "Play background highway video" : "Pause background highway video"}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#FACC15]/60 bg-[#102A33]/80 text-[#FACC15] hover:bg-[#FACC15] hover:text-[#102A33] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]"
                  >
                    {videoPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                  </button>
                )}

                {HERO_BACKDROP_REEL.map((s, idx) => (
                  <button
                    key={s.src}
                    type="button"
                    onClick={() => {
                      setSlideIdx(idx);
                      setVideoPaused(false);
                    }}
                    aria-label={`Switch hero backdrop to ${s.caption}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === slideIdx
                        ? "w-9 bg-[#FACC15]"
                        : "w-2.5 bg-[#FBF7EE]/45 hover:bg-[#FBF7EE]/80"
                    }`}
                  />
                ))}
                <span className="ml-1 font-mono text-xs font-bold text-[#FACC15] bg-[#102A33]/80 px-2.5 py-0.5 rounded-full border border-[#F29F3D]/35 backdrop-blur-sm">
                  {currentSlide.mile} · {currentSlide.caption}
                </span>
              </div>
            </div>

            {/* Right Interactive Destination Polaroid Showcase (Cycles Distinct Corridor Snapshots!) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col items-end gap-4">
              <motion.button
                type="button"
                onClick={() => {
                  onPlayChime?.();
                  if (onSelectStop) onSelectStop(currentPolaroid.stopId, "nav");
                  document.getElementById(`chapter-${currentPolaroid.stopId}`)?.scrollIntoView({
                    behavior: prefersReducedMotion ? "auto" : "smooth",
                  });
                }}
                initial={prefersReducedMotion ? false : { opacity: 0, rotate: 2, y: 16 }}
                animate={{ opacity: 1, rotate: 2, y: 0 }}
                whileHover={prefersReducedMotion ? undefined : { rotate: 0, scale: 1.025 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-sm text-left rounded-3xl bg-[#FBF7EE] p-4 shadow-[0_28px_60px_-15px_rgba(0,0,0,0.7)] border-2 border-[#F29F3D]/65 text-[#102A33] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#102A33]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPolaroid.src}
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={currentPolaroid.src}
                        alt={currentPolaroid.alt}
                        fill
                        sizes="380px"
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute top-3 left-3 rounded-full bg-[#FACC15] px-3 py-1 font-mono text-xs font-extrabold text-[#102A33] shadow">
                    {currentPolaroid.mile} · {currentPolaroid.title}
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-full bg-[#102A33]/90 backdrop-blur-md px-3 py-1 font-sans text-xs font-bold text-[#FBF7EE] border border-[#F29F3D]/40">
                    {currentPolaroid.vibe}
                  </div>
                </div>
                <div className="mt-3.5 flex items-center justify-between gap-3 px-1">
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#D95338]">
                      Active Expedition Rig
                    </span>
                    <span className="block font-serif text-base font-bold text-[#102A33] truncate">
                      {currentRideObj.label}
                    </span>
                  </div>
                  <VehicleGraphic
                    type={vehicle}
                    driving={!prefersReducedMotion}
                    className="w-16 h-10 shrink-0"
                  />
                </div>
              </motion.button>

              {/* Subtle Scroll Beacon */}
              <a
                href="#corridor-explorer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("corridor-explorer")?.scrollIntoView({
                    behavior: prefersReducedMotion ? "auto" : "smooth",
                  });
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#102A33]/75 backdrop-blur-md border border-white/20 px-4 py-1.5 font-mono text-[11px] font-bold text-[#FACC15] hover:bg-[#102A33] transition-colors mr-2"
              >
                <span>Scroll to Cruise South</span>
                <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* PART 2: INTERACTIVE ROAD-TRIP COPILOT LAUNCHER BAR */}
      <div className="relative z-30 -mt-11 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl border-2 border-[#E3DAC9] bg-white p-3.5 sm:p-4 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Quick Ride Switcher Pills */}
          <div className="md:col-span-4 flex flex-col gap-1">
            <span className="px-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#8C6226]">
              Your Ride
            </span>
            <div className="grid grid-cols-3 gap-1.5 bg-[#F6EFE0] p-1 rounded-2xl border border-[#E3DAC9]">
              {VEHICLE_OPTIONS.map((opt) => {
                const active = vehicle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onPlayChime?.();
                      onSelectVehicle?.(opt.id);
                    }}
                    title={opt.label}
                    className={`flex items-center justify-center gap-1 rounded-xl py-2 px-1.5 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D] ${
                      active
                        ? "bg-[#102A33] text-[#FACC15] shadow-sm"
                        : "text-[#445A62] hover:text-[#102A33] hover:bg-white/70"
                    }`}
                  >
                    <VehicleGraphic type={opt.id} className="w-7 h-4 shrink-0" />
                    <span className="truncate">{opt.id === "sedan" ? "Sedan" : opt.id === "cruiser" ? "Bike" : "4×4"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region Select */}
          <label className="md:col-span-3 flex items-center gap-2.5 rounded-2xl bg-[#FBF7EE] border border-[#E3DAC9] px-3.5 py-2.5 cursor-pointer hover:border-[#F29F3D] transition-colors">
            <Compass className="h-4 w-4 text-[#D95338] shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#5D7279]">
                Biome Zone
              </span>
              <select
                aria-label="Filter by highway region"
                value={selectedZone}
                onChange={(e) => {
                  const zoneId = e.target.value as BiomeId;
                  setSelectedZone(zoneId);
                  const first = states.find((s) => s.biome.id === zoneId);
                  if (first) setSelectedStop(first.id as CheckpointId);
                }}
                className="w-full bg-transparent text-sm font-bold text-[#102A33] focus:outline-none cursor-pointer"
              >
                {zoneCards.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
          </label>

          {/* Stop Select */}
          <label className="md:col-span-3 flex items-center gap-2.5 rounded-2xl bg-[#FBF7EE] border border-[#E3DAC9] px-3.5 py-2.5 cursor-pointer hover:border-[#F29F3D] transition-colors">
            <MapPin className="h-4 w-4 text-[#1C6E5A] shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#5D7279]">
                Pit-Stop (01–14)
              </span>
              <select
                aria-label="Jump to city checkpoint"
                value={selectedStop}
                onChange={(e) => setSelectedStop(e.target.value as CheckpointId)}
                className="w-full bg-transparent text-sm font-bold text-[#102A33] focus:outline-none cursor-pointer"
              >
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.order < 10 ? `0${s.order}` : s.order} · {s.stop}
                  </option>
                ))}
              </select>
            </div>
          </label>

          {/* Go Action */}
          <button
            type="button"
            onClick={handleDockExplore}
            className="md:col-span-2 w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#1C6E5A] hover:bg-[#155646] px-4 py-3.5 font-sans text-sm font-extrabold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D]"
          >
            <Navigation className="h-4 w-4 text-[#FACC15]" />
            <span>Hit Stop</span>
          </button>
        </div>
      </div>

      {/* PART 3: HIGH-ENERGY ASPHALT HIGHWAY MARQUEE RIBBON */}
      <div className="mt-10 bg-[#102A33] border-y-4 border-[#FACC15] py-3.5 overflow-hidden select-none">
        <div className="animate-highway-marquee flex items-center gap-8">
          {[...MARQUEE_TICKER_ITEMS, ...MARQUEE_TICKER_ITEMS].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 shrink-0">
              <span className="rounded bg-[#FACC15] px-2 py-0.5 font-mono text-xs font-black text-[#102A33]">
                {item.km}
              </span>
              <span className="font-sans text-xs sm:text-sm font-extrabold tracking-widest text-[#FBF7EE] uppercase">
                {item.text}
              </span>
              <Sparkles className="h-3.5 w-3.5 text-[#F29F3D] ml-3" />
            </div>
          ))}
        </div>
      </div>

      {/* PART 4: TILTED VINTAGE TRAVEL POSTCARD DECK */}
      <div className="bg-[#FBF7EE] py-14 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#D95338]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Five Scenic Biomes · One Endless Road</span>
              </span>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-black text-[#102A33]">
                Postcards Along the Spine
              </h2>
            </div>
            <a
              href="#chapters"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("chapters")?.scrollIntoView({
                  behavior: prefersReducedMotion ? "auto" : "smooth",
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#102A33] bg-white px-5 py-2.5 font-sans text-sm font-bold text-[#102A33] hover:bg-[#102A33] hover:text-[#FACC15] transition-colors shadow-sm"
            >
              <span>Browse All 14 Chapters</span>
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {zoneCards.map((zone) => (
              <motion.button
                key={zone.id}
                type="button"
                onClick={() => handleSelectZone(zone.id, zone.firstStopId)}
                whileHover={prefersReducedMotion ? undefined : { y: -6, rotate: 0, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className={`group text-left rounded-3xl border-2 border-[#E3DAC9] bg-white p-2.5 shadow-md hover:shadow-2xl hover:border-[#F29F3D] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F29F3D] ${zone.tilt}`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#F6EFE0]">
                  <Image
                    src={zone.img}
                    alt={`${zone.name} scenic preview`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102A33]/70 via-transparent to-transparent" />
                  <span
                    className={`absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-extrabold shadow ${zone.stampColor}`}
                  >
                    ZONE {zone.code}
                  </span>
                  <span className="absolute bottom-2 right-2.5 rounded-md bg-[#FBF7EE]/95 px-2 py-0.5 font-mono text-[10px] font-bold text-[#102A33]">
                    {zone.kmSpan}
                  </span>
                </div>
                <div className="px-2 pt-3 pb-2">
                  <div className="font-serif text-lg font-extrabold text-[#102A33] group-hover:text-[#D95338] transition-colors truncate">
                    {zone.name}
                  </div>
                  <div className="font-sans text-xs font-medium text-[#445A62] mt-1 line-clamp-2 leading-snug">
                    {zone.hook}
                  </div>
                  <div className="mt-2 pt-2 border-t border-dashed border-[#E3DAC9] flex items-center justify-between font-mono text-[10px] font-bold text-[#8C6226]">
                    <span>{zone.span}</span>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
