export type ViewMode = "cards" | "list";

export const VIEW_MODE_STORAGE_KEY = "get:view-mode";
export const DEFAULT_VIEW_MODE: ViewMode = "cards";

/**
 * Parses a raw localStorage value into a valid ViewMode. Anything that
 * isn't exactly "list" falls back to the default "cards" — this is the only
 * place that decides what counts as valid, so corrupt/old/unexpected stored
 * values can never put the UI in a broken state.
 */
export function parseViewMode(raw: string | null | undefined): ViewMode {
  return raw === "list" ? "list" : DEFAULT_VIEW_MODE;
}
