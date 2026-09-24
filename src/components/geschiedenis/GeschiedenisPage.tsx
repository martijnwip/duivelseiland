import { Fragment, type ReactNode } from 'react';
import { getPayload } from 'payload';
import { getTranslations } from 'next-intl/server';
import config from '@payload-config';
import type { HistorischeFoto } from '../../../payload-types';
import { RichTextContent } from '@/components/site/RichTextContent';
import { ArchiefBeeld, alsFoto, type ArchiefLabels } from './ArchiefBeeld';
import { JaarTeller } from './JaarTeller';
import { ScrollRij } from './ScrollRij';
import { Tijdvak, type TijdvakData } from './Tijdvak';
import { BuurtInMaten, DeBuurtGroeit, FabriekInCijfers, OmDeHoek, TweeEilanden } from './infographics';

type Locale = 'nl' | 'en';

/** Het verhaal op /geschiedenis: hero, tijdlijn met infographics, archief, open vragen en bronnen. */
export async function GeschiedenisPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.geschiedenis.ui' });
  const payload = await getPayload({ config });
  const [verhaal, site] = await Promise.all([
    payload.findGlobal({ slug: 'geschiedenis-verhaal', locale, depth: 2 }),
    payload.findGlobal({ slug: 'site-instellingen', locale, depth: 0 }),
  ]);

  const labels: ArchiefLabels = {
    beeldbank: t('beeldbank'),
    bron: t('bron'),
    beschermd: t('beschermd'),
    rechtenOnbekend: t('rechtenOnbekend'),
  };
  const heroFoto = alsFoto(verhaal.heroFoto);
  const archief = (verhaal.archief ?? []).map(alsFoto).filter((f): f is HistorischeFoto => f?.rechten === 'vrij');
  const tijdvakken = verhaal.tijdvakken ?? [];
  const email = site.contactgegevens?.email;

  const infographic = async (soort: TijdvakData['infographic']): Promise<ReactNode> => {
    switch (soort) {
      case 'groeit':
        return <DeBuurtGroeit locale={locale} />;
      case 'eilanden':
        return <TweeEilanden locale={locale} />;
      case 'fabriek':
        return <FabriekInCijfers locale={locale} />;
      case 'omDeHoek':
        return <OmDeHoek locale={locale} />;
      case 'maten':
        return <BuurtInMaten locale={locale} />;
      default:
        return null;
    }
  };
  const infographics = await Promise.all(tijdvakken.map((tv) => infographic(tv.infographic)));

  return (
    <main className="mx-auto max-w-[1200px] px-4 md:px-8">
      <JaarTeller />

      <section aria-labelledby="gs-titel" className="grid gap-8 pt-10 pb-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:pt-18 lg:pb-12">
        <div>
          <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('eyebrow')}</div>
          <h1
            id="gs-titel"
            className="my-3 text-[clamp(44px,8vw,84px)] leading-[1.02] font-bold tracking-[-0.02em] text-primary"
          >
            {verhaal.titel}
          </h1>
          {verhaal.ondertitel ? <p className="mb-5 max-w-[34ch] text-[clamp(19px,2.4vw,22px)] leading-snug text-text">{verhaal.ondertitel}</p> : null}
          {verhaal.openingszin ? (
            <p className="mb-4 font-heading text-xl leading-snug font-semibold text-accent">{verhaal.openingszin}</p>
          ) : null}
          {verhaal.intro ? <p className="m-0 max-w-[62ch] text-lg text-text">{verhaal.intro}</p> : null}
          {tijdvakken[0] ? (
            <a href={`#${tijdvakken[0].anker}`} className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-text no-underline hover:text-primary">
              {t('readStory')} <span aria-hidden>↓</span>
            </a>
          ) : null}
        </div>
        {heroFoto ? <ArchiefBeeld foto={heroFoto} labels={labels} /> : null}
      </section>

      {verhaal.kerncijfers?.length ? (
        <dl
          aria-label={t('kerncijfers')}
          className="mt-2 mb-14 grid grid-cols-2 border-t-2 border-b border-t-text border-b-text md:grid-cols-4"
        >
          {verhaal.kerncijfers.map((k) => (
            <div key={k.id} className="flex flex-col-reverse justify-end gap-0.5 py-4 pr-4 md:border-border md:pl-5 md:[&+&]:border-l md:first:pl-0">
              <dt className="text-[15px] leading-snug text-muted">{k.label}</dt>
              <dd className="m-0 font-heading text-[clamp(30px,4vw,40px)] leading-[1.05] font-semibold text-text tabular-nums">{k.waarde}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div id="gs-start" aria-label={t('tijdlijn')} role="region">
        {tijdvakken.map((tv, i) => (
          <Fragment key={tv.id ?? tv.anker}>
            <Tijdvak tijdvak={tv} labels={labels} />
            {infographics[i]}
          </Fragment>
        ))}
      </div>

      {archief.length > 0 ? (
        <section aria-labelledby="gs-archief" className="my-12 border-t-2 border-text pt-4">
          <header className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 id="gs-archief" className="m-0 text-2xl font-semibold text-text lg:text-[32px]">
              {t('archief')}
            </h2>
            <p className="m-0 text-[17px] text-muted">{t('archiefLead')}</p>
          </header>
          <ScrollRij label={t('scrollbaar', { naam: t('archief') })} vorige={t('vorige')} volgende={t('volgende')}>
            {archief.map((foto) => (
              <ArchiefBeeld key={foto.id} foto={foto} labels={labels} vierkant className="snap-start" />
            ))}
          </ScrollRij>
        </section>
      ) : null}

      {verhaal.onbekendTekst ? (
        <section aria-labelledby="gs-onbekend" className="my-14 rounded-lg border-2 border-dashed border-muted bg-card p-6">
          <h2 id="gs-onbekend" className="mt-0 mb-3 text-[28px] font-semibold text-text">
            {t('onbekend')}
          </h2>
          <RichTextContent data={verhaal.onbekendTekst} className="text-lg" />
          {email ? (
            <a
              href={`mailto:${email}`}
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-on-primary no-underline hover:bg-primary-hover"
            >
              {t('deelVerhaal')}
            </a>
          ) : null}
        </section>
      ) : null}

      {verhaal.bronnen?.length ? (
        <section aria-labelledby="gs-bronnen" className="mb-6 border-t border-border pt-4 text-[15px] text-muted">
          <h2 id="gs-bronnen" className="mt-0 mb-2 text-xl font-semibold text-text">
            {t('bronnen')}
          </h2>
          <ol className="m-0 list-decimal pl-5">
            {verhaal.bronnen.map((b) => (
              <li key={b.id}>{b.tekst}</li>
            ))}
          </ol>
        </section>
      ) : null}
    </main>
  );
}
