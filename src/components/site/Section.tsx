import type { ReactNode } from 'react';

/** Kaartje binnen een sectie (Buurtborrel, Praktische info). */
export const boxCls = 'flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-4 xl:p-6';

export function SectionHead({ id, eyebrow, title, intro }: { id: string; eyebrow: string; title: string; intro?: string }) {
  return (
    <>
      <div aria-hidden>
        <div className="border-t-2 border-text" />
        <div className="mt-[3px] border-t border-text" />
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{eyebrow}</div>
        <h2 id={id} className="m-0 text-[28px] leading-[1.15] font-semibold text-text xl:text-[38px] xl:leading-[1.1]">
          {title}
        </h2>
        {intro ? <p className="m-0 max-w-[620px] text-lg leading-[1.45] text-text">{intro}</p> : null}
      </div>
    </>
  );
}

export function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mx-auto max-w-5xl px-4 pt-4 pb-12 xl:pb-16">
      {children}
    </section>
  );
}
