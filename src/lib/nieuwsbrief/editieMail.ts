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
export type GerenderdeEditie = { locale: Locale; subject: string; preheader: string; intro: string; items: string };

// Huisstijl uit de styleguide (app/(site)/[locale]/styleguide/page.tsx): vaste lichte waarden, want mailclients
// kennen onze CSS-variabelen niet. Groen is alleen voor wat klikbaar is; koppen en tekst zijn neutraal.
const KLEUR = {
  tekst: '#202020',
  muted: '#767676',
  rand: '#d1d1d1',
  groen: '#00893c',
  wit: '#ffffff',
  buiten: '#f3f3f3',
  footer: '#202020',
  footerTekst: '#d1d1d1',
  footerKlein: '#a8a8a8',
  footerLijn: '#767676',
};
// Webfonts laden alleen in sommige clients (Apple Mail, iOS); de rest valt terug op de systeemletter.
const FONT_SERIF = "Fraunces, Georgia, 'Times New Roman', serif";
const FONT_KOP = 'Lexend, Arial, Helvetica, sans-serif';
const FONT_TEKST = "'Source Sans 3', Arial, Helvetica, sans-serif";

const PAD: Record<'nieuws' | 'agenda' | 'activiteiten', string> = {
  nieuws: '/nieuws',
  agenda: '/agenda',
  activiteiten: '/activiteiten',
};

const T = {
  nl: {
    nieuwsbrief: 'Nieuwsbrief',
    uitgelicht: 'Uitgelicht',
    leesmeer: 'Lees verder',
    aanhef: (naam: string) => `Beste ${naam},`,
    reden: 'Je ontvangt deze nieuwsbrief omdat je je hebt aangemeld via de website van Duivelseiland.',
    afmelden: 'Afmelden',
    website: 'Naar de website',
  },
  en: {
    nieuwsbrief: 'Newsletter',
    uitgelicht: 'Featured',
    leesmeer: 'Read more',
    aanhef: (naam: string) => `Dear ${naam},`,
    reden: "You're receiving this newsletter because you signed up on the Duivelseiland website.",
    afmelden: 'Unsubscribe',
    website: 'Visit the website',
  },
} satisfies Record<Locale, unknown>;

function absoluut(url: string | null | undefined) {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}${url}`;
}

/** Brede versie (16:9) voor de kaart; anders wat er is. */
function afbeeldingUrl(image: unknown) {
  if (!image || typeof image !== 'object') return null;
  const media = image as Media;
  return absoluut(media.sizes?.hero?.url ?? media.url ?? media.sizes?.thumbnail?.url);
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

/** Groene knop zoals in de styleguide (rounded-lg, wit op groen). */
function knop(label: string, url: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:8px;background:${KLEUR.groen}"><a href="${url}" style="display:inline-block;padding:8px 16px;border-radius:8px;font-family:${FONT_TEKST};font-size:16px;font-weight:500;color:${KLEUR.wit};text-decoration:none">${escapeHtml(label)}</a></td></tr></table>`;
}

/** Sectiekop zoals SectionHead op de site: dubbele lijn en een eyebrow in hoofdletters. */
function sectiekop(label: string) {
  return `<div style="border-top:2px solid ${KLEUR.tekst};height:0;line-height:0;font-size:0">&nbsp;</div><div style="border-top:1px solid ${KLEUR.tekst};margin-top:3px;height:0;line-height:0;font-size:0">&nbsp;</div><p style="margin:16px 0 0;font-family:${FONT_KOP};font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${KLEUR.muted}">${escapeHtml(label)}</p>`;
}

/** Een item als kaart: wit met rand en afgeronde hoeken (boxCls), afbeelding bovenaan. */
function itemHtml(item: Item, locale: Locale) {
  const img = item.afbeelding
    ? `<tr><td style="padding:0"><a href="${item.url}"><img src="${item.afbeelding}" alt="" width="538" style="display:block;width:100%;max-width:538px;height:auto;border:0;border-radius:8px 8px 0 0"></a></td></tr>`
    : '';
  const datum = item.datum
    ? `<p style="margin:0 0 4px;font-family:${FONT_TEKST};font-size:14px;color:${KLEUR.muted}">${escapeHtml(item.datum)}</p>`
    : '';
  const tekst = item.tekst
    ? `<p style="margin:8px 0 16px;font-family:${FONT_TEKST};font-size:16px;line-height:1.5;color:${KLEUR.tekst}">${escapeHtml(item.tekst)}</p>`
    : '<div style="height:16px"></div>';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 0;border:1px solid ${KLEUR.rand};border-radius:8px;border-collapse:separate;background:${KLEUR.wit}">${img}<tr><td style="padding:16px 24px 24px">${datum}<h2 style="margin:0;font-family:${FONT_KOP};font-size:20px;line-height:1.3;font-weight:600;color:${KLEUR.tekst}">${escapeHtml(item.titel)}</h2>${tekst}${knop(T[locale].leesmeer, item.url)}</td></tr></table>`;
}

/**
 * Bouwt onderwerp en inhoud van de editie in één taal. Lege Engelse velden vallen terug op het Nederlands
 * (localization.fallback in payload.config.ts).
 */
