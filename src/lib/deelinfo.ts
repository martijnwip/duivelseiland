import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';
import { getAgendaEffectiveDate, type AgendaRecurrenceFields } from '@/lib/agenda/nextOccurrence';
import type { AgendaRichFields } from '@/lib/agenda/richFields';
import type { Media } from '../../payload-types';
import { metDeelinfo } from '@/lib/deelMetadata';
import { vindActiviteit } from '@/components/activiteiten/ActiviteitDetailPage';
import { vakNamen } from '@/components/vaklui/VakmanKaart';

/**
 * Wat een gedeelde link (WhatsApp, sociale media) van een contentitem laat zien: titel, korte
 * omschrijving, datum en voor de agenda tijd en plek. Gebruikt door generateMetadata en
 * opengraph-image.tsx van de detailpagina's (/nieuws/<slug>, /agenda/<slug>, /interviews/<slug>, ...).
 *
 * Items met "Alleen voor de buurt" geven alleen de titel (die staat ook zonder buurtpas in de lijst);
 * omschrijving, afbeelding en programma blijven achter het slot.
 */
export type DeelCollectie = 'nieuws' | 'agenda' | 'interviews' | 'geschiedenis' | 'duivelse-kunst' | 'praktische-info';
type Locale = 'nl' | 'en';

export type Deelinfo = {
  title: string;
  description: string | null;
  /**
   * De belangrijkste gegevens: groot op de deelafbeelding en vooraan in de omschrijving. Agenda: datum en
   * "20:00–22:00 · Inloop in Buurthuis De Coenen" (eerste programmaregel); activiteit: wanneer; vakman: vakken.
   */
  regels: string[];
  imageUrl: string | null;
};

const MAX_DESCRIPTION = 200;
const TIJDZONE = 'Europe/Amsterdam';

type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] };

function platteTekst(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text;
  return (node.children ?? []).map(platteTekst).join('');
}

/** Eerste alinea met tekst uit rich text. */
export function eersteAlinea(content: unknown): string | null {
  const root = (content as { root?: LexicalNode } | null)?.root;
  for (const node of root?.children ?? []) {
    if (node.type !== 'paragraph') continue;
    const tekst = platteTekst(node).replace(/\s+/g, ' ').trim();
    if (tekst) return tekst;
  }
  return null;
}

/** Inkorten op hele zinnen, anders op een woordgrens met een beletselteken. */
export function inkorten(tekst: string, max = MAX_DESCRIPTION): string {
  if (tekst.length <= max) return tekst;
  // Een zin eindigt op . ! of ? gevolgd door een spatie of het einde (dus niet bij "20.00").
  const zinnen = tekst.match(/.+?[.!?](?=\s|$)\s*/g) ?? [];
  let uit = '';
  for (const zin of zinnen) {
    if ((uit + zin).trim().length > max) break;
    uit += zin;
  }
  if (uit.trim()) return uit.trim();
  return `${tekst.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

const hoofdletter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Datum als "Donderdag 19 november 2026" / "Thursday, 19 November 2026", in Amsterdamse tijd. */
export function datumTekst(datum: Date, locale: Locale): string {
  return hoofdletter(
    datum.toLocaleDateString(locale === 'en' ? 'en-GB' : 'nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: TIJDZONE,
    }),
  );
}

/** Tijd als "20:00" in Amsterdamse tijd. */
export function tijdTekst(datum: Date): string {
  return datum.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: TIJDZONE });
}

export function absoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_SERVER_URL;
  return base && URL.canParse(url, base) ? new URL(url, base).toString() : null;
}

export async function haalDeelinfo(collectie: DeelCollectie, slug: string, locale: Locale): Promise<Deelinfo | null> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: collectie,
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    locale,
    depth: 1,
    limit: 1,
  });
  const doc = docs[0];
  if (!doc) return null;

  if (doc.alleenBuurt) {
    return { title: doc.title, description: null, regels: [], imageUrl: null };
  }

  const image = typeof doc.image === 'object' && doc.image !== null ? (doc.image as Media) : null;
  const imageUrl = absoluteUrl(image?.sizes?.hero?.url ?? image?.url);

  let datum: Date | null = doc.date ? new Date(doc.date) : null;
  let wanneerWaar: string | null = null;
  let omschrijving = eersteAlinea(doc.content);

  if (collectie === 'agenda') {
    const rich = doc as typeof doc & AgendaRichFields & AgendaRecurrenceFields;
    datum = getAgendaEffectiveDate(rich);
    const stap = rich.schedule?.find((s) => s.title);
    const tijd = stap?.time ?? rich.recurrenceTime ?? null;
    wanneerWaar = [tijd, stap?.title].filter(Boolean).join(' · ') || null;
    omschrijving = rich.intro?.trim() || omschrijving;
  }

  return {
    title: doc.title,
    description: omschrijving ? inkorten(omschrijving) : null,
    regels: collectie === 'agenda' ? [datum ? datumTekst(datum, locale) : null, wanneerWaar].filter((r): r is string => Boolean(r)) : [],
    imageUrl,
  };
}

/** Metadata voor de detailpagina; de deelafbeelding komt uit opengraph-image.tsx naast de pagina. */
export async function deelMetadata(collectie: DeelCollectie, slug: string, locale: Locale): Promise<Metadata> {
  const info = await haalDeelinfo(collectie, slug, locale);
  if (!info) return {};

  // De belangrijkste gegevens (bv. datum en tijd) staan vóór de omschrijving: dat is wat je in een chat het eerst wilt zien.
  const kop = info.regels.join(', ') || null;
  const description = [kop, info.description].filter(Boolean).join('. ') || undefined;
  return metDeelinfo(locale, { title: `${info.title} | Duivelseiland`, deelTitel: info.title, description, type: 'article' });
}

/** Activiteit (fase goedgekeurd, gaat door of afgelopen): titel, wanneer, eerste zinnen en de headerafbeelding. */
export async function haalActiviteitDeelinfo(slug: string, locale: Locale): Promise<Deelinfo | null> {
  const doc = await vindActiviteit(slug, locale);
  if (!doc) return null;
  const image = typeof doc.image === 'object' && doc.image !== null ? (doc.image as Media) : null;
  const datum = doc.datum ? new Date(doc.datum) : null;
  const terugkerend = doc.soort === 'terugkerend' ? doc.soortToelichting?.trim() || null : null;
  const omschrijving = eersteAlinea(doc.content);
  return {
    title: doc.title,
    description: omschrijving ? inkorten(omschrijving) : null,
    regels: terugkerend ? [terugkerend] : datum ? [`${datumTekst(datum, locale)}, ${tijdTekst(datum)}`] : [],
    imageUrl: absoluteUrl(image?.sizes?.hero?.url ?? image?.url),
  };
}

/**
 * Vakman: naam, vakken en de aanbeveling. Telefoonnummers staan er bewust niet in: die zijn (meestal)
 * alleen voor wie een buurtpas heeft, en een linkvoorbeeld ziet iedereen.
 */
export async function haalVakmanDeelinfo(slug: string, locale: Locale): Promise<Deelinfo | null> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'vaklui',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    locale,
    depth: 1,
    limit: 1,
  });
  const vakman = docs[0];
  if (!vakman) return null;
  const vakken = vakNamen(vakman).join(', ');
  return {
    title: vakman.naam,
    description: vakman.aanbeveling?.trim() ? inkorten(vakman.aanbeveling.trim()) : null,
    regels: vakken ? [vakken] : [],
    imageUrl: null,
  };
}
