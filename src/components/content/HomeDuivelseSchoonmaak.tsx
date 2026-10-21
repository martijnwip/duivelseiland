import Link from 'next/link';
import { getPayload } from 'payload';
import config from '@payload-config';
import { getTranslations } from 'next-intl/server';
import { localizedHref } from '@/i18n/localizedHref';
import { WhatsappAanmeldLink } from '@/components/whatsapp/WhatsappAanmeldLink';
import { AgendaDateTile } from './AgendaDateTile';
import { ScheduleIcon } from './AgendaScheduleIcons';
import { getAgendaEffectiveDate, isRecurring, type AgendaRecurrenceFields } from '@/lib/agenda/nextOccurrence';
import type { AgendaRichFields } from '@/lib/agenda/richFields';

// Vast op dit ene agenda-item — net als HomeStats vaste KEYS gebruikt in plaats
// van generiek "een featured item" te worden. Als er later meer van dit soort
// homepage-uitlichtingen komen, is dat het moment om te generaliseren.
export const SCHOONMAAK_SLUG = 'duivelse-schoonmaak';

/** Homepagina-sectie onder "De buurt in cijfers": uitlichting van het terugkerende agenda-item Duivelse Schoonmaak. */
export async function HomeDuivelseSchoonmaak({ locale }: { locale: 'nl' | 'en' }) {
  const t = await getTranslations({ locale, namespace: 'home.duivelseSchoonmaak' });
  const tc = await getTranslations({ locale, namespace: 'content' });

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'agenda',
    where: { slug: { equals: SCHOONMAAK_SLUG }, status: { equals: 'published' } },
    locale,
    depth: 0,
    limit: 1,
  });

  const doc = docs[0];
  if (!doc) return null;

  const recurrenceFields = doc as typeof doc & AgendaRecurrenceFields;
  const effectiveDate = getAgendaEffectiveDate(recurrenceFields);
  if (!effectiveDate) return null;
  const recurring = isRecurring(recurrenceFields);

  const richFields = doc as typeof doc & AgendaRichFields;
  const schedule = (richFields.schedule ?? []).filter((step) => step.title);

  return (
    <section aria-labelledby="home-schoonmaak-title" className="mx-auto max-w-5xl px-4 pt-4 pb-12 xl:pb-16">
      <div aria-hidden>
        <div className="border-t-2 border-text" />
        <div className="mt-[3px] border-t border-text" />
      </div>

      {/* Kopstuk in dezelfde vorm als een hoofdstuk op Buurt statistieken: label,
          titel en boodschap links, een uitgelicht cijfer rechts (zie Chapter.tsx). */}
      <div className="mt-8 flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-end xl:gap-12">
        <div className="flex flex-col gap-3 xl:gap-3.5">
          <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('eyebrow')}</div>
          <h2 id="home-schoonmaak-title" className="m-0 text-[28px] leading-[1.15] font-semibold text-text xl:text-[38px] xl:leading-[1.1]">
            {t('title')}
          </h2>
          <p className="m-0 max-w-[560px] text-lg leading-[1.4] text-text">{t('intro')}</p>
          <Link
            href={localizedHref(locale, '/activiteiten/aanmelden')}
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg border border-primary px-5 py-2 font-medium text-primary no-underline transition-colors hover:bg-primary hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t('activiteitCta')}
            <svg width="16" height="16" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M2 7.5h10M8 3.5l4 4-4 4" />
            </svg>
          </Link>
          <p className="m-0 mt-2 max-w-[560px] text-lg leading-[1.4] text-text">{t('schoonmaakIntro')}</p>
        </div>
        <div className="flex items-baseline gap-4 border-t border-border pt-3 xl:flex-col xl:items-start xl:gap-1.5 xl:pt-4">
          <span className="font-heading text-4xl leading-none font-semibold text-primary xl:text-[48px]">1×</span>
          <span className="max-w-[280px] text-[15px] leading-[1.4] text-muted xl:text-base">{t('factText')}</span>
        </div>
      </div>

      {schedule.length > 0 ? (
        <div className="mt-8 flex flex-wrap items-center gap-x-1 gap-y-4">
          {schedule.map((step, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 ? (
                <svg aria-hidden width="16" height="16" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2" className="mx-1 flex-none text-border">
                  <path d="M2 7.5h10M8 3.5l4 4-4 4" />
                </svg>
              ) : null}
              <span className="flex size-9 flex-none items-center justify-center rounded-full border border-border bg-card text-primary">
                <ScheduleIcon icon={step.icon} />
              </span>
              <span className="text-sm font-medium text-text">{step.title}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-start gap-4 rounded-lg border border-border bg-card p-5">
        <AgendaDateTile date={effectiveDate} locale={locale} />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg font-semibold text-text">{doc.title}</p>
          <p className="mt-0.5 text-sm text-muted capitalize">
            {effectiveDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
            {recurrenceFields.recurrenceTime ? ` · ${recurrenceFields.recurrenceTime}` : ''}
          </p>
          {recurring ? <p className="mt-0.5 text-xs font-medium text-primary">{tc('recurringMonthly')}</p> : null}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={localizedHref(locale, `/agenda/${doc.slug}`)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-2 font-medium text-on-primary no-underline transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t('readMore')}
          <span className="sr-only"> {t('readMoreContext')}</span>
          <svg width="16" height="16" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path d="M2 7.5h10M8 3.5l4 4-4 4" />
          </svg>
        </Link>
        <WhatsappAanmeldLink locale={locale} label={t('whatsappCta')} />
      </div>
    </section>
  );
}
