import assert from "node:assert/strict";
import test from "node:test";

import { computeRecord } from "./status.ts";
import {
  getVisibleRecord,
  getVisibleRecords,
  isRecordActive,
  isRecordUpcoming,
  isRecordPubliclyVisible,
} from "./visibility.ts";
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

test("1. active record (started, not ended) is shown", () => {
  const r = record({
    id: "active-1",
    type: "event",
    startAt: new Date(NOW - DAY).toISOString(),
    endAt: new Date(NOW + DAY).toISOString(),
  });
  const computed = computeRecord(r, NOW);
  assert.equal(computed.status, "active");
  assert.equal(isRecordPubliclyVisible(computed), true);
});

test("2. future (upcoming) record is shown", () => {
  const r = record({
    id: "upcoming-1",
    type: "banner",
    startAt: new Date(NOW + DAY).toISOString(),
    endAt: new Date(NOW + 2 * DAY).toISOString(),
  });
  const computed = computeRecord(r, NOW);
  assert.equal(computed.status, "upcoming");
  assert.equal(isRecordPubliclyVisible(computed), true);
});

test("3. record with endAt in the past is hidden", () => {
  const r = record({
    id: "past-1",
    type: "event",
    startAt: new Date(NOW - 2 * DAY).toISOString(),
    endAt: new Date(NOW - DAY).toISOString(),
  });
  const computed = computeRecord(r, NOW);
  assert.equal(computed.status, "completed");
  assert.equal(isRecordPubliclyVisible(computed), false);
});

test("4. completed banner is hidden", () => {
  const r = record({
    id: "banner-ended",
    type: "banner",
    bannerSubtype: "character",
    startAt: new Date(NOW - 10 * DAY).toISOString(),
    endAt: new Date(NOW - 5 * DAY).toISOString(),
  });
  const computed = computeRecord(r, NOW);
  assert.equal(isRecordPubliclyVisible(computed), false);
});

test("5. completed season is hidden", () => {
  const r = record({
    id: "season-ended",
    type: "season",
    startAt: new Date(NOW - 60 * DAY).toISOString(),
    endAt: new Date(NOW - 30 * DAY).toISOString(),
  });
  const computed = computeRecord(r, NOW);
  assert.equal(isRecordPubliclyVisible(computed), false);
});

test("6. completed record is excluded from getVisibleRecords (used by search/filters)", () => {
  const active = record({
    id: "search-active",
    type: "event",
    startAt: new Date(NOW - DAY).toISOString(),
    endAt: new Date(NOW + DAY).toISOString(),
  });
  const ended = record({
    id: "search-ended",
    type: "event",
    startAt: new Date(NOW - 10 * DAY).toISOString(),
    endAt: new Date(NOW - DAY).toISOString(),
  });
  const visible = getVisibleRecords([active, ended], NOW);
  assert.deepEqual(
    visible.map((r) => r.id),
    ["search-active"],
  );
});

test("7. completed record is excluded from the data used to build calendar markers", () => {
  const upcoming = record({
    id: "calendar-upcoming",
    type: "season",
    startAt: new Date(NOW + 3 * DAY).toISOString(),
    endAt: new Date(NOW + 10 * DAY).toISOString(),
  });
  const ended = record({
    id: "calendar-ended",
    type: "season",
    startAt: new Date(NOW - 20 * DAY).toISOString(),
    endAt: new Date(NOW - 10 * DAY).toISOString(),
  });
  const visible = getVisibleRecords([upcoming, ended], NOW);
  const ids = visible.map((r) => r.id);
  assert.ok(ids.includes("calendar-upcoming"));
  assert.ok(!ids.includes("calendar-ended"));
});

test("8. completed record is not counted in statistics (getVisibleRecords length)", () => {
  const records = [
    record({
      id: "stat-active",
      type: "event",
      startAt: new Date(NOW - DAY).toISOString(),
      endAt: new Date(NOW + DAY).toISOString(),
    }),
    record({
      id: "stat-ended-1",
      type: "event",
      startAt: new Date(NOW - 5 * DAY).toISOString(),
      endAt: new Date(NOW - DAY).toISOString(),
    }),
    record({
      id: "stat-ended-2",
      type: "banner",
      startAt: new Date(NOW - 5 * DAY).toISOString(),
      endAt: new Date(NOW - DAY).toISOString(),
    }),
  ];
  assert.equal(getVisibleRecords(records, NOW).length, 1);
});

test("9. completed record cannot be opened via a direct public link", () => {
  const ended = record({
    id: "direct-link-ended",
    type: "event",
    startAt: new Date(NOW - 5 * DAY).toISOString(),
    endAt: new Date(NOW - DAY).toISOString(),
  });
  assert.equal(getVisibleRecord(ended, NOW), null);

  const active = record({
    id: "direct-link-active",
    type: "event",
    startAt: new Date(NOW - DAY).toISOString(),
    endAt: new Date(NOW + DAY).toISOString(),
  });
  assert.notEqual(getVisibleRecord(active, NOW), null);
});

test("10. claimEndAt in the future does not keep an ended record active", () => {
  const r = record({
    id: "claim-window",
    type: "event",
    startAt: new Date(NOW - 5 * DAY).toISOString(),
    endAt: new Date(NOW - DAY).toISOString(),
    claimEndAt: new Date(NOW + 5 * DAY).toISOString(),
  });
  const computed = computeRecord(r, NOW);
  assert.equal(computed.status, "completed");
  assert.equal(isRecordActive(computed), false);
  assert.equal(isRecordPubliclyVisible(computed), false);
});

test("11. a record with an unparseable end date is hidden conservatively", () => {
  const r = record({
    id: "bad-date",
    type: "event",
    startAt: new Date(NOW - DAY).toISOString(),
    endAt: "not-a-real-date",
  });
  const computed = computeRecord(r, NOW);
  assert.equal(Number.isFinite(computed.endMs), false);
  assert.equal(isRecordPubliclyVisible(computed), false);
  assert.equal(isRecordActive(computed), false);
  assert.equal(isRecordUpcoming(computed), false);
});

test("12. boundary comparison around the exact end instant", () => {
  const endMs = NOW;
  const r = record({
    id: "boundary",
    type: "banner",
    startAt: new Date(NOW - DAY).toISOString(),
    endAt: new Date(endMs).toISOString(),
  });

  const atEnd = computeRecord(r, endMs);
  assert.equal(atEnd.status, "active");
  assert.equal(isRecordPubliclyVisible(atEnd), true);

  const justAfterEnd = computeRecord(r, endMs + 1);
  assert.equal(justAfterEnd.status, "completed");
  assert.equal(isRecordPubliclyVisible(justAfterEnd), false);

  const justBeforeEnd = computeRecord(r, endMs - 1);
  assert.equal(justBeforeEnd.status, "active");
  assert.equal(isRecordPubliclyVisible(justBeforeEnd), true);
});
