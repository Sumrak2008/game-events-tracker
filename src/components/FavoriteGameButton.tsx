/**
 * Star toggle for marking a game as a favorite. The active state is shown
 * with a filled star icon AND a different label/title (not color alone),
 * so it reads correctly without relying on color perception.
 */
export function FavoriteGameButton({
  active,
  onToggle,
  gameName,
  size = "md",
}: {
  active: boolean;
  onToggle: () => void;
  gameName: string;
  size?: "sm" | "md";
}) {
  const dimensions = size === "sm" ? "h-8 w-8 text-base" : "h-10 w-10 text-lg";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={active}
      aria-label={
        active
          ? `Убрать ${gameName} из избранного`
          : `Добавить ${gameName} в избранное`
      }
      title={active ? "В избранном" : "Добавить в избранное"}
      className={`flex shrink-0 items-center justify-center rounded-lg border transition ${dimensions} ${
        active
          ? "border-warning/50 bg-warning/15 text-warning"
          : "border-border bg-bg/40 text-muted hover:text-warning hover:border-warning/40"
      }`}
    >
      <span aria-hidden="true">{active ? "★" : "☆"}</span>
    </button>
  );
}
