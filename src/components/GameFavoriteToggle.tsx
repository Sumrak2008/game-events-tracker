"use client";

import { FavoriteGameButton } from "@/components/FavoriteGameButton";
import { useFavoriteGames } from "@/lib/useFavoriteGames";

/**
 * Client-only wrapper so server-rendered pages (the games list, a single
 * game's page) can drop in a working favorite-star button without
 * themselves becoming client components.
 */
export function GameFavoriteToggle({
  gameId,
  gameName,
  size = "md",
}: {
  gameId: string;
  gameName: string;
  size?: "sm" | "md";
}) {
  const { isFavorite, toggleFavorite } = useFavoriteGames();
  return (
    <FavoriteGameButton
      active={isFavorite(gameId)}
      onToggle={() => toggleFavorite(gameId)}
      gameName={gameName}
      size={size}
    />
  );
}
