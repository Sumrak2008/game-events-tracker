import Image from "next/image";

import { getGameCoverUrl } from "@/lib/game-visuals";
import type { Game } from "@/lib/types";

export type GameVisualVariant = "cover" | "thumbnail" | "hero";

const VARIANT_SIZES: Record<GameVisualVariant, string> = {
  cover: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  thumbnail: "64px",
  hero: "100vw",
};

/**
 * Single place that renders a game's visual, in any of three contexts
 * (`cover` — wide card art, `thumbnail` — small square icon in dense lists,
 * `hero` — full-bleed background). Resolves the image through
 * `getGameCoverUrl`; if there isn't one, renders the same gradient +
 * initials placeholder used everywhere else instead of requesting a file
 * that doesn't exist. Must be placed inside a `position: relative` parent
 * with a defined size — it fills that parent via `next/image`'s `fill`.
 */
export function GameVisual({
  game,
  variant = "cover",
  className = "",
  priority = false,
}: {
  game: Pick<
    Game,
    "id" | "name" | "initials" | "colorFrom" | "colorTo" | "imageUrl"
  >;
  variant?: GameVisualVariant;
  className?: string;
  priority?: boolean;
}) {
  const src = getGameCoverUrl(game);

  if (!src) {
    // Same fallback everywhere an image is missing: the game's gradient +
    // initials, absolutely filling the parent the same way next/image's
    // `fill` does, so callers don't need to branch on whether an image
    // exists.
    return (
      <div
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center font-bold text-white ${className}`}
        style={{
          backgroundImage: `linear-gradient(135deg, ${game.colorFrom}, ${game.colorTo})`,
        }}
      >
        {game.initials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`Обложка игры «${game.name}»`}
      fill
      sizes={VARIANT_SIZES[variant]}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
