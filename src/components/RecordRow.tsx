import Link from "next/link";

import {
  ConfidenceBadge,
  DemoBadge,
  StatusBadge,
  TypeBadge,
} from "@/components/Badges";
import { Countdown } from "@/components/Countdown";
import { GameVisual } from "@/components/GameVisual";
import { recordTitle } from "@/lib/localized";
import type { ComputedRecord, Game } from "@/lib/types";

/**
 * Compact single-row representation of a record, used by the "list" view
 * mode. Same data, same filtering/sorting as the card grid — just a denser
 * layout for scanning many records at once. A single link, like RecordCard.
 */
export function RecordRow({
  record,
  game,
  now,
}: {
  record: ComputedRecord;
  game?: Game;
  now: number;
}) {
  const title = recordTitle(record);

  return (
    <Link
      href={`/records/${record.id}`}
      className="card card-interactive hover:border-accent/60 flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="flex min-w-0 items-center gap-2 sm:w-44 sm:shrink-0">
        {game ? (
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
            <GameVisual game={game} variant="thumbnail" />
          </div>
        ) : null}
        <span className="text-muted truncate text-xs">
          {game?.name ?? record.gameId}
        </span>
      </div>

      <p className="text-text min-w-0 flex-1 truncate text-sm font-medium">
        {title}
      </p>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <TypeBadge type={record.type} />
        <ConfidenceBadge confidence={record.confidence} />
        {record.isDemo ? <DemoBadge /> : null}
        <Countdown record={record} now={now} />
        <StatusBadge status={record.status} />
      </div>
    </Link>
  );
}
