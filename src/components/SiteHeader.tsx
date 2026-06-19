"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Главная" },
  { href: "/games", label: "Игры" },
  { href: "/ending-soon", label: "Скоро закончатся" },
  { href: "/calendar", label: "Календарь" },
  { href: "/archive", label: "Архив" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-border bg-bg/80 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden="true"
            className="from-accent to-season inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-sm text-white"
          >
            G
          </span>
          <span className="text-text">Game Events Tracker</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 transition ${
                  active
                    ? "bg-surface-2 text-text"
                    : "text-muted hover:bg-surface hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
