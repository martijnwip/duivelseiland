import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';
import { getAgendaEffectiveDate, type AgendaRecurrenceFields } from '@/lib/agenda/nextOccurrence';
import type { AgendaRichFields } from '@/lib/agenda/richFields';
import type { Media } from '../../payload-types';

/**
 * Wat een gedeelde link (WhatsApp, sociale media) van een nieuws- of agenda-item laat zien: titel,
 * korte omschrijving, datum en voor de agenda tijd en plek. Gebruikt door generateMetadata en
 * opengraph-image.tsx van /nieuws/<slug> en /agenda/<slug>.
 *
 * Items met "Alleen voor de buurt" geven alleen de titel (die staat ook zonder buurtpas in de lijst);
 * omschrijving, afbeelding en programma blijven achter het slot.
 */
export type DeelCollectie = 'nieuws' | 'agenda';
type Locale = 'nl' | 'en';

export type Deelinfo = {
  title: string;
  description: string | null;
  /** Datum als tekst, bv. "donderdag 19 november 2026". */
  datum: string | null;
  /** Agenda: tijd en plek uit de eerste programmaregel, bv. "20:00–22:00 · Inloop in Buurthuis De Coenen". */
  wanneerWaar: string | null;
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
function eersteAlinea(content: unknown): string | null {
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

function absoluteUrl(url: string | null | undefined): string | null {
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
    return { title: doc.title, description: null, datum: null, wanneerWaar: null, imageUrl: null };
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
    datum: datum
      ? hoofdletter(
          datum.toLocaleDateString(locale === 'en' ? 'en-GB' : 'nl-NL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: TIJDZONE,
          }),
        )
      : null,
    wanneerWaar,
    imageUrl,
  };
}

/** Metadata voor de detailpagina; de deelafbeelding komt uit opengraph-image.tsx naast de pagina. */
export async function deelMetadata(collectie: DeelCollectie, slug: string, locale: Locale): Promise<Metadata> {
  const info = await haalDeelinfo(collectie, slug, locale);
  if (!info) return {};

  // Bij de agenda staan datum en tijd vóór de omschrijving: dat is wat je in een chat het eerst wilt zien.
  const kop = collectie === 'agenda' ? [info.datum, info.wanneerWaar].filter(Boolean).join(', ') : null;
  const description = [kop, info.description].filter(Boolean).join('. ') || undefined;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  return {
    title: `${info.title} | Duivelseiland`,
    description,
    // WhatsApp en andere apps hebben een absolute URL voor de deelafbeelding nodig.
    ...(serverUrl && URL.canParse(serverUrl) ? { metadataBase: new URL(serverUrl) } : {}),
    openGraph: {
      type: 'article',
      siteName: 'Duivelseiland',
      locale: locale === 'en' ? 'en_GB' : 'nl_NL',
      title: info.title,
      description,
    },
    twitter: { card: 'summary_large_image', title: info.title, description },
  };
}
