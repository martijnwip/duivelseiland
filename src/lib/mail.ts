import { Resend } from 'resend';
import { localizedHref } from '@/i18n/localizedHref';

/**
 * Gedeelde mailhelpers (Resend) voor activiteiten en de nieuwsbrief. Zonder RESEND_API_KEY (lokaal) worden
 * mails alleen gelogd.
 */

export type Locale = 'nl' | 'en';

export type Mail = { to: string; subject: string; html: string; replyTo?: string; headers?: Record<string, string> };

const FROM = () => process.env.RESEND_FROM_EMAIL || 'Duivelseiland <onboarding@resend.dev>';

export function siteUrl(locale: Locale, path: string) {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
  return `${base}${localizedHref(locale, path)}`;
}

export function adminUrl(path = '') {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
  return `${base}/admin${path}`;
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Platte tekst (bv. van een organisator) veilig als alinea's in HTML. */
export function tekstAlsHtml(tekst: string) {
  return tekst
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .filter((a) => a.trim())
    .map((a) => `<p>${escapeHtml(a.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/** Eenvoudige opmaak voor alle activiteitenmails. `alineas` is al HTML (escape gebruikersinvoer vooraf). */
export function mailHtml({ alineas, knop, voet }: { alineas: string[]; knop?: { label: string; url: string }; voet?: string[] }) {
  const body = alineas.map((a) => (a.startsWith('<p>') ? a : `<p>${a}</p>`)).join('');
  const button = knop ? `<p><a href="${knop.url}">${escapeHtml(knop.label)}</a></p><p style="color:#666;font-size:13px">${knop.url}</p>` : '';
  const footer = voet?.length
    ? `<hr style="border:none;border-top:1px solid #ddd;margin:24px 0"><p style="color:#666;font-size:13px">${voet.join('<br>')}</p>`
    : '';
  return `${body}${button}${footer}`;
}

/**
 * Mails aan een hele lijst (nieuwsbrief, berichten aan deelnemers) gaan alleen op de productiesite echt uit.
 * Lokaal en op preview-deploys staan er echte adressen in de database en vaak een echte Resend-key; daar
 * worden ze alleen gelogd. Vercel zet VERCEL_ENV alleen op productie op `production`. Bewust zonder omweg.
 */
export const bulkmailToegestaan = () => process.env.VERCEL_ENV === 'production';

function logMail(mail: Mail, reden = 'RESEND_API_KEY ontbreekt') {
  const links = [...mail.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  console.log(`[mail] ${reden}, mail aan ${mail.to}: "${mail.subject}"${links.length ? ` links: ${links.join(' ')}` : ''}`);
}

/** Eén mail versturen. */
export async function verstuur(mail: Mail) {
  if (!process.env.RESEND_API_KEY) return logMail(mail);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: FROM(), ...mail });
  if (error) throw error;
}

/**
 * Veel mails tegelijk: per 100 via de batch-API, ieder een eigen mail. Alleen op productie (zie hierboven). Met `idempotencyKey` krijgt elke
 * portie van 100 een eigen sleutel (`<key>-<n>`), zodat een herhaalde poging geen dubbele mails geeft.
 */
export async function verstuurBatch(mails: Mail[], { idempotencyKey }: { idempotencyKey?: string } = {}) {
  if (!mails.length) return;
  if (!bulkmailToegestaan()) {
    mails.forEach((m) => logMail(m, 'geen productie, niet verstuurd'));
    return;
  }
  if (!process.env.RESEND_API_KEY) {
    mails.forEach((m) => logMail(m));
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  for (let i = 0; i < mails.length; i += 100) {
    const { error } = await resend.batch.send(
      mails.slice(i, i + 100).map((m) => ({ from: FROM(), ...m })),
      idempotencyKey ? { idempotencyKey: `${idempotencyKey}-${i / 100}` } : undefined,
    );
    if (error) throw error;
  }
}
