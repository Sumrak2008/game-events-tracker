import Link from "next/link";

export function SectionHeader({
  title,
  count,
  icon,
  href,
  hint,
}: {
  title: string;
  count?: number;
  icon?: string;
  href?: string;
  hint?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        <h2 className="text-text text-lg font-semibold">{title}</h2>
        {typeof count === "number" ? (
          <span className="bg-surface-2 text-muted rounded-full px-2 py-0.5 text-xs">
            {count}
          </span>
        ) : null}
      </div>
      {hint ? <span className="text-muted text-xs">{hint}</span> : null}
      {href ? (
        <Link
          href={href}
          className="text-accent text-sm transition hover:text-white"
        >
          Все →
        </Link>
      ) : null}
    </div>
  );
}
