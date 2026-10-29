import Link from 'next/link';
import { getPayload } from 'payload';
import config from '@payload-config';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Vaklui } from '../../../../payload-types';
import { BuurtpasSlot } from '@/components/buurtpas/BuurtpasSlot';
import { Section, SectionHead } from '@/components/site/Section';
import { VakluiDisclaimer, VakmanKaart, kaartGegevens, vakNamen } from '@/components/vaklui/VakmanKaart';
import { heeftBuurtpas } from '@/lib/buurtpas/toegang';
import { localizedHref } from '@/i18n/localizedHref';

type Groep = { vak: string; vaklui: Vaklui[] };

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

const knopCls = 'inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors';

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

        <div className="mt-8">
          <VakluiDisclaimer locale={locale} />
        </div>

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
                {vaklui.map((vakman) => (
                  <li key={vakman.id}>
                    <VakmanKaart vakman={kaartGegevens(vakman, buurtpas)} locale={locale} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </Section>
    </main>
  );
}
