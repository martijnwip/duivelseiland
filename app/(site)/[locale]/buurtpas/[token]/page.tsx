import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BuurtpasTokenForm } from '@/components/buurtpas/BuurtpasTokenForm';
import { veiligTerugpad } from '@/lib/buurtpas/toegang';
import { localizedHref } from '@/i18n/localizedHref';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'buurtpas' });
  return { title: t('activeren.heading'), robots: { index: false, follow: false } };
}

/** Pagina achter de link in de buurtpasmail. Of het token geldig is, blijkt pas bij de klik. */
export default async function BuurtpasTokenRoute({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<{ terug?: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'buurtpas' });
  const terug = veiligTerugpad((await searchParams).terug, localizedHref(locale, '/'));

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-text">{t('activeren.heading')}</h1>
      <p className="mt-2 text-muted">{t('activeren.text')}</p>
      <BuurtpasTokenForm
        token={token}
        terug={terug}
        strings={{ submit: t('activeren.submit'), submitting: t('form.submitting'), invalid: t('activeren.invalid') }}
      />
      <p className="mt-8">
        <Link href={localizedHref(locale, '/buurtpas')} className="text-primary underline">
          {t('activeren.opnieuw')}
        </Link>
      </p>
    </main>
  );
}
