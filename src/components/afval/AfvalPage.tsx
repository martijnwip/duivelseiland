import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { makeFormatters } from '@/lib/stats/format';
import type { Tone } from '@/lib/stats/scale';
import { ChapterNav } from '@/components/stats/ChapterNav';
import { Chapter, Pair, Stack } from '@/components/stats/Chapter';
import { ChartCardShell } from '@/components/stats/ChartCardShell';
import { ChartFrame } from '@/components/stats/ChartFrame';
import { CountUp } from '@/components/stats/CountUp';
import { DataTable, dual, type Cell, type T } from '@/components/stats/cards/card';
import { BarHorizontal, BarVertical } from '@/components/stats/charts/Bars';
import { Legend } from '@/components/stats/charts/base';
import { getBijplaatsingen, getContainers, getMeldingen, getRecyclepunten, getRegels } from '@/lib/afval/api';
import { CROW, crowVerdeling, hotspots, jaarVergelijking, laatsteDatum, meldingenRecent, perFractie, perJaar, perStraat, soorten } from '@/lib/afval/aggregate';
import { LINKS } from '@/lib/afval/constants';
import { BUURT_MIDDEN, distanceM } from '@/lib/afval/geo';
import { BaseMap } from './BaseMap';
import { ContainerLayer, HotspotLayer, MeldingLayer, fractieTone } from './MapLayers';
import { NextPickup } from './NextPickup';
import { AdresCheck } from './AdresCheck';
import { RegelItem } from './RegelItem';

const DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const MELDING_DAGEN = 90;

const linkCls =
  'font-medium text-primary underline underline-offset-3 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const boxCls = 'flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-4 xl:p-6';

function External({ href, children, className = linkCls, note }: { href: string; children: ReactNode; className?: string; note: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> {note}</span>
    </a>
  );
}

function BoxTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h3 className="m-0 text-[17px] leading-[1.3] font-semibold text-text xl:text-lg">{title}</h3>
      {sub && <p className="mt-1 mb-0 text-sm leading-[1.4] text-muted">{sub}</p>}
    </div>
  );
}

