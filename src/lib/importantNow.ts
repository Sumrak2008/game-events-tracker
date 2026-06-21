import { sortPublicRecordsByUrgency } from "./sort.ts";
import { endsToday, endsWithinDays } from "./status.ts";
import { dedupeRecords, recordKey } from "./stats.ts";
import type { ComputedRecord, TrackerRecord } from "./types.ts";
import { getVisibleRecords } from "./visibility.ts";

export const IMPORTANT_NOW_LIMIT = 6;
export const IMPORTANT_NOW_SOON_DAYS = 3;

/**
 * Builds the curated "Важно сейчас" list for the home page, filling it from
 * four priority pools in order (each already deduplicated against the
 * pools before it):
 *
 *   1. active records ending today
 *   2. active records ending within the next few days (but not today)
 *   3. the soonest upcoming records
 *   4. any other active record, by nearest end
 *
 * Completed records and weapon banners never enter the pools at all (they
 * are excluded by `getVisibleRecords` up front). The result is capped at
 * `limit` and never contains the same record twice.
 */
export function buildImportantNow(
  records: TrackerRecord[],
  now: number,
  limit = IMPORTANT_NOW_LIMIT,
  gameNameById: ReadonlyMap<string, string> = new Map(),
): ComputedRecord[] {
  const visible = dedupeRecords(getVisibleRecords(records, now));
  const active = visible.filter((r) => r.status === "active");
  const upcoming = visible.filter((r) => r.status === "upcoming");

  const endingToday = active.filter((r) => endsToday(r, now));
  const endingTodayKeys = new Set(endingToday.map(recordKey));

  const endingSoon = active.filter(
    (r) =>
      endsWithinDays(r, now, IMPORTANT_NOW_SOON_DAYS) &&
      !endingTodayKeys.has(recordKey(r)),
  );
  const endingSoonKeys = new Set(endingSoon.map(recordKey));

  const otherActive = active.filter(
    (r) =>
      !endingTodayKeys.has(recordKey(r)) && !endingSoonKeys.has(recordKey(r)),
  );

  const ordered: ComputedRecord[] = [
    ...sortPublicRecordsByUrgency(endingToday, gameNameById),
    ...sortPublicRecordsByUrgency(endingSoon, gameNameById),
    ...sortPublicRecordsByUrgency(upcoming, gameNameById),
    ...sortPublicRecordsByUrgency(otherActive, gameNameById),
  ];

  return dedupeRecords(ordered).slice(0, limit);
}
