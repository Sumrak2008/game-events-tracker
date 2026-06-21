import assert from "node:assert/strict";
import test from "node:test";

import { normalizeRegionLabel } from "./region.ts";

test("global synonyms normalize to a single label", () => {
  assert.equal(normalizeRegionLabel("Global"), "Все регионы");
  assert.equal(normalizeRegionLabel("Все регионы"), "Все регионы");
  assert.equal(normalizeRegionLabel("Глобальный сервер"), "Все регионы");
  assert.equal(normalizeRegionLabel("global"), "Все регионы");
  assert.equal(normalizeRegionLabel("all"), "Все регионы");
});

test("a real specific region passes through unchanged", () => {
  assert.equal(normalizeRegionLabel("Americas"), "Americas");
  assert.equal(normalizeRegionLabel("Retail"), "Retail");
  assert.equal(normalizeRegionLabel("Europe"), "Europe");
});

test("missing or empty region does not get an invented value, just the global label", () => {
  assert.equal(normalizeRegionLabel(undefined), "Все регионы");
  assert.equal(normalizeRegionLabel(null), "Все регионы");
  assert.equal(normalizeRegionLabel(""), "Все регионы");
  assert.equal(normalizeRegionLabel("   "), "Все регионы");
});

test("normalization is whitespace and case insensitive", () => {
  assert.equal(normalizeRegionLabel("  GLOBAL  "), "Все регионы");
  assert.equal(normalizeRegionLabel("ГЛОБАЛЬНЫЙ СЕРВЕР"), "Все регионы");
});
