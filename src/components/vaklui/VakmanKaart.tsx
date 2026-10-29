import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Vakken, Vaklui } from '../../../payload-types';
import { SlotIcoon } from '@/components/buurtpas/BuurtpasSlot';
import { WhatsAppIcon } from '@/components/buurtborrel/icons';
import { boxCls } from '@/components/site/Section';
import { localizedHref } from '@/i18n/localizedHref';
import { buildWhatsAppLink, isNlMobielNummer } from '@/lib/whatsapp';
import { DeelLink } from './DeelLink';

export const vakNamen = (vakman: Vaklui) =>
  (vakman.vakken ?? []).filter((v): v is Vakken => typeof v === 'object' && v !== null).map((v) => v.naam);

export const vakmanPad = (locale: string, slug: string) => localizedHref(locale, `/vaklui/${slug}`);

const zonderProtocol = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

const TUSSENVOEGSELS = new Set(['de', 'den', 'der', 'van', 'het', "'t", 'te', 'ten', 'ter', 'in', 'op', 'aan', 'bij', '&']);

/** Eerste letter van het eerste en het laatste woord, zonder tussenvoegsels: "Piet van der Pijp" → "PP". */
function initialen(naam: string) {
  const woorden = naam.trim().split(/\s+/).filter((w, i) => i === 0 || !TUSSENVOEGSELS.has(w.toLowerCase()));
  const eerste = woorden[0]?.[0] ?? '';
  const laatste = woorden.length > 1 ? woorden[woorden.length - 1][0] : '';
  return `${eerste}${laatste}`.toUpperCase();
}

const knopCls = 'inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors';

function TelefoonIcoon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden className="size-4">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

function WebIcoon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden className="size-4">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </svg>
  );
}

/** Wat de kaart toont: alleen deze velden, want in dev komen de props van een server component in de RSC-payload. */
export type KaartGegevens = {
  naam: string;
  slug: string | null;
  vakken: string[];
  aanbeveling: string | null;
  website: string | null;
  /** Alleen met buurtpas. */
  telefoon: string | null;
  /** Er is een nummer, maar de bezoeker heeft geen buurtpas. */
  telefoonAchterSlot: boolean;
};

export const kaartGegevens = (vakman: Vaklui, buurtpas: boolean): KaartGegevens => ({
  naam: vakman.naam,
  slug: vakman.slug ?? null,
  vakken: vakNamen(vakman),
  aanbeveling: vakman.aanbeveling ?? null,
  website: vakman.website ?? null,
  telefoon: buurtpas ? (vakman.telefoon ?? null) : null,
  telefoonAchterSlot: Boolean(vakman.telefoon) && !buurtpas,
});

/**
 * Eén vakman: naam, vakken, aanbeveling, telefoon (alleen met buurtpas) en website, met rechtsboven een deelknop.
 * In het overzicht linkt de naam naar de eigen pagina; op die pagina (`kopId`) is de naam de kop.
 */
export async function VakmanKaart({ vakman, locale, kopId }: { vakman: KaartGegevens; locale: string; kopId?: string }) {
  const t = await getTranslations({ locale, namespace: 'pages.vaklui' });
  const { vakken } = vakman;
  const pad = vakman.slug ? vakmanPad(locale, vakman.slug) : null;
  // Alleen bij een mobiel nummer; `telefoon` is er alleen met buurtpas, dus de link (met nummer) ook.
  const whatsapp = isNlMobielNummer(vakman.telefoon) ? buildWhatsAppLink(vakman.telefoon, t('whatsappBericht')) : null;
  const naamCls = 'm-0 font-heading text-lg leading-[1.25] font-semibold break-words text-text';

  return (
    <article className={`${boxCls} relative h-full`}>
      {pad ? (
        <div className="absolute top-2 right-2">
          <DeelLink pad={pad} titel={vakman.naam} label={t('delen', { naam: vakman.naam })} gekopieerd={t('gekopieerd')} />
        </div>
      ) : null}

      <div className="flex items-center gap-3 pr-10">
        <span
          aria-hidden
          className="flex size-12 flex-none items-center justify-center rounded-full bg-primary-soft font-heading text-lg font-semibold text-primary"
        >
          {initialen(vakman.naam)}
        </span>
        <div className="min-w-0">
          {kopId ? (
            <h1 id={kopId} className={naamCls}>
              {vakman.naam}
            </h1>
          ) : (
            <p className={naamCls}>
              {pad ? (
                <Link href={pad} className="text-inherit no-underline hover:text-primary hover:underline">
                  {vakman.naam}
                </Link>
              ) : (
                vakman.naam
              )}
            </p>
          )}
          {vakken.length ? (
            <ul aria-label={t('vakken')} className="mt-1.5 flex list-none flex-wrap gap-1.5 p-0">
              {vakken.map((naam) => (
                <li key={naam} className="rounded-full bg-secondary-soft px-2.5 py-0.5 text-xs font-medium text-text">
                  {naam}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {vakman.aanbeveling ? (
        <figure className="m-0">
          <figcaption className="text-xs font-medium tracking-wide text-muted uppercase">{t('aanbeveling')}</figcaption>
          <blockquote className="mt-1 mb-0 border-l-2 border-secondary pl-3 text-[15px] leading-[1.5] whitespace-pre-line text-text">
            {vakman.aanbeveling}
          </blockquote>
        </figure>
      ) : null}

      {vakman.telefoon || vakman.telefoonAchterSlot || vakman.website ? (
        <div className="mt-auto flex flex-col items-start gap-2">
          {vakman.telefoon ? (
            <div className="flex flex-wrap gap-2">
              <a href={`tel:${vakman.telefoon.replace(/[^0-9+]/g, '')}`} className={`${knopCls} bg-primary text-on-primary hover:bg-primary-hover`}>
                <TelefoonIcoon />
                <span className="sr-only">{t('telefoon')}: </span>
                {vakman.telefoon}
              </a>
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('whatsappLabel', { naam: vakman.naam })}
                  className={`${knopCls} border border-border text-text hover:border-primary hover:text-primary`}
                >
                  <WhatsAppIcon className="size-4" />
                  WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}
          {vakman.telefoonAchterSlot ? (
            <span className="inline-flex min-h-11 items-center gap-2 text-sm text-muted">
              <SlotIcoon className="size-4" />
              {t('telefoonMetBuurtpas')}
            </span>
          ) : null}
          {vakman.website ? (
            <a
              href={vakman.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`${knopCls} max-w-full min-w-0 border border-border text-text hover:border-primary hover:text-primary`}
            >
              <WebIcoon />
              <span className="sr-only">{t('website')}: </span>
              <span className="truncate">{zonderProtocol(vakman.website)}</span>
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

/** "Let op: geen aanbevelingen namens de site", op het overzicht en op de pagina van een vakman. */
export async function VakluiDisclaimer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'pages.vaklui' });
  return (
    <aside role="note" className="max-w-3xl rounded-lg border border-l-4 border-border border-l-accent bg-card px-5 py-4 text-[15px] leading-[1.5] text-text">
      <p className="m-0 font-semibold text-accent">{t('disclaimer.titel')}</p>
      <p className="mt-1 mb-0">{t.rich('disclaimer.tekst', { b: (chunks) => <strong>{chunks}</strong> })}</p>
    </aside>
  );
}
