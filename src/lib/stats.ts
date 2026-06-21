import { endsWithinDays } from "./status.ts";
import type { ComputedRecord } from "./types.ts";
import { getVisibleRecords } from "./visibility.ts";

/** Default "ending soon" window used across the home, games and ending-soon pages. */
export const ENDING_SOON_DAYS = 3;

/**
 * Stable, unique identity for a record. Types and ids are independent
 * namespaces in the JSON files (a banner and an event could theoretically
 * share the same id), so the key is always `${type}:${id}`, never the id
 * alone. Used everywhere a count or a curated list must not double-count the
 * same record reached through two different code paths (e.g. a record that
 * is both "active" and "ends in the next 3 days").
 */
export function recordKey(record: Pick<ComputedRecord, "type" | "id">): string {
  return `${record.type}:${record.id}`;
}

/** De-duplicates a list of records by `recordKey`, keeping the first occurrence. */
export function dedupeRecords<T extends Pick<ComputedRecord, "type" | "id">>(
  records: T[],
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const record of records) {
    const key = recordKey(record);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(record);
  }
  return result;
}

export interface SiteStats {
  /** Every publicly visible record (active + upcoming), deduplicated. */
  total: number;
  active: number;
  upcoming: number;
  /** Active records ending within ENDING_SOON_DAYS — a subset of `active`, never added on top of it. */
  endingSoon: number;
}

/**
 * The single source of truth for the headline counters shown in the hero
 * and section headers. Completed records and weapon banners are excluded by
 * `getVisibleRecords` before anything is counted, and every record is
 * counted at most once via `recordKey` — "ending soon" is a subset of
 * "active", not an additional bucket layered on top.
 */
export function computeSiteStats(
  records: Parameters<typeof getVisibleRecords>[0],
  now: number,
  endingSoonDays = ENDING_SOON_DAYS,
): SiteStats {
  const visible = dedupeRecords(getVisibleRecords(records, now));

  let active = 0;
  let upcoming = 0;
  let endingSoon = 0;

  for (const record of visible) {
    if (record.status === "active") {
      active += 1;
      if (endsWithinDays(record, now, endingSoonDays)) endingSoon += 1;
    } else if (record.status === "upcoming") {
      upcoming += 1;
    }
  }

  return { total: visible.length, active, upcoming, endingSoon };
}
