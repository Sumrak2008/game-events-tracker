import type { Game } from "@/lib/types";

/**
 * Resolves the cover art URL for a game. Prefers an explicit raster `imageUrl`
 * if provided in games.json; otherwise falls back to the bundled original SVG
 * art. Swapping in raster images later is just a data change — no code edits.
 */
export function gameArtUrl(game: Pick<Game, "id" | "imageUrl">): string {
  if (game.imageUrl && game.imageUrl.trim().length > 0) {
    return game.imageUrl;
  }
  return `/art/games/${game.id}.svg`;
}
