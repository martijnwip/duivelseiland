'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { EMAIL_RE } from '@/lib/nieuwsbrief/token';
import { CONTACT_SOORTEN, type ContactSoort } from '@/lib/contact/constants';
import { meldContactbericht } from '@/lib/contact/mail';

const str = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();

export type ContactVelden = { soort: string; naam: string; email: string; bericht: string };

export type ContactFoutReden = 'velden' | 'email' | 'server';

// Bij een fout gaan de ingevulde waarden mee terug: React leegt het formulier na elke actie.
export type ContactFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; reden: ContactFoutReden; velden: ContactVelden };

// Sneller dan dit kan een mens het formulier niet invullen.
const MIN_INVULTIJD_MS = 3000;

const GELDIG = new Set<string>(CONTACT_SOORTEN);

/** Idee, vraag of opmerking aan de redactie (voor iedereen). Alleen een mail, er wordt niets opgeslagen. */
export async function submitContact(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  // Honeypot en te snel verstuurd: doe alsof het gelukt is.
  if (formData.get('website2')) return { status: 'success' };
  const start = Number(formData.get('start'));
  if (!start || Date.now() - start < MIN_INVULTIJD_MS) return { status: 'success' };

  const velden: ContactVelden = {
    soort: str(formData, 'soort'),
    naam: str(formData, 'naam'),
    email: str(formData, 'email'),
    bericht: str(formData, 'bericht'),
  };
  const locale: 'nl' | 'en' = formData.get('locale') === 'en' ? 'en' : 'nl';
  const fout = (reden: ContactFoutReden) => ({ status: 'error' as const, reden, velden });

  if (!GELDIG.has(velden.soort) || !velden.naam || velden.naam.length > 80 || !velden.bericht || velden.bericht.length > 5000) {
    return fout('velden');
  }
  const email = velden.email.toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return fout('email');

  try {
    const payload = await getPayload({ config });
    await meldContactbericht(payload, {
      soort: velden.soort as ContactSoort,
      naam: velden.naam.replace(/\s+/g, ' '),
      email,
      bericht: velden.bericht,
      locale,
    });
    return { status: 'success' };
  } catch (error) {
    console.error('[contact] versturen mislukt', error);
    return fout('server');
  }
}
