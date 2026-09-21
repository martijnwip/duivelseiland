'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Telt in 600 ms naar de waarde zodra het cijfer in beeld komt. De server rendert
 * direct de eindwaarde (children); zonder JS of met prefers-reduced-motion verandert er niets.
 */
export function CountUp({
  value,
  locale,
  prefix = '',
  suffix = '',
  decimals = 0,
  children,
}: {
  value: number;
  locale: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const final = el.textContent ?? '';
    const nf = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 600, 1);
          const eased = 1 - (1 - p) ** 3;
          el.textContent = p < 1 ? `${prefix}${nf.format(value * eased)}${suffix}` : final;
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      el.textContent = final;
    };
  }, [value, locale, prefix, suffix, decimals]);
  return <span ref={ref}>{children}</span>;
}
