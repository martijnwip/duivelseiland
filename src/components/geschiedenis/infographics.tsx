import type { ReactNode } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { localizedHref } from '@/i18n/localizedHref';
import { Intekenen } from './Intekenen';

type Tekst = { jaar: string; tekst: string };
type Gebouw = { titel: string; items: Tekst[] };

/** Kop en lijn boven elke infographic; breekt uit de tijdlijn over de volle breedte. */
function Kader({ id, titel, lead, children }: { id: string; titel: string; lead?: string; children: ReactNode }) {
  return (
    <figure aria-labelledby={id} className="my-12 border-t-2 border-text pt-4">
      <header className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 id={id} className="m-0 text-2xl leading-tight font-semibold text-text lg:text-[32px]">
          {titel}
        </h2>
        {lead ? <p className="m-0 max-w-[62ch] text-[17px] text-muted">{lead}</p> : null}
      </header>
      {children}
    </figure>
  );
}

/** Horizontaal scrollbare container voor brede SVG's op kleine schermen. */
function Scroll({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={label}
      className="overflow-x-auto pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      {children}
    </div>
  );
}

// Schematische uitsnede van de buurt (Roelof Hartplein linksonder, Boerenwetering rechts).
const BUURT = '25,188 58,88 200,66 200,152';
const HUISJES_1896 = [
  [80, 122],
  [98, 100],
  [150, 92],
  [170, 112],
  [122, 140],
];
const HUISJES_1906 = [...HUISJES_1896, [72, 146], [112, 116], [138, 118], [178, 84], [92, 160]];

function Huisjes({ lijst }: { lijst: number[][] }) {
  return (
    <g className="gs-oud">
      {lijst.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={8} height={6} />
      ))}
    </g>
  );
}

function Basis({ bruggen }: { bruggen: number }) {
  return (
    <>
      <rect className="gs-water" x={206} y={0} width={18} height={200} />
      <rect x={200} y={63} width={30} height={5} fill="var(--color-text)" />
      {bruggen > 1 ? <rect x={200} y={149} width={30} height={5} fill="var(--color-text)" /> : null}
    </>
  );
}

export async function DeBuurtGroeit({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'pages.geschiedenis' });
  const jaren = t.raw('ig.groeit.jaren') as Tekst[];
  const kaartjes = [
    <>
      <Basis bruggen={1} />
      <polygon className="gs-buurt-o" points={BUURT} />
      <rect className="gs-fabriek" x={146} y={14} width={54} height={40} />
      <text className="gs-tlab" x={173} y={38} textAnchor="middle">
        {t('ig.groeit.fabriek')}
      </text>
      <rect className="gs-nieuw" x={34} y={160} width={16} height={12} />
      <text className="gs-t" x={36} y={186} style={{ fontSize: 10 }}>
        {t('ig.groeit.hbs')}
      </text>
      <Huisjes lijst={HUISJES_1896} />
    </>,
    <>
      <Basis bruggen={1} />
      <polygon className="gs-buurt-o" points={BUURT} />
      <rect className="gs-fabriek" x={146} y={14} width={54} height={40} style={{ fillOpacity: 0.35, strokeDasharray: '4 3' }} />
      <path className="gs-rood" d="M150 18l46 32M196 18l-46 32" />
      <rect className="gs-nieuw" x={34} y={160} width={16} height={12} />
      <Huisjes lijst={HUISJES_1906} />
      <path className="gs-groen stats-draw" pathLength={1} d="M202 4V60" />
      <path className="gs-groen" d="M197 52l5 8 5-8" />
      <text className="gs-tlab" x={194} y={10} textAnchor="end">
        {t('ig.groeit.hobbemakade')}
      </text>
    </>,
    <>
      <Basis bruggen={2} />
      <polygon className="gs-buurt-f" points={BUURT} />
      <path className="gs-straat" d="M44 140 200 112M66 112 200 90M128 78 112 170" />
      <rect className="gs-nieuw" x={150} y={16} width={46} height={44} />
    </>,
    <>
      <Basis bruggen={2} />
      <polygon className="gs-buurt-f" points={BUURT} />
      <path className="gs-straat" d="M44 140 200 112M66 112 200 90M128 78 112 170" />
      <polygon points={BUURT} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeDasharray="6 4" />
      <text className="gs-tb" x={115} y={135} textAnchor="middle">
        KD09
      </text>
    </>,
  ];

  return (
    <Kader id="ig-groeit" titel={t('ig.groeit.title')} lead={t('ig.groeit.lead')}>
      <Intekenen>
        <Scroll label={t('ui.scrollbaar', { naam: t('ig.groeit.title') })}>
          <div className="grid snap-x snap-mandatory auto-cols-[78%] grid-flow-col gap-4 md:auto-cols-[calc(50%-8px)] lg:grid-flow-row lg:grid-cols-4">
            {jaren.map((jaar, i) => (
              <figure key={jaar.jaar} className="m-0 snap-start rounded-lg border border-border bg-card p-3">
                <b className="block font-heading text-2xl font-semibold text-text tabular-nums">{jaar.jaar}</b>
                <p className="mt-1 mb-0 text-[15px] leading-snug text-muted">{jaar.tekst}</p>
                <svg viewBox="0 0 240 200" className="mt-2 h-auto w-full" aria-hidden>
                  {kaartjes[i]}
                </svg>
              </figure>
            ))}
          </div>
        </Scroll>
      </Intekenen>
      <figcaption className="mt-3 text-sm text-muted">{t('ig.groeit.caption')}</figcaption>
    </Kader>
  );
}

