import Image from 'next/image';
import type { HistorischeFoto } from '../../../payload-types';
import { TijdlijnIcoon } from './icons';

export type ArchiefLabels = { beeldbank: string; bron: string; beschermd: string; rechtenOnbekend: string };

/** Een relatieveld levert een id (niet gepopuleerd) of het document zelf. */
export function alsFoto(value: number | HistorischeFoto | null | undefined): HistorischeFoto | null {
  return value && typeof value === 'object' && value.status === 'published' ? value : null;
}

const onderschrift = (foto: HistorischeFoto, bron: string) =>
  [foto.datering, foto.vervaardiger, bron].filter(Boolean).join(' · ');

/**
 * Archiefbeeld met bijschrift en bronvermelding. Alleen foto's met rechten "vrij"
 * worden getoond; de rest verschijnt als archiefkaart met een link naar de Beeldbank.
 */
export function ArchiefBeeld({
  foto,
  labels,
  className = '',
  vierkant = false,
}: {
  foto: HistorischeFoto;
  labels: ArchiefLabels;
  className?: string;
  /** Vaste 4:3-uitsnede, bijv. in de slideshow. */
  vierkant?: boolean;
}) {
  if (foto.rechten !== 'vrij') return <ArchiefKaart foto={foto} labels={labels} className={className} />;

  return (
    <figure className={`m-0 ${className}`}>
      {/* Via next/image: eigen domein, AVIF/WebP en langere cache dan Memorix. Hooguit ~480 px breed op de pagina. */}
      <Image
        src={foto.imageUrl}
        alt={foto.title}
        width={640}
        height={480}
        sizes="(min-width: 1024px) 480px, (min-width: 640px) 50vw, 100vw"
        className={`h-auto w-full rounded bg-muted-soft grayscale ${vierkant ? 'aspect-[4/3] object-cover' : ''}`}
      />
      <figcaption className="mt-2 text-sm leading-snug text-muted">
        <b className="font-semibold text-text">{foto.title}</b> · {onderschrift(foto, labels.bron)} ·{' '}
        <a href={foto.bronUrl} className="whitespace-nowrap text-primary hover:text-primary-hover">
          {labels.beeldbank} ↗
        </a>
      </figcaption>
    </figure>
  );
}

export function ArchiefKaart({ foto, labels, className = '' }: { foto: HistorischeFoto; labels: ArchiefLabels; className?: string }) {
  return (
    <a
      href={foto.bronUrl}
      className={`flex items-start gap-3 rounded border-[1.5px] border-dashed border-border bg-card p-3.5 text-left no-underline hover:border-primary ${className}`}
    >
      <TijdlijnIcoon naam="camera" className="size-7 flex-none text-muted" />
      <span>
        <b className="block font-heading text-base leading-snug font-semibold text-text">{foto.title}</b>
        <small className="mt-0.5 block text-sm leading-snug text-muted">
          {onderschrift(foto, labels.bron)}. {foto.rechten === 'toestemming' ? labels.beschermd : labels.rechtenOnbekend} ↗
        </small>
      </span>
    </a>
  );
}
