import { sortPublicRecordsByUrgency } from "./sort.ts";
import type { ComputedRecord } from "./types.ts";

/**
 * Calendar grouping helpers. These are pure functions over an already
 * publicly-visible record set (callers must run getVisibleRecords first —
 * completed records and weapon banners must never reach here) so the
 * calendar UI can do a single Map-based grouping pass per render instead of
 * re-filtering the full record list for every cell.
 */

export function dayKey(year: number, month: number, day: number): string {
  return `${year}-${month}-${day}`;
}

export function keyFromMs(ms: number): string {
  const d = new Date(ms);
  return dayKey(d.getFullYear(), d.getMonth(), d.getDate());
}

export interface DayGroups {
  starts: Map<string, ComputedRecord[]>;
  ends: Map<string, ComputedRecord[]>;
}

/** Groups records by the calendar day their start/end falls on (viewer-local time). */
export function groupRecordsByDay(records: ComputedRecord[]): DayGroups {
  const starts = new Map<string, ComputedRecord[]>();
  const ends = new Map<string, ComputedRecord[]>();
  for (const record of records) {
    const startDay = keyFromMs(record.startMs);
    const endDay = keyFromMs(record.endMs);
    const startBucket = starts.get(startDay) ?? [];
    startBucket.push(record);
    starts.set(startDay, startBucket);
    const endBucket = ends.get(endDay) ?? [];
    endBucket.push(record);
    ends.set(endDay, endBucket);
  }
  return { starts, ends };
}

/**
 * Every record active on the given calendar day — started on or before it
 * and not yet ended — regardless of whether it starts, ends, or merely
 * spans through that day. Sorted by urgency.
 */
export function recordsOnDay(
  records: ComputedRecord[],
  year: number,
  month: number,
  day: number,
  gameNameById: ReadonlyMap<string, string> = new Map(),
): ComputedRecord[] {
  const dayStartMs = new Date(year, month, day, 0, 0, 0, 0).getTime();
  const dayEndMs = new Date(year, month, day, 23, 59, 59, 999).getTime();
  const matching = records.filter(
    (r) => r.startMs <= dayEndMs && r.endMs >= dayStartMs,
  );
  return sortPublicRecordsByUrgency(matching, gameNameById);
}

/** Every record overlapping the given month at all (started before it ends, ends after it starts). Sorted by urgency. */
export function recordsInMonth(
  records: ComputedRecord[],
  year: number,
  month: number,
  gameNameById: ReadonlyMap<string, string> = new Map(),
): ComputedRecord[] {
  const monthStartMs = new Date(year, month, 1, 0, 0, 0, 0).getTime();
  const monthEndMs = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
  const matching = records.filter(
    (r) => r.startMs <= monthEndMs && r.endMs >= monthStartMs,
  );
  return sortPublicRecordsByUrgency(matching, gameNameById);
}
