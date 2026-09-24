'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Laat lijnen met `stats-draw` en vlakken met `stats-fade` intekenen zodra de
 * infographic in beeld komt (zelfde animatie als de statistiekenpagina).
 * Zonder JS of met prefers-reduced-motion staat direct de eindstand er.
 */
export function Intekenen({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
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
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} data-anim={anim}>
      {children}
    </div>
  );
}
