"use client";

import Link from "next/link";
import { useState } from "react";
import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { localizedHref } from "@/i18n/localizedHref";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export type MenuItem = { label: string; url: string };

export function Header({
  siteNaam,
  menu,
  locale,
}: {
  siteNaam: string;
  menu: MenuItem[];
  locale: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href={localizedHref(locale, "/")}
          className="font-serif text-3xl font-bold tracking-tight text-primary"
        >
          {siteNaam}
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <ThemeSwitcher />

          {menu.length > 0 ? (
            <button
              type="button"
              className="rounded-lg p-2 text-text transition-colors hover:bg-border/30"
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
              aria-label="Menu openen of sluiten"
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <Cross1Icon className="h-6 w-6" aria-hidden />
              ) : (
                <HamburgerMenuIcon className="h-6 w-6" aria-hidden />
              )}
            </button>
          ) : null}
        </div>
      </div>

      {menu.length > 0 && mobileOpen ? (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 border-b border-border bg-background shadow-lg"
        >
          <nav className="flex flex-col p-4" aria-label="Hoofdmenu">
            {menu.map((item) => (
              <Link
                key={item.url}
                href={localizedHref(locale, item.url)}
                className="rounded px-4 py-2 font-medium text-text transition-colors hover:bg-background hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
