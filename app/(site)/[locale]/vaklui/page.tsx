import Link from 'next/link';
import { getPayload } from 'payload';
import config from '@payload-config';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Vakken, Vaklui } from '../../../../payload-types';
import { BuurtpasSlot, SlotIcoon } from '@/components/buurtpas/BuurtpasSlot';
import { Section, SectionHead, boxCls } from '@/components/site/Section';
import { heeftBuurtpas } from '@/lib/buurtpas/toegang';
import { localizedHref } from '@/i18n/localizedHref';

type Groep = { vak: string; vaklui: Vaklui[] };

const vakNamen = (vakman: Vaklui) =>
  (vakman.vakken ?? []).filter((v): v is Vakken => typeof v === 'object' && v !== null).map((v) => v.naam);

/** Per vak de gepubliceerde vaklui, alfabetisch; wie meerdere vakken heeft staat onder elk vak. */
function groepeerPerVak(vaklui: Vaklui[], overig: string, locale: string): Groep[] {
  const groepen = new Map<string, Vaklui[]>();
  for (const vakman of vaklui) {
    const namen = vakNamen(vakman);
    for (const naam of namen.length ? namen : [overig]) {
      groepen.set(naam, [...(groepen.get(naam) ?? []), vakman]);
    }
  }
  return [...groepen.entries()]
    .sort(([a], [b]) => (a === overig ? 1 : b === overig ? -1 : a.localeCompare(b, locale)))
    .map(([vak, lijst]) => ({ vak, vaklui: lijst.sort((a, b) => a.naam.localeCompare(b.naam, locale)) }));
}

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

export default async function VakluiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.vaklui' });
  const tb = await getTranslations({ locale, namespace: 'buurtpas' });
  // Telefoonnummers alleen met buurtpas (leest cookies, dus per request gerenderd). Zonder buurtpas wordt het
  // nummer niet eens aangemaakt; naam, vakken en website ziet iedereen.
  const buurtpas = await heeftBuurtpas();

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'vaklui',
    where: { status: { equals: 'published' } },
    locale: locale as 'nl' | 'en',
    depth: 1,
    pagination: false,
  });
  const groepen = groepeerPerVak(docs, t('overig'), locale);
  const heeftNummers = docs.some((d) => d.telefoon);

  return (
    <main className="pt-8 xl:pt-12">
      <Section id="vaklui">
        <SectionHead id="vaklui" eyebrow={t('eyebrow')} title={t('heading')} intro={t('intro')} />

        <aside role="note" className="mt-8 max-w-3xl rounded-lg border border-l-4 border-border border-l-accent bg-card px-5 py-4 text-[15px] leading-[1.5] text-text">
          <p className="m-0 font-semibold text-accent">{t('disclaimer.titel')}</p>
          <p className="mt-1 mb-0">{t.rich('disclaimer.tekst', { b: (chunks) => <strong>{chunks}</strong> })}</p>
        </aside>

        <div className="mt-6 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-text">
            <strong>{t('aanmeldKnop.titel')}</strong> {t('aanmeldKnop.tekst')}
          </p>
          <Link
            href={localizedHref(locale, '/vaklui/aanmelden')}
            className={`${knopCls} flex-none self-start border border-border text-text hover:border-primary hover:text-primary sm:self-auto`}
          >
            {t('aanmeldKnop.link')}
          </Link>
        </div>

        {heeftNummers && !buurtpas ? (
          <div className="mt-6 max-w-3xl">
            <BuurtpasSlot locale={locale as 'nl' | 'en'} terug={localizedHref(locale, '/vaklui')} titel={tb('slot.telefoon')} />
          </div>
        ) : null}

        {groepen.length === 0 ? (
          <p className="mt-10 text-muted">{t('empty')}</p>
        ) : (
          groepen.map(({ vak, vaklui }) => (
            <section key={vak} aria-label={vak} className="mt-12">
              <h3 className="m-0 flex items-baseline gap-3 text-2xl font-semibold text-text">
                {vak}
                <span className="text-sm font-medium text-muted">{t('aantal', { aantal: vaklui.length })}</span>
              </h3>
              <ul className="mt-5 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {vaklui.map((vakman) => {
                  const vakken = vakNamen(vakman);
                  return (
                    <li key={vakman.id} className={`${boxCls} h-full`}>
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="flex size-12 flex-none items-center justify-center rounded-full bg-primary-soft font-heading text-lg font-semibold text-primary"
                        >
                          {initialen(vakman.naam)}
                        </span>
                        <div className="min-w-0">
                          <p className="m-0 font-heading text-lg leading-[1.25] font-semibold break-words text-text">{vakman.naam}</p>
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

                      {vakman.telefoon || vakman.website ? (
                        <div className="mt-auto flex flex-col items-start gap-2">
                          {vakman.telefoon && buurtpas ? (
                            <a
                              href={`tel:${vakman.telefoon.replace(/[^0-9+]/g, '')}`}
                              className={`${knopCls} bg-primary text-on-primary hover:bg-primary-hover`}
                            >
                              <TelefoonIcoon />
                              <span className="sr-only">{t('telefoon')}: </span>
                              {vakman.telefoon}
                            </a>
                          ) : null}
                          {vakman.telefoon && !buurtpas ? (
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
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </Section>
    </main>
  );
}
