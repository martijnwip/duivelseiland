import type { Regel } from '@/lib/afval/types';

export type RegelLabels = { dagen: string; buitenzetten: string; waar: string; addresses?: string };

/**
 * Eén fractie uit de Afvalwijzer. De teksten komen letterlijk uit de gemeentelijke data
 * (alleen Nederlands), vandaar `lang="nl"` op de Engelse pagina.
 */
export function RegelItem({ regel, naam, locale, labels, share }: { regel: Regel; naam: string; locale: string; labels: RegelLabels; share?: string }) {
  const lang = locale === 'nl' ? undefined : 'nl';
  return (
    <li className="flex flex-col gap-1 border-t border-border py-3 first:border-t-0 xl:grid xl:grid-cols-[180px_minmax(0,1fr)] xl:gap-6">
      <span className="text-[15px] font-semibold text-text">{naam}</span>
      <div className="flex min-w-0 flex-col gap-1" lang={lang}>
        <span className="text-[15px] leading-[1.45] text-text">
          {regel.instructie ?? '–'}
          {share && <span className="ml-2 text-[13px] text-muted">{share}</span>}
        </span>
        {regel.dagen && (
          <span className="text-sm text-muted">
            {labels.dagen}: <span className="text-text">{regel.dagen}</span>
          </span>
        )}
        {regel.buitenzetten && (
          <span className="text-sm text-muted">
            {labels.buitenzetten}: <span className="text-text">{regel.buitenzetten}</span>
          </span>
        )}
        {regel.waar && regel.dagen && (
          <span className="text-sm text-muted">
            {labels.waar}: <span className="text-text">{regel.waar}</span>
          </span>
        )}
        {regel.opmerking && <span className="text-sm leading-[1.45] text-muted">{regel.opmerking}</span>}
        {regel.melding && <span className="rounded-md border border-accent px-2.5 py-1.5 text-sm text-text">{regel.melding}</span>}
      </div>
    </li>
  );
}
