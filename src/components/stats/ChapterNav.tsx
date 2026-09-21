'use client';

import { useEffect, useState } from 'react';

type Chapter = { id: string; name: string };

function useActive(ids: string[]) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      let cur = 0;
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 160) cur = i;
      });
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ids]);
  return active;
}

const CHEV = (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M3.5 5.5l4 4 4-4" />
  </svg>
);

function Progress({ active, total }: { active: number; total: number }) {
  return (
    <div aria-hidden className="h-[3px] rounded-sm bg-border">
      <div className="h-[3px] rounded-sm bg-primary" style={{ width: `${((active + 0.35) / total) * 100}%` }} />
    </div>
  );
}

/**
 * Sticky hoofdstuknavigatie met scroll-spy. `rail`: inhoudsopgave links (desktop).
 * `bar`: compacte balk onder de header (mobiel) die de lijst uitklapt.
 */
export function ChapterNav({
  variant,
  chapters,
  sources,
  labels,
}: {
  variant: 'rail' | 'bar';
  chapters: Chapter[];
  sources: Chapter;
  labels: { nav: string; contents: string; chapterOf: string };
}) {
  const all = [...chapters, sources];
  const active = useActive(all.map((c) => c.id));
  const [open, setOpen] = useState(false);

  if (variant === 'rail') {
    return (
      <nav
        aria-label={labels.nav}
        className="sticky top-26 hidden flex-col self-start border-l border-border pl-4 xl:flex"
      >
        <span className="pb-2 text-xs font-semibold tracking-[0.08em] text-muted uppercase">{labels.contents}</span>
        {all.map((c, i) => {
          const on = i === active;
          const isSources = i === all.length - 1;
          return (
            <a
              key={c.id}
              href={`#${c.id}`}
              aria-current={on ? 'true' : undefined}
              className={`flex items-baseline gap-3 py-2 text-[15px] leading-[1.3] no-underline hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${on ? 'font-semibold text-text' : 'text-muted'}`}
            >
              <span className={`w-[22px] font-heading text-xs font-semibold ${on ? 'text-primary' : 'text-muted'}`}>
                {isSources ? '' : String(i + 1).padStart(2, '0')}
              </span>
              <span>{c.name}</span>
            </a>
          );
        })}
        <div className="mt-3">
          <Progress active={active} total={all.length} />
        </div>
      </nav>
    );
  }

  const cur = all[active];
  return (
    <nav aria-label={labels.nav} className="sticky top-20 z-40 border-b border-border bg-background xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-6 text-left text-[15px] font-medium text-text"
      >
        <span>
          <span className="font-heading text-xs font-semibold text-primary">
            {active < chapters.length ? String(active + 1).padStart(2, '0') : ''}
          </span>
          &nbsp; {cur.name}
        </span>
        <span className="inline-flex items-center gap-2 text-[13px] font-normal text-muted">
          {labels.chapterOf.replace('{n}', String(Math.min(active + 1, chapters.length))).replace('{total}', String(chapters.length))}
          {CHEV}
        </span>
      </button>
      {open && (
        <ul className="m-0 flex list-none flex-col px-6 py-2">
          {all.map((c, i) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                onClick={() => setOpen(false)}
                className={`flex min-h-11 items-center gap-3 text-[15px] text-text no-underline ${i === active ? 'font-semibold' : ''}`}
              >
                <span className="w-[22px] font-heading text-xs font-semibold text-primary">
                  {i < chapters.length ? String(i + 1).padStart(2, '0') : ''}
                </span>
                {c.name}
              </a>
            </li>
          ))}
        </ul>
      )}
      <Progress active={active} total={all.length} />
    </nav>
  );
}
