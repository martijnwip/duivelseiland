'use client';

import { useRef, type ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

/** Horizontaal scrollbare rij (scroll-snap) met vorige/volgende-knoppen, voor de archieffoto's. */
export function ScrollRij({
  label,
  vorige,
  volgende,
  children,
}: {
  label: string;
  vorige: string;
  volgende: string;
  children: ReactNode;
}) {
  const rij = useRef<HTMLDivElement>(null);
  const schuif = (richting: 1 | -1) => {
    const el = rij.current;
    if (!el) return;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: el.clientWidth * 0.8 * richting, behavior: smooth ? 'smooth' : 'auto' });
  };
  const knop =
    'flex size-11 items-center justify-center rounded-lg border border-border bg-card text-text hover:border-primary hover:text-primary';

  return (
    <div>
      <div
        ref={rij}
        tabIndex={0}
        role="region"
        aria-label={label}
        className="grid snap-x snap-mandatory auto-cols-[85%] grid-flow-col gap-4 overflow-x-auto pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:auto-cols-[calc(40%-8px)]"
      >
        {children}
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" className={knop} aria-label={vorige} onClick={() => schuif(-1)}>
          <ChevronLeftIcon className="size-5" aria-hidden />
        </button>
        <button type="button" className={knop} aria-label={volgende} onClick={() => schuif(1)}>
          <ChevronRightIcon className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