// Jaarschaal 1894–1906: 60px per jaar vanaf x=200.
const x = (jaar: number) => 200 + (jaar - 1894) * 60;

export async function TweeEilanden({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'pages.geschiedenis.ig.eilanden' });
  const tu = await getTranslations({ locale, namespace: 'pages.geschiedenis.ui' });
  const jaren = Array.from({ length: 12 }, (_, i) => 1894 + i);

  return (
    <Kader id="ig-eilanden" titel={t('title')} lead={t('lead')}>
      <Intekenen>
        <Scroll label={tu('scrollbaar', { naam: t('title') })}>
          <svg viewBox="0 0 1000 330" className="h-auto w-full min-w-[760px]" role="img" aria-label={t('desc')}>
            <rect x={x(1906) - 24} y={30} width={48} height={250} rx={4} fill="var(--color-muted-soft)" />
            <text className="gs-tbig" x={x(1906)} y={24} textAnchor="middle" fill="var(--color-accent)">
              1906
            </text>
            <line x1={x(1894)} y1={280} x2={x(1906)} y2={280} stroke="var(--color-border)" />
            {jaren.map((j) => (
              <g key={j}>
                <line x1={x(j)} y1={276} x2={x(j)} y2={284} stroke="var(--color-border)" />
                <text className="gs-t" x={x(j)} y={302} textAnchor="middle">
                  {j === 1894 || j === 1900 ? j : `'${String(j).slice(2)}`}
                </text>
              </g>
            ))}

            {/* Dreyfus */}
            <text className="gs-tb" x={16} y={96}>
              {t('dreyfus')}
            </text>
            <text className="gs-t" x={16} y={114}>
              {t('dreyfusSub')}
            </text>
            <rect className="stats-fade" x={x(1895)} y={92} width={x(1899) - x(1895)} height={16} rx={8} fill="var(--color-accent-soft)" />
            <text className="gs-tlab" x={(x(1895) + x(1899)) / 2} y={84} textAnchor="middle" fill="var(--color-accent)">
              {t('opEiland')}
            </text>
            <line className="gs-rood stats-draw" pathLength={1} x1={x(1894)} y1={100} x2={x(1906)} y2={100} />
            {[1894, 1895, 1899].map((j) => (
              <circle key={j} cx={x(j)} cy={100} r={7} fill="var(--color-card)" stroke="var(--color-accent)" strokeWidth={2.5} />
            ))}
            <circle cx={x(1906)} cy={100} r={9} fill="var(--color-accent)" />
            <text className="gs-tt" x={x(1894)} y={76} textAnchor="middle">
              {t('veroordeeld')}
            </text>
            <text className="gs-tt" x={x(1895) + 6} y={136}>
              {t('verbannen')}
            </text>
            <text className="gs-tt" x={x(1899)} y={76} textAnchor="middle">
              {t('gratie')}
            </text>
            <text className="gs-tb" x={x(1906)} y={76} textAnchor="middle">
              {t('eerherstel')}
            </text>

            {/* Amsterdam */}
            <text className="gs-tb" x={16} y={206}>
              {t('amsterdam')}
            </text>
            <text className="gs-t" x={16} y={224}>
              {t('amsterdamSub')}
            </text>
            <rect className="stats-fade" x={x(1896)} y={202} width={x(1906) - x(1896)} height={16} rx={8} fill="var(--color-primary-soft)" />
            <text className="gs-tlab" x={(x(1897) + x(1905)) / 2} y={244} textAnchor="middle" fill="var(--color-primary)">
              {t('bijnaam')}
            </text>
            <line className="gs-groen stats-draw" pathLength={1} x1={x(1894)} y1={210} x2={x(1906)} y2={210} />
            {[1894, 1896].map((j) => (
              <circle key={j} cx={x(j)} cy={210} r={7} fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth={2.5} />
            ))}
            <circle cx={x(1906)} cy={210} r={9} fill="var(--color-primary)" />
            <text className="gs-tt" x={x(1894)} y={186} textAnchor="middle">
              {t('hbs')}
            </text>
            <text className="gs-tt" x={x(1896)} y={270} textAnchor="middle">
              {t('annexatie')}
            </text>
            <text className="gs-tb" x={x(1906)} y={270} textAnchor="middle">
              {t('fabriekWeg')}
            </text>

            {/* Afstand */}
            <g transform="translate(560 30)">
              <circle cx={0} cy={18} r={4} fill="var(--color-primary)" />
              <circle cx={220} cy={18} r={4} fill="var(--color-accent)" />
              <path d="M0 18Q110 -8 220 18" fill="none" stroke="var(--color-muted)" strokeWidth={1.2} strokeDasharray="3 3" />
              <text className="gs-t" x={110} y={4} textAnchor="middle">
                {t('afstand')}
              </text>
              <text className="gs-tsm" x={0} y={38} textAnchor="middle">
                {t('van')}
              </text>
              <text className="gs-tsm" x={220} y={38} textAnchor="middle">
                {t('naar')}
              </text>
            </g>
          </svg>
        </Scroll>
      </Intekenen>
    </Kader>
  );
}