export async function AfvalPage({ locale }: { locale: string }) {
  const t = (await getTranslations({ locale, namespace: 'pages.afval' })) as unknown as T;
  const f = makeFormatters(locale);
  const [containers, bij, regels, recycle, meldingen] = await Promise.all([
    getContainers(),
    getBijplaatsingen(),
    getRegels(),
    getRecyclepunten(),
    getMeldingen(),
  ]);

  const date = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
    new Intl.DateTimeFormat(locale, { ...opts, timeZone: 'Europe/Amsterdam' }).format(new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso));
  /** "maandag, donderdag" in de taal van de pagina. */
  const dagNaam = (nl: string) =>
    nl
      .split(',')
      .map((d) => {
        const i = DAGEN.indexOf(d.trim().toLowerCase());
        // 4 januari 2026 is een zondag.
        return i < 0 ? d.trim() : new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 0, 4 + i)));
      })
      .join(locale === 'nl' ? ' en ' : ' and ');
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const note = t('ui.external');
  const tableLabels = { showTable: t('ui.showTable'), showChart: t('ui.showChart') };
  const fractieNaam = (code: string) => (t.has(`containerFracties.${code}`) ? t(`containerFracties.${code}`) : code);

  const card = (o: { title: string; sub?: string; note?: string; bron: string; chart: ReactNode; head: string[]; rows: Cell[][]; showMap?: boolean }) => {
    const source = t('ui.source', { bron: o.bron });
    return (
      <ChartCardShell
        title={o.title}
        sub={o.sub}
        note={o.note}
        source={source}
        chart={<ChartFrame source={source}>{o.chart}</ChartFrame>}
        table={<DataTable caption={o.title} head={o.head} rows={o.rows} />}
        labels={o.showMap ? { ...tableLabels, showChart: t('ui.showMap') } : tableLabels}
      />
    );
  };
  const unavailable = <p className="m-0 rounded-lg border border-border bg-card p-4 text-[15px] text-muted xl:p-6">{t('ui.unavailable')}</p>;

  // ---- Kerncijfers ----
  const bronGemeente = t('kpi.sourceGemeente');
  const ga = regels.ok ? regels.data.GA?.[0] : undefined;
  const gaAlt = regels.ok ? regels.data.GA?.[1] : undefined;
  const vergelijking = bij.ok ? jaarVergelijking(bij.data) : null;
  const meld = meldingen.ok ? meldingenRecent(meldingen.data, new Date(), MELDING_DAGEN) : null;
  const fracties = containers.ok ? perFractie(containers.data) : [];

  const kpis: { key: string; value: number | string | null; label: string; source: string }[] = [
    { key: 'containers', value: containers.ok ? containers.data.length : null, label: t('kpi.containers'), source: bronGemeente },
    { key: 'ophaaldag', value: ga?.dagen ? dagNaam(ga.dagen) : null, label: t('kpi.ophaaldag'), source: t('kpi.sourceAfvalwijzer') },
    { key: 'bijplaatsingen', value: vergelijking?.recent ?? null, label: t('kpi.bijplaatsingen'), source: bronGemeente },
    { key: 'meldingen', value: meld?.recent.length ?? null, label: t('kpi.meldingen'), source: t('kpi.sourceMeldingen') },
  ];

  // ---- Hoofdstukken ----
  const chapterIds = ['grof', 'containers', 'bijplaatsingen', 'meldingen'];
  const chapters = chapterIds.map((id) => ({ id, name: t(`chapters.${id}.name`) }));
  const navLabels = { nav: t('nav.nav'), contents: t('nav.contents'), chapterOf: t('nav.chapterOf', { n: '{n}', total: '{total}' }) };
  const sourcesNav = { id: 'bronnen', name: t('nav.sources') };
  const chapter = (n: number, id: string, factBig: string, factText: string, children: ReactNode) => (
    <Chapter
      n={n}
      id={id}
      label={t('ui.chapterLabel')}
      title={t(`chapters.${id}.name`)}
      message={t(`chapters.${id}.message`)}
      factBig={factBig}
      factText={factText}
    >
      {children}
    </Chapter>
  );

  // Hoofdstuk 1: grof afval
  const regelLabels = { dagen: t('regelLabels.dagen'), buitenzetten: t('regelLabels.buitenzetten'), waar: t('regelLabels.waar') };
  const lang = locale === 'nl' ? undefined : 'nl';
  const pickup = ga ? (
    <div className={boxCls}>
      <BoxTitle title={t('grof.pickupTitle')} sub={t('grof.pickupSub')} />
      <div className="flex flex-col gap-2">
        <span className="font-heading text-[40px] leading-none font-semibold text-primary xl:text-[56px]">{ga.dagen ? cap(dagNaam(ga.dagen)) : '–'}</span>
        {ga.buitenzetten && (
          <span className="text-[17px] leading-[1.4] text-text" lang={lang}>
            {ga.buitenzetten}
          </span>
        )}
      </div>
      {ga.dagen && <NextPickup dagen={ga.dagen} locale={locale} label={t('grof.next')} />}
      {ga.waar && (
        <p className="m-0 text-sm text-muted">
          {t('grof.where')}: <span className="text-text" lang={lang}>{ga.waar}</span>
        </p>
      )}
      {gaAlt?.instructie && (
        <p className="m-0 border-t border-border pt-3 text-sm leading-[1.45] text-muted">
          {t('grof.otherRule', { n: f.num(gaAlt.adressen), rule: gaAlt.instructie.toLowerCase() })}
        </p>
      )}
    </div>
  ) : (
    unavailable
  );

  const tips = (
    <div className={boxCls}>
      <BoxTitle title={t('grof.tipsTitle')} />
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {(t.raw('grof.tips') as string[]).map((tip) => (
          <li key={tip} className="flex gap-3 text-[15px] leading-[1.45] text-text">
            <span aria-hidden className="mt-2 size-1.5 flex-none rounded-full bg-cta" />
            {tip}
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <h4 className="m-0 text-[15px] font-semibold text-text">{t('grof.afspraakTitle')}</h4>
        <p className="m-0 text-[15px] leading-[1.5] text-text">{t('grof.afspraakText')}</p>
        <External href={LINKS.grofAfspraak} note={note}>
          {t('grof.afspraakCta')}
        </External>
      </div>
    </div>
  );

  const recyclepunten = recycle.ok ? (
    <div className={boxCls}>
      <BoxTitle title={t('grof.recycleTitle')} sub={t('grof.recycleSub')} />
      <ol className="m-0 list-none p-0">
        {recycle.data
          .map((p) => ({ ...p, d: distanceM(BUURT_MIDDEN, p.rd) }))
          .sort((a, b) => a.d - b.d)
          .map((p) => (
            <li key={p.naam} className="flex items-baseline gap-4 border-t border-border py-2.5 first:border-t-0">
              <span className="w-16 flex-none font-heading whitespace-nowrap text-[15px] font-semibold text-text tabular-nums">{t('grof.distance', { km: f.num(p.d / 1000, 1) })}</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[15px] font-semibold text-text">{p.naam}</span>
                <span className="text-sm text-muted">
                  {p.adres}, {p.postcode}
                  {p.geenBedrijfsafval && ` · ${t('grof.noBusiness')}`}
                </span>
              </span>
              {p.url && (
                <External href={p.url} note={note} className={`${linkCls} flex-none text-sm`}>
                  {t('grof.site')}
                </External>
              )}
            </li>
          ))}
      </ol>
    </div>
  ) : (
    unavailable
  );

  const regelsList = regels.ok ? (
    <div className={boxCls}>
      <BoxTitle title={t('grof.regelsTitle')} sub={t('grof.regelsSub')} />
      <ul className="m-0 list-none p-0">
        {Object.entries(regels.data)
          .filter(([code, list]) => code !== 'GA' && list.length)
          .map(([code, list]) => {
            const total = list.reduce((a, r) => a + r.adressen, 0);
            const top = list[0];
            return (
              <RegelItem
                key={code}
                regel={top}
                naam={t(`fracties.${code}`)}
                locale={locale}
                labels={regelLabels}
                share={list.length > 1 ? t('grof.share', { n: f.num(top.adressen), total: f.num(total) }) : undefined}
              />
            );
          })}
      </ul>
    </div>
  ) : (
    unavailable
  );

  const adresLabels = {
    ...regelLabels,
    ...Object.fromEntries(['title', 'intro', 'postcode', 'huisnummer', 'toevoeging', 'submit', 'loading', 'invalid', 'notFound', 'unavailable', 'resultFor'].map((k) => [k, t(`adres.${k}`)])),
    fracties: t.raw('fracties') as Record<string, string>,
  } as Parameters<typeof AdresCheck>[0]['labels'];

  // Hoofdstuk 2: containers
  const containerCard = containers.ok
    ? card({
        title: t('cards.containerMap.title'),
        sub: t('cards.containerMap.sub'),
        bron: bronGemeente,
        showMap: true,
        chart: (
          <div className="flex flex-col gap-3">
            <BaseMap label={t('cards.containerMap.label', { n: containers.data.length })}>
              <ContainerLayer containers={containers.data} tip={(c) => fractieNaam(c.fractie)} />
            </BaseMap>
            <Legend items={fracties.map((x) => ({ label: `${fractieNaam(x.fractie)} (${x.n})`, tone: fractieTone(x.fractie) }))} />
          </div>
        ),
        head: [t('table.fractie'), t('table.aantal')],
        rows: fracties.map((x) => [fractieNaam(x.fractie), x.n]),
      })
    : unavailable;

  // Hoofdstuk 3: bijplaatsingen
  let bijCards: ReactNode = unavailable;
  let bijFact = '–';
  let bijFactText = '';
  if (bij.ok && bij.data.length) {
    const b = bij.data;
    const eind = laatsteDatum(b);
    const start = b.reduce((m, x) => (x.datum < m ? x.datum : m), eind);
    const startText = date(start, { month: 'long', year: 'numeric' });
    const spots = hotspots(b);
    const straten = perStraat(b);
    const jaren = perJaar(b);
    const huidigJaar = Number(eind.slice(0, 4));
    const s = soorten(b);
    const soortRows = (['grof', 'karton', 'huisvuil', 'zwerfafval'] as const).map((k) => ({ k, v: (100 * s[k]) / b.length }));
    const crow = crowVerdeling(b);
    const crowTone: Record<(typeof CROW)[number], Tone> = { 'A+': 'p', A: 'p6', B: 'm3', C: 'c4', D: 'c' };
    const hotspotTip = (h: (typeof spots)[number]) => t('tip.hotspot', { plek: h.straat ?? '–', n: f.num(h.n), recent: f.num(h.recent) });

    bijFact = f.num(vergelijking!.recent);
    bijFactText = t('chapters.bijplaatsingen.factText', { vorig: f.num(vergelijking!.vorig) });
    bijCards = (
      <>
        <Pair>
          {card({
            title: t('cards.hotspotMap.title'),
            sub: t('cards.hotspotMap.sub', { start: startText }),
            bron: bronGemeente,
            showMap: true,
            chart: (
              <BaseMap label={t('cards.hotspotMap.label')}>
                <HotspotLayer hotspots={spots} tip={hotspotTip} />
              </BaseMap>
            ),
            head: [t('table.plek'), t('table.sinds'), t('table.recent')],
            rows: spots.slice(0, 12).map((h) => [h.straat ?? '–', f.num(h.n), f.num(h.recent)]),
          })}
          {card({
            title: t('cards.straten.title'),
            sub: t('cards.straten.sub', { start: startText }),
            bron: bronGemeente,
            chart: dual(false, (w, mobile) => (
              <BarHorizontal
                width={w}
                mobile={mobile}
                labelWidth={180}
                rows={straten.map((x) => ({ label: x.naam, v: x.n, tone: 'c' as Tone, tip: `${x.naam}\n${f.num(x.n)}` }))}
                fmt={(v) => f.num(v)}
                label={t('cards.straten.label', { top: straten[0]?.naam ?? '' })}
              />
            )),
            head: [t('table.straat'), t('table.aantal')],
            rows: straten.map((x) => [x.naam, f.num(x.n)]),
          })}
        </Pair>
        {card({
          title: t('cards.jaren.title'),
          sub: t('cards.jaren.sub'),
          note: t('cards.jaren.note', { start: date(start, { day: 'numeric', month: 'long' }), jaar: huidigJaar, end: date(eind, { day: 'numeric', month: 'long' }) }),
          bron: bronGemeente,
          chart: dual(true, (w) => (
            <BarVertical
              width={w}
              height={220}
              items={jaren.map((x) => ({
                label: x.jaar === huidigJaar ? `${x.jaar}*` : String(x.jaar),
                v: x.n,
                tone: (x.jaar === huidigJaar || x.jaar === 2020 ? 'p3' : 'p') as Tone,
                tip: `${x.jaar}\n${f.num(x.n)}`,
              }))}
              fmt={(v) => f.num(v)}
              label={t('cards.jaren.label')}
            />
          )),
          head: [t('table.jaar'), t('table.aantal')],
          rows: jaren.map((x) => [String(x.jaar), f.num(x.n)]),
        })}
        <Pair>
          {card({
            title: t('cards.soorten.title'),
            sub: t('cards.soorten.sub'),
            bron: bronGemeente,
            chart: dual(false, (w, mobile) => (
              <BarHorizontal
                width={w}
                mobile={mobile}
                labelWidth={150}
                max={100}
                rows={soortRows.map((x) => ({ label: t(`soorten.${x.k}`), v: x.v, tip: `${t(`soorten.${x.k}`)}\n${f.pct(x.v)}` }))}
                fmt={(v) => f.pct(v)}
                label={t('cards.soorten.label')}
              />
            )),
            head: [t('table.soort'), t('table.aandeel')],
            rows: soortRows.map((x) => [t(`soorten.${x.k}`), f.pct(x.v)]),
          })}
          {card({
            title: t('cards.crow.title'),
            sub: t('cards.crow.sub'),
            note: t('cards.crow.note'),
            bron: bronGemeente,
            chart: dual(false, (w, mobile) => (
              <BarHorizontal
                width={w}
                mobile={mobile}
                labelWidth={130}
                rows={crow.map((x) => ({ label: t(`crow.${x.score}`), v: x.n, tone: crowTone[x.score], tip: `${t(`crow.${x.score}`)}\n${f.num(x.n)}` }))}
                fmt={(v) => f.num(v)}
                label={t('cards.crow.label')}
              />
            )),
            head: [t('table.score'), t('table.aantal')],
            rows: crow.map((x) => [t(`crow.${x.score}`), f.num(x.n)]),
          })}
        </Pair>
      </>
    );
  }

  // Hoofdstuk 4: meldingen
  const cta = (
    <div className="flex flex-col gap-3 rounded-lg bg-primary p-5 text-background xl:p-6">
      <h3 className="m-0 text-xl font-semibold">{t('meldingen.ctaTitle')}</h3>
      <p className="m-0 text-[15px] leading-[1.5]">{t('meldingen.ctaText')}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <External
          href={LINKS.melding}
          note={note}
          className="inline-flex min-h-11 items-center rounded-md bg-cta px-5 text-[15px] font-semibold text-on-cta no-underline hover:bg-cta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
        >
          {t('meldingen.cta')}
        </External>
        <External href={LINKS.meldingenkaart} note={note} className="text-[15px] font-medium text-background underline underline-offset-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background">
          {t('meldingen.mapLink')}
        </External>
      </div>
    </div>
  );
  const meldTone = (cat: string): Tone => (cat === 'Grof afval' ? 'c' : 's');
  const meldCards = meld ? (
    <Pair>
      {card({
        title: t('cards.meldingMap.title'),
        sub: t('cards.meldingMap.sub'),
        bron: t('kpi.sourceMeldingen'),
        showMap: true,
        chart: (
          <div className="flex flex-col gap-3">
            <BaseMap label={t('cards.meldingMap.label', { n: meld.recent.length })}>
              <MeldingLayer
                meldingen={meld.recent}
                tone={(m) => meldTone(m.categorie)}
                tip={(m) => t('tip.melding', { datum: date(m.datum, { day: 'numeric', month: 'short' }), categorie: m.categorie })}
              />
            </BaseMap>
            <Legend
              items={[
                { label: t('legend.grof'), tone: 'c' },
                { label: t('legend.overig'), tone: 's' },
              ]}
            />
          </div>
        ),
        head: [t('table.datum'), t('table.categorie')],
        rows: meld.recent.map((m) => [date(m.datum, { day: 'numeric', month: 'short' }), m.categorie]),
      })}
      <Stack>
        {card({
          title: t('cards.meldingCat.title'),
          sub: t('cards.meldingCat.sub'),
          bron: t('kpi.sourceMeldingen'),
          chart: dual(false, (w, mobile) => (
            <BarHorizontal
              width={w}
              mobile={mobile}
              labelWidth={210}
              rows={meld.perCat.slice(0, 8).map((x) => ({ label: x.categorie, v: x.n, tone: meldTone(x.categorie), tip: `${x.categorie}\n${f.num(x.n)}` }))}
              fmt={(v) => f.num(v)}
              label={t('cards.meldingCat.label')}
            />
          )),
          head: [t('table.categorie'), t('table.aantal')],
          rows: meld.perCat.map((x) => [x.categorie, f.num(x.n)]),
        })}
        {cta}
      </Stack>
    </Pair>
  ) : (
    <Pair>
      {unavailable}
      {cta}
    </Pair>
  );

  const fetched = [containers, bij, regels, recycle, meldingen].find((r) => r.ok);

  return (
    <>
      <ChapterNav variant="bar" chapters={chapters} sources={sourcesNav} labels={navLabels} />
      <main className="mx-auto w-full max-w-[1336px] px-6 pb-16 xl:pb-24">
        <section className="flex flex-col gap-8 pt-8 pb-10 xl:gap-14 xl:pt-20 xl:pb-16">
          <div className="flex flex-col gap-4 xl:gap-5">
            <div className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">{t('hero.eyebrow')}</div>
            <h1 className="m-0 text-[46px] leading-[1.02] font-bold tracking-[-0.02em] text-primary xl:text-[84px]">{t('heading')}</h1>
            <p className="m-0 max-w-[680px] text-[19px] leading-[1.45] text-text xl:text-[22px]">{t('hero.intro')}</p>
            <a
              href="#grof"
              className="inline-flex min-h-11 items-center gap-2.5 text-[15px] font-medium text-text no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {t('hero.start')} <span aria-hidden>↓</span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-x-6 border-t-2 border-b border-text xl:grid-cols-4 xl:gap-x-0">
            {kpis.map((k) => (
              <div key={k.key} className="flex min-w-0 flex-col gap-1 py-4 xl:py-5 xl:pr-5">
                <span className="font-heading text-[32px] leading-[1.05] font-semibold text-text xl:text-[40px]">
                  {typeof k.value === 'number' ? (
                    <CountUp value={k.value} locale={locale}>
                      {f.num(k.value)}
                    </CountUp>
                  ) : (
                    (k.value && cap(k.value)) ?? '–'
                  )}
                </span>
                <span className="text-[15px] leading-[1.3] text-text">{k.label}</span>
                <span className="text-[13px] text-muted">{k.source}</span>
              </div>
            ))}
          </div>
        </section>
        <div className="xl:grid xl:grid-cols-[216px_minmax(0,1fr)] xl:items-start xl:gap-x-12">
          <ChapterNav variant="rail" chapters={chapters} sources={sourcesNav} labels={navLabels} />
          <div className="flex min-w-0 flex-col gap-16 xl:gap-28">
            {chapter(
              1,
              'grof',
              ga?.dagen ? cap(dagNaam(ga.dagen)) : '–',
              ga?.buitenzetten ?? '',
              <>
                <Pair>
                  {pickup}
                  {tips}
                </Pair>
                <Pair>
                  <AdresCheck locale={locale} labels={adresLabels} />
                  {recyclepunten}
                </Pair>
              </>,
            )}
            {chapter(
              2,
              'containers',
              containers.ok ? f.num(containers.data.length) : '–',
              containers.ok ? t('chapters.containers.factText', { list: fracties.map((x) => `${x.n} ${fractieNaam(x.fractie).toLowerCase()}`).join(', ') }) : '',
              <Pair>
                {containerCard}
                {regelsList}
              </Pair>,
            )}
            {chapter(3, 'bijplaatsingen', bijFact, bijFactText, bijCards)}
            {chapter(4, 'meldingen', meld ? f.num(meld.recent.length) : '–', t('chapters.meldingen.factText'), meldCards)}

            <section id="bronnen" aria-labelledby="bronnen-t" className="flex scroll-mt-26 flex-col gap-8">
              <div aria-hidden>
                <div className="border-t-2 border-text" />
                <div className="mt-[3px] border-t border-text" />
              </div>
              <h2 id="bronnen-t" className="m-0 text-[30px] leading-[1.1] font-semibold text-text xl:text-[44px]">
                {t('sources.title')}
              </h2>
              <p className="m-0 max-w-[720px] text-[15px] leading-[1.55] text-text">
                {t('sources.intro')} {fetched?.ok && t('sources.updated', { date: date(fetched.fetchedAt, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) })}
              </p>
              <dl className="m-0 grid gap-x-8 xl:grid-cols-[220px_minmax(0,1fr)]">
                {(t.raw('sources.rows') as { name: string; what: string; api: string }[]).map((r) => (
                  <div key={r.name} className="contents">
                    <dt className="border-t border-border pt-2.5 text-sm font-semibold text-text xl:pb-2.5">{r.name}</dt>
                    <dd className="m-0 flex flex-col gap-0.5 pb-2.5 text-sm leading-[1.4] text-text xl:border-t xl:border-border xl:pt-2.5">
                      {r.what}
                      <span className="font-mono text-xs text-muted">{r.api}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
