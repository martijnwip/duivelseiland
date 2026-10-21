import type { Payload } from 'payload';
import { redactieAdressen } from '../activiteiten/workflow';
import { adminUrl, escapeHtml, mailHtml, verstuur, type Mail } from '../mail';
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
        'Het telefoonnummer staat in het beheerpaneel. Zet de aanmelding op "Toegevoegd" als je het nummer hebt toegevoegd; het nummer wordt dan gewist.',
      ],
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
