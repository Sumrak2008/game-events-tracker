import { computeRecord, computeRecords } from "./status.ts";
import type { ComputedRecord, TrackerRecord } from "./types.ts";

/**
 * Single source of truth for "can this record be shown to a visitor".
 *
 * The site only ever shows active and upcoming records. Completed records
 * stay in the JSON files (and Git history) forever, but must never reach a
 * public page, search result, calendar marker, counter, or direct link.
 *
 * `claimEndAt` (a reward-claim grace period after a record's real end) is
 * intentionally not consulted here: a record whose main period has ended is
 * not made "active" again just because rewards can still be claimed.
 */

function hasResolvedDates(record: ComputedRecord): boolean {
  return Number.isFinite(record.startMs) && Number.isFinite(record.endMs);
}

/** True if the record has already started and has not ended yet. */
export function isRecordActive(record: ComputedRecord): boolean {
  return hasResolvedDates(record) && record.status === "active";
}

/** True if the record is officially announced and starts in the future. */
export function isRecordUpcoming(record: ComputedRecord): boolean {
  return hasResolvedDates(record) && record.status === "upcoming";
}

/**
 * True if the record may be shown anywhere in the public UI. A record with
 * dates that could not be parsed is treated conservatively as not visible —
 * we cannot confirm it is still current, so it is hidden rather than risking
 * a stale record looking active forever.
 */
export function isRecordPubliclyVisible(record: ComputedRecord): boolean {
  return isRecordActive(record) || isRecordUpcoming(record);
}

/** Computes status for every record and keeps only the publicly visible ones. */
export function getVisibleRecords(
  records: TrackerRecord[],
  now: number,
): ComputedRecord[] {
  return computeRecords(records, now).filter(isRecordPubliclyVisible);
}

/**
 * Computes and returns a single record only if it is publicly visible,
 * otherwise null. Use this to guard direct-link routes like /records/[id].
 */
export function getVisibleRecord(
  record: TrackerRecord,
  now: number,
): ComputedRecord | null {
  const computed = computeRecord(record, now);
  return isRecordPubliclyVisible(computed) ? computed : null;
}
