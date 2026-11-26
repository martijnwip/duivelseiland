'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export type Laag = { id: string; inhoud: ReactNode };
export type VerhaalStap = { laag: string; nu?: boolean; tekst: ReactNode; omschrijving: string };

/**
 * Scrollverhaal: een vast beeldvlak met lagen en stappen die erlangs (desktop) of eroverheen
 * (mobiel) schuiven. De stap die het midden van het scherm passeert, bepaalt welke laag zichtbaar is;
 * bij een toen/nu-paar veegt de foto van nu over die van toen (CSS in globals.css, .tn-*).
 * Zonder JS staan beelden en teksten onder elkaar; het beeldvlak is voor schermlezers verborgen,
 * elke stap noemt zelf wat er te zien is.
 */
export function ScrollVerhaal({ lagen, stappen, beeldLabel }: { lagen: Laag[]; stappen: VerhaalStap[]; beeldLabel: string }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [js, setJs] = useState(false);
  const [actief, setActief] = useState(0);

  useEffect(() => {
    setJs(true);
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActief(Number((e.target as HTMLElement).dataset.stap));
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    el.querySelectorAll('[data-stap]').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const stap = stappen[actief];

  return (
    <div ref={wrapper} className="tn-verhaal" data-js={js ? '' : undefined}>
      <div className="tn-paneel" aria-hidden>
        {lagen.map((l) => (
          <div
            key={l.id}
            className="tn-laag"
            data-aan={stap?.laag === l.id ? '' : undefined}
            data-nu={stap?.laag === l.id && stap.nu ? '' : undefined}
          >
            {l.inhoud}
          </div>
        ))}
      </div>
      <ol className="tn-stappen m-0 list-none p-0">
        {stappen.map((s, i) => (
          <li key={i} data-stap={i} className="tn-stap">
            <div
              className={`w-full max-w-md rounded-lg border border-border bg-card/95 p-4 text-[18px] leading-[1.5] text-text shadow-md backdrop-blur-sm transition-opacity duration-300 lg:p-5 ${
                js && i !== actief ? 'lg:opacity-40' : ''
              }`}
            >
              {s.tekst}
              <span className="sr-only">
                {' '}
                ({beeldLabel}: {s.omschrijving})
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
