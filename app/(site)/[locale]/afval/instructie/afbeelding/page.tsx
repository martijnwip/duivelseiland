import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { DeelKaart } from '@/components/afval/instructie/DeelKaart';

// Bron voor de deelbare PNG (scripts/afval-deelkaart.ts); niet bedoeld om te vinden via zoekmachines.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.afvalInstructie' });
  return { title: t('share.heading'), robots: { index: false, follow: false } };
}

export default async function DeelKaartRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="overflow-x-auto px-4 py-8">
      <div className="mx-auto w-[1080px]">
        <DeelKaart locale={locale} />
      </div>
    </main>
  );
}
