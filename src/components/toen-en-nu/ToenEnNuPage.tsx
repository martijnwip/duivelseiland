import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ChapterNav } from '@/components/stats/ChapterNav';
import { HOOFDSTUKKEN, NAWOORD, OMSLAG, VOORWOORD, beeldbankLink, zichtbaar, type Foto, type Straat, type Taal, TOESTEMMING_BESCHERMDE_FOTOS } from '@/lib/toen-en-nu/hoofdstukken';
import { TEKST } from '@/lib/toen-en-nu/tekst';
import { BeeldLaag, BuurtKaartOndergrond, Onderschrift, beeldOmschrijving, type BronLabels } from './Beelden';
import { ScrollVerhaal } from './ScrollVerhaal';

/** Voorwoord of nawoord: één zin als citaat, met foto en de volledige tekst om uit te klappen. */
function Woord({
  id,
  kop,
  woord,
  taal,
  leesMeer,
}: {
  id: 'voorwoord' | 'nawoord';
  kop: string;
  woord: typeof VOORWOORD;
  taal: Taal;
  leesMeer: string;
}) {
  const tekst = TEKST[id][taal];
  return (
    <section aria-labelledby={`tn-${id}`} className="my-14 grid items-start gap-6 border-t-2 border-text pt-5 md:grid-cols-[160px_minmax(0,1fr)] md:gap-8">
      <Image src={woord.foto.src} alt={woord.foto.alt[taal]} placeholder="blur" sizes="160px" className="h-auto w-28 rounded-md md:w-full" />
      <div>
        <h2 id={`tn-${id}`} className="mt-0 mb-3 text-sm font-semibold tracking-[0.08em] text-muted uppercase">
          {kop}
        </h2>
        <blockquote className="m-0">
          <p className="m-0 font-heading text-[clamp(22px,3vw,30px)] leading-snug font-semibold text-text">“{woord.citaat[taal]}”</p>
          <footer className="mt-2 text-[16px] text-muted">
            {woord.naam}, {woord.rol[taal]}
          </footer>
        </blockquote>
        <details className="mt-4 max-w-[65ch] text-[17px]">
          <summary className="cursor-pointer font-semibold text-primary">{leesMeer}</summary>
          {tekst.tekst.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </details>
      </div>
    </section>
  );
}

/** /toen-en-nu: het boekje "Duivelseiland 1898-2004" (2004) als scrollverhaal, per straat toen en nu. */
export async function ToenEnNuPage({ locale }: { locale: Taal }) {
  const t = await getTranslations({ locale, namespace: 'pages.toenEnNu' });
  const labels: BronLabels = {
    oudeboon: t('bron.oudeboon'),
    archief: t('bron.archief'),
    boekje: t('bron.boekje'),
    prentbriefkaart: t('bron.prentbriefkaart'),
    fotokaart: t('bron.fotokaart'),
    beeldnummer: t('bron.beeldnummer'),
    foto: t('bron.foto'),
  };
  const kaartLabel = (straat?: Straat) => (straat ? t('kaart.straat', { straat }) : t('kaart.buurt'));
  const hoofdstukken = HOOFDSTUKKEN.map(zichtbaar);

  const fotos: Foto[] = HOOFDSTUKKEN.flatMap((h) =>
    Object.values(h.beelden).flatMap((b) => (b.soort === 'foto' ? [b.foto] : b.soort === 'toenNu' ? [b.toen, b.nu] : [])),
  );
  const archief = fotos.filter((f) => f.beeldnummer && (TOESTEMMING_BESCHERMDE_FOTOS || !f.beschermd));

  /** Voor zoekmachines: een artikel over Duivelseiland, gebaseerd op het boekje uit 2004. */
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: t('metaTitle'),
    description: t('metaDescription'),
    inLanguage: locale,
    about: {
      '@type': 'Place',
      name: 'Duivelseiland',
      address: { '@type': 'PostalAddress', addressLocality: 'Amsterdam', addressCountry: 'NL' },
    },
    isBasedOn: {
      '@type': 'Book',
      name: 'Duivelseiland 1898 - 2004',
      datePublished: '2004-10',
      author: { '@type': 'Person', name: 'Fred van Kooij' },
      publisher: { '@type': 'Organization', name: 'Stadsdeel Amsterdam Oud Zuid' },
    },
  };

  return (
    <main className="mx-auto max-w-[1280px] px-4 md:px-8">
      <BuurtKaartOndergrond />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <section aria-labelledby="tn-titel" className="pt-10 pb-6 lg:pt-16">
        <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('eyebrow')}</div>
        <h1 id="tn-titel" className="my-3 text-[clamp(40px,7vw,76px)] leading-[1.02] font-bold tracking-[-0.02em] text-primary">
          {t('title')}
        </h1>
        <p className="m-0 max-w-[40ch] text-[clamp(20px,2.6vw,26px)] leading-snug text-text">{t('lead')}</p>
        <p className="mt-4 mb-0 max-w-[65ch] text-[16px] text-muted">{t('herkomst')}</p>
      </section>

      <figure className="m-0">
        <Image
          src={OMSLAG.src}
          alt={OMSLAG.alt[locale]}
          placeholder="blur"
          priority
          fetchPriority="high"
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="h-auto max-h-[75svh] w-full rounded-md object-cover"
        />
        <figcaption className="mt-2 text-[15px]">
          <Onderschrift foto={OMSLAG} taal={locale} labels={labels} />
        </figcaption>
      </figure>

      <Woord id="voorwoord" kop={t('voorwoord')} woord={VOORWOORD} taal={locale} leesMeer={t('leesHeleTekst')} />

      <div className="xl:grid xl:grid-cols-[200px_minmax(0,1fr)] xl:gap-10">
        <ChapterNav
          variant="rail"
          chapters={hoofdstukken.map((h) => ({ id: h.id, name: h.titel }))}
          sources={{ id: 'tn-bronnen', name: t('bronnen') }}
          labels={{ nav: t('nav.nav'), contents: t('nav.contents'), chapterOf: t.raw('nav.chapterOf') as string }}
        />
        <div className="-mx-4 md:-mx-8 xl:mx-0">
          <ChapterNav
            variant="bar"
            chapters={hoofdstukken.map((h) => ({ id: h.id, name: h.titel }))}
            sources={{ id: 'tn-bronnen', name: t('bronnen') }}
            labels={{ nav: t('nav.nav'), contents: t('nav.contents'), chapterOf: t.raw('nav.chapterOf') as string }}
          />
          <div className="px-4 md:px-8 xl:px-0">
            {hoofdstukken.map((h, i) => {
              const tekst = TEKST[h.id][locale];
              return (
                <section key={h.id} id={h.id} aria-labelledby={`${h.id}-kop`} className="scroll-mt-36 border-t-2 border-text pt-5 pb-10 first:mt-6">
                  <header className="mb-4">
                    <div className="font-heading text-sm font-semibold text-primary tabular-nums">{String(i + 1).padStart(2, '0')}</div>
                    <h2 id={`${h.id}-kop`} className="mt-1 mb-1 text-[clamp(28px,4vw,40px)] leading-tight font-semibold text-text">
                      {h.titel}
                    </h2>
                    <p className="m-0 text-[19px] text-muted italic">{h.ondertitel[locale]}</p>
                  </header>

                  <ScrollVerhaal
                    beeldLabel={t('beeld')}
                    lagen={Object.entries(h.beelden).map(([id, beeld]) => ({
                      id,
                      inhoud: <BeeldLaag beeld={beeld} taal={locale} labels={labels} kaartLabel={kaartLabel} />,
                    }))}
                    stappen={h.stappen.map((s) => ({
                      laag: s.beeld,
                      nu: s.nu,
                      tekst: s.tekst[locale],
                      omschrijving: beeldOmschrijving(h.beelden[s.beeld], s.nu, locale, kaartLabel),
                    }))}
                  />

                  <details className="mt-8 max-w-[65ch] text-[17px] leading-[1.6]">
                    <summary className="cursor-pointer font-semibold text-primary">{t('leesHeleTekst')}</summary>
                    {tekst.tekst.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                    {tekst.noten.length ? (
                      <ol className="mt-4 border-t border-border pt-3 pl-5 text-[15px] text-muted">
                        {tekst.noten.map((n, j) => (
                          <li key={j}>{n}</li>
                        ))}
                      </ol>
                    ) : null}
                  </details>
                </section>
              );
            })}

            <Woord id="nawoord" kop={t('nawoord')} woord={NAWOORD} taal={locale} leesMeer={t('leesHeleTekst')} />

            <section id="tn-bronnen" aria-labelledby="tn-bronnen-kop" className="mb-10 scroll-mt-36 border-t border-border pt-4 text-[15px] text-muted">
              <h2 id="tn-bronnen-kop" className="mt-0 mb-2 text-xl font-semibold text-text">
                {t('bronnen')}
              </h2>
              <p className="max-w-[75ch]">{t('bronTekst')}</p>
              <p className="max-w-[75ch]">{t('vertaling')}</p>
              <p className="max-w-[75ch]">{t('extraAlberto')}</p>
              {archief.length ? (
                <>
                  <h3 className="mt-5 mb-2 text-base font-semibold text-text">{t('beeldbank')}</h3>
                  <ul className="m-0 pl-5">
                    {archief.map((f) => (
                      <li key={f.beeldnummer}>
                        {f.bijschrift[locale]}
                        {f.maker ? ` (${f.maker})` : ''}:{' '}
                        <a href={beeldbankLink[f.beeldnummer!]} className="text-primary underline">
                          {f.beeldnummer}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
