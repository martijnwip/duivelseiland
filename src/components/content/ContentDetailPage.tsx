import { getPayload } from 'payload';
import config from '@payload-config';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RichTextContent } from '@/components/site/RichTextContent';
import { localizedHref } from '@/i18n/localizedHref';
import type { ContentCollectionSlug } from './collections';
import { getAgendaEffectiveDate, isRecurring, type AgendaRecurrenceFields } from '@/lib/agenda/nextOccurrence';
import { getTranslations } from 'next-intl/server';
import { BuurtpasSlot } from '@/components/buurtpas/BuurtpasSlot';
import { heeftBuurtpas } from '@/lib/buurtpas/toegang';

export async function ContentDetailPage({
  collection,
  routeSegment,
  slug,
  locale,
  backLabel,
  recurringLabel,
}: {
  collection: ContentCollectionSlug;
  routeSegment: string;
  slug: string;
  locale: 'nl' | 'en';
  backLabel: string;
  /** Label shown when the item is a recurring event, e.g. "Herhaalt elke maand". */
  recurringLabel?: string;
}) {
  const payload = await getPayload({ config });
  // Altijd de buurtpas lezen (cookies): zo wordt de pagina per request gerenderd en nooit een versie met of
  // zonder afgeschermde inhoud gecachet voor iedereen.
  const buurtpas = await heeftBuurtpas();
  const terug = localizedHref(locale, `/${routeSegment}/${slug}`);

  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    locale,
    depth: 1,
    limit: 1,
  });

  const doc = docs[0];
  if (!doc) {
    notFound();
  }

  // Buurtitem zonder buurtpas: alleen de titel en het slot, geen tekst of afbeelding.
  if (doc.alleenBuurt && !buurtpas) {
    const t = await getTranslations({ locale, namespace: 'buurtpas' });
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* React zet dit in de <head>: de slotpagina hoort niet in zoekmachines. */}
        <meta name="robots" content="noindex" />
        <Link href={localizedHref(locale, `/${routeSegment}`)} className="text-sm text-primary hover:underline">
          ← {backLabel}
        </Link>
        <h1 className="mt-4 mb-6 text-3xl font-bold text-text">{doc.title}</h1>
        <BuurtpasSlot locale={locale} terug={terug} titel={t('slot.alleenBuurt')} />
      </main>
    );
  }

  const image = typeof doc.image === 'object' && doc.image !== null ? doc.image : null;
  const imageUrl = image?.sizes?.hero?.url ?? image?.url ?? null;

  const recurrenceFields = doc as typeof doc & AgendaRecurrenceFields;
  const effectiveDate = getAgendaEffectiveDate(recurrenceFields);
  const recurring = isRecurring(recurrenceFields);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href={localizedHref(locale, `/${routeSegment}`)} className="text-sm text-primary hover:underline">
        ← {backLabel}
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-text">{doc.title}</h1>

      {effectiveDate ? (
        <p className="mt-1 text-sm text-muted">
          {effectiveDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
          {recurrenceFields.recurrenceTime ? ` · ${recurrenceFields.recurrenceTime}` : ''}
        </p>
      ) : null}
      {recurring && recurringLabel ? <p className="mt-0.5 text-xs font-medium text-primary">{recurringLabel}</p> : null}

      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={image?.alt ?? ''} className="mt-6 w-full rounded object-cover" />
      ) : null}

      {doc.content ? <RichTextContent data={doc.content} className="mt-6" /> : null}
    </main>
  );
}
