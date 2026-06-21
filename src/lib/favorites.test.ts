import assert from "node:assert/strict";
import test from "node:test";

import {
  parseFavoriteGameIds,
  serializeFavoriteGameIds,
  toggleFavoriteGameId,
} from "./favorites.ts";

test("serialize then parse round-trips a list of ids", () => {
  const ids = ["genshin-impact", "world-of-warcraft"];
  assert.deepEqual(parseFavoriteGameIds(serializeFavoriteGameIds(ids)), ids);
});

test("missing value parses to an empty list", () => {
  assert.deepEqual(parseFavoriteGameIds(null), []);
  assert.deepEqual(parseFavoriteGameIds(undefined), []);
  assert.deepEqual(parseFavoriteGameIds(""), []);
});

test("corrupt JSON parses to an empty list instead of throwing", () => {
  assert.deepEqual(parseFavoriteGameIds("{not valid json"), []);
  assert.deepEqual(parseFavoriteGameIds("undefined"), []);
});

test("a non-array JSON value parses to an empty list", () => {
  assert.deepEqual(parseFavoriteGameIds('{"a":1}'), []);
  assert.deepEqual(parseFavoriteGameIds('"just a string"'), []);
  assert.deepEqual(parseFavoriteGameIds("42"), []);
});

test("non-string and empty-string entries are dropped", () => {
  assert.deepEqual(
    parseFavoriteGameIds('["genshin-impact", 42, null, "", "nikke"]'),
    ["genshin-impact", "nikke"],
  );
});

test("duplicate ids are removed", () => {
  assert.deepEqual(
    parseFavoriteGameIds('["genshin-impact", "genshin-impact", "nikke"]'),
    ["genshin-impact", "nikke"],
  );
});

test("toggleFavoriteGameId adds an absent id and removes a present one", () => {
  assert.deepEqual(toggleFavoriteGameId([], "genshin-impact"), [
    "genshin-impact",
  ]);
  assert.deepEqual(
    toggleFavoriteGameId(["genshin-impact"], "genshin-impact"),
    [],
  );
  assert.deepEqual(toggleFavoriteGameId(["genshin-impact"], "nikke"), [
    "genshin-impact",
    "nikke",
  ]);
});

test("toggleFavoriteGameId never produces duplicates", () => {
  const result = toggleFavoriteGameId(["a", "b"], "c");
  const unique = new Set(result);
  assert.equal(unique.size, result.length);
});
