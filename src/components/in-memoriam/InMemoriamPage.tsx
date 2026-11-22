import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { getTranslations } from 'next-intl/server';
import type { InMemoriam, Media } from '../../../payload-types';
import { BuurtpasSlot } from '@/components/buurtpas/BuurtpasSlot';
import { RichTextContent } from '@/components/site/RichTextContent';
import { DeelLink } from '@/components/vaklui/DeelLink';
import { buttonCls } from '@/components/activiteiten/styles';
import { buurtpasAdres } from '@/lib/buurtpas/toegang';
import { normaliseerEmail } from '@/lib/adresboek';
import { inMemoriamPad } from '@/lib/in-memoriam/constants';
import { hasRichTextContent } from '@/lib/richtext';
import { localizedHref } from '@/i18n/localizedHref';
import { HerinneringForm } from './HerinneringForm';
import { ontvolgFotos, volgFotos } from './actions';

type Locale = 'nl' | 'en';

/** Een gepubliceerde In-memoriam-pagina; concepten geven een 404. */
export const vindHerdenking = cache(async (slug: string, locale: Locale): Promise<InMemoriam | null> => {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'in-memoriam',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    locale,
    depth: 1,
    limit: 1,
  });
  return docs[0] ?? null;
});

const media = (value: number | Media | null | undefined) => (typeof value === 'object' && value !== null ? value : null);

/** Datum als "9 april 2026" / "9 April 2026", in Amsterdamse tijd. */
export function datumKort(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Amsterdam',
  });
}

const kopCls = 'm-0 font-serif text-[28px] leading-[1.15] font-semibold text-text xl:text-[32px]';
const kolomCls = 'mx-auto w-full max-w-[680px] px-4';

