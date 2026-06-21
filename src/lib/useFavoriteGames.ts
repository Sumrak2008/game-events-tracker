"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  FAVORITE_GAMES_STORAGE_KEY,
  parseFavoriteGameIds,
  serializeFavoriteGameIds,
  toggleFavoriteGameId,
} from "@/lib/favorites";
import { readFromStorage, writeToStorage } from "@/lib/storage";

const CHANGE_EVENT = "get:favorite-games-change";
const EMPTY: readonly string[] = [];

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

// useSyncExternalStore requires getSnapshot to return a stable (===) value
// when nothing has actually changed — parseFavoriteGameIds always allocates
// a new array, so the raw string is cached and the parsed array is only
// recomputed when the underlying storage value actually changes. Without
// this, React sees a "new" snapshot every render and loops.
let cachedRaw: string | null = null;
let cachedSnapshot: readonly string[] = EMPTY;

function getSnapshot(): readonly string[] {
  const raw = readFromStorage(FAVORITE_GAMES_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = parseFavoriteGameIds(raw);
  }
  return cachedSnapshot;
}

function getServerSnapshot(): readonly string[] {
  // No favorites on the server — matches the client's pre-hydration state
  // (an empty list) until the effect-free useSyncExternalStore read kicks in.
  return EMPTY;
}

export interface FavoriteGames {
  favoriteIds: readonly string[];
  isFavorite: (gameId: string) => boolean;
  toggleFavorite: (gameId: string) => void;
}

/**
 * Persists the user's favorite games across page loads via localStorage,
 * read through useSyncExternalStore (server snapshot = empty list, so there
 * is no hydration mismatch). No authentication, no server storage — this is
 * purely a client-side convenience.
 */
export function useFavoriteGames(): FavoriteGames {
  const favoriteIds = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggleFavorite = useCallback((gameId: string) => {
    const current = parseFavoriteGameIds(
      readFromStorage(FAVORITE_GAMES_STORAGE_KEY),
    );
    const next = toggleFavoriteGameId(current, gameId);
    writeToStorage(FAVORITE_GAMES_STORAGE_KEY, serializeFavoriteGameIds(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const isFavorite = useCallback(
    (gameId: string) => favoriteIds.includes(gameId),
    [favoriteIds],
  );

  return { favoriteIds, isFavorite, toggleFavorite };
}
