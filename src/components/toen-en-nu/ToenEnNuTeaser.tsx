import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { localizedHref } from '@/i18n/localizedHref';
import toen from '../../../public/toen-en-nu/05-pieter-baststraat/05-oneven-zijde-1968.jpg';
import nu from '../../../public/toen-en-nu/05-pieter-baststraat/06-oneven-zijde-2004.jpg';

/** Verwijzing naar /toen-en-nu (op /geschiedenis): de Pieter Baststraat in 1968 en 2004 naast elkaar. */
export async function ToenEnNuTeaser({ locale }: { locale: 'nl' | 'en' }) {
  const t = await getTranslations({ locale, namespace: 'pages.toenEnNu.teaser' });
  return (
    <section aria-labelledby="tn-teaser" className="my-14 grid gap-6 border-t-2 border-text pt-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center md:gap-10">
      <div className="grid grid-cols-2 gap-2">
        {[
          { foto: toen, jaar: '1968' },
          { foto: nu, jaar: '2004' },
        ].map(({ foto, jaar }) => (
          <figure key={jaar} className="m-0">
            <Image src={foto} alt="" placeholder="blur" sizes="(min-width: 768px) 280px, 50vw" className="aspect-[1.4] h-auto w-full rounded-md object-cover" />
            <figcaption className="mt-1 font-heading text-sm font-semibold text-primary tabular-nums">{jaar}</figcaption>
          </figure>
        ))}
      </div>
      <div>
        <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('eyebrow')}</div>
        <h2 id="tn-teaser" className="mt-2 mb-3 text-[clamp(26px,3.4vw,34px)] leading-tight font-semibold text-text">
          {t('titel')}
        </h2>
        <p className="m-0 max-w-[52ch] text-lg text-text">{t('tekst')}</p>
        <Link
          href={localizedHref(locale, '/toen-en-nu')}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-2 font-medium text-on-primary no-underline transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t('link')}
          <svg width="16" height="16" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path d="M2 7.5h10M8 3.5l4 4-4 4" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
