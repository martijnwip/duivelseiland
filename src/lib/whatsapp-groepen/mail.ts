import type { Payload } from 'payload';
import { redactieAdressen } from '../activiteiten/workflow';
import { adminUrl, escapeHtml, mailHtml, verstuur, type Locale, type Mail } from '../mail';
import { WHATSAPP_GROEPEN, type WhatsappGroep } from './constants';

// Zonder telefoonnummer: dat staat alleen in /admin, niet in een mailbox.
function redactieNieuweAanmeldingMail(to: string, naam: string, groepen: WhatsappGroep[], id: number): Mail {
  const namen = WHATSAPP_GROEPEN.filter((g) => groepen.includes(g.value)).map((g) => g.label);
  return {
    to,
    subject: `WhatsApp-groep: ${naam} wil erbij`,
    html: mailHtml({
      alineas: [
        `<strong>${escapeHtml(naam)}</strong> wil in de WhatsApp-groep: ${namen.map(escapeHtml).join(' en ')}.`,
        groepen.includes('buurt')
          ? 'Voor de Buren-app: klik in het beheerpaneel op "Uitnodiging sturen", dan krijgt de aanvrager de uitnodigingslink per mail.'
          : '',
        groepen.includes('schoonmaak')
          ? 'Voor de Duivelse Schoonmaak: het telefoonnummer staat in het beheerpaneel. Voeg het toe en zet de aanmelding op "Toegevoegd"; het nummer wordt dan gewist.'
          : '',
      ].filter(Boolean),
      knop: { label: 'Bekijk de aanmelding', url: adminUrl(`/collections/whatsapp-aanmeldingen/${id}`) },
    }),
  };
}

export async function meldWhatsappAanRedactie(payload: Payload, naam: string, groepen: WhatsappGroep[], id: number) {
  for (const to of await redactieAdressen(payload)) {
    try {
      await verstuur(redactieNieuweAanmeldingMail(to, naam, groepen, id));
    } catch (error) {
      payload.logger.error(`[whatsapp] melding nieuwe aanmelding aan ${to} mislukt: ${error}`);
    }
  }
}

const UITNODIGING = {
  nl: {
    subject: 'Je uitnodiging voor de Buren-app Duivelseiland',
    welkom: (naam: string) => `Hoi ${naam}, welkom! Met de knop hieronder word je lid van de WhatsApp-groep Buren-app Duivelseiland.`,
    schoonmaak: 'Voor de groep van de Duivelse Schoonmaak voegt de redactie je nog toe.',
    knop: 'Word lid van de groep',
    voet: 'Deel deze link niet verder: hij is alleen voor buren.',
  },
  en: {
    subject: 'Your invitation to the Buren-app Duivelseiland',
    welkom: (naam: string) => `Hi ${naam}, welcome! Use the button below to join the WhatsApp group Buren-app Duivelseiland.`,
    schoonmaak: 'The editors will add you to the Duivelse Schoonmaak group separately.',
    knop: 'Join the group',
    voet: 'Please do not share this link: it is for neighbours only.',
  },
} satisfies Record<Locale, unknown>;

/** De uitnodigingslink van de Buren-app, als de redactie de aanmelding goedkeurt. */
export function uitnodigingMail(to: string, locale: Locale, naam: string, link: string, ookSchoonmaak: boolean): Mail {
  const t = UITNODIGING[locale];
  return {
    to,
    subject: t.subject,
    html: mailHtml({
      alineas: [escapeHtml(t.welkom(naam)), ...(ookSchoonmaak ? [t.schoonmaak] : [])],
      knop: { label: t.knop, url: escapeHtml(link) },
      voet: [t.voet],
    }),
  };
}
