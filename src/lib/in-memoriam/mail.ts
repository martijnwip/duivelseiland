import type { Payload } from 'payload';
import { redactieAdressen } from '../activiteiten/workflow';
import { adminUrl, escapeHtml, mailHtml, siteUrl, tekstAlsHtml, verstuur, type Locale, type Mail } from '../mail';
import { inMemoriamPad } from './constants';

/** Aan de redactie: een nieuwe herinnering wacht op goedkeuring. Zonder e-mailadres van de schrijver. */
function nieuweReactieMail(to: string, herdenking: string, naam: string, tekst: string, id: number): Mail {
  return {
    to,
    subject: `In memoriam ${herdenking}: nieuwe herinnering`,
    html: mailHtml({
      alineas: [
        `Er is een nieuwe herinnering bij <strong>In memoriam ${escapeHtml(herdenking)}</strong>${naam ? `, van ${escapeHtml(naam)}` : ''}. Hij staat pas op de site als je hem goedkeurt.`,
        `<blockquote style="margin:0;padding-left:12px;border-left:3px solid #ddd">${tekstAlsHtml(tekst)}</blockquote>`,
      ],
      knop: { label: 'Bekijk en keur goed', url: adminUrl(`/collections/in-memoriam-reacties/${id}`) },
    }),
  };
}

export async function meldReactieAanRedactie(payload: Payload, herdenking: string, naam: string, tekst: string, id: number) {
  for (const to of await redactieAdressen(payload)) {
    try {
      await verstuur(nieuweReactieMail(to, herdenking, naam, tekst, id));
    } catch (error) {
      payload.logger.error(`[in-memoriam] melding nieuwe herinnering aan ${to} mislukt: ${error}`);
    }
  }
}

const SEINTJE = {
  nl: {
    subject: (naam: string) => `Nieuwe foto’s bij In memoriam ${naam}`,
    tekst: (naam: string, aantal: number) =>
      `Er ${aantal === 1 ? 'is een nieuwe foto' : `zijn ${aantal} nieuwe foto’s`} geplaatst op de pagina ter herinnering aan ${escapeHtml(naam)}.`,
    knop: 'Bekijk de foto’s',
    voet: 'Je krijgt deze mail omdat je op de pagina vroeg om een bericht bij nieuwe foto’s.',
    afmelden: 'Geen berichten meer over deze pagina',
  },
  en: {
    subject: (naam: string) => `New photos: In memoriam ${naam}`,
    tekst: (naam: string, aantal: number) =>
      `${aantal === 1 ? 'A new photo has' : `${aantal} new photos have`} been added to the page in memory of ${escapeHtml(naam)}.`,
    knop: 'See the photos',
    voet: 'You receive this email because you asked for a message when new photos are added.',
    afmelden: 'No more messages about this page',
  },
} satisfies Record<Locale, unknown>;

/** Aan een volger: er zijn foto's bij gekomen. Met een afmeldlink (werkt zonder buurtpas). */
export function fotoSeintjeMail(to: string, locale: Locale, naam: string, slug: string, aantal: number, afmeldToken: string): Mail {
  const t = SEINTJE[locale];
  const afmeldUrl = siteUrl(locale, `/in-memoriam/afmelden/${afmeldToken}`);
  return {
    to,
    subject: t.subject(naam),
    headers: { 'List-Unsubscribe': `<${afmeldUrl}>` },
    html: mailHtml({
      alineas: [t.tekst(naam, aantal)],
      knop: { label: t.knop, url: `${siteUrl(locale, inMemoriamPad(slug))}#fotos` },
      voet: [escapeHtml(t.voet), `<a href="${afmeldUrl}">${escapeHtml(t.afmelden)}</a>`],
    }),
  };
}
