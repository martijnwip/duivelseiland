import type { Payload, PayloadRequest } from 'payload';
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html';
import type { SerializedEditorState } from 'lexical';
import type { Media, NieuwsbriefAbonnee, NieuwsbriefEditie } from '../../../payload-types';
import { formatDatumTijd } from '../activiteiten/datum';
import { lexicalNaarTekst } from '../activiteiten/lexical';
import { escapeHtml, siteUrl, type Locale, type Mail } from '../mail';
import { hasRichTextContent } from '../richtext';
import { nieuwsbriefLink } from './mail';

/** De editie in één taal, één keer opgebouwd en daarna per ontvanger aangevuld met aanhef en afmeldlink. */
export type GerenderdeEditie = { locale: Locale; subject: string; inhoud: string };

const PAD: Record<'nieuws' | 'agenda' | 'activiteiten', string> = {
  nieuws: '/nieuws',
  agenda: '/agenda',
  activiteiten: '/activiteiten',
};

const LEESMEER: Record<Locale, string> = { nl: 'Lees verder', en: 'Read more' };

function absoluut(url: string | null | undefined) {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}${url}`;
}

function afbeeldingUrl(image: unknown) {
  if (!image || typeof image !== 'object') return null;
  const media = image as Media;
  return absoluut(media.sizes?.thumbnail?.url ?? media.url);
}

function kort(tekst: string, max = 220) {
  const schoon = tekst.replace(/\s+/g, ' ').trim();
  return schoon.length > max ? `${schoon.slice(0, max).replace(/\s+\S*$/, '')}…` : schoon;
}

type Item = { titel: string; tekst: string; datum: string | null; url: string; afbeelding: string | null };

async function haalItems(payload: Payload, editie: NieuwsbriefEditie, locale: Locale, req?: PayloadRequest) {
  const items: Item[] = [];
  for (const ref of editie.items ?? []) {
    const id = typeof ref.value === 'object' ? ref.value.id : ref.value;
    const doc = await payload.findByID({
      collection: ref.relationTo,
      id,
      locale,
      depth: 1,
      disableErrors: true,
      overrideAccess: true,
      req,
    });
    if (!doc || !doc.slug) continue;
    const datum = 'datum' in doc ? doc.datum : ref.relationTo === 'agenda' && 'date' in doc ? doc.date : null;
    items.push({
      titel: doc.title,
      tekst: kort(lexicalNaarTekst(doc.content)),
      datum: datum ? formatDatumTijd(datum, locale) : null,
      url: siteUrl(locale, `${PAD[ref.relationTo]}/${doc.slug}`),
      afbeelding: afbeeldingUrl(doc.image),
    });
  }
  return items;
}

function itemHtml(item: Item, locale: Locale) {
  const img = item.afbeelding
    ? `<a href="${item.url}"><img src="${item.afbeelding}" alt="" width="400" style="display:block;width:100%;max-width:400px;height:auto;border-radius:6px;margin:0 0 8px"></a>`
    : '';
  const datum = item.datum ? `<p style="margin:0 0 4px;color:#666;font-size:14px">${escapeHtml(item.datum)}</p>` : '';
  const tekst = item.tekst ? `<p style="margin:0 0 6px">${escapeHtml(item.tekst)}</p>` : '';
  return `<div style="margin:0 0 24px">${img}<h2 style="margin:0 0 4px;font-size:18px"><a href="${item.url}" style="color:#1a1a1a">${escapeHtml(item.titel)}</a></h2>${datum}${tekst}<p style="margin:0"><a href="${item.url}">${LEESMEER[locale]} →</a></p></div>`;
}

/**
 * Bouwt onderwerp en inhoud van de editie in één taal. Lege Engelse velden vallen terug op het Nederlands
 * (localization.fallback in payload.config.ts).
 */
export async function renderEditie(payload: Payload, id: number, locale: Locale, req?: PayloadRequest): Promise<GerenderdeEditie> {
  const editie = await payload.findByID({ collection: 'nieuwsbrief-edities', id, locale, depth: 0, overrideAccess: true, req });
  const intro = hasRichTextContent(editie.intro)
    ? convertLexicalToHTML({ data: editie.intro as SerializedEditorState, disableContainer: true })
    : '';
  const items = await haalItems(payload, editie, locale, req);
  const lijn = '<hr style="border:none;border-top:1px solid #ddd;margin:24px 0">';
  return {
    locale,
    subject: editie.onderwerp,
    inhoud: `${intro}${items.length ? `${lijn}${items.map((i) => itemHtml(i, locale)).join('')}` : ''}`,
  };
}

const VOET: Record<Locale, (url: string) => string> = {
  nl: (url) => `Je ontvangt deze nieuwsbrief omdat je je hebt aangemeld via de website van Duivelseiland. <a href="${url}">Afmelden</a>`,
  en: (url) => `You're receiving this newsletter because you signed up on the Duivelseiland website. <a href="${url}">Unsubscribe</a>`,
};

const AANHEF: Record<Locale, (naam: string) => string> = {
  nl: (naam) => `Beste ${naam},`,
  en: (naam) => `Dear ${naam},`,
};

/** De mail voor één ontvanger: aanhef met naam (als bekend), de editie en een persoonlijke afmeldlink. */
export function editieMail(
  editie: GerenderdeEditie,
  ontvanger: Pick<NieuwsbriefAbonnee, 'email' | 'naam' | 'token'>,
  { test = false }: { test?: boolean } = {},
): Mail {
  // Een testmail heeft geen eigen abonnement; de link gaat naar de aan- en afmeldpagina.
  const afmeldUrl = test ? siteUrl(editie.locale, '/nieuwsbrief') : nieuwsbriefLink(editie.locale, 'afmelden', ontvanger.token);
  const aanhef = ontvanger.naam?.trim() ? `<p>${escapeHtml(AANHEF[editie.locale](ontvanger.naam.trim()))}</p>` : '';
  const voet = `<hr style="border:none;border-top:1px solid #ddd;margin:24px 0"><p style="color:#666;font-size:13px">${VOET[editie.locale](afmeldUrl)}</p>`;
  return {
    to: ontvanger.email,
    subject: test ? `[TEST ${editie.locale.toUpperCase()}] ${editie.subject}` : editie.subject,
    html: `<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#1a1a1a">${aanhef}${editie.inhoud}${voet}</div>`,
    headers: { 'List-Unsubscribe': `<${afmeldUrl}>` },
  };
}
