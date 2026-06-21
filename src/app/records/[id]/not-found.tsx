import Link from "next/link";

export default function RecordNotFound() {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
      <h1 className="text-text text-xl font-semibold">Запись недоступна</h1>
      <p className="text-muted text-sm">
        Этой записи нет, либо событие уже завершилось — сайт показывает только
        активные и предстоящие баннеры, события и сезоны.
      </p>
      <Link
        href="/"
        className="bg-accent text-bg hover:bg-accent/90 mt-2 inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold transition"
      >
        На главную
      </Link>
    </div>
  );
}
