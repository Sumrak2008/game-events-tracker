import { gameArtUrl } from "@/lib/art";
import type { Game } from "@/lib/types";

/**
 * Renders a game's stylized cover art as a background layer. Uses a CSS
 * background-image (no <img>) so SVG art and future raster images are
 * interchangeable and there is no layout shift. Wrap in a `group` to enable the
 * hover zoom.
 */
export function GameCover({
  game,
  className = "",
  overlay = true,
  zoom = true,
  children,
}: {
  game: Pick<Game, "id" | "imageUrl">;
  className?: string;
  overlay?: boolean;
  zoom?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-cover bg-center ${
          zoom ? "transition-transform duration-500 group-hover:scale-105" : ""
        }`}
        style={{ backgroundImage: `url(${gameArtUrl(game)})` }}
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
