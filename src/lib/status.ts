import type { ComputedRecord, RecordStatus, TrackerRecord } from "@/lib/types";

export const DAY_MS = 24 * 60 * 60 * 1000;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

function offsetForTimezone(timezone?: string): string {
  switch (timezone) {
    case "UTC+8":
    case "Asia/Shanghai":
      return "+08:00";
    case "UTC+9":
    case "Asia/Seoul":
      return "+09:00";
    default:
      return "Z";
  }
}

export function parseRecordDate(
  value: string,
  boundary: "start" | "end",
  timezone?: string,
): number {
  if (DATE_ONLY.test(value)) {
    const time = boundary === "start" ? "T00:00:00" : "T23:59:59";
    return Date.parse(`${value}${time}${offsetForTimezone(timezone)}`);
  }
  if (LOCAL_DATE_TIME.test(value)) {
    return Date.parse(`${value}${offsetForTimezone(timezone)}`);
  }
  return Date.parse(value);
}

/**
 * Status is never stored — it is derived from the current time and the
 * record's start/end timestamps. now < start => upcoming, now > end =>
 * completed, otherwise active.
 */
export function computeStatus(
  record: Pick<TrackerRecord, "startAt" | "endAt" | "timezone">,
  now: number,
): RecordStatus {
  const start = parseRecordDate(record.startAt, "start", record.timezone);
  const end = parseRecordDate(record.endAt, "end", record.timezone);
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "active";
}

/** Attach computed fields (status + parsed timestamps) to a record. */
export function computeRecord(
  record: TrackerRecord,
  now: number,
): ComputedRecord {
  return {
    ...record,
    startMs: parseRecordDate(record.startAt, "start", record.timezone),
    endMs: parseRecordDate(record.endAt, "end", record.timezone),
    status: computeStatus(record, now),
  };
}

export function computeRecords(
  records: TrackerRecord[],
  now: number,
): ComputedRecord[] {
  return records.map((record) => computeRecord(record, now));
}

/** Start of the current day in the viewer's local timezone. */
export function startOfLocalDay(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function endOfLocalDay(now: number): number {
  return startOfLocalDay(now) + DAY_MS - 1;
}

/** Records whose end falls inside [now, now + days] and are still active. */
export function endsWithinDays(
  record: ComputedRecord,
  now: number,
  days: number,
): boolean {
  return (
    record.status === "active" &&
    record.endMs >= now &&
    record.endMs <= now + days * DAY_MS
  );
}

/** Records ending before the end of today (viewer-local), still active. */
export function endsToday(record: ComputedRecord, now: number): boolean {
  return (
    record.status === "active" &&
    record.endMs >= now &&
    record.endMs <= endOfLocalDay(now)
  );
}

export type SortKey = "ending-soon" | "starting-soon";

export function sortRecords(
  records: ComputedRecord[],
  key: SortKey = "ending-soon",
): ComputedRecord[] {
  const copy = [...records];
  switch (key) {
    case "ending-soon":
      return copy.sort((a, b) => a.endMs - b.endMs);
    case "starting-soon":
      return copy.sort((a, b) => a.startMs - b.startMs);
    default:
      return copy;
  }
}
