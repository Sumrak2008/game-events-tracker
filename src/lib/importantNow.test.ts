import assert from "node:assert/strict";
import test from "node:test";

import { buildImportantNow, IMPORTANT_NOW_LIMIT } from "./importantNow.ts";
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

test("a record is never added to the list twice", () => {
  const r = record({
    id: "dup",
    type: "event",
    startAt: new Date(NOW - DAY).toISOString(),
    endAt: new Date(NOW + 2 * 60 * 60 * 1000).toISOString(),
  });
  const result = buildImportantNow([r, { ...r }], NOW);
  assert.equal(result.length, 1);
});

test("a record ending today ranks above an upcoming record, which ranks above a less-urgent active record", () => {
  const endingToday = record({
    id: "ending-today",
    type: "event",
    startAt: new Date(NOW - DAY).toISOString(),
    endAt: new Date(NOW + 2 * 60 * 60 * 1000).toISOString(),
  });
  const upcomingSoon = record({
    id: "upcoming-soon",
    type: "banner",
    bannerSubtype: "character",
    startAt: new Date(NOW + DAY).toISOString(),
    endAt: new Date(NOW + 10 * DAY).toISOString(),
  });
  const farActive = record({
    id: "far-active",
    type: "season",
    startAt: new Date(NOW - DAY).toISOString(),
    endAt: new Date(NOW + 30 * DAY).toISOString(),
  });
  const result = buildImportantNow([farActive, upcomingSoon, endingToday], NOW);
  assert.deepEqual(
    result.map((r) => r.id),
    ["ending-today", "upcoming-soon", "far-active"],
  );
});

test("completed records are excluded", () => {
  const completed = record({
    id: "completed",
    type: "event",
    startAt: new Date(NOW - 5 * DAY).toISOString(),
    endAt: new Date(NOW - DAY).toISOString(),
  });
  const result = buildImportantNow([completed], NOW);
  assert.equal(result.length, 0);
});

test("weapon banners are excluded", () => {
  const weapon = record({
    id: "weapon",
    type: "banner",
    bannerSubtype: "weapon",
    startAt: new Date(NOW - DAY).toISOString(),
    endAt: new Date(NOW + DAY).toISOString(),
  });
  const result = buildImportantNow([weapon], NOW);
  assert.equal(result.length, 0);
});

test("the list is capped at the limit", () => {
  const records = Array.from({ length: 20 }, (_, i) =>
    record({
      id: `r-${i}`,
      type: "event",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + (i + 1) * 60 * 60 * 1000).toISOString(),
    }),
  );
  const result = buildImportantNow(records, NOW);
  assert.equal(result.length, IMPORTANT_NOW_LIMIT);
});

test("a custom limit is respected", () => {
  const records = Array.from({ length: 10 }, (_, i) =>
    record({
      id: `r-${i}`,
      type: "event",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + (i + 1) * DAY).toISOString(),
    }),
  );
  const result = buildImportantNow(records, NOW, 4);
  assert.equal(result.length, 4);
});
