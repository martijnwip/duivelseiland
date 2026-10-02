'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { Resend } from 'resend';
import { cookies } from 'next/headers';
import { IDEE_KEYS, type IdeeKey } from '@/collections/IdeeLikes';

// Bij een fout gaat het ingevulde adres mee terug: React leegt het formulier na elke actie.
export type BuurtborrelFormState =
  | { status: 'idle' }
  | { status: 'success'; mode: 'aanmelden' | 'afmelden' }
  | { status: 'error'; email: string };

const FALLBACK_ONTVANGER = 'duivelseiland@outlook.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Aan- of afmelding voor de Buurtborrel-mailinglijst: stuurt een mail naar de organisatie. */
export async function submitBuurtborrel(_prev: BuurtborrelFormState, formData: FormData): Promise<BuurtborrelFormState> {
  const mode = formData.get('mode') === 'afmelden' ? 'afmelden' : 'aanmelden';
  // Honeypot: mensen zien dit veld niet, bots vullen het in. Doe alsof het gelukt is.
  if (formData.get('website')) return { status: 'success', mode };

  const email = String(formData.get('email') ?? '').trim();
  const bericht = mode === 'aanmelden' ? String(formData.get('bericht') ?? '').trim() : '';

  if (email.length > 254 || !EMAIL_RE.test(email) || bericht.length > 1000) return { status: 'error', email };

  const payload = await getPayload({ config });
  const { aanmeldEmail } = await payload.findGlobal({ slug: 'buurtborrel', depth: 0 });
  const to = aanmeldEmail || FALLBACK_ONTVANGER;

  const subject = mode === 'aanmelden' ? 'Buurtborrel: aanmelding' : 'Buurtborrel: afmelding';
  const intro =
    mode === 'aanmelden'
      ? 'Via de website wil iemand op de Buurtborrel-mailinglijst:'
      : 'Via de website wil iemand van de Buurtborrel-mailinglijst af:';
  const html = `<p>${intro}</p><p><strong>${escapeHtml(email)}</strong></p>${
    bericht ? `<p>Bericht:</p><p>${escapeHtml(bericht).replace(/\n/g, '<br>')}</p>` : ''
  }`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`[buurtborrel] RESEND_API_KEY ontbreekt, ${mode} van ${email} naar ${to}${bericht ? `: ${bericht}` : ''}`);
    return { status: 'success', mode };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Duivelseiland <onboarding@resend.dev>',
      to,
      replyTo: email,
      subject,
      html,
    });
    if (error) throw error;
    return { status: 'success', mode };
  } catch (error) {
    console.error('[buurtborrel] versturen mislukt', error);
    return { status: 'error', email };
  }
}

export type IdeeLikesState = { counts: Record<IdeeKey, number>; liked: IdeeKey[] };

const STEMMER_COOKIE = 'db_stemmer';

async function ideeLikesState(stemmer: string | undefined): Promise<IdeeLikesState> {
  const payload = await getPayload({ config });
  const totals = await Promise.all(
    IDEE_KEYS.map((idee) => payload.count({ collection: 'idee-likes', where: { idee: { equals: idee } } })),
  );
  const counts = Object.fromEntries(IDEE_KEYS.map((idee, i) => [idee, totals[i].totalDocs])) as Record<IdeeKey, number>;
  if (!stemmer) return { counts, liked: [] };
  const { docs } = await payload.find({
    collection: 'idee-likes',
    where: { stemmer: { equals: stemmer } },
    limit: IDEE_KEYS.length,
    depth: 0,
    pagination: false,
  });
  return { counts, liked: docs.map((d) => d.idee as IdeeKey) };
}

/** Tellingen per idee, plus de ideeën waar deze browser al een hartje bij zette. */
export async function getIdeeLikes(): Promise<IdeeLikesState> {
  return ideeLikesState((await cookies()).get(STEMMER_COOKIE)?.value);
}

/** Zet of haalt een hartje bij een idee. Eén per idee per browser: een graadmeter, geen stemming. */
export async function toggleIdeeLike(idee: string): Promise<IdeeLikesState> {
  const jar = await cookies();
  if (!(IDEE_KEYS as readonly string[]).includes(idee)) return ideeLikesState(jar.get(STEMMER_COOKIE)?.value);

  let stemmer = jar.get(STEMMER_COOKIE)?.value;
  if (!stemmer || !/^[0-9a-f-]{36}$/.test(stemmer)) {
    stemmer = crypto.randomUUID();
    jar.set(STEMMER_COOKIE, stemmer, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 365, path: '/' });
  }

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'idee-likes',
    where: { and: [{ idee: { equals: idee } }, { stemmer: { equals: stemmer } }] },
    limit: 10,
    depth: 0,
  });
  if (docs.length) {
    await payload.delete({ collection: 'idee-likes', where: { id: { in: docs.map((d) => d.id) } } });
  } else {
    await payload.create({ collection: 'idee-likes', data: { idee: idee as IdeeKey, stemmer } });
  }
  return ideeLikesState(stemmer);
}
