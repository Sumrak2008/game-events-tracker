import { GameVisual } from "@/components/GameVisual";
import type { Game } from "@/lib/types";

/**
 * Renders a game's cover art as a full-bleed background layer behind
 * `children`. Wrap in a `group` to enable the hover zoom. The image itself
 * (or its CSS gradient fallback) is rendered by `GameVisual` — this
 * component only owns the zoom transition, the readability overlay, and
 * the children layout.
 */
export function GameCover({
  game,
  className = "",
  overlay = true,
  zoom = true,
  priority = false,
  children,
}: {
  game: Pick<
    Game,
    "id" | "name" | "initials" | "colorFrom" | "colorTo" | "imageUrl"
  >;
  className?: string;
  overlay?: boolean;
  zoom?: boolean;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <GameVisual
        game={game}
        variant="cover"
        priority={priority}
        className={
          zoom ? "transition-transform duration-500 group-hover:scale-105" : ""
        }
      />
      {overlay ? (
        <div
          aria-hidden="true"
          className="from-bg via-bg/45 absolute inset-0 bg-gradient-to-t to-transparent"
        />
      ) : null}
      {children ? <div className="relative h-full">{children}</div> : null}
    </div>
  );
}
