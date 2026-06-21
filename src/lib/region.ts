/**
 * The same "no specific region" concept shows up in the data under several
 * different spellings (English, Russian, different source phrasing). This
 * normalizes all of them to one label for display, without touching the
 * underlying JSON values. Any other (real, specific) region passes through
 * unchanged — this never invents a region that wasn't in the data.
 */
const GLOBAL_LABEL = "Все регионы";

const GLOBAL_ALIASES = new Set(
  [
    "global",
    "all",
    "все регионы",
    "глобальный сервер",
    "worldwide",
    "all regions",
  ].map((s) => s.toLowerCase()),
);

export function normalizeRegionLabel(
  region: string | undefined | null,
): string {
  if (!region) return GLOBAL_LABEL;
  const trimmed = region.trim();
  if (trimmed.length === 0) return GLOBAL_LABEL;
  return GLOBAL_ALIASES.has(trimmed.toLowerCase()) ? GLOBAL_LABEL : trimmed;
}