export async function FabriekInCijfers({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'pages.geschiedenis.ig.fabriek' });
  const feiten = t.raw('feiten') as Tekst[];

  return (
    <Kader id="ig-fabriek" titel={t('title')}>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <b className="block font-heading text-[clamp(48px,9vw,96px)] leading-none font-bold tracking-tight text-accent tabular-nums">
            {t('bedrag')}
          </b>
          <span className="text-[17px] text-muted">{t('bedragTekst')}</span>
          <ul className="mt-4 border-t border-border p-0">
            {feiten.map((f) => (
              <li key={f.jaar} className="flex gap-3 border-b border-border py-2 text-base">
                <b className="min-w-[6.2em] font-heading font-semibold whitespace-nowrap tabular-nums">{f.jaar}</b>
                <span>{f.tekst}</span>
              </li>
            ))}
          </ul>
        </div>
        <Intekenen>
          <svg viewBox="0 0 640 260" className="h-auto w-full" role="img" aria-label={t('desc')}>
            <text className="gs-tsm" x={10} y={20}>
              {t('noord')}
            </text>
            <text className="gs-tsm" x={630} y={20} textAnchor="end">
              {t('zuid')}
            </text>
            <path className="gs-rood" d="M190 46C250 0 330 10 390 44S520 80 600 64" style={{ strokeDasharray: '8 6' }} />
            <path className="gs-rood" d="M592 58l10 6-10 6" />
            <g className="stats-fade" fill="var(--color-accent-soft)" stroke="var(--color-accent)">
              <circle cx={232} cy={26} r={10} />
              <circle cx={300} cy={18} r={13} />
              <circle cx={370} cy={34} r={11} />
              <circle cx={450} cy={56} r={12} />
              <circle cx={530} cy={64} r={10} />
            </g>
            <text className="gs-tlab" x={300} y={56} textAnchor="middle" fill="var(--color-accent)">
              {t('stank')}
            </text>
            <rect className="gs-fabriek" x={176} y={50} width={18} height={88} />
            <path className="gs-fabriek" d="M40 200V120l40 22v-22l40 22v-22l40 22v-22l40 22v58z" />
            <text className="gs-tb" x={150} y={228} textAnchor="middle">
              {t('fabriek')}
            </text>
            <rect x={262} y={194} width={36} height={6} fill="var(--color-muted)" />
            <text className="gs-t" x={280} y={228} textAnchor="middle">
              {t('straat')}
            </text>
            <g className="gs-oud">
              <path d="M330 200v-28l16-14 16 14v28z" />
              <path d="M380 200v-24l14-12 14 12v24z" />
              <path d="M430 200v-30l18-15 18 15v30z" />
              <path d="M490 200v-24l14-12 14 12v24z" />
              <path d="M540 200v-28l16-14 16 14v28z" />
            </g>
            <text className="gs-tb" x={455} y={228} textAnchor="middle">
              {t('buurt')}
            </text>
            <line x1={10} y1={200} x2={630} y2={200} stroke="var(--color-text)" strokeWidth={1.5} />
            <rect className="gs-water" x={10} y={236} width={620} height={16} rx={2} />
            <text className="gs-tlab" x={620} y={248} textAnchor="end">
              {t('wetering')}
            </text>
            <path className="gs-rood" d="M24 204v28" style={{ strokeWidth: 1.5, strokeDasharray: '3 3' }} />
            <path className="gs-rood" d="M19 226l5 7 5-7" style={{ strokeWidth: 1.5 }} />
            <text className="gs-t" x={30} y={214} style={{ fontSize: 11 }} fill="var(--color-accent)">
              {t('afvalwater')}
            </text>
          </svg>
        </Intekenen>
      </div>
      <figcaption className="mt-3 text-sm text-muted">{t('caption')}</figcaption>
    </Kader>
  );
}

