import assert from "node:assert/strict";
import test from "node:test";

import {
  dayKey,
  groupRecordsByDay,
  recordsInMonth,
  recordsOnDay,
} from "./calendar.ts";
import { computeRecord } from "./status.ts";
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

function computed(r: TrackerRecord) {
  return computeRecord(r, NOW);
}

test("groupRecordsByDay buckets a record under both its start day and end day", () => {
  const r = computed(
    record({
      id: "a",
      type: "event",
      startAt: "2026-06-10T00:00:00Z",
      endAt: "2026-06-12T00:00:00Z",
    }),
  );
  const { starts, ends } = groupRecordsByDay([r]);
  assert.deepEqual(
    starts.get(dayKey(2026, 5, 10))?.map((x) => x.id),
    ["a"],
  );
  assert.deepEqual(
    ends.get(dayKey(2026, 5, 12))?.map((x) => x.id),
    ["a"],
  );
});

test("groupRecordsByDay never drops or duplicates a record within one bucket", () => {
  const a = computed(
    record({
      id: "a",
      type: "event",
      startAt: "2026-06-10T00:00:00Z",
      endAt: "2026-06-10T05:00:00Z",
    }),
  );
  const b = computed(
    record({
      id: "b",
      type: "banner",
      bannerSubtype: "character",
      startAt: "2026-06-10T01:00:00Z",
      endAt: "2026-06-15T00:00:00Z",
    }),
  );
  const { starts } = groupRecordsByDay([a, b]);
  const bucket = starts.get(dayKey(2026, 5, 10)) ?? [];
  assert.equal(bucket.length, 2);
  assert.equal(new Set(bucket.map((x) => x.id)).size, 2);
});

test("recordsOnDay includes a record that merely spans through the day", () => {
  const spanning = computed(
    record({
      id: "spanning",
      type: "season",
      startAt: "2026-06-01T00:00:00Z",
      endAt: "2026-06-30T00:00:00Z",
    }),
  );
  const result = recordsOnDay([spanning], 2026, 5, 15);
  assert.deepEqual(
    result.map((r) => r.id),
    ["spanning"],
  );
});

test("recordsOnDay excludes a record that does not overlap the day", () => {
  const before = computed(
    record({
      id: "before",
      type: "event",
      startAt: "2026-06-01T00:00:00Z",
      endAt: "2026-06-02T00:00:00Z",
    }),
  );
  const result = recordsOnDay([before], 2026, 5, 15);
  assert.deepEqual(result, []);
});

test("recordsOnDay sorts by urgency (soonest end first)", () => {
  const farEnd = computed(
    record({
      id: "far-end",
      type: "event",
      startAt: "2026-06-10T00:00:00Z",
      endAt: "2026-06-30T00:00:00Z",
    }),
  );
  const nearEnd = computed(
    record({
      id: "near-end",
      type: "banner",
      bannerSubtype: "character",
      startAt: "2026-06-10T00:00:00Z",
      endAt: "2026-06-25T00:00:00Z",
    }),
  );
  const result = recordsOnDay([farEnd, nearEnd], 2026, 5, 15);
  assert.deepEqual(
    result.map((r) => r.id),
    ["near-end", "far-end"],
  );
});

test("recordsInMonth includes a record that spans across the month boundary", () => {
  const spanningBoundary = computed(
    record({
      id: "boundary",
      type: "season",
      startAt: "2026-05-25T00:00:00Z",
      endAt: "2026-06-05T00:00:00Z",
    }),
  );
  const result = recordsInMonth([spanningBoundary], 2026, 5);
  assert.deepEqual(
    result.map((r) => r.id),
    ["boundary"],
  );
});

test("recordsInMonth excludes a record entirely in a different month", () => {
  const otherMonth = computed(
    record({
      id: "other-month",
      type: "event",
      startAt: "2026-08-01T00:00:00Z",
      endAt: "2026-08-05T00:00:00Z",
    }),
  );
  const result = recordsInMonth([otherMonth], 2026, 5);
  assert.deepEqual(result, []);
});
