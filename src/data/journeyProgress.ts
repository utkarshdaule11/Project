import { states } from "@content/states";
import { CHECKPOINTS_GIS_MAP } from "@/data/nh44GisData";
import {
  CheckpointId,
  CHECKPOINT_IDS,
  isValidCheckpointId,
  JourneyProgressInfo,
} from "@/types/state";

// Total physical highway distance derived from OpenStreetMap checkpoint validation reference chain
// Note: 3,613.79 KM corresponds to the orthogonal projection milestone of Kanyakumari (Cape Comorin)
// in data/nh44/nh44-checkpoints-validation.json. The authoritative LOD 0 MultiLineString geometry
// sum is 3,612.21 KM, reflecting the 1.62 KM omission of the 4 structural gaps across sections.
// 3,613.79 KM is maintained as the reference denominator to align with cumulativeHighwayKm milestones.
export const TOTAL_PHYSICAL_HIGHWAY_KM = 3613.79;

// Official listed national corridor benchmark under MoRTH Annexure II(d)
export const OFFICIAL_MORTH_CORRIDOR_KM = 3810;

/**
 * Pure, non-mutating helper that derives North-to-South journey progression metrics
 * for any given checkpoint along the 14-stop NH44 corridor.
 *
 * Clearly separates:
 * 1. Checkpoint Count Progress: Index-based progression across the 14 major hubs (0% to 100%).
 * 2. Physical Highway Distance: OSM centerline distance along the physical single-thread road (0 to 3,613.79 km).
 * 3. MoRTH Benchmark Milestone: Listed planning reference distance under Annexure II(d) (0 to 3,810 km).
 *
 * Safely handles invalid or unrecognized checkpoint IDs by falling back to the northern terminus (Srinagar).
 */
export function getJourneyProgress(checkpointId: string): JourneyProgressInfo {
  const safeId: CheckpointId = isValidCheckpointId(checkpointId) ? checkpointId : "srinagar";
  const index = CHECKPOINT_IDS.indexOf(safeId); // 0 to 13
  const order = index + 1; // 1 to 14

  const stateData = states.find((s) => s.id === safeId) || states[0];
  const gisData = CHECKPOINTS_GIS_MAP.get(safeId);

  // Checkpoint counting metrics
  const checkpointCountProgressPercent = Math.round(((order - 1) / (CHECKPOINT_IDS.length - 1)) * 1000) / 10;
  const checkpointsCompletedCount = order - 1;
  const checkpointsRemainingCount = CHECKPOINT_IDS.length - order;

  // Physical road distance metrics
  const physicalCompletedKm = gisData ? gisData.cumulativeHighwayKm : stateData.distanceFromStartKm;
  const physicalRemainingKm = Math.max(0, Math.round((TOTAL_PHYSICAL_HIGHWAY_KM - physicalCompletedKm) * 100) / 100);
  const physicalDistanceProgressPercent = Math.min(
    100,
    Math.round((physicalCompletedKm / TOTAL_PHYSICAL_HIGHWAY_KM) * 1000) / 10
  );

  // Official MoRTH benchmark milestone
  const morthMilestoneKm = stateData.distanceFromStartKm;
  const morthRemainingKm = Math.max(0, OFFICIAL_MORTH_CORRIDOR_KM - morthMilestoneKm);

  const isOrigin = order === 1;
  const isTerminus = order === CHECKPOINT_IDS.length;
  const status: "origin" | "en-route" | "terminus" = isOrigin
    ? "origin"
    : isTerminus
    ? "terminus"
    : "en-route";

  const prevStopId = order > 1 ? CHECKPOINT_IDS[index - 1] : null;
  const nextStopId = order < CHECKPOINT_IDS.length ? CHECKPOINT_IDS[index + 1] : null;

  return {
    currentIndex: order,
    currentStopId: safeId,
    currentStopName: stateData.stop,
    currentJurisdiction: stateData.name,
    status,
    checkpointCountProgressPercent,
    checkpointsCompletedCount,
    checkpointsRemainingCount,
    physicalCompletedKm,
    physicalRemainingKm,
    physicalDistanceProgressPercent,
    morthMilestoneKm,
    morthRemainingKm,
    prevStopId,
    nextStopId,
    isOrigin,
    isTerminus,
  };
}
