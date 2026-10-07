'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { normaliseerEmail, registreerAdres, regelsVoorAdres } from '@/lib/adresboek';
import { COOKIE_MAX_AGE, COOKIE_NAAM, maakCookieWaarde } from '@/lib/buurtpas/cookie';
import { TOKEN_GELDIG_MS, sendBuurtpasMail } from '@/lib/buurtpas/mail';
import { zetNieuwsbrief } from '@/lib/buurtpas/nieuwsbrief';
import { buurtpasAdres, veiligTerugpad } from '@/lib/buurtpas/toegang';
import { EMAIL_RE, TOKEN_RE, nieuwToken } from '@/lib/nieuwsbrief/token';

export type BuurtpasFormState = { status: 'idle' } | { status: 'success' } | { status: 'error'; email: string };
export type BuurtpasTokenState = { status: 'idle' | 'invalid' };

// Binnen deze tijd geen tweede mail naar hetzelfde adres, ook niet als iemand het formulier vaker verstuurt.
const MAIL_INTERVAL_MS = 2 * 60 * 1000;

/**
 * Buurtpas aanvragen: een mail met een link. Het antwoord is altijd hetzelfde, of het adres nu bekend is, net
 * gemaild is of ingetrokken: alleen wie de mail kan lezen merkt verschil.
 */
export async function vraagBuurtpasAan(_prev: BuurtpasFormState, formData: FormData): Promise<BuurtpasFormState> {
  if (formData.get('website')) return { status: 'success' };

  const rawEmail = String(formData.get('email') ?? '');
  const email = normaliseerEmail(rawEmail);
  const locale = formData.get('locale') === 'en' ? 'en' : 'nl';
  const terug = veiligTerugpad(formData.get('terug'));
  const metNieuwsbrief = formData.get('nieuwsbrief') === 'ja';
  if (email.length > 254 || !EMAIL_RE.test(email)) return { status: 'error', email: rawEmail };

  try {
    const payload = await getPayload({ config });
    await registreerAdres(payload, email, { bevestigd: false });
    const { docs } = await payload.find({
      collection: 'email-adressen',
      where: { email: { equals: email } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    });
    const adres = docs[0];
    if (!adres || adres.buurtpasIngetrokken) return { status: 'success' };
    const laatste = adres.laatsteBuurtpasMailOp ? new Date(adres.laatsteBuurtpasMailOp).getTime() : 0;
    if (Date.now() - laatste < MAIL_INTERVAL_MS) return { status: 'success' };

    // Elke aanvraag een nieuw token: een oudere link werkt dan niet meer.
    const token = nieuwToken();
    const nu = Date.now();
    await payload.update({
      collection: 'email-adressen',
      id: adres.id,
      data: {
        buurtpasToken: token,
        buurtpasTokenTot: new Date(nu + TOKEN_GELDIG_MS).toISOString(),
        laatsteBuurtpasMailOp: new Date(nu).toISOString(),
        // De nieuwsbrief pas na de klik op de link: dan is het adres bewezen van de aanvrager.
        buurtpasNieuwsbrief: metNieuwsbrief,
        buurtpasLocale: locale,
      },
      overrideAccess: true,
      context: { geenPromotie: true },
    });
    await sendBuurtpasMail({ to: email, locale, token, terug, metNieuwsbrief });
    return { status: 'success' };
  } catch (error) {
    console.error('[buurtpas] aanvragen mislukt', error);
    return { status: 'error', email: rawEmail };
  }
}

/**
 * Klik op "activeren" op de pagina achter de link. Pas bij de klik (POST), niet bij het openen van de link:
 * mailscanners die links voorladen verbruiken het token anders.
 */
export async function bevestigBuurtpas(_prev: BuurtpasTokenState, formData: FormData): Promise<BuurtpasTokenState> {
  const token = String(formData.get('token') ?? '');
  const terug = veiligTerugpad(formData.get('terug'));
  if (!TOKEN_RE.test(token)) return { status: 'invalid' };

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'email-adressen',
    where: { buurtpasToken: { equals: token } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  });
  const adres = docs[0];
  const geldigTot = adres?.buurtpasTokenTot ? new Date(adres.buurtpasTokenTot).getTime() : 0;
  if (!adres || adres.buurtpasIngetrokken || geldigTot < Date.now()) return { status: 'invalid' };

  const versie = adres.buurtpasVersie ?? 1;
  // Het token werkt één keer. Het adres is nu aantoonbaar van de bezoeker, dus bevestigd; geenPromotie: wat
  // nog wacht (bv. een nieuwsbriefaanmelding) gaat niet vanzelf door, daar was deze klik niet voor.
  await payload.update({
    collection: 'email-adressen',
    id: adres.id,
    data: {
      buurtpasToken: null,
      buurtpasTokenTot: null,
      buurtpasVersie: versie,
      buurtpasLaatstGebruikt: new Date().toISOString(),
      buurtpasNieuwsbrief: false,
      bevestigd: true,
    },
    overrideAccess: true,
    context: { geenPromotie: true },
  });
  if (adres.buurtpasNieuwsbrief) {
    await zetNieuwsbrief(payload, adres.email, { aan: true, locale: adres.buurtpasLocale === 'en' ? 'en' : 'nl' });
  }

  (await cookies()).set(COOKIE_NAAM, await maakCookieWaarde({ adresId: adres.id, versie, uitgegeven: Date.now() }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  redirect(terug);
}

/** Buurtpas van dit apparaat halen. Andere apparaten houden hun buurtpas. */
export async function beeindigBuurtpas(formData: FormData) {
  (await cookies()).delete(COOKIE_NAAM);
  redirect(veiligTerugpad(formData.get('terug')));
}

/** Nieuwsbrief aan of uit vanaf /buurtpas. Alleen met een geldige buurtpas: die bewijst dat het adres van de bezoeker is. */
export async function nieuwsbriefMetBuurtpas(formData: FormData) {
  const terug = veiligTerugpad(formData.get('terug'));
  const adres = await buurtpasAdres();
  if (adres) {
    const payload = await getPayload({ config });
    await zetNieuwsbrief(payload, adres.email, {
      aan: formData.get('aan') === 'ja',
      locale: formData.get('locale') === 'en' ? 'en' : 'nl',
    });
  }
  redirect(terug);
}

/**
 * Buurtpas opzeggen: geldt meteen op alle apparaten (nieuwe versie). Gebruikt de site het adres nergens
 * anders voor (nieuwsbrief, activiteiten, account), dan verdwijnt het ook uit het adresboek.
 */
export async function zegBuurtpasOp(formData: FormData) {
  const terug = veiligTerugpad(formData.get('terug'));
  const adres = await buurtpasAdres();
  if (adres) {
    const payload = await getPayload({ config });
    const regels = await regelsVoorAdres(payload, adres.email);
    if (regels.length === 0) {
      await payload.delete({ collection: 'email-adressen', id: adres.id, overrideAccess: true });
    } else {
      await payload.update({
        collection: 'email-adressen',
        id: adres.id,
        data: { buurtpasVersie: (adres.buurtpasVersie ?? 1) + 1, buurtpasToken: null, buurtpasTokenTot: null, buurtpasNieuwsbrief: false },
        overrideAccess: true,
        context: { geenPromotie: true },
      });
    }
  }
  (await cookies()).delete(COOKIE_NAAM);
  redirect(`${terug}?opgezegd=1`);
}
