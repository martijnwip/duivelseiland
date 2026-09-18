'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localizedHref, stripLocalePrefix } from '@/i18n/localizedHref';
import { localeMeta } from '@/i18n/localeMeta';
import { routing } from '@/i18n/routing';
import { useDropdown } from './useDropdown';

export function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const barePath = stripLocalePrefix(pathname, routing.locales);
  const { open, setOpen, ref } = useDropdown<HTMLDivElement>();
  const active = localeMeta[locale];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-1 rounded-lg p-2 text-text transition-colors hover:bg-border/30"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Taal wijzigen"
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden>{active.flag}</span>
        <span className="hidden text-sm font-medium sm:inline">{active.label}</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-40 rounded-lg border border-border bg-background py-1 shadow-lg">
          {routing.locales.map((code) => (
            <Link
              key={code}
              href={localizedHref(code, barePath)}
              aria-current={code === locale ? 'true' : undefined}
              onClick={() => setOpen(false)}
              className={
                code === locale
                  ? 'flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary'
                  : 'flex items-center gap-2 px-4 py-2 text-sm text-text transition-colors hover:bg-border/30 hover:text-primary'
              }
            >
              <span aria-hidden>{localeMeta[code].flag}</span>
              {localeMeta[code].label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
