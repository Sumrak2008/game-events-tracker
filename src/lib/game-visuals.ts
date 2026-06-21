import type { Game } from "@/lib/types";

/**
 * Maps a game's id (the slug used throughout data/games.json — there is no
 * separate "slug" field, `id` already serves that role) to its cover
 * illustration. These are generated, unofficial illustrations, not official
 * art from the games' publishers.
 *
 * The NIKKE entry's id is `goddess-of-victory-nikke` (matching data/games.json),
 * not `nikke` — only the asset filename is the shorter `nikke.webp`.
 */
const GAME_COVER_BY_SLUG: Record<string, string> = {
  "genshin-impact": "/images/games/covers/genshin-impact.webp",
  "honkai-star-rail": "/images/games/covers/honkai-star-rail.webp",
  "zenless-zone-zero": "/images/games/covers/zenless-zone-zero.webp",
  "arknights-endfield": "/images/games/covers/arknights-endfield.webp",
  "neverness-to-everness": "/images/games/covers/neverness-to-everness.webp",
  "goddess-of-victory-nikke": "/images/games/covers/nikke.webp",
  "diablo-iv": "/images/games/covers/diablo-iv.webp",
  "world-of-warcraft": "/images/games/covers/world-of-warcraft.webp",
};

/**
 * Resolves the cover image URL for a game, or undefined if none exists —
 * callers must fall back to a CSS placeholder in that case, never request a
 * file that doesn't exist. An explicit `imageUrl` in games.json (not
 * currently set for any game) always takes priority over the static map, so
 * a future per-game override needs only a data change, no code change.
 */
export function getGameCoverUrl(
  game: Pick<Game, "id" | "imageUrl">,
): string | undefined {
  if (game.imageUrl && game.imageUrl.trim().length > 0) return game.imageUrl;
  return GAME_COVER_BY_SLUG[game.id];
}