export async function OmDeHoek({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'pages.geschiedenis' });
  const straten = t.raw('ig.omDeHoek.straten') as string[];
  const gebouwen = t.raw('ig.omDeHoek.gebouwen') as Gebouw[];
  const nummers: [number, number][] = [
    [140, 46],
    [327, 36],
    [490, 54],
    [650, 40],
  ];

  return (
    <Kader id="ig-hoek" titel={t('ig.omDeHoek.title')} lead={t('ig.omDeHoek.lead')}>
      <Scroll label={t('ui.scrollbaar', { naam: t('ig.omDeHoek.title') })}>
        <svg viewBox="0 0 1000 200" className="h-auto w-full min-w-[760px]" role="img" aria-label={t('ig.omDeHoek.desc')}>
          <text className="gs-tsm" x={10} y={20}>
            {t('ig.omDeHoek.rijksmuseum')}
          </text>
          <text className="gs-tsm" x={990} y={20} textAnchor="end">
            {t('ig.omDeHoek.duivelseiland')}
          </text>
          <line x1={10} y1={120} x2={990} y2={120} stroke="var(--color-text)" strokeWidth={1.5} />
          <rect className="gs-water" x={10} y={128} width={980} height={24} />
          <text className="gs-tlab" x={500} y={144} textAnchor="middle">
            {t('ig.omDeHoek.wetering')}
          </text>
          <text className="gs-t" x={500} y={174} textAnchor="middle" style={{ fontSize: 11 }}>
            {t('ig.omDeHoek.kade')}
          </text>
          {[228, 566, 906].map((sx, i) => (
            <text key={sx} className="gs-t" x={sx} y={114} textAnchor="middle" transform={`rotate(-90 ${sx} 100)`} style={{ fontSize: 10 }}>
              {straten[i]}
            </text>
          ))}
          <rect className="gs-oud" x={80} y={74} width={120} height={46} />
          <rect className="gs-nieuw" x={252} y={62} width={150} height={58} />
          <rect className="gs-blauw" x={440} y={80} width={100} height={40} />
          <path className="gs-blauw" d="M600 120V84l20-22h60l20 22v36z" />
          <rect className="gs-fabriek" x={720} y={56} width={160} height={64} />
          <text className="gs-tlab" x={800} y={94} textAnchor="middle">
            {t('ig.omDeHoek.fabriek')}
          </text>
          <polygon points="926,120 926,70 990,60 990,120" fill="none" stroke="var(--color-primary)" strokeWidth={1.5} strokeDasharray="4 3" />
          {nummers.map(([cx, cy], i) => (
            <g key={cx}>
              <circle cx={cx} cy={cy} r={14} fill="var(--color-text)" />
              <text x={cx} y={cy + 5} textAnchor="middle" fill="var(--color-background)" style={{ font: '700 14px var(--font-heading)' }}>
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
      </Scroll>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {gebouwen.map((g, i) => (
          <article key={g.titel} className="rounded-lg border border-border bg-card p-3.5">
            <span className="mr-1.5 inline-grid size-7 place-items-center rounded-full bg-text font-heading text-sm font-bold text-background">
              {i + 1}
            </span>
            <h3 className="inline text-[17px] font-semibold text-text">{g.titel}</h3>
            <ul className="mt-3 ml-1 border-l-2 border-primary pl-3.5">
              {g.items.map((item) => (
                <li
                  key={item.jaar}
                  className="relative pb-2 text-[15px] leading-snug before:absolute before:top-1.5 before:-left-[21px] before:size-2.5 before:rounded-full before:border-2 before:border-primary before:bg-card"
                >
                  <b className="mr-1.5 font-heading text-sm font-semibold tabular-nums">{item.jaar}</b>
                  {item.tekst}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Kader>
  );
}

export async function BuurtInMaten({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'pages.geschiedenis.ig.maten' });
  const s = (k: string) => t(`straten.${k}`);

  return (
    <Kader id="ig-maten" titel={t('title')}>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
        <svg viewBox="0 0 400 280" className="h-auto w-full" role="img" aria-label={t('desc')}>
          <rect className="gs-water" x={330} y={10} width={22} height={260} />
          <text className="gs-tlab" x={341} y={140} textAnchor="middle" transform="rotate(-90 341 140)">
            {t('wetering')}
          </text>
          <polygon className="gs-buurt-f" points="50,240 100,95 320,60 320,195" />
          <text className="gs-tb" x={200} y={160} textAnchor="middle" transform="rotate(-10 200 160)" style={{ letterSpacing: '0.15em' }}>
            {t('buurt').toUpperCase()}
          </text>
          <g className="gs-t" style={{ fontSize: 12, fill: 'var(--color-text)' }}>
            <text x={210} y={66} textAnchor="middle" transform="rotate(-9 210 66)">
              {s('noord')}
            </text>
            <text x={312} y={128} textAnchor="middle" transform="rotate(-90 312 128)">
              {s('oost')}
            </text>
            <text x={190} y={236} textAnchor="middle" transform="rotate(-9.5 190 236)">
              {s('zuid')}
            </text>
            <text x={62} y={162} textAnchor="middle" transform="rotate(-71 62 162)">
              {s('west')}
            </text>
          </g>
          <circle cx={50} cy={240} r={9} fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth={2} />
          <text className="gs-tlab" x={64} y={266}>
            {s('plein')}
          </text>
        </svg>
        <div>
          <div role="img" aria-label={t('velden')} className="grid max-w-[360px] grid-cols-3 gap-2">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="gs-veld" style={i === 8 ? ({ '--p': '40%' } as React.CSSProperties) : undefined} />
            ))}
          </div>
          <b className="mt-4 block font-heading text-[clamp(40px,7vw,72px)] leading-none font-bold text-primary tabular-nums">
            {t('oppervlak')}
          </b>
          <p className="mt-1 text-[17px] text-muted">
            {t('tekst')} ·{' '}
            <Link href={localizedHref(locale, '/buurt-statistieken')} className="text-primary hover:text-primary-hover">
              {t('link')}
            </Link>
          </p>
        </div>
      </div>
    </Kader>
  );
}
