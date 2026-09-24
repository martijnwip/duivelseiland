import Link from 'next/link';
import { getPayload } from 'payload';
import { getTranslations } from 'next-intl/server';
import config from '@payload-config';
import { localizedHref } from '@/i18n/localizedHref';
import { TijdlijnIcoon } from './icons';

/** Homepagina-sectie: korte introductie van het geschiedenisverhaal met een mini-tijdlijn. */
export async function HomeGeschiedenis({ locale }: { locale: 'nl' | 'en' }) {
  const t = await getTranslations({ locale, namespace: 'home.geschiedenis' });
  const payload = await getPayload({ config });
  const verhaal = await payload.findGlobal({ slug: 'geschiedenis-verhaal', locale, depth: 0 });
  if (!verhaal.titel) return null;

  const tijdvakken = verhaal.tijdvakken ?? [];
  const href = (anker?: string) => localizedHref(locale, anker ? `/geschiedenis#${anker}` : '/geschiedenis');

  return (
    <section aria-labelledby="home-geschiedenis-title" className="mx-auto max-w-5xl px-4 pt-4 pb-12 xl:pb-16">
      <div aria-hidden>
        <div className="border-t-2 border-text" />
        <div className="mt-[3px] border-t border-text" />
      </div>

      <div className="mt-8 flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-end xl:gap-12">
        <div className="flex flex-col gap-3 xl:gap-3.5">
          <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('eyebrow')}</div>
          <h2 id="home-geschiedenis-title" className="m-0 text-[28px] leading-[1.15] font-semibold text-text xl:text-[38px] xl:leading-[1.1]">
            {verhaal.titel}
          </h2>
          {verhaal.openingszin ? <p className="m-0 font-heading text-lg font-semibold text-accent">{verhaal.openingszin}</p> : null}
          {verhaal.intro ? <p className="m-0 max-w-[560px] text-lg leading-[1.4] text-text">{verhaal.intro}</p> : null}
        </div>
        <div className="flex items-baseline gap-4 border-t border-border pt-3 xl:flex-col xl:items-start xl:gap-1.5 xl:pt-4">
          <span className="font-heading text-4xl leading-none font-semibold text-primary tabular-nums xl:text-[48px]">{t('factBig')}</span>
          <span className="max-w-[280px] text-[15px] leading-[1.4] text-muted xl:text-base">{t('factText')}</span>
        </div>
      </div>

      {tijdvakken.length > 0 ? (
        <nav aria-label={t('tijdlijn')} className="mt-8">
          <div className="relative">
          {/* Doorlopende as van de eerste tot de laatste knoop (vanaf lg: zes kolommen, gap 16px). */}
          <span aria-hidden className="absolute top-5 right-[calc((100%-80px)/6-20px)] left-5 hidden h-0.5 bg-primary lg:block" />
          <ol className="relative m-0 grid list-none gap-4 p-0 sm:grid-cols-3 lg:grid-cols-6">
            {tijdvakken.map((tv) => {
              const icoon =
                tv.infographic === 'fabriek'
                  ? 'fabriek'
                  : tv.infographic === 'omDeHoek'
                    ? 'circus'
                    : (tv.gebeurtenissen?.[0]?.icoon ?? 'kaart');
              return (
                <li key={tv.id ?? tv.anker} className="relative">
                  <Link href={href(tv.anker)} className="group flex items-start gap-3 no-underline sm:flex-col sm:gap-2">
                    <span className="grid size-10 flex-none place-items-center rounded-full border-2 border-primary bg-card text-text transition-colors group-hover:bg-primary group-hover:text-on-primary">
                      <TijdlijnIcoon naam={icoon} />
                    </span>
                    <span>
                      <span className="block font-heading text-sm font-semibold text-primary tabular-nums">{tv.band}</span>
                      <span className="block text-[15px] leading-snug text-text group-hover:underline">{tv.titel}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          </div>
        </nav>
      ) : null}

      <Link
        href={href()}
        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-2 font-medium text-on-primary no-underline transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {t('readMore')}
        <span className="sr-only"> {t('readMoreContext')}</span>
        <svg width="16" height="16" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path d="M2 7.5h10M8 3.5l4 4-4 4" />
        </svg>
      </Link>
    </section>
  );
}
