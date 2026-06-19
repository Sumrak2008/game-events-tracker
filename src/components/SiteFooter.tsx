import { formatLocalDate } from "@/lib/format";

export function SiteFooter({
  lastVerifiedMs,
}: {
  lastVerifiedMs: number | null;
}) {
  return (
    <footer className="border-border mt-12 border-t">
      <div className="text-muted mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs">
        <p>
          Game Events Tracker — трекер игровых баннеров, событий и сезонов.
          Данные хранятся в JSON-файлах проекта.
        </p>
        <p>
          Последняя проверка данных:{" "}
          <span className="text-text">
            {lastVerifiedMs
              ? formatLocalDate(new Date(lastVerifiedMs).toISOString())
              : "нет данных"}
          </span>
        </p>
      </div>
    </footer>
  );
}
