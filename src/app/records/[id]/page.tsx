import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  ConfidenceBadge,
  DemoBadge,
  EventSubtypeBadge,
  RegionBadge,
  StatusBadge,
  SubtypeBadge,
  TypeBadge,
} from "@/components/Badges";
import { Countdown } from "@/components/Countdown";
import { GameAvatar } from "@/components/GameAvatar";
import { GameCover } from "@/components/GameCover";
import { getTrackerData } from "@/lib/data";
import { formatInZone, formatLocalDate } from "@/lib/format";
import { sourceTypeLabel } from "@/lib/labels";
import {
  recordDescription,
  recordNote,
  recordRequirements,
  recordRewardSummary,
  recordTitle,
} from "@/lib/localized";
import { hasSummonCurrency, premiumCurrencyText } from "@/lib/records";
import { computeRecord } from "@/lib/status";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const { records } = await getTrackerData();
  const record = records.find((r) => r.id === id);
  return { title: record ? recordTitle(record) : "Запись" };
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="border-border/60 flex flex-col gap-0.5 border-b py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="text-muted w-40 shrink-0 text-sm">{label}</dt>
      <dd className="text-text text-sm">{value}</dd>
    </div>
  );
}

export default async function RecordDetailPage({ params }: Params) {
  const { id } = await params;
  const { records, games, now: serverNow } = await getTrackerData();
  const raw = records.find((r) => r.id === id);
  if (!raw) notFound();

  const record = computeRecord(raw, serverNow);
  const game = games.find((g) => g.id === record.gameId);
  const title = recordTitle(record);
  const description = recordDescription(record);
  const rewardSummary = recordRewardSummary(record);
  const requirements = recordRequirements(record);
  const note = recordNote(record);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/" className="text-accent text-sm hover:text-white">
        ← На главную
      </Link>

      {game ? (
        <GameCover
          game={game}
          zoom={false}
          className="border-border h-40 w-full rounded-2xl border sm:h-48"
        />
      ) : null}

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          {game ? <GameAvatar game={game} size="md" /> : null}
          <Link
            href={game ? `/games/${game.id}` : "/games"}
            className="text-muted hover:text-text text-sm"
          >
            {game?.name ?? record.gameId}
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {record.originalTitle ? (
            <p className="text-muted mt-1 text-xs">
              Оригинальное название: {record.originalTitle}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={record.status} />
          <TypeBadge type={record.type} />
          {record.type === "banner" && record.bannerSubtype ? (
            <SubtypeBadge subtype={record.bannerSubtype} />
          ) : null}
          {record.type === "event" && record.eventSubtype ? (
            <EventSubtypeBadge subtype={record.eventSubtype} />
          ) : null}
          <ConfidenceBadge confidence={record.confidence} />
          <RegionBadge region={record.region} />
          {record.isDemo ? <DemoBadge /> : null}
        </div>
        <Countdown record={record} now={serverNow} size="md" />
      </header>

      {record.isDemo ? (
        <div className="card border-amber-400/30 bg-amber-400/5 p-3 text-sm text-amber-100/90">
          <span className="font-semibold text-amber-200">
            Данные не подтверждены официально.
          </span>{" "}
          {note ??
            "Демонстрационная запись. Даты не отражают подтвержденное расписание."}
        </div>
      ) : null}

      <p className="text-muted">{description}</p>

      {rewardSummary ||
      record.rewards?.length ||
      premiumCurrencyText(record) ||
      hasSummonCurrency(record) ||
      requirements ? (
        <div className="card space-y-3 p-4">
          <h2 className="text-text text-sm font-semibold">Награды</h2>
          {rewardSummary ? (
            <p className="text-muted text-sm">{rewardSummary}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {premiumCurrencyText(record) ? (
              <span className="bg-event/15 text-event ring-event/30 rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset">
                Валюта: {premiumCurrencyText(record)}
              </span>
            ) : null}
            {hasSummonCurrency(record) ? (
              <span className="bg-banner/15 text-banner ring-banner/30 rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset">
                Призывы x{record.summonCurrencyAmount}
              </span>
            ) : null}
          </div>
          {record.rewards?.length ? (
            <ul className="text-muted list-inside list-disc space-y-1 text-sm">
              {record.rewards.map((reward) => (
                <li key={reward}>{reward}</li>
              ))}
            </ul>
          ) : null}
          {requirements ? (
            <p className="text-muted text-xs">
              <span className="text-text">Условия:</span> {requirements}
            </p>
          ) : null}
        </div>
      ) : null}

      <dl className="card px-4 py-2">
        <DetailRow
          label="Начало"
          value={formatInZone(record.startAt, record.timezone)}
        />
        <DetailRow
          label="Окончание"
          value={formatInZone(record.endAt, record.timezone)}
        />
        {record.claimEndAt ? (
          <DetailRow
            label="Забрать награды до"
            value={formatInZone(record.claimEndAt, record.timezone)}
          />
        ) : null}
        <DetailRow label="Часовой пояс" value={record.timezone} />
        <DetailRow label="Регион" value={record.region} />
        <DetailRow
          label="Достоверность"
          value={<ConfidenceBadge confidence={record.confidence} />}
        />
        <DetailRow
          label="Тип источника"
          value={sourceTypeLabel(record.sourceType)}
        />
        <DetailRow
          label="Проверено"
          value={formatLocalDate(record.verifiedAt)}
        />
        <DetailRow
          label={record.sourceUrls.length > 1 ? "Источники" : "Источник"}
          value={
            <ul className="space-y-1">
              {record.sourceUrls.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent break-all hover:text-white"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          }
        />
        {record.verificationNote ? (
          <DetailRow label="Проверка" value={record.verificationNote} />
        ) : null}
        {note ? <DetailRow label="Примечание" value={note} /> : null}
        <DetailRow label="ID записи" value={<code>{record.id}</code>} />
      </dl>
    </div>
  );
}
