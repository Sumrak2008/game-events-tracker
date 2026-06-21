"use client";

import { useSyncExternalStore } from "react";

import { readFromStorage, writeToStorage } from "@/lib/storage";
import {
  DEFAULT_VIEW_MODE,
  parseViewMode,
  VIEW_MODE_STORAGE_KEY,
  type ViewMode,
} from "@/lib/viewMode";

const CHANGE_EVENT = "get:view-mode-change";

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot(): ViewMode {
  return parseViewMode(readFromStorage(VIEW_MODE_STORAGE_KEY));
}

function getServerSnapshot(): ViewMode {
  return DEFAULT_VIEW_MODE;
}

/**
 * Persists the user's preferred record list layout (cards/list) across page
 * loads, using useSyncExternalStore to read localStorage the React-correct
 * way: the server snapshot is always DEFAULT_VIEW_MODE (matching SSR HTML,
 * so there is no hydration mismatch), and the client snapshot is read from
 * storage. Writes dispatch a same-tab event so other components using this
 * hook update immediately — the native "storage" event only fires in other
 * tabs/windows, not the one that made the change.
 */
export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setMode(next: ViewMode) {
    writeToStorage(VIEW_MODE_STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return [mode, setMode];
}
