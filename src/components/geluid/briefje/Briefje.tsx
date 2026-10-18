'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { ADVIES_LAWAAI_VANAF, FEEST_ZACHTER_VANAF } from '@/lib/geluid/constants';

type Soort = 'verbouwing' | 'feestje';
type Taal = 'nl' | 'en' | 'beide';

export type BriefTeksten = {
  verbouwing: Record<'titel' | 'aanhef' | 'periode' | 'periodeKort' | 'tijden' | 'lawaai' | 'aannemer' | 'contact' | 'slot' | 'groet', string>;
  feestje: Record<'titel' | 'aanhef' | 'wanneer' | 'wanneerMet' | 'stil' | 'contact' | 'welkom' | 'slot' | 'groet', string>;
};

export type BriefjeLabels = {
  privacy: string;
  tabs: { label: string; verbouwing: string; feestje: string };
  taal: { label: string; nl: string; en: string; beide: string };
  velden: Record<string, string>;
  lawaaiTip: string;
  voorbeeld: string;
  print: string;
  wissen: string;
  leeg: string;
};

const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;

const LEEG = {
  naam: '',
  adres: '',
  telefoon: '',
  // verbouwing
  start: '',
  eind: '',
  wat: '',
  werkVan: '08:00',
  werkTot: '17:00',
  lawaaiVan: hh(ADVIES_LAWAAI_VANAF),
  lawaaiTot: '16:00',
  aannemer: '',
  // feestje
  datum: '',
  aanleiding: '',
  van: '20:00',
  tot: '01:00',
  stil: hh(FEEST_ZACHTER_VANAF),
  welkom: false,
};
type Velden = typeof LEEG;

const OPSLAG = 'duivelseiland:geluid-briefje';

/** Concept onthouden op dit apparaat; bij een privévenster of geblokkeerde opslag gewoon niet. */
function laad(): { soort?: Soort; taal?: Taal; velden?: Partial<Velden> } {
  try {
    return JSON.parse(localStorage.getItem(OPSLAG) ?? '{}');
  } catch {
    return {};
  }
}
function bewaar(data: { soort: Soort; taal: Taal; velden: Velden }) {
  try {
    localStorage.setItem(OPSLAG, JSON.stringify(data));
  } catch {
    // niet erg
  }
}

const inputCls =
  'min-h-11 w-full rounded-md border border-input-border bg-background px-3 text-[15px] text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** {naam} → waarde, of het leeg-teken als het veld nog niet is ingevuld. */
const vul = (tpl: string, waarden: Record<string, string>, leeg: string) => tpl.replace(/\{(\w+)\}/g, (_, k: string) => waarden[k] || leeg);

/** "08:00" → "8.00" (nl) of "8:00" (en). */
const tijd = (v: string, taal: 'nl' | 'en') => (v ? v.replace(/^0(\d)/, '$1').replace(':', taal === 'nl' ? '.' : ':') : '');

