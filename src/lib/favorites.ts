export const FAVORITE_GAMES_STORAGE_KEY = "get:favorite-games";

/**
 * Parses a raw localStorage value into a clean list of favorite game ids:
 * de-duplicated, non-empty strings only. Anything else (missing value,
 * corrupt JSON, wrong shape, non-string entries) falls back to an empty
 * list rather than throwing or showing a broken favorites state.
 */
export function parseFavoriteGameIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const ids: string[] = [];
  const seen = new Set<string>();
  for (const entry of parsed) {
    if (typeof entry !== "string" || entry.length === 0) continue;
    if (seen.has(entry)) continue;
    seen.add(entry);
    ids.push(entry);
  }
  return ids;
}

export function serializeFavoriteGameIds(ids: string[]): string {
  return JSON.stringify(ids);
}

/** Adds gameId if absent, removes it if present. Never produces duplicates. */
export function toggleFavoriteGameId(ids: string[], gameId: string): string[] {
  return ids.includes(gameId)
    ? ids.filter((id) => id !== gameId)
    : [...ids, gameId];
}
