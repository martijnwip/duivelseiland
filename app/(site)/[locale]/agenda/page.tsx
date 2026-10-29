import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AgendaListPage } from '@/components/content/AgendaListPage';

// Agenda-items kunnen maandelijks terugkeren (zie src/lib/agenda/nextOccurrence.ts):
// de "eerstvolgende zondag" wordt bij elk bezoek opnieuw berekend, dus deze
// pagina mag niet statisch bevriezen op het moment van de laatste deploy.
export const dynamic = 'force-dynamic';

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
