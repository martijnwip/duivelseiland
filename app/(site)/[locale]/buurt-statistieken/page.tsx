import { setRequestLocale, getTranslations } from 'next-intl/server';

export default async function BuurtStatistiekenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.buurtStatistieken' });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-primary">{t('heading')}</h1>
      <p className="mt-6 text-muted">{t('comingSoon')}</p>
    </main>
  );
}
