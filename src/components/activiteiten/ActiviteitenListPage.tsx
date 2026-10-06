import Link from 'next/link';
import { getPayload } from 'payload';
import { getTranslations } from 'next-intl/server';
import config from '@payload-config';
import { localizedHref } from '@/i18n/localizedHref';
import { Section, SectionHead } from '@/components/site/Section';
import { lexicalNaarTekst } from '@/lib/activiteiten/lexical';
import { faseLabel, formatDatumTijd, mediaUrl } from './format';
import { buttonCls } from './styles';

/** /activiteiten: activiteiten die deelnemers zoeken of doorgaan, met daaronder een archief van afgelopen activiteiten. */
export async function ActiviteitenListPage({ locale }: { locale: 'nl' | 'en' }) {
  const t = await getTranslations({ locale, namespace: 'activiteiten' });
  const payload = await getPayload({ config });
  const [{ docs }, { docs: archief }] = await Promise.all([
    payload.find({
      collection: 'activiteiten',
      where: { fase: { in: ['goedgekeurd', 'gaat-door'] } },
      locale,
      depth: 1,
      limit: 100,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'activiteiten',
      where: { fase: { equals: 'afgelopen' } },
      locale,
      depth: 1,
      limit: 12,
      sort: '-datum',
    }),
  ]);

  const kaart = (doc: (typeof docs)[number]) => {
    const img = mediaUrl(doc.image, 'card');
    const tekst = lexicalNaarTekst(doc.content).trim();
    return (
      <li key={doc.id}>
        <Link
          href={localizedHref(locale, `/activiteiten/${doc.slug}`)}
          className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
        >
          {img?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img.url} alt={img.alt} className="aspect-[16/9] w-full object-cover" />
          ) : null}
          <div className="flex flex-1 flex-col gap-1.5 p-4">
            <span className="self-start rounded-full bg-secondary-soft px-2.5 py-0.5 text-xs font-semibold tracking-[0.04em] text-text uppercase">
              {t(`fase.${faseLabel(doc)}`)}
            </span>
            <h2 className="font-heading text-lg font-semibold text-text group-hover:text-primary">{doc.title}</h2>
            <p className="text-sm text-muted first-letter:uppercase">
              {doc.datum
                ? formatDatumTijd(doc.datum, locale)
                : doc.soort === 'terugkerend'
                  ? (doc.soortToelichting ?? t('soort.terugkerend'))
                  : null}
            </p>
            {doc.fase === 'goedgekeurd' ? <p className="text-xs font-medium text-accent">{t('voorbehoudKort')}</p> : null}
            {tekst ? <p className="line-clamp-3 text-sm text-text">{tekst}</p> : null}
          </div>
        </Link>
      </li>
    );
  };

  return (
    <main className="pt-8 xl:pt-12">
      <Section id="activiteiten">
        <SectionHead id="activiteiten" eyebrow={t('eyebrow')} title={t('heading')} intro={t('intro')} />
        <p className="mt-6">
          <Link href={localizedHref(locale, '/activiteiten/aanmelden')} className={buttonCls}>
            {t('ctaAanmelden')}
          </Link>
        </p>

        {docs.length === 0 ? (
          <p className="mt-8 text-muted">{t('leeg')}</p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">{docs.map(kaart)}</ul>
        )}

        {archief.length ? (
          <>
            <h2 className="mt-12 font-heading text-xl font-semibold text-text">{t('archiefTitel')}</h2>
            <p className="mt-1 text-sm text-muted">{t('archiefIntro')}</p>
            <ul className="mt-4 grid gap-4 opacity-90 sm:grid-cols-2">{archief.map(kaart)}</ul>
          </>
        ) : null}
      </Section>
    </main>
  );
}
