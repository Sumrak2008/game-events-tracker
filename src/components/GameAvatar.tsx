import type { Game } from "@/lib/types";

const SIZES = {
  sm: "h-9 w-9 text-[11px] rounded-lg",
  md: "h-12 w-12 text-sm rounded-xl",
  lg: "h-16 w-16 text-base rounded-2xl",
} as const;

export function GameAvatar({
  game,
  size = "md",
}: {
  game: Pick<Game, "initials" | "colorFrom" | "colorTo" | "name">;
  size?: keyof typeof SIZES;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-bold tracking-tight text-white shadow-inner ${SIZES[size]}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${game.colorFrom}, ${game.colorTo})`,
      }}
      aria-hidden="true"
      title={game.name}
    >
      {game.initials}
    </span>
  );
}