export async function renderEditie(payload: Payload, id: number, locale: Locale, req?: PayloadRequest): Promise<GerenderdeEditie> {
  const editie = await payload.findByID({ collection: 'nieuwsbrief-edities', id, locale, depth: 0, overrideAccess: true, req });
  const heeftIntro = hasRichTextContent(editie.intro);
  const intro = heeftIntro ? convertLexicalToHTML({ data: editie.intro as SerializedEditorState, disableContainer: true }) : '';
  const items = await haalItems(payload, editie, locale, req);
  return {
    locale,
    subject: editie.onderwerp,
    preheader: heeftIntro ? kort(lexicalNaarTekst(editie.intro), 120) : '',
    intro,
    items: items.length
      ? `<div style="margin:40px 0 0">${sectiekop(T[locale].uitgelicht)}${items.map((i) => itemHtml(i, locale)).join('')}</div>`
      : '',
  };
}

// Opmaak voor de rich text van de intro (die komt als kale HTML uit Lexical). Clients die <style> negeren,
// houden de basis van de inline stijl op de wrapper.
const STYLE = `
  body { margin:0; padding:0; background:${KLEUR.buiten}; }
  .intro p { margin:0 0 16px; }
  .intro h2, .intro h3, .intro h4 { font-family:${FONT_KOP}; color:${KLEUR.tekst}; font-weight:600; line-height:1.3; margin:24px 0 8px; }
  .intro h2 { font-size:22px; } .intro h3 { font-size:19px; } .intro h4 { font-size:17px; }
  .intro ul, .intro ol { margin:0 0 16px; padding-left:24px; }
  .intro li { margin:0 0 4px; }
  .intro blockquote { margin:0 0 16px; padding-left:16px; border-left:2px solid ${KLEUR.rand}; color:${KLEUR.muted}; }
  .intro a { color:${KLEUR.groen}; text-decoration:underline; }
  @media (max-width:620px) { .kader { padding-left:16px !important; padding-right:16px !important; } }
`;

/** De mail voor één ontvanger: aanhef met naam (als bekend), de editie en een persoonlijke afmeldlink. */
export function editieMail(
  editie: GerenderdeEditie,
  ontvanger: Pick<NieuwsbriefAbonnee, 'email' | 'naam' | 'token'>,
  { test = false }: { test?: boolean } = {},
): Mail {
  const t = T[editie.locale];
  // Een testmail heeft geen eigen abonnement; de link gaat naar de aan- en afmeldpagina.
  const afmeldUrl = test ? siteUrl(editie.locale, '/nieuwsbrief') : nieuwsbriefLink(editie.locale, 'afmelden', ontvanger.token);
  const websiteUrl = siteUrl(editie.locale, '/');
  const subject = test ? `[TEST ${editie.locale.toUpperCase()}] ${editie.subject}` : editie.subject;
  const aanhef = ontvanger.naam?.trim() ? `<p style="margin:0 0 16px">${escapeHtml(t.aanhef(ontvanger.naam.trim()))}</p>` : '';
  const badge = absoluut('/logo/mail-badge.png');
  const embleem = absoluut('/logo/mail-embleem.png');

  const html = `<!doctype html>
<html lang="${editie.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Lexend:wght@600&family=Source+Sans+3:wght@400;500&display=swap" rel="stylesheet">
<style>${STYLE}</style>
</head>
<body style="margin:0;padding:0;background:${KLEUR.buiten}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(editie.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${KLEUR.buiten}">
<tr><td align="center" style="padding:24px 8px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${KLEUR.wit};border:1px solid ${KLEUR.rand};border-radius:8px;border-collapse:separate;overflow:hidden">
<tr><td class="kader" style="padding:32px 32px 0">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="padding:0 12px 0 0;vertical-align:middle"><a href="${websiteUrl}"><img src="${badge}" alt="Duivelseiland" width="56" height="56" style="display:block;border:0"></a></td>
    <td style="vertical-align:middle;font-family:${FONT_SERIF};font-size:28px;font-weight:700;letter-spacing:-0.01em;color:${KLEUR.tekst}">Duivelseiland</td>
  </tr></table>
  <div style="margin:24px 0 0">${sectiekop(t.nieuwsbrief)}</div>
  <h1 style="margin:12px 0 24px;font-family:${FONT_SERIF};font-size:32px;line-height:1.15;font-weight:700;color:${KLEUR.tekst}">${escapeHtml(editie.subject)}</h1>
</td></tr>
<tr><td class="kader intro" style="padding:0 32px 32px;font-family:${FONT_TEKST};font-size:17px;line-height:1.55;color:${KLEUR.tekst}">
  ${aanhef}${editie.intro}${editie.items}
</td></tr>
<tr><td class="kader" style="padding:32px;background:${KLEUR.footer}">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="padding:0 16px 0 0;vertical-align:middle"><img src="${embleem}" alt="" width="64" height="62" style="display:block;border:0"></td>
    <td style="vertical-align:middle;font-family:${FONT_SERIF};font-size:20px;font-weight:700;color:${KLEUR.wit}">Duivelseiland</td>
  </tr></table>
  <div style="margin:24px 0 16px;border-top:1px solid ${KLEUR.footerLijn};height:0;line-height:0;font-size:0">&nbsp;</div>
  <p style="margin:0 0 8px;font-family:${FONT_TEKST};font-size:14px;line-height:1.5;color:${KLEUR.footerTekst}">${escapeHtml(t.reden)}</p>
  <p style="margin:0;font-family:${FONT_TEKST};font-size:14px;line-height:1.5;color:${KLEUR.footerKlein}"><a href="${afmeldUrl}" style="color:${KLEUR.footerTekst};text-decoration:underline">${t.afmelden}</a> &nbsp;·&nbsp; <a href="${websiteUrl}" style="color:${KLEUR.footerTekst};text-decoration:underline">${t.website}</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { to: ontvanger.email, subject, html, headers: { 'List-Unsubscribe': `<${afmeldUrl}>` } };
}
