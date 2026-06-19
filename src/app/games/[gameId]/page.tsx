import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DemoNotice } from "@/components/DemoNotice";
import { GameAvatar } from "@/components/GameAvatar";
import { GameCover } from "@/components/GameCover";
import { RecordExplorer } from "@/components/RecordExplorer";
import { getTrackerData } from "@/lib/data";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ gameId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { gameId } = await params;
  const { games } = await getTrackerData();
  const game = games.find((g) => g.id === gameId);
  return { title: game ? game.name : "Игра" };
}

export default async function GamePage({ params }: Params) {
  const { gameId } = await params;
  const { games, records, now: serverNow } = await getTrackerData();
  const game = games.find((g) => g.id === gameId);
  if (!game) notFound();

  const gameRecords = records.filter((r) => r.gameId === game.id);
  const hasDemo = gameRecords.some((r) => r.isDemo);

  return (
    <div className="space-y-6">
      <Link href="/games" className="text-accent text-sm hover:text-white">
        ← Все игры
      </Link>

      <GameCover
        game={game}
        zoom={false}
        className="border-border h-56 rounded-2xl border sm:h-64"
      >
        <header className="flex h-full items-end gap-4 p-6">
          <GameAvatar game={game} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow sm:text-3xl">
              {game.name}
            </h1>
            {game.publisher ? (
              <p className="text-sm text-white/75">{game.publisher}</p>
            ) : null}
          </div>
        </header>
      </GameCover>

      {hasDemo ? <DemoNotice /> : null}

      <RecordExplorer
        records={gameRecords}
        games={games}
        serverNow={serverNow}
        showGameFilter={false}
        emptyMessage="Для этой игры пока нет записей."
      />
    </div>
  );
}
