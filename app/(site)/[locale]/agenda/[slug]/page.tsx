import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AgendaDetailPage } from '@/components/content/AgendaDetailPage';

// Agenda-items kunnen maandelijks terugkeren (zie src/lib/agenda/nextOccurrence.ts):
// de "eerstvolgende zondag" wordt bij elk bezoek opnieuw berekend, dus deze
// pagina mag niet statisch bevriezen op het moment van de laatste deploy.
export const dynamic = 'force-dynamic';

export default async function AgendaDetailRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'content' });

  return (
    <AgendaDetailPage
      slug={slug}
      locale={locale as 'nl' | 'en'}
      backLabel={t('backToOverview')}
      recurringLabel={t('recurringMonthly')}
      scheduleLabel={t('schedule')}
    />
  );
}
