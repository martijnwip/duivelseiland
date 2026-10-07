import { getPayload } from 'payload';
import config from '@payload-config';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Vakken, Vakmensen } from '../../../../payload-types';
import { BuurtpasSlot } from '@/components/buurtpas/BuurtpasSlot';
import { heeftBuurtpas } from '@/lib/buurtpas/toegang';
import { localizedHref } from '@/i18n/localizedHref';

type Groep = { vak: string; vakmensen: Vakmensen[] };

/** Per vak de gepubliceerde vakmensen, alfabetisch; wie meerdere vakken heeft staat onder elk vak. */
function groepeerPerVak(vakmensen: Vakmensen[], overig: string, locale: string): Groep[] {
  const groepen = new Map<string, Vakmensen[]>();
  for (const vakmens of vakmensen) {
    const namen = (vakmens.vakken ?? []).filter((v): v is Vakken => typeof v === 'object' && v !== null).map((v) => v.naam);
    for (const naam of namen.length ? namen : [overig]) {
      groepen.set(naam, [...(groepen.get(naam) ?? []), vakmens]);
    }
  }
  return [...groepen.entries()]
    .sort(([a], [b]) => (a === overig ? 1 : b === overig ? -1 : a.localeCompare(b, locale)))
    .map(([vak, lijst]) => ({ vak, vakmensen: lijst.sort((a, b) => a.naam.localeCompare(b.naam, locale)) }));
}

const zonderProtocol = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

export default async function VakmensenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.vakmensen' });
  const tb = await getTranslations({ locale, namespace: 'buurtpas' });
  // Telefoonnummers alleen met buurtpas (leest cookies, dus per request gerenderd). Zonder buurtpas wordt het
  // nummer niet eens aangemaakt; naam, vakken en website ziet iedereen.
  const buurtpas = await heeftBuurtpas();

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'vakmensen',
    where: { status: { equals: 'published' } },
    locale: locale as 'nl' | 'en',
    depth: 1,
    pagination: false,
  });
  const groepen = groepeerPerVak(docs, t('overig'), locale);
  const heeftNummers = docs.some((d) => d.telefoon);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-text">{t('heading')}</h1>

      {heeftNummers && !buurtpas ? (
        <div className="mt-6">
          <BuurtpasSlot locale={locale as 'nl' | 'en'} terug={localizedHref(locale, '/vakmensen')} titel={tb('slot.telefoon')} />
        </div>
      ) : null}

      {groepen.length === 0 ? (
        <p className="mt-6 text-muted">{t('empty')}</p>
      ) : (
        groepen.map(({ vak, vakmensen }) => (
          <section key={vak} className="mt-10">
            <h2 className="text-xl font-semibold text-text">{vak}</h2>
            <ul className="mt-4 divide-y divide-muted/20">
              {vakmensen.map((vakmens) => (
                <li key={vakmens.id} className="py-3">
                  <p className="font-medium text-text">{vakmens.naam}</p>
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {buurtpas && vakmens.telefoon ? (
                      <a href={`tel:${vakmens.telefoon.replace(/[^0-9+]/g, '')}`} className="text-primary hover:underline">
                        <span className="sr-only">{t('telefoon')}: </span>
                        {vakmens.telefoon}
                      </a>
                    ) : null}
                    {vakmens.website ? (
                      <a href={vakmens.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        <span className="sr-only">{t('website')}: </span>
                        {zonderProtocol(vakmens.website)}
                      </a>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
