import assert from "node:assert/strict";
import test from "node:test";

import { parseViewMode } from "./viewMode.ts";

test("a valid stored value round-trips", () => {
  assert.equal(parseViewMode("list"), "list");
  assert.equal(parseViewMode("cards"), "cards");
});

test("missing value falls back to the default", () => {
  assert.equal(parseViewMode(null), "cards");
  assert.equal(parseViewMode(undefined), "cards");
});

test("corrupt/unexpected stored value falls back to the default", () => {
  assert.equal(parseViewMode("garbage"), "cards");
  assert.equal(parseViewMode(""), "cards");
  assert.equal(parseViewMode("LIST"), "cards");
});
