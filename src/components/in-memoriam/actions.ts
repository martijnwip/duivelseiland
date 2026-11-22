'use server';

import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { buurtpasAdres, veiligTerugpad } from '@/lib/buurtpas/toegang';
import { normaliseerEmail } from '@/lib/adresboek';
import { NAAM_MAX, REACTIE_MAX } from '@/lib/in-memoriam/constants';
import { meldReactieAanRedactie } from '@/lib/in-memoriam/mail';
import { nieuwToken, TOKEN_RE } from '@/lib/nieuwsbrief/token';

const str = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();

// Sneller dan dit schrijft een mens geen herinnering.
const MIN_INVULTIJD_MS = 3000;

export type HerinneringVelden = { tekst: string; naam: string };
export type HerinneringFoutReden = 'velden' | 'buurtpas' | 'server';

// Bij een fout gaan de ingevulde waarden mee terug: React leegt het formulier na elke actie.
export type HerinneringFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; reden: HerinneringFoutReden; velden: HerinneringVelden };

/** Een gepubliceerde In-memoriam-pagina, of null. */
async function gepubliceerdeHerdenking(id: number) {
  if (!Number.isInteger(id) || id <= 0) return null;
  const payload = await getPayload({ config });
  const doc = await payload.findByID({ collection: 'in-memoriam', id, depth: 0, locale: 'nl', disableErrors: true, overrideAccess: true });
  return doc?.status === 'published' ? doc : null;
}

/**
 * Een herinnering achterlaten (alleen met buurtpas). Komt binnen als `ingediend`; de redactie krijgt een
 * mail en keurt hem goed in /admin. Het e-mailadres komt uit de buurtpas en staat nergens op de site.
 */
export async function plaatsHerinnering(_prev: HerinneringFormState, formData: FormData): Promise<HerinneringFormState> {
  // Honeypot en te snel verstuurd: doe alsof het gelukt is.
  if (formData.get('website2')) return { status: 'success' };
  const start = Number(formData.get('start'));
  if (!start || Date.now() - start < MIN_INVULTIJD_MS) return { status: 'success' };

  const velden: HerinneringVelden = { tekst: str(formData, 'tekst'), naam: str(formData, 'naam') };
  const fout = (reden: HerinneringFoutReden) => ({ status: 'error' as const, reden, velden });
  const locale: 'nl' | 'en' = formData.get('locale') === 'en' ? 'en' : 'nl';

  const adres = await buurtpasAdres();
  if (!adres) return fout('buurtpas');
  if (!velden.tekst || velden.tekst.length > REACTIE_MAX || velden.naam.length > NAAM_MAX) return fout('velden');

  try {
    const herdenking = await gepubliceerdeHerdenking(Number(formData.get('herdenking')));
    if (!herdenking) return fout('server');
    const payload = await getPayload({ config });
    const reactie = await payload.create({
      collection: 'in-memoriam-reacties',
      data: {
        tekst: velden.tekst,
        naam: velden.naam || null,
        status: 'ingediend',
        herdenking: herdenking.id,
        herdenkingNaam: herdenking.naam,
        email: normaliseerEmail(adres.email),
        locale,
      },
    });
    await meldReactieAanRedactie(payload, herdenking.naam, velden.naam, velden.tekst, reactie.id);
    return { status: 'success' };
  } catch (error) {
    console.error('[in-memoriam] herinnering plaatsen mislukt', error);
    return fout('server');
  }
}

/** Bericht bij nieuwe foto's: aanmelden (met buurtpas). Een tweede keer aanmelden doet niets. */
export async function volgFotos(formData: FormData) {
  const terug = veiligTerugpad(formData.get('terug'));
  const adres = await buurtpasAdres();
  const herdenking = adres ? await gepubliceerdeHerdenking(Number(formData.get('herdenking'))) : null;
  if (adres && herdenking) {
    const payload = await getPayload({ config });
    const email = normaliseerEmail(adres.email);
    const { totalDocs } = await payload.count({
      collection: 'in-memoriam-volgers',
      where: { and: [{ herdenking: { equals: herdenking.id } }, { email: { equals: email } }] },
      overrideAccess: true,
    });
    if (!totalDocs) {
      await payload.create({
        collection: 'in-memoriam-volgers',
        data: {
          email,
          herdenking: herdenking.id,
          herdenkingNaam: herdenking.naam,
          locale: formData.get('locale') === 'en' ? 'en' : 'nl',
          afmeldToken: nieuwToken(),
        },
        overrideAccess: true,
      });
    }
  }
  redirect(`${terug}#fotos`);
}

/** Bericht bij nieuwe foto's: afmelden vanaf de pagina (met buurtpas). */
export async function ontvolgFotos(formData: FormData) {
  const terug = veiligTerugpad(formData.get('terug'));
  const adres = await buurtpasAdres();
  const id = Number(formData.get('herdenking'));
  if (adres && Number.isInteger(id)) {
    const payload = await getPayload({ config });
    await payload.delete({
      collection: 'in-memoriam-volgers',
      where: { and: [{ herdenking: { equals: id } }, { email: { equals: normaliseerEmail(adres.email) } }] },
      overrideAccess: true,
    });
  }
  redirect(`${terug}#fotos`);
}

/** Afmelden via de link in de mail (zonder buurtpas). Pas bij de klik, zodat mailscanners niets afmelden. */
export async function afmeldenMetToken(formData: FormData) {
  const token = str(formData, 'token');
  const terug = veiligTerugpad(formData.get('terug'));
  if (TOKEN_RE.test(token)) {
    const payload = await getPayload({ config });
    await payload.delete({ collection: 'in-memoriam-volgers', where: { afmeldToken: { equals: token } }, overrideAccess: true });
  }
  redirect(`${terug}?klaar=1`);
}
