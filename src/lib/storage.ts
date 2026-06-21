/**
 * Thin, defensive wrappers around localStorage. Used by client-only
 * preferences (favorite games, view mode) that must never crash the page if
 * storage is unavailable (private browsing, quota exceeded, disabled by the
 * browser) and must never be touched during server rendering.
 */

export function readFromStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeToStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Non-essential preference — failing silently beats crashing the page.
  }
}
