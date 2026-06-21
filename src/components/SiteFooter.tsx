import { formatLocalDate } from "@/lib/format";

const GITHUB_URL = "https://github.com/Sumrak2008/game-events-tracker";

export function SiteFooter({
  lastVerifiedMs,
}: {
  lastVerifiedMs: number | null;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border mt-12 border-t">
      <div className="text-muted mx-auto max-w-6xl space-y-3 px-4 py-8 text-xs">
        <p>
          Game Events Tracker — трекер игровых баннеров, событий и сезонов.
          Данные хранятся в JSON-файлах проекта и обновляются вручную по
          открытым источникам.
        </p>
        <p>
          Даты, награды и условия событий могут измениться по решению
          разработчиков игр — сверяйтесь с источниками, указанными на странице
          каждой записи.
        </p>
        <p>
          Проект не связан с разработчиками или издателями перечисленных игр и
          не является официальным источником информации.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <p>
            Последняя проверка данных:{" "}
            <span className="text-text">
              {lastVerifiedMs
                ? formatLocalDate(new Date(lastVerifiedMs).toISOString())
                : "нет данных"}
            </span>
          </p>
          <p className="flex items-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-white"
            >
              Проект на GitHub ↗
            </a>
            <span>© {year} Game Events Tracker</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