const datum = (v: string, taal: 'nl' | 'en') =>
  v ? new Intl.DateTimeFormat(taal === 'nl' ? 'nl-NL' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${v}T12:00:00Z`)) : '';

function Brief({ soort, taal, v, tekst, leeg }: { soort: Soort; taal: 'nl' | 'en'; v: Velden; tekst: BriefTeksten; leeg: string }) {
  const w: Record<string, string> = {
    naam: v.naam,
    telefoon: v.telefoon,
    start: datum(v.start, taal),
    eind: datum(v.eind, taal),
    wat: v.wat,
    werkVan: tijd(v.werkVan, taal),
    werkTot: tijd(v.werkTot, taal),
    lawaaiVan: tijd(v.lawaaiVan, taal),
    lawaaiTot: tijd(v.lawaaiTot, taal),
    aannemer: v.aannemer,
    datum: datum(v.datum, taal),
    aanleiding: v.aanleiding,
    van: tijd(v.van, taal),
    tot: tijd(v.tot, taal),
    stil: tijd(v.stil, taal),
  };
  const f = (tpl: string) => vul(tpl, w, leeg);
  const b = soort === 'verbouwing' ? tekst.verbouwing : tekst.feestje;
  const alineas =
    soort === 'verbouwing'
      ? [
          f(v.wat ? tekst.verbouwing.periode : tekst.verbouwing.periodeKort),
          f(tekst.verbouwing.tijden),
          f(tekst.verbouwing.lawaai),
          v.aannemer ? f(tekst.verbouwing.aannemer) : null,
          f(tekst.verbouwing.contact),
        ]
      : [
          f(v.aanleiding ? tekst.feestje.wanneerMet : tekst.feestje.wanneer),
          f(tekst.feestje.stil),
          f(tekst.feestje.contact),
          v.welkom ? tekst.feestje.welkom : null,
        ];
  return (
    <div lang={taal} className="flex flex-col gap-4">
      <h2 className="m-0 font-serif text-[30px] leading-[1.1] font-bold text-primary print:text-[28px]">{b.titel}</h2>
      <p className="m-0">{b.aanhef}</p>
      {alineas.filter(Boolean).map((p, i) => (
        <p key={i} className="m-0">
          {p}
        </p>
      ))}
      <p className="m-0">{b.slot}</p>
      <p className="m-0">
        {b.groet}
        <br />
        <strong className="font-semibold">{v.naam || leeg}</strong>
        {v.adres && (
          <>
            <br />
            {v.adres}
          </>
        )}
      </p>
    </div>
  );
}

function Veld({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`flex flex-col gap-1 text-sm font-medium text-text ${wide ? 'col-span-2' : ''}`}>
      {label}
      {children}
    </label>
  );
}

function Keuze<K extends string>({ legend, name, value, options, onChange }: { legend: string; name: string; value: K; options: [K, string][]; onChange: (k: K) => void }) {
  return (
    <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
      <legend className="mb-1.5 p-0 text-sm font-medium text-text">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([k, label]) => (
          <label
            key={k}
            className={`inline-flex min-h-11 cursor-pointer items-center rounded-md border px-4 text-[15px] font-semibold has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${
              value === k ? 'border-primary bg-primary text-on-primary' : 'border-input-border bg-card text-text hover:bg-background'
            }`}
          >
            <input type="radio" name={name} value={k} checked={value === k} onChange={() => onChange(k)} className="sr-only" />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Briefje voor de buren: invullen links, voorbeeld rechts, afdrukken print alleen het briefje.
 * Er gaat niets naar een server en niets in de URL; alleen een concept in localStorage.
 */
export function Briefje({ locale, labels, teksten }: { locale: string; labels: BriefjeLabels; teksten: Record<'nl' | 'en', BriefTeksten> }) {
  const id = useId();
  const [soort, setSoort] = useState<Soort>('verbouwing');
  const [taal, setTaal] = useState<Taal>(locale === 'en' ? 'en' : 'nl');
  const [v, setV] = useState<Velden>(LEEG);
  const [geladen, setGeladen] = useState(false);
  const l = labels.velden;

  useEffect(() => {
    const opgeslagen = laad();
    if (opgeslagen.velden) setV({ ...LEEG, ...opgeslagen.velden });
    if (opgeslagen.taal) setTaal(opgeslagen.taal);
    // ?soort=feestje (link vanaf de pagina) gaat voor het concept.
    const gevraagd = new URLSearchParams(window.location.search).get('soort');
    if (gevraagd === 'feestje' || gevraagd === 'verbouwing') setSoort(gevraagd);
    else if (opgeslagen.soort) setSoort(opgeslagen.soort);
    setGeladen(true);
  }, []);

  useEffect(() => {
    if (geladen) bewaar({ soort, taal, velden: v });
  }, [geladen, soort, taal, v]);

  const zet = (k: keyof Velden) => (e: { target: { value: string; checked?: boolean; type?: string } }) =>
    setV((old) => ({ ...old, [k]: e.target.type === 'checkbox' ? !!e.target.checked : e.target.value }));
  const tekst = (k: keyof Velden, label: string, opts: { wide?: boolean; placeholder?: string; autoComplete?: string } = {}) => (
    <Veld label={label} wide={opts.wide}>
      <input name={k} value={v[k] as string} onChange={zet(k)} className={inputCls} placeholder={opts.placeholder} autoComplete={opts.autoComplete} />
    </Veld>
  );
  const veld = (k: keyof Velden, label: string, type: 'date' | 'time') => (
    <Veld label={label}>
      <input type={type} name={k} value={v[k] as string} onChange={zet(k)} className={inputCls} />
    </Veld>
  );

  const talen: ('nl' | 'en')[] = taal === 'beide' ? ['nl', 'en'] : [taal];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <form className="flex flex-col gap-5 rounded-lg border border-border bg-card p-4 xl:p-6 print:hidden" onSubmit={(e) => e.preventDefault()} aria-describedby={`${id}-privacy`}>
        <Keuze legend={labels.tabs.label} name={`${id}-soort`} value={soort} onChange={setSoort} options={[['verbouwing', labels.tabs.verbouwing], ['feestje', labels.tabs.feestje]]} />
        <Keuze legend={labels.taal.label} name={`${id}-taal`} value={taal} onChange={setTaal} options={[['nl', labels.taal.nl], ['en', labels.taal.en], ['beide', labels.taal.beide]]} />

        <div className="grid grid-cols-2 gap-3 border-t border-border pt-5">
          {tekst('naam', l.naam, { autoComplete: 'name' })}
          {tekst('adres', l.adres)}
          <Veld label={l.telefoon} wide>
            <input type="tel" name="telefoon" value={v.telefoon} onChange={zet('telefoon')} autoComplete="tel" className={inputCls} />
          </Veld>
        </div>

        {soort === 'verbouwing' ? (
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-5">
            {veld('start', l.start, 'date')}
            {veld('eind', l.eind, 'date')}
            {tekst('wat', l.wat, { wide: true, placeholder: l.watPlaceholder })}
            {veld('werkVan', l.werkVan, 'time')}
            {veld('werkTot', l.werkTot, 'time')}
            {veld('lawaaiVan', l.lawaaiVan, 'time')}
            {veld('lawaaiTot', l.lawaaiTot, 'time')}
            <p className="col-span-2 m-0 text-sm leading-[1.45] text-muted">{labels.lawaaiTip}</p>
            {tekst('aannemer', l.aannemer, { wide: true })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-5">
            {veld('datum', l.datum, 'date')}
            {veld('stil', l.stil, 'time')}
            {veld('van', l.van, 'time')}
            {veld('tot', l.tot, 'time')}
            {tekst('aanleiding', l.aanleiding, { wide: true, placeholder: l.aanleidingPlaceholder })}
            <label className="col-span-2 flex min-h-11 items-center gap-3 text-[15px] text-text">
              <input type="checkbox" checked={v.welkom} onChange={zet('welkom')} className="size-5 accent-primary" />
              {l.welkom}
            </label>
          </div>
        )}

        <p id={`${id}-privacy`} className="m-0 border-t border-border pt-4 text-sm leading-[1.45] text-muted">
          {labels.privacy}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border-0 bg-primary px-5 text-[15px] font-semibold text-on-primary hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {labels.print}
          </button>
          <button
            type="button"
            onClick={() => setV(LEEG)}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-input-border bg-card px-4 text-[15px] font-medium text-text hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {labels.wissen}
          </button>
        </div>
      </form>

      <section aria-label={labels.voorbeeld} className="flex flex-col gap-2 lg:sticky lg:top-24">
        <span className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase print:hidden">{labels.voorbeeld}</span>
        <article className="briefje deelkaart-licht flex flex-col gap-6 rounded-lg border-2 border-text bg-background p-6 text-[16px] leading-[1.55] shadow-sm xl:p-8 print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="flex items-center justify-between gap-4 border-b-2 border-primary pb-4">
            <span className="font-heading text-[13px] font-semibold tracking-[0.12em] text-muted uppercase">Duivelseiland</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/duivelseiland-embleem.svg" alt="" className="h-14 w-auto" />
          </div>
          {talen.map((tl, i) => (
            <div key={tl} className={i > 0 ? 'border-t border-dashed border-input-border pt-6' : undefined}>
              <Brief soort={soort} taal={tl} v={v} tekst={teksten[tl]} leeg={labels.leeg} />
            </div>
          ))}
        </article>
      </section>
    </div>
  );
}
