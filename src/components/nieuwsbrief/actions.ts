'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { sendNieuwsbriefMail, type NieuwsbriefMailKind } from '@/lib/nieuwsbrief/mail';
import { EMAIL_RE, TOKEN_RE, nieuwToken } from '@/lib/nieuwsbrief/token';

// Bij een fout gaan het ingevulde adres en de naam mee terug: React leegt het formulier na elke actie.
export type NieuwsbriefFormState =
  | { status: 'idle' }
  | { status: 'success'; mode: 'aanmelden' | 'afmelden' }
  | { status: 'error'; email: string; naam: string };

export type NieuwsbriefTokenState = { status: 'idle' | 'success' | 'invalid' };

// Binnen deze tijd geen tweede mail naar hetzelfde adres, ook niet als iemand het formulier vaker verstuurt.
const MAIL_INTERVAL_MS = 2 * 60 * 1000;

function recentGemaild(laatsteMailOp: string | null | undefined) {
  return Boolean(laatsteMailOp) && Date.now() - new Date(laatsteMailOp!).getTime() < MAIL_INTERVAL_MS;
}

/**
 * Aanmelden of een afmeldlink aanvragen. Het antwoord is altijd hetzelfde, of het adres nu al op de
 * lijst staat of niet: de bezoeker krijgt een mail met een link, en pas die link verandert iets.
 */
export async function submitNieuwsbrief(_prev: NieuwsbriefFormState, formData: FormData): Promise<NieuwsbriefFormState> {
  const mode = formData.get('mode') === 'afmelden' ? 'afmelden' : 'aanmelden';
  // Honeypot: mensen zien dit veld niet, bots vullen het in. Doe alsof het gelukt is.
  if (formData.get('website')) return { status: 'success', mode };

  const rawEmail = String(formData.get('email') ?? '');
  const email = rawEmail.trim().toLowerCase();
  const rawNaam = String(formData.get('naam') ?? '');
  const naam = rawNaam.trim().replace(/\s+/g, ' ').slice(0, 200);
  const locale = formData.get('locale') === 'en' ? 'en' : 'nl';
  // Seintjes over nieuwe ideeën: gaan pas lopen na de bevestiging, net als de nieuwsbrief.
  const ideeen = formData.get('ideeen') === 'ja';
  if (email.length > 254 || !EMAIL_RE.test(email)) return { status: 'error', email: rawEmail, naam: rawNaam };

  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'nieuwsbrief-abonnees',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    });
    const bestaand = docs[0];
    const now = new Date().toISOString();
    let mail: { kind: NieuwsbriefMailKind; token: string; locale: 'nl' | 'en' } | null = null;

    if (mode === 'aanmelden') {
      if (!bestaand) {
        const token = nieuwToken();
        await payload.create({
          collection: 'nieuwsbrief-abonnees',
          data: { email, naam: naam || null, status: 'pending', bron: 'formulier', locale, token, laatsteMailOp: now, ideeen },
        });
        mail = { kind: 'bevestigen', token, locale };
      } else if (bestaand.status !== 'actief' && !recentGemaild(bestaand.laatsteMailOp)) {
        // Nieuw token, zodat een oude bevestigings- of afmeldlink niet meer werkt.
        const token = nieuwToken();
        await payload.update({
          collection: 'nieuwsbrief-abonnees',
          id: bestaand.id,
          data: { status: 'pending', locale, token, laatsteMailOp: now, ideeen, ...(naam ? { naam } : {}) },
        });
        mail = { kind: 'bevestigen', token, locale };
      }
    } else if (bestaand && bestaand.status !== 'afgemeld' && !recentGemaild(bestaand.laatsteMailOp)) {
      await payload.update({ collection: 'nieuwsbrief-abonnees', id: bestaand.id, data: { laatsteMailOp: now } });
      mail = { kind: 'afmelden', token: bestaand.token, locale: bestaand.locale };
    }

    if (mail) await sendNieuwsbriefMail({ to: email, ...mail });
    return { status: 'success', mode };
  } catch (error) {
    console.error(`[nieuwsbrief] ${mode} mislukt`, error);
    return { status: 'error', email: rawEmail, naam: rawNaam };
  }
}

async function zetStatus(formData: FormData, status: 'actief' | 'afgemeld'): Promise<NieuwsbriefTokenState> {
  const token = String(formData.get('token') ?? '');
  if (!TOKEN_RE.test(token)) return { status: 'invalid' };

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'nieuwsbrief-abonnees',
    where: { token: { equals: token } },
    limit: 1,
    depth: 0,
  });
  const abonnee = docs[0];
  if (!abonnee) return { status: 'invalid' };
  if (abonnee.status === status) return { status: 'success' };
  // Een oude bevestigingslink mag een afmelding niet terugdraaien; daarvoor meld je je opnieuw aan.
  if (status === 'actief' && abonnee.status === 'afgemeld') return { status: 'invalid' };

  const now = new Date().toISOString();
  await payload.update({
    collection: 'nieuwsbrief-abonnees',
    id: abonnee.id,
    data: status === 'actief' ? { status, bevestigdOp: now, afgemeldOp: null } : { status, afgemeldOp: now, laatsteMailOp: null },
  });
  return { status: 'success' };
}

/** Klik op "afmelden" achter de link in een seintje over nieuwe ideeën: alleen de seintjes stoppen, de nieuwsbrief blijft. */
export async function afmeldenIdeeen(_prev: NieuwsbriefTokenState, formData: FormData): Promise<NieuwsbriefTokenState> {
  const token = String(formData.get('token') ?? '');
  if (!TOKEN_RE.test(token)) return { status: 'invalid' };
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: 'nieuwsbrief-abonnees', where: { token: { equals: token } }, limit: 1, depth: 0 });
  if (!docs[0]) return { status: 'invalid' };
  if (docs[0].ideeen) await payload.update({ collection: 'nieuwsbrief-abonnees', id: docs[0].id, data: { ideeen: false } });
  return { status: 'success' };
}

/** Klik op "bevestigen" op de pagina achter de link in de bevestigingsmail. */
export async function bevestigNieuwsbrief(_prev: NieuwsbriefTokenState, formData: FormData) {
  return zetStatus(formData, 'actief');
}

/** Klik op "afmelden" op de pagina achter de afmeldlink. Hetzelfde token als bij bevestigen. */
export async function afmeldenNieuwsbrief(_prev: NieuwsbriefTokenState, formData: FormData) {
  return zetStatus(formData, 'afgemeld');
}
