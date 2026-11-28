import { introContent } from "@content/states";

export const INTRO_TIMING = {
  lineGrowthDuration: 0.65,
  roadWidenDuration: 0.6,
  counterStart: 0.2,
  counterDuration: 2.0,
  landmarksStart: 0.35,
  landmarksDuration: 2.4,
  titleFadeStart: 1.0,
  autoCurtainDelay: 14.0,
  curtainSlideDuration: 0.85,
  curtainEase: [0.65, 0, 0.35, 1] as const,
  sessionKey: "bharat_highway_intro_v2",
};

export interface RouteMilestoneBadge {
  km: string;
  label: string;
  region: string;
  tag: string;
}

export const NH44_INTRO_MILESTONES: RouteMilestoneBadge[] = [
  { km: "0 KM", label: "Srinagar", region: "Pir Panjal", tag: "Alpine Dawn" },
  { km: "780 KM", label: "Delhi", region: "Alluvial Plains", tag: "Capital Vibes" },
  { km: "1,630 KM", label: "Nagpur", region: "Zero Mile", tag: "Heart of India" },
  { km: "2,130 KM", label: "Hyderabad", region: "Deccan Plateau", tag: "Biryani Pit-Stop" },
  { km: "3,810 KM", label: "Kanyakumari", region: "Three Oceans", tag: "Coastal Finale" },
];

export const INTRO_COPY = {
  ...introContent,
  startWithAudioLabel: "Start Your Journey",
  startSilentLabel: "Enter Without Audio",
};
