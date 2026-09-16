'use client';

import Link from 'next/link';
import { useState } from 'react';

export type MenuItem = { label: string; url: string };

export function Header({ siteNaam, menu }: { siteNaam: string; menu: MenuItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="font-heading text-xl font-bold tracking-tight text-primary">
          {siteNaam}
        </Link>

        {menu.length > 0 ? (
          <nav className="hidden items-center gap-8 md:flex" aria-label="Hoofdmenu">
            {menu.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                className="font-medium text-text transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        {menu.length > 0 ? (
          <button
            type="button"
            className="rounded-lg p-2 text-text transition-colors hover:bg-background md:hidden"
            aria-controls="mobile-menu"
            aria-expanded={mobileOpen}
            aria-label="Menu openen of sluiten"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <svg className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        ) : null}
      </div>

      {menu.length > 0 && mobileOpen ? (
        <div id="mobile-menu" className="absolute left-0 right-0 border-b border-border bg-white shadow-lg md:hidden">
          <nav className="flex flex-col p-4" aria-label="Mobiel menu">
            {menu.map((item) => (
              <Link
                key={item.url}
                href={item.url}
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
