import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { localizedHref } from '@/i18n/localizedHref';
import { BuurtpasForm } from './BuurtpasForm';

/** Slotje, gedeeld met de lijstpagina's. */
export function SlotIcoon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden className={className}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/**
 * Het slot dat een bezoeker zonder buurtpas ziet: uitleg en het aanvraagformulier. De aanroeper beslist met
 * heeftBuurtpas() wat er getoond wordt en maakt de afgeschermde inhoud zonder buurtpas niet eens aan. Zelfs
 * een niet-gerenderd element met de gegevens als props kan in de RSC-payload belanden (dev-debuginfo).
 */
export async function BuurtpasSlot({
  locale,
  terug,
  titel,
}: {
  locale: 'nl' | 'en';
  /** Pad van de huidige pagina (met taalprefix), om na het activeren naar terug te gaan. */
  terug: string;
  /** Wat er achter het slot zit, bv. "Contactgegevens". */
  titel?: string;
}) {
  const t = await getTranslations({ locale, namespace: 'buurtpas' });

  return (
    <section className="rounded-lg border border-border bg-card px-5 py-4">
      <h2 className="m-0 flex items-center gap-2 text-lg font-semibold text-text">
        <SlotIcoon className="size-5 text-primary" />
        {titel ?? t('slot.titel')}
      </h2>
      <p className="mt-1 mb-4 text-sm leading-[1.5] text-muted">
        {t('slot.uitleg')}{' '}
        <Link href={localizedHref(locale, '/buurtpas')} className="text-primary underline">
          {t('slot.meer')}
        </Link>
      </p>
      <BuurtpasForm locale={locale} terug={terug} strings={await formStrings(locale)} />
    </section>
  );
}

/**
 * Compacte variant voor een knop (bv. WhatsApp) zonder buurtpas: een link naar /buurtpas, die na het
 * activeren terugkeert naar `terug`. Voor pagina's met meerdere afgeschermde knoppen.
 */
export async function BuurtpasNodig({ locale, terug, label }: { locale: 'nl' | 'en'; terug: string; label: string }) {
  return (
    <Link
      href={`${localizedHref(locale, '/buurtpas')}?terug=${encodeURIComponent(terug)}`}
      className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-primary hover:text-primary"
    >
      <SlotIcoon className="size-4 text-primary" />
      {label}
    </Link>
  );
}

export async function formStrings(locale: string) {
  const t = await getTranslations({ locale, namespace: 'buurtpas' });
  return {
    emailLabel: t('form.emailLabel'),
    emailPlaceholder: t('form.emailPlaceholder'),
    submit: t('form.submit'),
    submitting: t('form.submitting'),
    success: t('form.success'),
    error: t('form.error'),
  };
}
