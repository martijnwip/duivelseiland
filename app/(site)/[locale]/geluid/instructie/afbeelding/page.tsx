import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { GeluidDeelKaart } from '@/components/geluid/instructie/GeluidDeelKaart';

// Bron voor de deelbare PNG (scripts/afval-deelkaart.ts); niet bedoeld om te vinden via zoekmachines.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.geluidInstructie' });
  return { title: t('share.heading'), robots: { index: false, follow: false } };
}

export default async function GeluidDeelKaartRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="overflow-x-auto px-4 py-8">
      <div className="mx-auto w-[1080px]">
        <GeluidDeelKaart locale={locale} />
      </div>
    </main>
  );
}
