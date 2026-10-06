import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import { getTranslations } from 'next-intl/server';
import config from '@payload-config';
import { localizedHref } from '@/i18n/localizedHref';
import { RichTextContent } from '@/components/site/RichTextContent';
import { boxCls } from '@/components/site/Section';
import { ACTIEVE_FASES, voornaam } from '@/lib/activiteiten/constants';
import { hasRichTextContent } from '@/lib/richtext';
import { faseLabel, formatDatumTijd, mediaUrl } from './format';
import { InschrijfForm } from './InschrijfForm';

export async function vindActiviteit(slug: string, locale: 'nl' | 'en') {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'activiteiten',
    where: { and: [{ slug: { equals: slug } }, { fase: { in: ['goedgekeurd', 'gaat-door', 'afgelopen'] } }] },
    locale,
    depth: 1,
    limit: 1,
  });
  return docs[0] ?? null;
}

/** /activiteiten/[slug]: alle gegevens van de activiteit plus het inschrijfblok. */
export async function ActiviteitDetailPage({ slug, locale }: { slug: string; locale: 'nl' | 'en' }) {
  const doc = await vindActiviteit(slug, locale);
  if (!doc) notFound();

  const t = await getTranslations({ locale, namespace: 'activiteiten' });
  const payload = await getPayload({ config });
  const img = mediaUrl(doc.image, 'hero');
  const actief = ACTIEVE_FASES.includes(doc.fase);
  const open = actief && doc.inschrijving === 'open';
  const naam = voornaam(doc.aanvragerNaam);
  const aantal = doc.toonAantal
    ? (
        await payload.count({
          collection: 'activiteit-inschrijvingen',
          where: { and: [{ activiteit: { equals: doc.id } }, { status: { equals: 'actief' } }] },
        })
      ).totalDocs
    : null;
  const agenda = typeof doc.agendaItem === 'object' && doc.agendaItem?.status === 'published' ? doc.agendaItem : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href={localizedHref(locale, '/activiteiten')} className="text-sm text-primary hover:underline">
        ← {t('terug')}
      </Link>

      {img?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.url} alt={img.alt} className="mt-4 aspect-[16/7] w-full rounded-lg object-cover" />
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-secondary-soft px-2.5 py-0.5 text-xs font-semibold tracking-[0.04em] text-text uppercase">
          {t(`fase.${faseLabel(doc)}`)}
        </span>
        <span className="text-xs font-medium text-primary">
          {doc.soort === 'terugkerend' ? (doc.soortToelichting ?? t('soort.terugkerend')) : t('soort.eenmalig')}
        </span>
      </div>
      <h1 className="mt-2 text-3xl font-bold text-text">{doc.title}</h1>

      <div className="mt-3 flex flex-col gap-1 text-sm text-muted">
        {doc.datum ? <p className="m-0 first-letter:uppercase">{formatDatumTijd(doc.datum, locale)}</p> : null}
        {naam ? <p className="m-0">{t('organisator', { naam })}</p> : null}
        {aantal !== null && aantal > 0 ? <p className="m-0">{t('aantal', { aantal })}</p> : null}
      </div>

      {doc.fase === 'goedgekeurd' ? (
        <p className="mt-6 rounded-lg border border-border bg-secondary-soft px-4 py-3 text-sm text-text">{t('voorbehoud')}</p>
      ) : null}

      {hasRichTextContent(doc.content) ? <RichTextContent data={doc.content} className="mt-6" /> : null}

      {agenda?.slug ? (
        <p className="mt-6">
          <Link href={localizedHref(locale, `/agenda/${agenda.slug}`)} className="text-primary underline">
            {t('opAgenda')}
          </Link>
        </p>
      ) : null}

      <section aria-labelledby="doe-mee" className={`${boxCls} mt-10`}>
        <h2 id="doe-mee" className="font-heading text-xl font-semibold text-text">
          {t('inschrijfForm.titel')}
        </h2>
        {!actief ? (
          <p className="text-muted">{t('afgelopenTekst')}</p>
        ) : (
          <>
            {!open ? <p className="text-accent">{t('inschrijfForm.gesloten')}</p> : null}
            <InschrijfForm
              activiteitId={doc.id}
              locale={locale}
              alleenAfmelden={!open}
              strings={{
                legend: t('inschrijfForm.legend'),
                aanmelden: t('inschrijfForm.aanmelden'),
                afmelden: t('inschrijfForm.afmelden'),
                voornaam: t('inschrijfForm.voornaam'),
                email: t('inschrijfForm.email'),
                emailPlaceholder: t('inschrijfForm.emailPlaceholder'),
                opmerking: t('inschrijfForm.opmerking'),
                opmerkingPlaceholder: t('inschrijfForm.opmerkingPlaceholder'),
                submitAanmelden: t('inschrijfForm.submitAanmelden'),
                submitAfmelden: t('inschrijfForm.submitAfmelden'),
                submitting: t('inschrijfForm.submitting'),
                successAanmelden: t('inschrijfForm.successAanmelden'),
                successAfmelden: t('inschrijfForm.successAfmelden'),
                gesloten: t('inschrijfForm.gesloten'),
                error: t('inschrijfForm.error'),
              }}
            />
            <p className="m-0 text-sm text-muted">{t('inschrijfForm.privacy')}</p>
          </>
        )}
      </section>
    </main>
  );
}
