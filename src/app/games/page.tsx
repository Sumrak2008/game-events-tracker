import type { Metadata } from "next";

import { GamesGrid } from "@/components/GamesGrid";
import { getTrackerData } from "@/lib/data";
import { computeGameStats, type GameStats } from "@/lib/gameStats";
import { getVisibleRecords } from "@/lib/visibility";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Игры" };

export default async function GamesPage() {
  const { games, records, now: serverNow } = await getTrackerData();
  const visible = getVisibleRecords(records, serverNow);

  const statsByGameId = new Map<string, GameStats>();
  for (const game of games) {
    const gameRecords = visible.filter((r) => r.gameId === game.id);
    statsByGameId.set(game.id, computeGameStats(gameRecords, serverNow));
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Игры</h1>
        <p className="text-muted">
          {games.length} игр под отслеживанием. Выберите игру, чтобы увидеть ее
          актуальные и предстоящие баннеры, события и сезоны.
        </p>
      </header>

      <GamesGrid games={games} statsByGameId={statsByGameId} />
    </div>
  );
}
