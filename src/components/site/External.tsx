import type { ReactNode } from 'react';

/** Tekstlink in de huisstijl (afval, geluid). */
export const linkCls =
  'font-medium text-primary underline underline-offset-3 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** Link naar een andere website, in een nieuw venster; `note` zegt dat voor schermlezers. */
export function External({ href, children, className = linkCls, note }: { href: string; children: ReactNode; className?: string; note: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> {note}</span>
    </a>
  );
}
