import assert from "node:assert/strict";
import test from "node:test";

import { computeStatus, parseRecordDate } from "./status.ts";

test("parseRecordDate resolves date-only values using the boundary", () => {
  const start = parseRecordDate("2026-06-10", "start", "UTC");
  const end = parseRecordDate("2026-06-10", "end", "UTC");
  assert.equal(new Date(start).toISOString(), "2026-06-10T00:00:00.000Z");
  assert.equal(new Date(end).toISOString(), "2026-06-10T23:59:59.000Z");
});

test("parseRecordDate honors explicit offsets regardless of timezone hint", () => {
  const ms = parseRecordDate("2026-06-10T10:00:00+08:00", "start", "UTC+8");
  assert.equal(new Date(ms).toISOString(), "2026-06-10T02:00:00.000Z");
});

test("computeStatus: upcoming / active / completed boundaries", () => {
  const record = {
    startAt: "2026-06-10T00:00:00Z",
    endAt: "2026-06-20T00:00:00Z",
    timezone: "UTC",
  };
  assert.equal(
    computeStatus(record, Date.parse("2026-06-09T23:59:59Z")),
    "upcoming",
  );
  assert.equal(
    computeStatus(record, Date.parse("2026-06-15T00:00:00Z")),
    "active",
  );
  assert.equal(
    computeStatus(record, Date.parse("2026-06-20T00:00:00Z")),
    "active",
  );
  assert.equal(
    computeStatus(record, Date.parse("2026-06-20T00:00:01Z")),
    "completed",
  );
});
