import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import { localizedHref } from '@/i18n/localizedHref';
import { AgendaDateTile } from './AgendaDateTile';
import {
  getAgendaEffectiveDate,
  isRecurring,
  startOfDay,
  type AgendaRecurrenceFields,
} from '@/lib/agenda/nextOccurrence';
import type { AgendaRichFields } from '@/lib/agenda/richFields';

type ListItem = {
  id: number;
  slug: string;
  title: string;
  intro: string | null;
  effectiveDate: Date | null;
  recurrenceTime: string | null;
  isRecurring: boolean;
  imageUrl: string | null;
  imageAlt: string;
};

export async function AgendaListPage({
  locale,
  heading,
  emptyText,
  recurringLabel,
  upcomingLabel,
}: {
  locale: 'nl' | 'en';
  heading: string;
  emptyText: string;
  recurringLabel: string;
  upcomingLabel: string;
}) {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'agenda',
    where: { status: { equals: 'published' } },
    locale,
    depth: 1,
    limit: 100,
  });

  const now = new Date();
  const today = startOfDay(now);

  const items: ListItem[] = docs
    .map((doc) => {
      const image = typeof doc.image === 'object' && doc.image !== null ? doc.image : null;
      const recurrenceFields = doc as typeof doc & AgendaRecurrenceFields;
      const richFields = doc as typeof doc & AgendaRichFields;
      return {
        id: doc.id,
        slug: doc.slug ?? '',
        title: doc.title,
        intro: richFields.intro ?? null,
        effectiveDate: getAgendaEffectiveDate(recurrenceFields, now),
        recurrenceTime: recurrenceFields.recurrenceTime ?? null,
        isRecurring: isRecurring(recurrenceFields),
        imageUrl: image?.sizes?.card?.url ?? image?.url ?? null,
        imageAlt: image?.alt ?? '',
      };
    })
    // Eenmalige events uit het verleden verdwijnen uit de lijst; terugkerende
    // items lossen altijd op naar vandaag-of-later, dus die blijven.
    .filter((item) => item.isRecurring || (item.effectiveDate && startOfDay(item.effectiveDate) >= today))
    .sort((a, b) => (a.effectiveDate?.getTime() ?? 0) - (b.effectiveDate?.getTime() ?? 0));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-primary">{heading}</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-muted">{emptyText}</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {items.map((item, index) => (
            <li key={item.id}>
              {index === 0 ? (
                <span className="mb-2 inline-block rounded-full bg-secondary-soft px-2.5 py-0.5 text-xs font-semibold tracking-[0.04em] text-text uppercase">
                  {upcomingLabel}
                </span>
              ) : null}
              <Link
                href={localizedHref(locale, `/agenda/${item.slug}`)}
                className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
              >
                {item.effectiveDate ? <AgendaDateTile date={item.effectiveDate} locale={locale} /> : null}

                <div className="min-w-0 flex-1">
                  <h2 className="font-heading text-lg font-semibold text-text group-hover:text-primary">{item.title}</h2>
                  {item.effectiveDate ? (
                    <p className="mt-0.5 text-sm text-muted capitalize">
                      {item.effectiveDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                      {item.recurrenceTime ? ` · ${item.recurrenceTime}` : ''}
                    </p>
                  ) : null}
                  {item.isRecurring ? <p className="mt-0.5 text-xs font-medium text-primary">{recurringLabel}</p> : null}
                  {item.intro ? <p className="mt-1.5 line-clamp-2 text-sm text-muted">{item.intro}</p> : null}
                </div>

                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    className="size-16 flex-none rounded-lg border border-border object-cover"
                  />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