/** Kleine scheiding tussen de delen van de pagina. */
function Scheiding() {
  return (
    <div aria-hidden className="mx-auto my-14 flex max-w-[680px] items-center gap-4 px-4 text-border xl:my-16">
      <span className="h-px flex-1 bg-border" />
      <span className="size-1.5 rotate-45 bg-border" />
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export async function InMemoriamPage({ slug, locale }: { slug: string; locale: Locale }) {
  const doc = await vindHerdenking(slug, locale);
  if (!doc) notFound();

  const t = await getTranslations({ locale, namespace: 'pages.inMemoriam' });
  const pad = localizedHref(locale, inMemoriamPad(slug));
  // Leest cookies: de pagina wordt per request gerenderd. Namen bij herinneringen alleen met buurtpas.
  const adres = await buurtpasAdres();
  const buurtpas = Boolean(adres);

  const payload = await getPayload({ config });
  const [{ docs: herinneringen }, volgt] = await Promise.all([
    payload.find({
      collection: 'in-memoriam-reacties',
      where: { and: [{ herdenking: { equals: doc.id } }, { status: { equals: 'goedgekeurd' } }] },
      // Zonder buurtpas wordt de naam niet eens opgehaald, dus kan hij ook niet in de pagina belanden.
      select: buurtpas ? { tekst: true, naam: true, goedgekeurdOp: true, createdAt: true } : { tekst: true, goedgekeurdOp: true, createdAt: true },
      sort: 'createdAt',
      depth: 0,
      pagination: false,
      overrideAccess: true,
    }),
    adres
      ? payload
          .count({
            collection: 'in-memoriam-volgers',
            where: { and: [{ herdenking: { equals: doc.id } }, { email: { equals: normaliseerEmail(adres.email) } }] },
            overrideAccess: true,
          })
          .then((r) => r.totalDocs > 0)
      : false,
  ]);

  const hero = media(doc.hero);
  // Het origineel: de maat `hero` snijdt bij tot 16:9, en van deze foto moet alles in beeld blijven.
  const heroUrl = hero?.url ?? null;
  const fotos = (doc.fotos ?? []).map((f) => ({ id: f.id, foto: media(f.foto), onderschrift: f.onderschrift })).filter((f) => f.foto?.url);
  const formStrings = {
    tekst: t('form.tekst'),
    naam: t('form.naam'),
    naamHint: t('form.naamHint'),
    uitleg: t('form.uitleg'),
    submit: t('form.submit'),
    submitting: t('form.submitting'),
    success: t('form.success'),
    error: { velden: t('form.error.velden'), buurtpas: t('form.error.buurtpas'), server: t('form.error.server') },
  };

  return (
    <main className="pt-10 pb-16 xl:pt-16 xl:pb-24">
      <article aria-labelledby="in-memoriam-naam">
        <header className={`${kolomCls} flex flex-col items-center text-center`}>
          <p className="m-0 text-[13px] font-semibold tracking-[0.18em] text-muted uppercase">{t('eyebrow')}</p>
          <span aria-hidden className="mt-5 h-px w-12 bg-text" />
          <h1 id="in-memoriam-naam" className="mt-5 mb-0 font-serif text-5xl leading-[1.05] font-semibold tracking-tight text-text xl:text-6xl">
            {doc.naam}
          </h1>
          {doc.ondertitel ? <p className="mt-3 mb-0 font-serif text-xl text-muted italic xl:text-2xl">{doc.ondertitel}</p> : null}
          {doc.overleden ? (
            <p className="mt-4 mb-0 text-base text-muted">
              <time dateTime={doc.overleden.slice(0, 10)}>{t('overleden', { datum: datumKort(doc.overleden, locale) })}</time>
            </p>
          ) : null}
        </header>

        {heroUrl ? (
          <figure className="mx-auto mt-10 mb-0 max-w-5xl px-4 xl:mt-14">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroUrl}
              alt={hero?.alt ?? ''}
              width={hero?.width ?? undefined}
              height={hero?.height ?? undefined}
              fetchPriority="high"
              className="h-auto w-full rounded-sm"
            />
            {doc.heroOnderschrift ? (
              <figcaption className="mx-auto mt-3 max-w-[680px] text-center text-sm leading-[1.5] text-muted">{doc.heroOnderschrift}</figcaption>
            ) : null}
          </figure>
        ) : null}

        <div className={`${kolomCls} mt-10 xl:mt-14`}>
          {hasRichTextContent(doc.content) ? <RichTextContent data={doc.content} className="text-lg leading-[1.7] xl:text-[19px]" /> : null}

          {doc.citaat ? (
            <blockquote className="mx-0 mt-12 mb-0 border-y border-border py-8 text-center">
              <p className="m-0 font-serif text-2xl leading-[1.4] text-text italic xl:text-[28px]">“{doc.citaat}”</p>
            </blockquote>
          ) : null}

          {doc.bron ? <p className="mt-8 mb-0 text-sm text-muted italic">{doc.bron}</p> : null}

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted">
            <span aria-hidden>{t('deelLabel')}</span>
            <DeelLink pad={pad} titel={`${t('eyebrow')} ${doc.naam}`} label={t('deelLabel')} gekopieerd={t('gekopieerd')} />
          </div>
        </div>
      </article>

      <Scheiding />

      <section id="fotos" aria-labelledby="fotos-kop" className="scroll-mt-24">
        {fotos.length ? (
          <div className="mx-auto max-w-5xl px-4">
            <h2 id="fotos-kop" className={`${kopCls} text-center`}>
              {t('fotos.title')}
            </h2>
            <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2">
              {fotos.map(({ id, foto, onderschrift }) => {
                const groot = foto?.sizes?.hero?.url ?? foto?.url ?? '';
                return (
                  <li key={id}>
                    <figure className="m-0">
                      <a href={groot} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={groot}
                          alt={foto?.alt ?? ''}
                          width={foto?.sizes?.hero?.width ?? foto?.width ?? undefined}
                          height={foto?.sizes?.hero?.height ?? foto?.height ?? undefined}
                          loading="lazy"
                          className="h-auto w-full rounded-sm"
                        />
                      </a>
                      {onderschrift ? <figcaption className="mt-2 text-sm leading-[1.5] text-muted">{onderschrift}</figcaption> : null}
                    </figure>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <h2 id="fotos-kop" className="sr-only">
            {t('fotos.title')}
          </h2>
        )}

        <div className={`${kolomCls} ${fotos.length ? 'mt-10' : ''}`}>
          <div className="rounded-lg border border-border bg-card p-5 xl:p-6">
            <h3 className="m-0 font-serif text-xl font-semibold text-text">{t('volgen.title')}</h3>
            <p className="mt-2 mb-0 text-base leading-[1.5] text-text">
              {t.rich('fotos.stuurIn', {
                naam: doc.naam,
                link: (chunks) => (
                  <Link href={localizedHref(locale, '/contact')} className="text-primary underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
            {buurtpas ? (
              volgt ? (
                <form action={ontvolgFotos} className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <input type="hidden" name="herdenking" value={doc.id} />
                  <input type="hidden" name="terug" value={pad} />
                  <p className="m-0 font-medium text-primary">{t('volgen.aan')}</p>
                  <button type="submit" className="min-h-11 cursor-pointer border-0 bg-transparent p-0 text-sm text-muted underline hover:text-text">
                    {t('volgen.uit')}
                  </button>
                </form>
              ) : (
                <form action={volgFotos} className="mt-4 flex flex-col gap-3">
                  <input type="hidden" name="herdenking" value={doc.id} />
                  <input type="hidden" name="terug" value={pad} />
                  <input type="hidden" name="locale" value={locale} />
                  <p className="m-0 text-base leading-[1.5] text-muted">{t('volgen.uitleg')}</p>
                  <button type="submit" className={buttonCls}>
                    {t('volgen.knop')}
                  </button>
                </form>
              )
            ) : (
              <p className="mt-2 mb-0 text-base leading-[1.5] text-muted">
                {t('volgen.uitleg')}{' '}
                {t.rich('volgen.slot', {
                  link: (chunks) => (
                    <a href="#buurtpas" className="text-primary underline">
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            )}
          </div>
        </div>
      </section>

      <Scheiding />

      <section id="herinneringen" aria-labelledby="herinneringen-kop" className={`${kolomCls} scroll-mt-24`}>
        <h2 id="herinneringen-kop" className={`${kopCls} text-center`}>
          {t('herinneringen.title')}
        </h2>
        <p className="mx-auto mt-3 mb-0 max-w-[560px] text-center text-base leading-[1.5] text-muted">{t('herinneringen.intro', { naam: doc.naam })}</p>

        {herinneringen.length ? (
          <ol className="m-0 mt-10 flex list-none flex-col gap-6 p-0">
            {herinneringen.map((h) => {
              const naam = buurtpas && 'naam' in h && typeof h.naam === 'string' && h.naam.trim() ? h.naam.trim() : t('herinneringen.anoniem');
              const datum = h.goedgekeurdOp ?? h.createdAt;
              return (
                <li key={h.id} className="border-l-2 border-border pl-5">
                  <blockquote className="m-0 text-[17px] leading-[1.6] whitespace-pre-line text-text">{h.tekst}</blockquote>
                  <p className="mt-2 mb-0 text-sm text-muted">
                    — {naam}
                    {datum ? (
                      <>
                        {', '}
                        <time dateTime={datum}>{datumKort(datum, locale)}</time>
                      </>
                    ) : null}
                  </p>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-8 mb-0 text-center text-base text-muted italic">{t('herinneringen.leeg')}</p>
        )}
        {herinneringen.length && !buurtpas ? <p className="mt-6 mb-0 text-sm text-muted">{t('herinneringen.namenMetBuurtpas')}</p> : null}

        <div className="mt-12">
          {buurtpas ? (
            <div className="rounded-lg border border-border bg-card p-5 xl:p-6">
              <h3 className="m-0 mb-5 font-serif text-xl font-semibold text-text">{t('form.title')}</h3>
              <HerinneringForm locale={locale} herdenking={doc.id} strings={formStrings} />
            </div>
          ) : (
            // Eén slot voor de hele pagina: herinnering delen en bericht bij nieuwe foto's.
            <div id="buurtpas" className="scroll-mt-24">
              <BuurtpasSlot locale={locale} terug={`${pad}#herinneringen`} titel={t('herinneringen.slot')} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
