import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import Image from 'next/image';
import { localizedHref } from '@/i18n/localizedHref';
import { getTranslations } from 'next-intl/server';
import { SlotIcoon } from '@/components/buurtpas/BuurtpasSlot';
import { AgendaDateTile } from './AgendaDateTile';
import {
  getAgendaEffectiveDate,
  isRecurring,
  startOfDay,
  type AgendaRecurrenceFields,
} from '@/lib/agenda/nextOccurrence';
import type { AgendaRichFields } from '@/lib/agenda/richFields';
import { hoeVaakVan } from '@/lib/agenda/hoeVaak';

type ListItem = {
  id: number;
  slug: string;
  title: string;
  intro: string | null;
  effectiveDate: Date | null;
  recurrenceTime: string | null;
  isRecurring: boolean;
  /** Hoort bij een terugkerende activiteit (soort `terugkerend`). */
  terugkerend: boolean;
  /** Bij een terugkerende activiteit: hoe vaak, in de woorden van de organisator. */
  hoeVaak: string | null;
  /** Gekoppelde activiteit die nog niet zeker doorgaat (fase goedgekeurd). */
  voorbehoud: boolean;
  imageUrl: string | null;
  imageAlt: string;
  alleenBuurt: boolean;
};

export async function AgendaListPage({
  locale,
  heading,
  emptyText,
  recurringLabel,
  voorbehoudLabel,
  upcomingLabel,
  vastHeading,
}: {
  locale: 'nl' | 'en';
  heading: string;
  emptyText: string;
  recurringLabel: string;
  voorbehoudLabel?: string;
  upcomingLabel: string;
  /** Kop boven terugkerende activiteiten zonder (komende) datum. */
  vastHeading: string;
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

  const alle: ListItem[] = docs.map((doc) => {
    const image = typeof doc.image === 'object' && doc.image !== null ? doc.image : null;
    const recurrenceFields = doc as typeof doc & AgendaRecurrenceFields;
    const richFields = doc as typeof doc & AgendaRichFields;
    return {
      id: doc.id,
      slug: doc.slug ?? '',
      title: doc.title,
      // Buurtitems: geen intro in de lijst, die zit achter de buurtpas.
      intro: doc.alleenBuurt ? null : (richFields.intro ?? null),
      alleenBuurt: Boolean(doc.alleenBuurt),
      effectiveDate: getAgendaEffectiveDate(recurrenceFields, now),
      recurrenceTime: recurrenceFields.recurrenceTime ?? null,
      isRecurring: isRecurring(recurrenceFields),
      terugkerend: typeof doc.activiteit === 'object' && doc.activiteit?.soort === 'terugkerend',
      hoeVaak: hoeVaakVan(doc),
      voorbehoud: typeof doc.activiteit === 'object' && doc.activiteit?.fase === 'goedgekeurd',
      imageUrl: image?.sizes?.card?.url ?? image?.url ?? null,
      imageAlt: image?.alt ?? '',
    };
  });

  // Eenmalige events uit het verleden verdwijnen uit de lijst; terugkerende
  // items lossen altijd op naar vandaag-of-later, dus die blijven.
  const items = alle
    .filter((item) => item.isRecurring || (item.effectiveDate && startOfDay(item.effectiveDate) >= today))
    .sort((a, b) => (a.effectiveDate?.getTime() ?? 0) - (b.effectiveDate?.getTime() ?? 0));
  // Terugkerende activiteiten zonder (komende) datum: "elke donderdag" staat alleen als tekst bij de activiteit.
  // Een datum uit het verleden (bv. de eerste keer) zegt daar niets meer, dus zonder datum.
  const vast = alle
    .filter((item) => item.terugkerend && !items.includes(item))
    .map((item) => ({ ...item, effectiveDate: null }))
    .sort((a, b) => a.title.localeCompare(b.title, locale));

  const tb = await getTranslations({ locale, namespace: 'buurtpas' });

  const kaart = (item: ListItem, Kop: 'h2' | 'h3' = 'h2') => (
    <Link
      href={localizedHref(locale, `/agenda/${item.slug}`)}
      className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
    >
      {item.effectiveDate ? <AgendaDateTile date={item.effectiveDate} locale={locale} /> : null}

      <div className="min-w-0 flex-1">
        <Kop className="font-heading text-lg font-semibold text-text group-hover:text-primary">
          {item.title}
          {item.alleenBuurt ? (
            <span title={tb('slot.alleenBuurt')} className="ml-2 inline-flex align-middle text-muted">
              <SlotIcoon className="size-4" />
              <span className="sr-only">{tb('slot.alleenBuurt')}</span>
            </span>
          ) : null}
        </Kop>
        {item.effectiveDate ? (
          <p className="mt-0.5 text-sm text-muted capitalize">
            {item.effectiveDate.toLocaleDateString(locale, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
            {item.recurrenceTime ? ` · ${item.recurrenceTime}` : ''}
          </p>
        ) : null}
        {item.isRecurring ? <p className="mt-0.5 text-xs font-medium text-primary">{recurringLabel}</p> : null}
        {/* Bij een terugkerende activiteit staat dit op de plek van de datum, dus in dezelfde stijl. */}
        {item.hoeVaak ? <p className="mt-0.5 text-sm text-muted">{item.hoeVaak}</p> : null}
        {item.voorbehoud && voorbehoudLabel ? <p className="mt-0.5 text-xs font-medium text-accent">{voorbehoudLabel}</p> : null}
        {item.intro ? <p className="mt-1.5 line-clamp-2 text-sm text-muted">{item.intro}</p> : null}
      </div>

      {item.imageUrl ? (
        // 64 px: via next/image op formaat, niet het originele bestand.
        <Image src={item.imageUrl} alt={item.imageAlt} width={64} height={64} className="size-16 flex-none rounded-lg border border-border object-cover" />
      ) : null}
    </Link>
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-text">{heading}</h1>

      {items.length === 0 && vast.length === 0 ? <p className="mt-6 text-muted">{emptyText}</p> : null}

      {items.length > 0 ? (
        <ul className="mt-8 flex flex-col gap-4">
          {items.map((item, index) => (
            <li key={item.id}>
              {index === 0 ? (
                <span className="mb-2 inline-block rounded-full bg-secondary-soft px-2.5 py-0.5 text-xs font-semibold tracking-[0.04em] text-text uppercase">
                  {upcomingLabel}
                </span>
              ) : null}
              {kaart(item)}
            </li>
          ))}
        </ul>
      ) : null}

      {vast.length > 0 ? (
        <section aria-labelledby="agenda-vast" className="mt-12">
          <h2 id="agenda-vast" className="text-2xl font-semibold text-text">
            {vastHeading}
          </h2>
          <ul className="mt-4 flex flex-col gap-4">
            {vast.map((item) => (
              <li key={item.id}>{kaart(item, 'h3')}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
