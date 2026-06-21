import { ENDING_SOON_DAYS } from "@/lib/stats";
import { endsWithinDays } from "@/lib/status";
import type { ComputedRecord } from "@/lib/types";

export { ENDING_SOON_DAYS };

export interface GameStats {
  activeEvents: number;
  upcomingEvents: number;
  activeBanners: number;
  upcomingBanners: number;
  activeSeasons: number;
  upcomingSeasons: number;
  total: number;
  endingSoon: number;
  /** Soonest end timestamp among this game's active records, or null if none. */
  nearestEndMs: number | null;
}

/**
 * Aggregates counters for one game from an already publicly-visible record
 * set (see `getVisibleRecords`). Never pass raw/unfiltered records here —
 * completed records must be excluded before this function is called.
 */
export function computeGameStats(
  visibleRecords: ComputedRecord[],
  now: number,
  endingSoonDays = ENDING_SOON_DAYS,
): GameStats {
  let activeEvents = 0;
  let upcomingEvents = 0;
  let activeBanners = 0;
  let upcomingBanners = 0;
  let activeSeasons = 0;
  let upcomingSeasons = 0;
  let endingSoon = 0;
  let nearestEndMs: number | null = null;

  for (const r of visibleRecords) {
    if (r.status === "active") {
      if (r.type === "event") activeEvents += 1;
      else if (r.type === "banner") activeBanners += 1;
      else if (r.type === "season") activeSeasons += 1;

      if (nearestEndMs === null || r.endMs < nearestEndMs) {
        nearestEndMs = r.endMs;
      }
      if (endsWithinDays(r, now, endingSoonDays)) endingSoon += 1;
    } else if (r.status === "upcoming") {
      if (r.type === "event") upcomingEvents += 1;
      else if (r.type === "banner") upcomingBanners += 1;
      else if (r.type === "season") upcomingSeasons += 1;
    }
  }

  return {
    activeEvents,
    upcomingEvents,
    activeBanners,
    upcomingBanners,
    activeSeasons,
    upcomingSeasons,
    total: visibleRecords.length,
    endingSoon,
    nearestEndMs,
  };
}
