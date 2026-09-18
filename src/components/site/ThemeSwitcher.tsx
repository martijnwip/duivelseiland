'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, DesktopIcon } from '@radix-ui/react-icons';
import { useDropdown } from './useDropdown';

const options = [
  { value: 'light', label: 'Licht', Icon: SunIcon },
  { value: 'dark', label: 'Donker', Icon: MoonIcon },
  { value: 'system', label: 'Automatisch', Icon: DesktopIcon },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { open, setOpen, ref } = useDropdown<HTMLDivElement>();

  useEffect(() => setMounted(true), []);

  // Server always renders as if theme is unset (falls back to options[2]),
  // since useTheme() has no value server-side; matching that on the client's
  // first render too (before `mounted`) avoids a hydration mismatch — the
  // real icon swaps in right after mount, as a normal client-side update.
  const active = options.find((option) => option.value === (mounted ? theme : undefined)) ?? options[2];
  const ActiveIcon = active.Icon;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="rounded-lg p-2 text-text transition-colors hover:bg-border/30"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Thema wijzigen"
        onClick={() => setOpen((o) => !o)}
      >
        <ActiveIcon className="h-5 w-5" aria-hidden />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-40 rounded-lg border border-border bg-background py-1 shadow-lg">
          {options.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={mounted && theme === value}
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              className={
                mounted && theme === value
                  ? 'flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-primary'
                  : 'flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-text transition-colors hover:bg-border/30 hover:text-primary'
              }
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
