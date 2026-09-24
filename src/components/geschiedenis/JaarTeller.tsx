'use client';

import { useEffect, useState } from 'react';

/**
 * Zwevend label met het jaar van de gebeurtenis die nu midden in beeld is
 * (elementen met `data-jaar`). Puur visueel: de jaartallen staan al in de tekst.
 */
export function JaarTeller() {
  const [jaar, setJaar] = useState<string | null>(null);

  useEffect(() => {
    const knopen = document.querySelectorAll<HTMLElement>('[data-jaar]');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setJaar(e.target.getAttribute('data-jaar'));
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    knopen.forEach((k) => io.observe(k));
    // Boven de eerste tijdlijn (hero) nog geen teller.
    const start = document.getElementById('gs-start');
    const top = start
      ? new IntersectionObserver(([e]) => {
          if (e.boundingClientRect.top > 0) setJaar(null);
        })
      : null;
    if (start) top?.observe(start);
    return () => {
      io.disconnect();
      top?.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed top-20 right-3 z-30 rounded-full bg-primary px-2.5 py-1 font-heading text-[15px] font-semibold text-on-primary tabular-nums transition-opacity lg:top-auto lg:right-auto lg:bottom-6 lg:left-6 lg:px-3.5 lg:py-1.5 lg:text-[22px] ${
        jaar ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {jaar}
    </div>
  );
}
