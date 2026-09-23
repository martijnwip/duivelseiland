import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { localizedHref } from '@/i18n/localizedHref';
import { Icon } from './icons';

/** Homepagina-sectie die naar de Buurtborrel-pagina verwijst. */
export async function HomeBuurtborrel({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home.buurtborrel' });

  return (
    <section aria-labelledby="home-buurtborrel-title" className="mx-auto max-w-5xl px-4 pt-4 pb-12 xl:pb-16">
      <div aria-hidden>
        <div className="border-t-2 border-text" />
        <div className="mt-[3px] border-t border-text" />
      </div>

      <div className="mt-8 flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-end xl:gap-12">
        <div className="flex flex-col gap-3 xl:gap-3.5">
          <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('eyebrow')}</div>
          <h2 id="home-buurtborrel-title" className="m-0 text-[28px] leading-[1.15] font-semibold text-text xl:text-[38px] xl:leading-[1.1]">
            {t('title')}
          </h2>
          <p className="m-0 max-w-[560px] text-lg leading-[1.4] text-text">{t('intro')}</p>
        </div>
        <div className="flex items-baseline gap-4 border-t border-border pt-3 xl:flex-col xl:items-start xl:gap-1.5 xl:pt-4">
          <span className="font-heading text-4xl leading-none font-semibold text-primary xl:text-[48px]">2×</span>
          <span className="max-w-[280px] text-[15px] leading-[1.4] text-muted xl:text-base">{t('factText')}</span>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3 text-primary" aria-hidden>
        <Icon name="vuurkorf" className="size-10" />
        <span className="h-px w-10 bg-border" />
        <Icon name="zon" className="size-10" />
        <span className="h-px w-10 bg-border" />
        <Icon name="idee" className="size-10 opacity-60" />
      </div>

      <Link
        href={localizedHref(locale, '/buurtborrel')}
        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg bg-cta px-5 py-2 font-medium text-on-cta no-underline transition-colors hover:bg-cta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
