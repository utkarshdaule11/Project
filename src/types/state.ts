export type ImageType = "landmark" | "nature" | "cultural" | "highway";

export interface Speciality {
  title: string;
  description: string;
}

export interface StateImage {
  src: string;
  alt: string;
  caption: string;
  type: ImageType;
}

export interface CulturalHighlight {
  title: string;
  description: string;
}

export interface LandmarkItem {
  name: string;
  description: string;
}

export interface FoodExperience {
  name: string;
  description: string;
}

export type BiomeId =
  | "himalayan-alpine"
  | "indo-gangetic"
  | "central-india"
  | "deccan-tablelands"
  | "southern-basins";

export interface BiomeClassification {
  id: BiomeId;
  name: string;
  description?: string;
}

export interface StateChapter {
  id: string;
  order: number;
  name: string;
  stop: string;
  tagline: string;
  lat: number;
  lng: number;
  distanceFromStartKm: number;
  elevation: string;
  biome: BiomeClassification;
  intro: string;
  routeContext: string;
  specialities: [Speciality, Speciality];
  culturalHighlights: CulturalHighlight[];
  famousLandmarks: LandmarkItem[];
  foodAndExperiences: FoodExperience[];
  images: [StateImage, StateImage?] | [StateImage];
}

export interface GeoJsonFeature {
  type: string;
  id?: string | number;
  properties?: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

export interface GeoJsonData {
  type: string;
  features: GeoJsonFeature[];
}

export interface HeroStat {
  label: string;
  value: string;
}

export interface HeroData {
  kicker: string;
  title: string;
  tagline: string;
  stats: [HeroStat, HeroStat, HeroStat];
  fallbackImage: {
    src: string;
    alt: string;
  };
}

export interface IntroData {
  title: string;
  subtitle: string;
  startLabel: string;
  skipLabel: string;
  targetKm: number;
}

export type CheckpointId =
  | "srinagar"
  | "jalandhar"
  | "ludhiana"
  | "ambala"
  | "delhi"
  | "gwalior"
  | "jhansi"
  | "nagpur"
  | "hyderabad"
  | "bangalore"
  | "salem"
  | "namakkal"
  | "madurai"
  | "kanyakumari";

export const CHECKPOINT_IDS: readonly CheckpointId[] = [
  "srinagar",
  "jalandhar",
  "ludhiana",
  "ambala",
  "delhi",
  "gwalior",
  "jhansi",
  "nagpur",
  "hyderabad",
  "bangalore",
  "salem",
  "namakkal",
  "madurai",
  "kanyakumari",
] as const;

export function isValidCheckpointId(id: unknown): id is CheckpointId {
  return typeof id === "string" && (CHECKPOINT_IDS as readonly string[]).includes(id);
}

export type NavigationOrigin = "map" | "card" | "nav" | "scroll" | "url" | "initial";

export interface JourneyProgressInfo {
  currentIndex: number; // 1 to 14
  currentStopId: CheckpointId;
  currentStopName: string;
  currentJurisdiction: string;
  status: "origin" | "en-route" | "terminus";
  // Checkpoint counting metrics
  checkpointCountProgressPercent: number; // ((order - 1) / 13) * 100
  checkpointsCompletedCount: number; // order - 1
  checkpointsRemainingCount: number; // 14 - order
  // Physical road distance metrics (OSM centerline based: total ~3613.79 km)
  physicalCompletedKm: number; // cumulativeHighwayKm at snapped point
  physicalRemainingKm: number; // 3613.79 - completed
  physicalDistanceProgressPercent: number; // (completed / 3613.79) * 100
  // Official MoRTH benchmark milestone (~3810 km listed corridor)
  morthMilestoneKm: number;
  morthRemainingKm: number;
  // Navigation references
  prevStopId: CheckpointId | null;
  nextStopId: CheckpointId | null;
  isOrigin: boolean;
  isTerminus: boolean;
}

