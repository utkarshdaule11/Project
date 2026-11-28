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

/**
 * Passport exploration progress summary.
 * All progress metrics derive their denominator dynamically from states.length.
 */
export interface PassportProgressSummary {
  totalCount: number; // Derived dynamically: states.length
  exploredCount: number; // Derived: exploredIds.length (0 to states.length)
  percentComplete: number; // Derived: states.length > 0 ? Math.round((exploredCount / states.length) * 100) : 0
  isFullyExplored: boolean; // Derived: states.length > 0 && exploredCount === states.length
  isHydrated: boolean; // true once client-side localStorage read settles
  lastExploredId: CheckpointId | null;
}

/**
 * Unified storage payload stored in localStorage under 'nh44_passport_progress_v1'.
 * Contains strictly version, IDs, and ISO-8601 timestamp; zero duplicated content.
 */
export interface PassportStoragePayload {
  version: 1;
  exploredIds: CheckpointId[];
  lastUpdated: string; // ISO 8601 string
}

/**
 * Dynamically derived stamp view-model (never stored statically).
 */
export interface DerivedPassportStamp {
  id: CheckpointId;
  order: number;
  name: string;
  stop: string;
  morthMilestoneKm: number;
  projectionReferenceKm: number; // 3,613.79 KM Kanyakumari projection reference
  elevation: string;
  zoneId: BiomeId;
  zoneName: string;
  hasVerifiedLocalAsset: boolean;
  isActive: boolean; // Derived: id === activeStopId (from page.tsx)
  isExplored: boolean; // Derived: exploredIds.includes(id) (from usePassportProgress)
}

