import type { ViewMode } from "@/lib/viewMode";

export function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Режим отображения списка"
      className="border-border bg-surface inline-flex h-10 shrink-0 items-center gap-0.5 rounded-lg border p-1"
    >
      <button
        type="button"
        aria-pressed={mode === "cards"}
        onClick={() => onChange("cards")}
        className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition ${
          mode === "cards"
            ? "bg-accent/20 text-text"
            : "text-muted hover:text-text"
        }`}
      >
        <span aria-hidden="true">▦</span>
        Карточки
      </button>
      <button
        type="button"
        aria-pressed={mode === "list"}
        onClick={() => onChange("list")}
        className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition ${
          mode === "list"
            ? "bg-accent/20 text-text"
            : "text-muted hover:text-text"
        }`}
      >
        <span aria-hidden="true">≡</span>
        Список
      </button>
    </div>
  );
}
