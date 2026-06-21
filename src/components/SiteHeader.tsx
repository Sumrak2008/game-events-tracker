"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Главная" },
  { href: "/games", label: "Игры" },
  { href: "/ending-soon", label: "Скоро закончатся" },
  { href: "/calendar", label: "Календарь" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes (e.g. after tapping a
  // nav link), adjusted during render rather than in an effect to avoid an
  // extra cascading render.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <header className="border-border bg-bg/80 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden="true"
            className="from-accent to-season inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-sm text-white"
          >
            G
          </span>
          <span className="text-text">Game Events Tracker</span>
        </Link>

        <nav
          aria-label="Основная навигация"
          className="hidden items-center gap-1 text-sm sm:flex"
        >
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

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          className="border-border text-text flex h-10 w-10 items-center justify-center rounded-lg border sm:hidden"
        >
          <span aria-hidden="true" className="relative block h-3.5 w-4.5">
            <span
              className={`bg-text absolute left-0 h-0.5 w-4.5 rounded transition ${
                menuOpen ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`bg-text absolute top-1.5 left-0 h-0.5 w-4.5 rounded transition ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`bg-text absolute left-0 h-0.5 w-4.5 rounded transition ${
                menuOpen ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Мобильная навигация"
          className="border-border flex flex-col gap-1 border-t px-4 py-3 sm:hidden"
        >
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-lg px-3 text-sm transition ${
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
      ) : null}
    </header>
  );
}
