import Image from "next/image";
import Link from "next/link";

import { DemoNotice } from "@/components/DemoNotice";
import { HomeDashboard } from "@/components/HomeDashboard";
import { getTrackerData } from "@/lib/data";
import { formatLocalDate } from "@/lib/format";
import { computeSiteStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const {
    records,
    games,
    lastVerifiedMs,
    now: serverNow,
  } = await getTrackerData();
  const hasDemo = records.some((r) => r.isDemo);

  // computeSiteStats is the single source of truth for these counters: it
  // excludes completed records and weapon banners, and de-duplicates by a
  // stable type:id key so "ending soon" never inflates the total on top of
  // "active".
  const stats = computeSiteStats(records, serverNow);

  return (
    <div className="space-y-8">
      <section className="glow-accent border-border relative overflow-hidden rounded-3xl border">
        <Image
          src="/images/ui/hero-background.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="from-bg via-bg/85 to-bg/50 absolute inset-0 bg-gradient-to-r"
        />
        <div className="relative max-w-2xl space-y-3 p-5 sm:space-y-5 sm:p-10">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="border-border bg-bg/40 text-muted inline-flex items-center gap-2 rounded-full border px-3 py-1">
              {games.length} игр под отслеживанием
            </span>
            <span className="border-border bg-bg/40 text-muted hidden items-center gap-2 rounded-full border px-3 py-1 sm:inline-flex">
              Обновлено:{" "}
              {lastVerifiedMs
                ? formatLocalDate(new Date(lastVerifiedMs).toISOString())
                : "нет данных"}
            </span>
          </div>
          <h1 className="text-2xl leading-tight font-bold sm:text-4xl">
            <span className="text-gradient">Game Events Tracker</span> —
            баннеры, события и сезоны
          </h1>
          <p className="text-muted max-w-lg text-sm sm:text-base">
            Только то, что актуально прямо сейчас или скоро начнётся.
            Завершённые записи в публичном интерфейсе не показываются.
          </p>
          <dl className="flex flex-wrap gap-2 text-sm">
            <div className="bg-active/15 text-active ring-active/30 rounded-lg px-3 py-1.5 font-semibold ring-1 ring-inset">
              <dd className="inline">{stats.active}</dd>{" "}
              <dt className="inline font-medium">активно</dt>
            </div>
            <div className="bg-upcoming/15 text-upcoming ring-upcoming/30 rounded-lg px-3 py-1.5 font-semibold ring-1 ring-inset">
              <dd className="inline">{stats.upcoming}</dd>{" "}
              <dt className="inline font-medium">предстоит</dt>
            </div>
            <div className="bg-urgent/15 text-urgent ring-urgent/30 rounded-lg px-3 py-1.5 font-semibold ring-1 ring-inset">
              <dd className="inline">{stats.endingSoon}</dd>{" "}
              <dt className="inline font-medium">скоро закончится</dt>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="#section-active-events"
              className="bg-accent text-bg hover:bg-accent/90 inline-flex h-9 items-center rounded-lg px-4 text-sm font-semibold transition sm:h-10"
            >
              Актуальные события
            </Link>
            <Link
              href="/calendar"
              className="border-border-strong text-text hover:bg-surface-2 inline-flex h-9 items-center rounded-lg border px-4 text-sm font-semibold transition sm:h-10"
            >
              Открыть календарь
            </Link>
          </div>
        </div>
      </section>

      {hasDemo ? <DemoNotice /> : null}

      <HomeDashboard
        records={records}
        games={games}
        serverNow={serverNow}
        lastVerifiedMs={lastVerifiedMs}
      />
    </div>
  );
}
