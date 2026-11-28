"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { states } from "@content/states";
import {
  CheckpointId,
  PassportProgressSummary,
  PassportStoragePayload,
  isValidCheckpointId,
} from "@/types/state";

export const STORAGE_KEY = "nh44_passport_progress_v1";

// Valid checkpoint IDs derived dynamically from the single source of truth
const VALID_CHECKPOINT_IDS = new Set<string>(states.map((s) => s.id));

/**
 * Robust, resilient JSON storage parser conforming to Revision 2.3 schema specifications:
 * - Rejects non-objects and arrays
 * - Validates version === 1
 * - Validates strict ISO-8601 timestamp
 * - Validates exploredIds is an Array
 * - Discards invalid or obsolete IDs dynamically against content/states.ts
 * - Deduplicates valid IDs
 */
export function parseStoredProgress(raw: string | null): CheckpointId[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);

    // 1. Must be a non-null object and not an array
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return [];
    }

    // 2. Strict version check
    if (parsed.version !== 1) {
      return [];
    }

    // 3. Strict ISO-8601 timestamp validation
    if (
      typeof parsed.lastUpdated !== "string" ||
      isNaN(Date.parse(parsed.lastUpdated))
    ) {
      return [];
    }

    // 4. exploredIds must be an array
    if (!Array.isArray(parsed.exploredIds)) {
      return [];
    }

    // 5. Retain valid string IDs, discard unknown IDs, and deduplicate
    const uniqueIds = new Set<CheckpointId>();
    for (const item of parsed.exploredIds) {
      if (typeof item === "string" && VALID_CHECKPOINT_IDS.has(item)) {
        uniqueIds.add(item as CheckpointId);
      }
    }

    return Array.from(uniqueIds);
  } catch {
    return [];
  }
}

export interface UsePassportProgressReturn {
  exploredIds: CheckpointId[];
  summary: PassportProgressSummary;
  isHydrated: boolean;
  markCheckpointExplored: (id: CheckpointId) => void;
  resetProgress: () => void;
  isExplored: (id: CheckpointId) => boolean;
}

/**
 * Phase 1C Step 5: usePassportProgress Hook
 *
 * Manages client-side interactive journey passport exploration state:
 * - Decoupled from viewport activeStopId
 * - Hydration-safe initial state (prevents progress flash)
 * - Safe in-memory fallback on storage unavailable / quota errors
 * - Dynamic progress metrics derived from states.length
 */
export function usePassportProgress(): UsePassportProgressReturn {
  const [exploredIds, setExploredIds] = useState<CheckpointId[]>([]);
  const [lastExploredId, setLastExploredId] = useState<CheckpointId | null>(null);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Initial SSR-safe client mount: read and validate localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(STORAGE_KEY);
        const valid = parseStoredProgress(raw);
        setExploredIds(valid);
        if (valid.length > 0) {
          setLastExploredId(valid[valid.length - 1]);
        }
      }
    } catch {
      // In-memory fallback if storage throws (Private Browsing, quota, disabled)
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Write changes to localStorage only AFTER hydration completes
  useEffect(() => {
    if (!isHydrated) return;

    try {
      if (typeof window !== "undefined") {
        if (exploredIds.length === 0) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          const payload: PassportStoragePayload = {
            version: 1,
            exploredIds,
            lastUpdated: new Date().toISOString(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        }
      }
    } catch {
      // Graceful fallback: state remains active in memory for the session
    }
  }, [exploredIds, isHydrated]);

  // Deliberate user action marks a checkpoint explored
  const markCheckpointExplored = useCallback((id: CheckpointId) => {
    if (!isValidCheckpointId(id)) return;
    setExploredIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    setLastExploredId(id);
  }, []);

  // Clear all progress and wipe localStorage
  const resetProgress = useCallback(() => {
    setExploredIds([]);
    setLastExploredId(null);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // In-memory reset
    }
  }, []);

  const isExplored = useCallback(
    (id: CheckpointId) => exploredIds.includes(id),
    [exploredIds]
  );

  // Dynamically derived summary metrics
  const summary: PassportProgressSummary = useMemo(() => {
    const totalCount = states.length;
    const exploredCount = exploredIds.length;
    const percentComplete =
      totalCount > 0 ? Math.round((exploredCount / totalCount) * 100) : 0;
    const isFullyExplored = totalCount > 0 && exploredCount === totalCount;

    return {
      totalCount,
      exploredCount,
      percentComplete,
      isFullyExplored,
      isHydrated,
      lastExploredId,
    };
  }, [exploredIds, isHydrated, lastExploredId]);

  return {
    exploredIds,
    summary,
    isHydrated,
    markCheckpointExplored,
    resetProgress,
    isExplored,
  };
}
