/**
 * De buurtpas-cookie: welk adres uit het adresboek en welke versie, ondertekend met PAYLOAD_SECRET (HMAC-SHA256).
 * Geen sessietabel: de handtekening bewijst dat de cookie van ons komt, de check in toegang.ts dat het adres
 * hem nog mag hebben.
 */

export const COOKIE_NAAM = 'buurtpas';
export const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export type BuurtpasInhoud = { adresId: number; versie: number; uitgegeven: number };

const encoder = new TextEncoder();

function base64url(bytes: Uint8Array) {
  return Buffer.from(bytes).toString('base64url');
}

async function sleutel() {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) throw new Error('PAYLOAD_SECRET ontbreekt');
  return crypto.subtle.importKey('raw', encoder.encode(`buurtpas:${secret}`), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export async function maakCookieWaarde(inhoud: BuurtpasInhoud) {
  const data = base64url(encoder.encode(JSON.stringify(inhoud)));
  const handtekening = new Uint8Array(await crypto.subtle.sign('HMAC', await sleutel(), encoder.encode(data)));
  return `${data}.${base64url(handtekening)}`;
}

/** De inhoud als de handtekening klopt, anders null. */
export async function leesCookieWaarde(waarde: string | undefined): Promise<BuurtpasInhoud | null> {
  if (!waarde) return null;
  const [data, handtekening, rest] = waarde.split('.');
  if (!data || !handtekening || rest !== undefined) return null;
  try {
    const geldig = await crypto.subtle.verify(
      'HMAC',
      await sleutel(),
      Buffer.from(handtekening, 'base64url'),
      encoder.encode(data),
    );
    if (!geldig) return null;
    const inhoud = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as BuurtpasInhoud;
    if (!Number.isInteger(inhoud.adresId) || !Number.isInteger(inhoud.versie)) return null;
    return inhoud;
  } catch {
    return null;
  }
}
