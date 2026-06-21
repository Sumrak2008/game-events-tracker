import type { ComputedRecord } from "@/lib/types";

/**
 * How a list of already-visible (active/upcoming) records should be ordered.
 *
 * - "urgency" (default): the record set used everywhere on the site by
 *   default — soonest-ending active records first, then upcoming records by
 *   soonest start. See `sortPublicRecordsByUrgency`.
 * - "starting-soon": every record by soonest start date, active or upcoming
 *   mixed together (used when "what starts next" matters more than "what
 *   ends next", e.g. a future-looking view).
 * - "game": alphabetically by game name.
 * - "title": alphabetically by record title.
 */
export type SortKey = "urgency" | "starting-soon" | "game" | "title";

function gameNameFor(
  record: ComputedRecord,
  gameNameById: ReadonlyMap<string, string>,
): string {
  return gameNameById.get(record.gameId) ?? record.gameId;
}

function recordTitleFor(record: ComputedRecord): string {
  return record.titleRu ?? record.title;
}

/**
 * Stable tiebreaker used whenever the primary sort key is equal: game name,
 * then record title, then type, then the record's own id. Comparing raw
 * timestamps (never formatted date strings) elsewhere in this module is what
 * keeps the ordering correct; this just decides ties deterministically.
 */
function compareStable(
  a: ComputedRecord,
  b: ComputedRecord,
  gameNameById: ReadonlyMap<string, string>,
): number {
  const gameNameA = gameNameFor(a, gameNameById);
  const gameNameB = gameNameFor(b, gameNameById);
  if (gameNameA !== gameNameB) return gameNameA.localeCompare(gameNameB);

  const titleA = recordTitleFor(a);
  const titleB = recordTitleFor(b);
  if (titleA !== titleB) return titleA.localeCompare(titleB);

  if (a.type !== b.type) return a.type.localeCompare(b.type);

  return a.id.localeCompare(b.id);
}

/**
 * 0 = active with a resolvable end date (the common case — every real record
 * has one), 1 = active but somehow without a resolvable end date (defensive;
 * should not occur given the schema, but never ranked above an urgent
 * record), 2 = upcoming, 3 = anything else (e.g. completed, should never be
 * passed in here since callers filter with getVisibleRecords first, but
 * sinks to the bottom rather than throwing if it ever is).
 */
function urgencyBucket(record: ComputedRecord): 0 | 1 | 2 | 3 {
  if (record.status === "active") {
    return Number.isFinite(record.endMs) ? 0 : 1;
  }
  if (record.status === "upcoming") return 2;
  return 3;
}

/**
 * Sorts already publicly-visible records "by urgency": active records with a
 * known end date first (soonest end first), then active records without a
 * resolvable end date, then upcoming records (soonest start first). Records
 * with equal primary dates fall back to `compareStable`. Never mutates the
 * input array.
 */
export function sortPublicRecordsByUrgency(
  records: ComputedRecord[],
  gameNameById: ReadonlyMap<string, string> = new Map(),
): ComputedRecord[] {
  return [...records].sort((a, b) => {
    const bucketA = urgencyBucket(a);
    const bucketB = urgencyBucket(b);
    if (bucketA !== bucketB) return bucketA - bucketB;

    if (bucketA === 0 && a.endMs !== b.endMs) return a.endMs - b.endMs;
    if (bucketA === 2 && a.startMs !== b.startMs) return a.startMs - b.startMs;

    return compareStable(a, b, gameNameById);
  });
}

/** Sorts by the given key. Never mutates the input array. */
export function sortRecords(
  records: ComputedRecord[],
  key: SortKey = "urgency",
  gameNameById: ReadonlyMap<string, string> = new Map(),
): ComputedRecord[] {
  switch (key) {
    case "urgency":
      return sortPublicRecordsByUrgency(records, gameNameById);
    case "starting-soon":
      return [...records].sort(
        (a, b) => a.startMs - b.startMs || compareStable(a, b, gameNameById),
      );
    case "game":
      return [...records].sort((a, b) => {
        const gameNameA = gameNameFor(a, gameNameById);
        const gameNameB = gameNameFor(b, gameNameById);
        return (
          gameNameA.localeCompare(gameNameB) ||
          compareStable(a, b, gameNameById)
        );
      });
    case "title":
      return [...records].sort((a, b) => {
        const titleA = recordTitleFor(a);
        const titleB = recordTitleFor(b);
        return (
          titleA.localeCompare(titleB) || compareStable(a, b, gameNameById)
        );
      });
    default:
      return [...records];
  }
}
