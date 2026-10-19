import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { T } from '@/components/stats/cards/card';
import { localizedHref } from '@/i18n/localizedHref';
import { ADVIES_LAWAAI_VANAF, uur } from '@/lib/geluid/constants';
import { Briefje, type BriefTeksten, type BriefjeLabels } from './Briefje';

/** Server-deel: teksten ophalen (de site heeft geen NextIntlClientProvider) en doorgeven aan het formulier. */
export async function BriefjePage({ locale }: { locale: string }) {
  const t = (await getTranslations({ locale, namespace: 'pages.geluidBriefje' })) as unknown as T;
  const pages = (await getTranslations({ locale, namespace: 'pages' })) as unknown as T;
  // Het briefje zelf kan in een andere taal dan de site: beide talen gaan mee.
  const [nl, en] = await Promise.all(
    (['nl', 'en'] as const).map(async (l) => ((await getTranslations({ locale: l, namespace: 'pages.geluidBriefje' })) as unknown as T).raw('brief') as BriefTeksten),
  );
  const labels: BriefjeLabels = {
    ...(pages.raw('geluidBriefje') as Omit<BriefjeLabels, 'lawaaiTip'>),
    lawaaiTip: t('lawaaiTip', { advies: uur(ADVIES_LAWAAI_VANAF, locale) }),
  };

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pt-6 pb-16 sm:px-6 xl:pt-10 print:max-w-none print:p-0">
      <div className="mb-6 flex flex-col gap-3 print:hidden">
        <Link
          href={localizedHref(locale, '/geluid')}
          className="inline-flex min-h-11 items-center gap-2 self-start text-[15px] font-medium text-text no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span aria-hidden>←</span> {t('back')}
        </Link>
        <h1 className="m-0 text-[38px] leading-[1.05] font-bold text-text xl:text-[56px]">{t('heading')}</h1>
        <p className="m-0 max-w-[680px] text-[17px] leading-[1.5] text-text">{t('intro')}</p>
      </div>
      <Briefje locale={locale} labels={labels} teksten={{ nl, en }} />
    </main>
  );
}
