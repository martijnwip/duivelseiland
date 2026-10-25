import type { Payload } from 'payload';
import { redactieAdressen } from '../activiteiten/workflow';
import { escapeHtml, mailHtml, tekstAlsHtml, verstuur, type Locale, type Mail } from '../mail';
import { CONTACT_SOORT_LABELS, type ContactSoort } from './constants';

export type Contactbericht = { soort: ContactSoort; naam: string; email: string; bericht: string; locale: Locale };

/** Ontvanger(s): CONTACT_EMAIL, of zonder die variabele alle redacteuren en admins. */
async function ontvangers(payload: Payload) {
  const adres = process.env.CONTACT_EMAIL?.trim();
  return adres ? [adres] : redactieAdressen(payload);
}

// Reply-to is de bezoeker, zodat de redactie direct kan antwoorden.
function contactMail(to: string, { soort, naam, email, bericht, locale }: Contactbericht): Mail {
  return {
    to,
    replyTo: email,
    subject: `Contactformulier – ${CONTACT_SOORT_LABELS[soort]} van ${naam}`,
    html: mailHtml({
      alineas: [
        `<strong>${escapeHtml(naam)}</strong> (${escapeHtml(email)}) stuurde via het contactformulier een ${CONTACT_SOORT_LABELS[soort].toLowerCase()}:`,
        tekstAlsHtml(bericht),
      ],
      voet: [`Taal van de bezoeker: ${locale === 'en' ? 'Engels' : 'Nederlands'}`, 'Beantwoorden gaat rechtstreeks naar de afzender.'],
    }),
  };
}

/** Gooit een fout als geen enkele mail is aangekomen, zodat de bezoeker het opnieuw kan proberen. */
export async function meldContactbericht(payload: Payload, bericht: Contactbericht) {
  const adressen = await ontvangers(payload);
  if (!adressen.length) throw new Error('geen ontvanger voor het contactformulier');
  let gelukt = 0;
  for (const to of adressen) {
    try {
      await verstuur(contactMail(to, bericht));
      gelukt++;
    } catch (error) {
      payload.logger.error(`[contact] bericht aan ${to} mislukt: ${error}`);
    }
  }
  if (!gelukt) throw new Error('contactbericht niet verstuurd');
}
