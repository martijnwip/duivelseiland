import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import { localizedHref } from '@/i18n/localizedHref';
import type { ContentCollectionSlug } from './collections';
import {
  getAgendaEffectiveDate,
  isRecurring,
  startOfDay,
  type AgendaRecurrenceFields,
} from '@/lib/agenda/nextOccurrence';

type ListItem = {
  id: number;
  slug: string;
  title: string;
  /** Date to display: the plain `date` field, or the computed next occurrence for recurring items. */
  displayDate: string | null;
  recurrenceTime: string | null;
  isRecurring: boolean;
  imageUrl: string | null;
};

export async function ContentListPage({
  collection,
  routeSegment,
  locale,
  heading,
  emptyText,
  sortByEventDate = false,
  recurringLabel,
}: {
  collection: ContentCollectionSlug;
  routeSegment: string;
  locale: 'nl' | 'en';
  heading: string;
  emptyText: string;
  /** When true, sort chronologically by event date (soonest first) instead of by creation date, and drop past one-off items. Used by Agenda. */
  sortByEventDate?: boolean;
  /** Label shown next to a recurring item's date, e.g. "Herhaalt elke maand". */
  recurringLabel?: string;
}) {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection,
    where: { status: { equals: 'published' } },
    sort: sortByEventDate ? undefined : '-createdAt',
    locale,
    depth: 1,
  });

  const now = new Date();

  let items: ListItem[] = docs.map((doc) => {
    const image = typeof doc.image === 'object' && doc.image !== null ? doc.image : null;
    const recurrenceFields = doc as typeof doc & AgendaRecurrenceFields;
    const effectiveDate = getAgendaEffectiveDate(recurrenceFields, now);
    return {
      id: doc.id,
      slug: doc.slug ?? '',
      title: doc.title,
      displayDate: effectiveDate ? effectiveDate.toISOString() : null,
      recurrenceTime: recurrenceFields.recurrenceTime ?? null,
      isRecurring: isRecurring(recurrenceFields),
      imageUrl: image?.sizes?.card?.url ?? image?.url ?? null,
    };
  });

  if (sortByEventDate) {
    const today = startOfDay(now);
    items = items
      // Drop past one-off events (by day, so today's event stays visible); recurring
      // items always resolve to today-or-later.
      .filter((item) => item.isRecurring || (item.displayDate && startOfDay(new Date(item.displayDate)) >= today))
      .sort((a, b) => (a.displayDate ? new Date(a.displayDate).getTime() : 0) - (b.displayDate ? new Date(b.displayDate).getTime() : 0));
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-primary">{heading}</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-muted">{emptyText}</p>
      ) : (
        <ul className="mt-8 space-y-8">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={localizedHref(locale, `/${routeSegment}/${item.slug}`)} className="group block">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="mb-3 h-48 w-full rounded object-cover" />
                ) : null}
                <h2 className="text-xl font-semibold text-text group-hover:text-primary">{item.title}</h2>
                {item.displayDate ? (
                  <p className="mt-1 text-sm text-muted">
                    {new Date(item.displayDate).toLocaleDateString(locale, {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                    {item.recurrenceTime ? ` · ${item.recurrenceTime}` : ''}
                  </p>
                ) : null}
                {item.isRecurring && recurringLabel ? (
                  <p className="mt-0.5 text-xs font-medium text-primary">{recurringLabel}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
