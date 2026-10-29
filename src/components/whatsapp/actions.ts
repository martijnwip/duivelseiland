'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { buurtpasAdres } from '@/lib/buurtpas/toegang';
import { normaliseerEmail } from '@/lib/adresboek';
import { TELEFOON } from '@/lib/vaklui/constants';
import { WHATSAPP_GROEPEN, type WhatsappGroep } from '@/lib/whatsapp-groepen/constants';
import { meldWhatsappAanRedactie } from '@/lib/whatsapp-groepen/mail';

const str = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();

export type WhatsappVelden = { naam: string; telefoon: string; groepen: string[] };

export type WhatsappFoutReden = 'velden' | 'groep' | 'telefoon' | 'akkoord' | 'buurtpas' | 'server';

// Bij een fout gaan de ingevulde waarden mee terug: React leegt het formulier na elke actie.
export type WhatsappFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; reden: WhatsappFoutReden; velden: WhatsappVelden };

const GELDIG = new Set<string>(WHATSAPP_GROEPEN.map((g) => g.value));

/**
 * Aanmelden voor de WhatsApp-groep(en) (alleen met buurtpas). Het e-mailadres komt uit de buurtpas. Heeft
 * dit adres al een open aanmelding, dan wordt die bijgewerkt in plaats van een tweede (en geen tweede mail).
 */
export async function submitWhatsapp(_prev: WhatsappFormState, formData: FormData): Promise<WhatsappFormState> {
  if (formData.get('website2')) return { status: 'success' };

  const velden: WhatsappVelden = {
    naam: str(formData, 'naam'),
    telefoon: str(formData, 'telefoon'),
    groepen: formData.getAll('groepen').map(String),
  };
  const locale: 'nl' | 'en' = formData.get('locale') === 'en' ? 'en' : 'nl';
  const fout = (reden: WhatsappFoutReden) => ({ status: 'error' as const, reden, velden });

  const adres = await buurtpasAdres();
  if (!adres) return fout('buurtpas');

  if (!velden.naam || velden.naam.length > 80 || (velden.telefoon && !TELEFOON.test(velden.telefoon))) return fout('velden');
  const groepen = velden.groepen.filter((g): g is WhatsappGroep => GELDIG.has(g));
  if (!groepen.length) return fout('groep');
  // Alleen de Schoonmaak voegt de redactie met het nummer toe; voor de Buren-app gaat de uitnodiging per mail.
  if (groepen.includes('schoonmaak') && !velden.telefoon) return fout('telefoon');
  if (formData.get('akkoord') !== 'on') return fout('akkoord');

  try {
    const payload = await getPayload({ config });
    const email = normaliseerEmail(adres.email);
    const data = { naam: velden.naam, telefoon: velden.telefoon || null, groepen, locale };

    const { docs: open } = await payload.find({
      collection: 'whatsapp-aanmeldingen',
      where: { and: [{ email: { equals: email } }, { status: { equals: 'aangemeld' } }] },
      depth: 0,
      limit: 1,
    });
    if (open[0]) {
      await payload.update({ collection: 'whatsapp-aanmeldingen', id: open[0].id, data });
      return { status: 'success' };
    }

    const aanmelding = await payload.create({ collection: 'whatsapp-aanmeldingen', data: { ...data, email, status: 'aangemeld' } });
    await meldWhatsappAanRedactie(payload, velden.naam, groepen, aanmelding.id);
    return { status: 'success' };
  } catch (error) {
    console.error('[whatsapp] aanmelden mislukt', error);
    return fout('server');
  }
}
