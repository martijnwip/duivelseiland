import type { ReactNode } from 'react';

/** Hoofdstuk: dubbele lijn, nummer, titel, kernboodschap en opvallend cijfer, daarna de kaarten. */
export function Chapter({
  n,
  id,
  label,
  title,
  message,
  factBig,
  factText,
  children,
}: {
  n: number;
  id: string;
  label: string;
  title: string;
  message: string;
  factBig: string;
  factText: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="flex scroll-mt-26 flex-col gap-6 xl:gap-8">
      <div aria-hidden>
        <div className="border-t-2 border-text" />
        <div className="mt-[3px] border-t border-text" />
      </div>
      <header className="flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-end xl:gap-12">
        <div className="flex flex-col gap-3 xl:gap-3.5">
          <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">
            {label} {String(n).padStart(2, '0')}
          </div>
          <h2 id={`${id}-t`} className="m-0 text-[30px] leading-[1.15] font-semibold text-text xl:text-[44px] xl:leading-[1.1]">
            {title}
          </h2>
          <p className="m-0 max-w-[560px] text-[19px] leading-[1.4] text-text xl:text-[22px]">{message}</p>
        </div>
        <div className="flex items-baseline gap-4 border-t border-border pt-3 xl:flex-col xl:items-start xl:gap-1.5 xl:pt-4">
          <span className="font-heading text-4xl leading-none font-semibold text-primary xl:text-[56px]">{factBig}</span>
          <span className="max-w-[340px] text-[15px] leading-[1.4] text-muted xl:text-base">{factText}</span>
        </div>
      </header>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

/** Twee kaarten naast elkaar (desktop), onder elkaar (mobiel). */
export function Pair({ children }: { children: ReactNode }) {
  return <div className="grid min-w-0 items-start gap-6 xl:grid-cols-2">{children}</div>;
}

export function Stack({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-6">{children}</div>;
}
