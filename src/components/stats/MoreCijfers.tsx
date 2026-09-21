'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * "Meer cijfers": details onder één knop met aantal en titels. `open`: altijd open;
 * `desktop`: alleen open vanaf de brede layout (op mobiel ingeklapt); `false`: ingeklapt.
 */
export function MoreCijfers({
  title,
  list,
  open = false,
  children,
}: {
  title: string;
  list: string;
  open?: boolean | 'desktop';
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (open === 'desktop' && window.matchMedia('(min-width: 1280px)').matches && ref.current) ref.current.open = true;
  }, [open]);
  return (
    <details ref={ref} open={open === true} className="group">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg border border-input-border bg-transparent px-4 text-left text-text marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:px-5 [&::-webkit-details-marker]:hidden">
        <span className="flex flex-col gap-0.5 py-2">
          <span className="font-heading text-[15px] font-semibold">{title}</span>
          <span className="text-[13px] leading-[1.35] text-muted">{list}</span>
        </span>
        <span className="inline-flex flex-none transition-transform group-open:rotate-180" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M3.5 5.5l4 4 4-4" />
          </svg>
        </span>
      </summary>
      <div className="mt-6 flex flex-col gap-6">{children}</div>
    </details>
  );
}
