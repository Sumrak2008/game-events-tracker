import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
      <h1 className="text-text text-xl font-semibold">Страница не найдена</h1>
      <p className="text-muted text-sm">
        Такой страницы нет, либо запись, на которую вы перешли, уже завершилась
        и поэтому не показывается.
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
