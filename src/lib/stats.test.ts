import assert from "node:assert/strict";
import test from "node:test";

import { computeSiteStats, dedupeRecords, recordKey } from "./stats.ts";
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

test("a completed record is not counted", () => {
  const completed = record({
    id: "completed",
    type: "event",
    startAt: new Date(NOW - 5 * DAY).toISOString(),
    endAt: new Date(NOW - DAY).toISOString(),
  });
  const stats = computeSiteStats([completed], NOW);
  assert.equal(stats.total, 0);
  assert.equal(stats.active, 0);
});

test("a weapon banner is not counted", () => {
  const weapon = record({
    id: "weapon",
    type: "banner",
    bannerSubtype: "weapon",
    startAt: new Date(NOW - DAY).toISOString(),
    endAt: new Date(NOW + DAY).toISOString(),
  });
  const stats = computeSiteStats([weapon], NOW);
  assert.equal(stats.total, 0);
  assert.equal(stats.active, 0);
});

test("an active record is counted exactly once", () => {
  const active = record({
    id: "active",
    type: "event",
    startAt: new Date(NOW - DAY).toISOString(),
    endAt: new Date(NOW + 10 * DAY).toISOString(),
  });
  const stats = computeSiteStats([active], NOW);
  assert.equal(stats.total, 1);
  assert.equal(stats.active, 1);
  assert.equal(stats.upcoming, 0);
});

test("an upcoming record is counted exactly once", () => {
  const upcoming = record({
    id: "upcoming",
    type: "season",
    startAt: new Date(NOW + DAY).toISOString(),
    endAt: new Date(NOW + 10 * DAY).toISOString(),
  });
  const stats = computeSiteStats([upcoming], NOW);
  assert.equal(stats.total, 1);
  assert.equal(stats.upcoming, 1);
  assert.equal(stats.active, 0);
});

test("a record ending soon is counted in both total/active and endingSoon, never inflating the total twice", () => {
  const endingSoon = record({
    id: "ending-soon",
    type: "event",
    startAt: new Date(NOW - DAY).toISOString(),
    endAt: new Date(NOW + 2 * DAY).toISOString(),
  });
  const stats = computeSiteStats([endingSoon], NOW);
  assert.equal(stats.total, 1);
  assert.equal(stats.active, 1);
  assert.equal(stats.endingSoon, 1);
});

test("duplicate records (same type+id) are not counted twice", () => {
  const active = record({
    id: "dup",
    type: "event",
    startAt: new Date(NOW - DAY).toISOString(),
    endAt: new Date(NOW + 10 * DAY).toISOString(),
  });
  const stats = computeSiteStats([active, { ...active }], NOW);
  assert.equal(stats.total, 1);
  assert.equal(stats.active, 1);
});

test("recordKey is namespaced by type so a banner and event sharing an id stay distinct", () => {
  const bannerKey = recordKey({ type: "banner", id: "x" });
  const eventKey = recordKey({ type: "event", id: "x" });
  assert.notEqual(bannerKey, eventKey);
});

test("dedupeRecords keeps the first occurrence and preserves order", () => {
  const items = [
    { type: "event" as const, id: "a" },
    { type: "event" as const, id: "b" },
    { type: "event" as const, id: "a" },
  ];
  const result = dedupeRecords(items);
  assert.deepEqual(result, [
    { type: "event", id: "a" },
    { type: "event", id: "b" },
  ]);
});
