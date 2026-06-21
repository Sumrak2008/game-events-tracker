import assert from "node:assert/strict";
import test from "node:test";

import { computeRecord } from "./status.ts";
import { sortPublicRecordsByUrgency, sortRecords } from "./sort.ts";
import type { TrackerRecord } from "./types.ts";

const BASE: Omit<TrackerRecord, "startAt" | "endAt" | "id" | "type"> = {
  gameId: "test-game",
  title: "Test record",
  description: "Test description",
  timezone: "UTC",
  region: "Global",
  sourceType: "official",
  confidence: "confirmed",
  sourceUrls: ["https://example.com"],
  verifiedAt: "2026-01-01T00:00:00Z",
  isDemo: false,
};

function record(
  overrides: Partial<TrackerRecord> & {
    id: string;
    type: TrackerRecord["type"];
    startAt: string;
    endAt: string;
  },
): TrackerRecord {
  return { ...BASE, ...overrides };
}

const NOW = Date.parse("2026-06-21T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

function computed(r: TrackerRecord) {
  return computeRecord(r, NOW);
}

test("a record ending today ranks above a record ending next week", () => {
  const endingToday = computed(
    record({
      id: "ends-today",
      type: "event",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + 2 * 60 * 60 * 1000).toISOString(),
    }),
  );
  const endingNextWeek = computed(
    record({
      id: "ends-next-week",
      type: "banner",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + 7 * DAY).toISOString(),
    }),
  );
  const sorted = sortPublicRecordsByUrgency([endingNextWeek, endingToday]);
  assert.deepEqual(
    sorted.map((r) => r.id),
    ["ends-today", "ends-next-week"],
  );
});

test("character banner and event sort together by date, not in separate groups", () => {
  const banner = computed(
    record({
      id: "banner-soon",
      type: "banner",
      bannerSubtype: "character",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + DAY).toISOString(),
    }),
  );
  const event = computed(
    record({
      id: "event-later",
      type: "event",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + 30 * DAY).toISOString(),
    }),
  );
  const sorted = sortPublicRecordsByUrgency([event, banner]);
  assert.deepEqual(
    sorted.map((r) => r.id),
    ["banner-soon", "event-later"],
  );
});

test("upcoming records sort by soonest start, after all active records", () => {
  const active = computed(
    record({
      id: "active",
      type: "event",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + 30 * DAY).toISOString(),
    }),
  );
  const upcomingSoon = computed(
    record({
      id: "upcoming-soon",
      type: "season",
      startAt: new Date(NOW + DAY).toISOString(),
      endAt: new Date(NOW + 10 * DAY).toISOString(),
    }),
  );
  const upcomingLater = computed(
    record({
      id: "upcoming-later",
      type: "season",
      startAt: new Date(NOW + 5 * DAY).toISOString(),
      endAt: new Date(NOW + 20 * DAY).toISOString(),
    }),
  );
  const sorted = sortPublicRecordsByUrgency([
    upcomingLater,
    active,
    upcomingSoon,
  ]);
  assert.deepEqual(
    sorted.map((r) => r.id),
    ["active", "upcoming-soon", "upcoming-later"],
  );
});

test("a record without a resolvable end date is ranked below urgent active records", () => {
  const urgent = computed(
    record({
      id: "urgent",
      type: "event",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + 2 * 60 * 60 * 1000).toISOString(),
    }),
  );
  // Defensive case: an "active" record whose end date could not be resolved.
  // This cannot happen via getVisibleRecords (it would be hidden entirely),
  // but the sort function must still handle it gracefully if ever passed in.
  const noEndDate = {
    ...computed(
      record({
        id: "no-end-date",
        type: "event",
        startAt: new Date(NOW - DAY).toISOString(),
        endAt: new Date(NOW + DAY).toISOString(),
      }),
    ),
    status: "active" as const,
    endMs: Number.NaN,
  };
  const sorted = sortPublicRecordsByUrgency([noEndDate, urgent]);
  assert.deepEqual(
    sorted.map((r) => r.id),
    ["urgent", "no-end-date"],
  );
});

test("equal dates fall back to a stable order: game, then title, then type, then id", () => {
  const a = computed(
    record({
      id: "b-id",
      type: "event",
      gameId: "game-a",
      title: "Alpha",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + DAY).toISOString(),
    }),
  );
  const b = computed(
    record({
      id: "a-id",
      type: "event",
      gameId: "game-a",
      title: "Alpha",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + DAY).toISOString(),
    }),
  );
  const gameNameById = new Map([["game-a", "Game A"]]);
  const sorted = sortPublicRecordsByUrgency([a, b], gameNameById);
  // Same game, same title, same type -> tiebreak on id.
  assert.deepEqual(
    sorted.map((r) => r.id),
    ["a-id", "b-id"],
  );
});

test("sortRecords does not mutate the input array", () => {
  const first = computed(
    record({
      id: "first",
      type: "event",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + 10 * DAY).toISOString(),
    }),
  );
  const second = computed(
    record({
      id: "second",
      type: "event",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + DAY).toISOString(),
    }),
  );
  const input = [first, second];
  const result = sortRecords(input, "urgency");
  assert.deepEqual(
    input.map((r) => r.id),
    ["first", "second"],
  );
  assert.deepEqual(
    result.map((r) => r.id),
    ["second", "first"],
  );
  assert.notEqual(input, result);
});

test('sortRecords "game" and "title" variants sort alphabetically', () => {
  const a = computed(
    record({
      id: "a",
      type: "event",
      gameId: "zz-game",
      title: "Zulu",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + DAY).toISOString(),
    }),
  );
  const b = computed(
    record({
      id: "b",
      type: "event",
      gameId: "aa-game",
      title: "Alpha",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + DAY).toISOString(),
    }),
  );
  const gameNameById = new Map([
    ["zz-game", "Zeta Game"],
    ["aa-game", "Alpha Game"],
  ]);
  const byGame = sortRecords([a, b], "game", gameNameById);
  assert.deepEqual(
    byGame.map((r) => r.id),
    ["b", "a"],
  );

  const byTitle = sortRecords([a, b], "title", gameNameById);
  assert.deepEqual(
    byTitle.map((r) => r.id),
    ["b", "a"],
  );
});
