'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

type Tip = { x: number; y: number; lines: string[] };

const MARK = '[data-tip]';

/**
 * Client-eiland rond een server-gerenderde grafiek. Doet drie dingen:
 * 1. tooltip bij hover en focus (desktop), met de waarde ook als tekst onder de grafiek (mobiel tik);
 * 2. pijltjestoetsen schuiven per punt (roving tabindex);
 * 3. de lijn-/vlakanimatie start zodra de grafiek in beeld komt (niet bij prefers-reduced-motion).
 * Elementen met `data-tip="regel 1\nregel 2"` zijn aanwijsbaar.
 */
export function ChartFrame({ children, source }: { children: ReactNode; source: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [anim, setAnim] = useState<'pre' | 'go' | undefined>(undefined);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setAnim('pre');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setAnim('go');
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const mark = (t: EventTarget | null) => (t instanceof Element ? (t.closest(MARK) as SVGElement | HTMLElement | null) : null);

  function show(el: Element) {
    const b = box.current;
    if (!b) return;
    const lines = (el.getAttribute('data-tip') ?? '').split('\n');
    const br = b.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const half = 90;
    setTip({
      x: Math.min(Math.max(er.left + er.width / 2 - br.left, half), Math.max(br.width - half, half)),
      y: er.top - br.top,
      lines,
    });
    setStatus(`${lines.join(' · ')} · ${source}`);
  }

  function marks(): HTMLElement[] {
    return Array.from(box.current?.querySelectorAll<HTMLElement>(MARK) ?? []).filter((m) => m.getClientRects().length > 0);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') return setTip(null);
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    const all = marks();
    const cur = mark(e.target);
    if (!cur || all.length === 0) return;
    e.preventDefault();
    const next = all[(all.indexOf(cur as HTMLElement) + dir + all.length) % all.length];
    all.forEach((m) => m.setAttribute('tabindex', m === next ? '0' : '-1'));
    next.focus();
  }

  return (
    <div
      ref={box}
      data-anim={anim}
      className="relative"
      onPointerOver={(e) => {
        const m = mark(e.target);
        if (m && e.pointerType === 'mouse') show(m);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse' && !box.current?.contains(document.activeElement)) setTip(null);
      }}
      onFocus={(e) => {
        const m = mark(e.target);
        if (m) show(m);
      }}
      onBlur={() => setTip(null)}
      onClick={(e) => {
        const m = mark(e.target);
        if (m) show(m);
      }}
      onKeyDown={onKeyDown}
    >
      {children}
      {tip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 hidden -translate-x-1/2 -translate-y-full rounded-md bg-text px-3 py-2 text-background shadow-md xl:block"
          style={{ left: tip.x, top: tip.y - 10 }}
        >
          {tip.lines.map((l, i) => (
            <div key={i} className={i === 0 ? 'text-xs opacity-75' : 'font-heading text-[15px] font-semibold whitespace-nowrap'}>
              {l}
            </div>
          ))}
          <div className="text-[11px] opacity-75">{source}</div>
        </div>
      )}
      {status && (
        <p role="status" className="mt-2 rounded-lg border border-input-border px-3 py-2.5 text-sm text-text xl:sr-only">
          {status}
        </p>
      )}
    </div>
  );
}
