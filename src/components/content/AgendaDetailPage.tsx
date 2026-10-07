import { getPayload } from 'payload';
import config from '@payload-config';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RichTextContent } from '@/components/site/RichTextContent';
import { localizedHref } from '@/i18n/localizedHref';
import { AgendaDateTile } from './AgendaDateTile';
import { ScheduleIcon } from './AgendaScheduleIcons';
import { getAgendaEffectiveDate, isRecurring, type AgendaRecurrenceFields } from '@/lib/agenda/nextOccurrence';
import type { AgendaRichFields } from '@/lib/agenda/richFields';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { getTranslations } from 'next-intl/server';
import { BuurtpasSlot } from '@/components/buurtpas/BuurtpasSlot';
import { heeftBuurtpas } from '@/lib/buurtpas/toegang';

export async function AgendaDetailPage({
  slug,
  locale,
  backLabel,
  recurringLabel,
  scheduleLabel,
  activiteitLabel,
  voorbehoudTekst,
}: {
  slug: string;
  locale: 'nl' | 'en';
  backLabel: string;
  recurringLabel?: string;
  scheduleLabel: string;
  /** Tekst van de knop naar een gekoppelde activiteit met open inschrijving. */
  activiteitLabel?: string;
  /** Uitleg bij een activiteit die nog niet zeker doorgaat. */
  voorbehoudTekst?: string;
}) {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'agenda',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    locale,
    depth: 1,
    limit: 1,
  });

  const doc = docs[0];
  if (!doc) {
    notFound();
  }

  const buurtpas = await heeftBuurtpas();
  const terug = localizedHref(locale, `/agenda/${slug}`);
  const tb = await getTranslations({ locale, namespace: 'buurtpas' });

  // Buurtitem zonder buurtpas: alleen de titel en het slot.
  if (doc.alleenBuurt && !buurtpas) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <meta name="robots" content="noindex" />
        <Link href={localizedHref(locale, `/agenda`)} className="text-sm text-primary hover:underline">
          ← {backLabel}
        </Link>
        <h1 className="mt-4 mb-6 text-3xl font-bold text-text">{doc.title}</h1>
        <BuurtpasSlot locale={locale} terug={terug} titel={tb('slot.alleenBuurt')} />
      </main>
    );
  }

  const image = typeof doc.image === 'object' && doc.image !== null ? doc.image : null;
  const imageUrl = image?.sizes?.hero?.url ?? image?.url ?? null;

  const recurrenceFields = doc as typeof doc & AgendaRecurrenceFields;
  const effectiveDate = getAgendaEffectiveDate(recurrenceFields);
  const recurring = isRecurring(recurrenceFields);

  const richFields = doc as typeof doc & AgendaRichFields;
  const schedule = (richFields.schedule ?? []).filter((step) => step.title);
  const hasRichLayout = schedule.length > 0 || Boolean(richFields.intro);
  // Een los WhatsApp-nummer heeft voorrang boven een kant-en-klare link.
  const whatsappHref = buildWhatsAppLink(richFields.whatsappNumber);
  const ctaHref = whatsappHref ?? richFields.ctaUrl;
  const hasCta = Boolean(richFields.ctaLabel && ctaHref);

  // Alleen agenda-items die bij een activiteit horen krijgen een aanmeldknop, en alleen zolang je je
  // daar nog kunt inschrijven (docs/brief-activiteiten.md, flow 7).
  const activiteit = typeof doc.activiteit === 'object' ? doc.activiteit : null;
  const activiteitHref =
    activiteit && ['goedgekeurd', 'gaat-door'].includes(activiteit.fase) && activiteit.inschrijving === 'open'
      ? localizedHref(locale, `/activiteiten/${activiteit.slug}`)
      : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href={localizedHref(locale, `/agenda`)} className="text-sm text-primary hover:underline">
        ← {backLabel}
      </Link>

      <div className="mt-4 flex items-start gap-4">
        {effectiveDate ? <AgendaDateTile date={effectiveDate} locale={locale} /> : null}
        <div>
          <h1 className="text-3xl font-bold text-text">{doc.title}</h1>

          {effectiveDate ? (
            <p className="mt-1 text-sm text-muted capitalize">
              {effectiveDate.toLocaleDateString(locale, { weekday: 'long' })}
              {recurrenceFields.recurrenceTime ? ` · ${recurrenceFields.recurrenceTime}` : ''}
            </p>
          ) : null}
          {recurring && recurringLabel ? <p className="mt-0.5 text-xs font-medium text-primary">{recurringLabel}</p> : null}
        </div>
      </div>

      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={image?.alt ?? ''} className="mt-6 w-full rounded-lg object-cover" />
      ) : null}

      {richFields.intro ? <p className="mt-6 text-lg leading-[1.4] text-text">{richFields.intro}</p> : null}

      {schedule.length > 0 ? (
        <section className="mt-8" aria-label={scheduleLabel}>
          <ol className="relative flex flex-col gap-6">
            <div aria-hidden className="absolute top-2 bottom-2 left-[19px] w-px bg-border" />
            {schedule.map((step, index) => (
              <li key={index} className="relative flex items-start gap-4">
                <span className="relative z-10 flex size-10 flex-none items-center justify-center rounded-full border border-border bg-card text-primary">
                  <ScheduleIcon icon={step.icon} />
                </span>
                <div className="flex-1 rounded-lg border border-border bg-card px-4 py-3">
                  {step.time ? (
                    <p className="text-xs font-semibold tracking-[0.06em] text-primary uppercase">{step.time}</p>
                  ) : null}
                  <h2 className="mt-0.5 font-heading text-lg font-semibold text-text">{step.title}</h2>
                  {step.description ? <p className="mt-1 text-sm leading-[1.4] text-muted">{step.description}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Zonder rijke indeling (geen intro/programma): val terug op de gewone tekst uit het "Content"-veld. */}
      {!hasRichLayout && doc.content ? <RichTextContent data={doc.content} className="mt-6" /> : null}
      {hasRichLayout && doc.content ? <RichTextContent data={doc.content} className="mt-8" /> : null}

      {/* Een WhatsApp-nummer is een telefoonnummer: alleen met buurtpas. Een gewone link mag iedereen zien. */}
      {hasCta && whatsappHref && !buurtpas ? (
        <div className="mt-8">
          <BuurtpasSlot locale={locale} terug={terug} titel={tb('slot.whatsapp')} />
        </div>
      ) : hasCta ? (
        <a
          href={ctaHref!}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex rounded-lg bg-primary px-4 py-2 font-medium text-on-primary transition-colors hover:bg-primary-hover"
        >
          {richFields.ctaLabel}
        </a>
      ) : null}

      {activiteit?.fase === 'goedgekeurd' && voorbehoudTekst ? (
        <p className="mt-8 rounded-lg border border-border bg-secondary-soft px-4 py-3 text-sm text-text">{voorbehoudTekst}</p>
      ) : null}

      {activiteitHref && activiteitLabel ? (
        <p className="mt-4">
          <Link
            href={activiteitHref}
            className="inline-flex rounded-lg bg-primary px-4 py-2 font-medium text-on-primary transition-colors hover:bg-primary-hover"
          >
            {activiteitLabel}
          </Link>
        </p>
      ) : null}
    </main>
  );
}
