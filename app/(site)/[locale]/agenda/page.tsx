import type { Metadata } from 'next';
import { metDeelinfo } from '@/lib/deelMetadata';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AgendaListPage } from '@/components/content/AgendaListPage';

// Agenda-items kunnen maandelijks terugkeren (zie src/lib/agenda/nextOccurrence.ts): elk uur opnieuw, zodat de
// "eerstvolgende zondag" niet bevriest. Publicaties zijn direct zichtbaar via revalidateContent.
export const revalidate = 3600;

/** Titel en omschrijving, ook voor een gedeelde link (deelafbeelding: opengraph-image.tsx). */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.agenda' });
  return metDeelinfo(locale, { title: t('heading'), description: t('metaDescription') });
}

export default async function AgendaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.agenda' });
  const tc = await getTranslations({ locale, namespace: 'content' });
  const ta = await getTranslations({ locale, namespace: 'activiteiten' });

  return (
    <AgendaListPage
      locale={locale as 'nl' | 'en'}
      heading={t('heading')}
      emptyText={tc('empty')}
      recurringLabel={tc('recurringMonthly')}
      voorbehoudLabel={ta('voorbehoudKort')}
      upcomingLabel={tc('upcoming')}
      vastHeading={t('vast')}
    />
  );
}
