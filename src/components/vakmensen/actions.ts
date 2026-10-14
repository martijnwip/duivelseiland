'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { TOKEN_RE, nieuwToken } from '@/lib/nieuwsbrief/token';
import { buurtpasAdres } from '@/lib/buurtpas/toegang';
import { normaliseerEmail } from '@/lib/adresboek';
import { recentGemaild } from '@/lib/activiteiten/constants';
import { MAX_OPEN_AANMELDINGEN_PER_ADRES, TELEFOON, WEBSITE } from '@/lib/vakmensen/constants';
import { verstuur, vakmensOntvangenMail } from '@/lib/vakmensen/mail';
import { meldNieuweVakmensAanRedactie } from '@/lib/vakmensen/workflow';
import type { TokenState } from '../activiteiten/actions';

const str = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();

export type VakmensVelden = {
  naam: string;
  vakken: string[];
  anderVak: string;
  telefoon: string;
  website: string;
  aanmelderNaam: string;
  toelichting: string;
};

export type VakmensFoutReden = 'velden' | 'vak' | 'contact' | 'akkoord' | 'buurtpas' | 'server';

// Bij een fout gaan de ingevulde waarden mee terug: React leegt het formulier na elke actie.
export type VakmensFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; reden: VakmensFoutReden; velden: VakmensVelden };

/** "www.voorbeeld.nl" wordt "https://www.voorbeeld.nl"; een adres met protocol blijft zoals het is. */
const metProtocol = (url: string) => (!url || /^https?:\/\//i.test(url) ? url : `https://${url}`);

/**
 * Een vakmens aanmelden (alleen met buurtpas). Het e-mailadres van de aanmelder komt uit de buurtpas en is
 * dus al bevestigd: de aanmelding gaat direct naar de redactie, de aanmelder krijgt een mail met intrekken-link.
 */
export async function submitVakmens(_prev: VakmensFormState, formData: FormData): Promise<VakmensFormState> {
  if (formData.get('website2')) return { status: 'success' };

  const velden: VakmensVelden = {
    naam: str(formData, 'naam'),
    vakken: formData.getAll('vakken').map(String),
    anderVak: str(formData, 'anderVak'),
    telefoon: str(formData, 'telefoon'),
    website: metProtocol(str(formData, 'website')),
    aanmelderNaam: str(formData, 'aanmelderNaam'),
    toelichting: str(formData, 'toelichting'),
  };
  const locale = formData.get('locale') === 'en' ? 'en' : 'nl';
  const fout = (reden: VakmensFoutReden) => ({ status: 'error' as const, reden, velden });

  const adres = await buurtpasAdres();
  if (!adres) return fout('buurtpas');

  if (
    !velden.naam ||
    velden.naam.length > 80 ||
    velden.anderVak.length > 60 ||
    !velden.aanmelderNaam ||
    velden.aanmelderNaam.length > 80 ||
    velden.toelichting.length > 500 ||
    velden.website.length > 200 ||
    (velden.telefoon && !TELEFOON.test(velden.telefoon)) ||
    (velden.website && !WEBSITE.test(velden.website))
  ) {
    return fout('velden');
  }
  if (!velden.telefoon && !velden.website) return fout('contact');
  if (formData.get('akkoord') !== 'on') return fout('akkoord');

  try {
    const payload = await getPayload({ config });

    // Alleen bestaande vakken; een onbekend id uit een gemanipuleerd formulier valt weg.
    const ids = velden.vakken.map(Number).filter(Number.isInteger);
    const { docs: vakken } = ids.length
      ? await payload.find({ collection: 'vakken', where: { id: { in: ids } }, depth: 0, pagination: false })
      : { docs: [] };
    if (!vakken.length && !velden.anderVak) return fout('vak');

    const email = normaliseerEmail(adres.email);

    // Rem op misbruik: maximaal een paar openstaande aanmeldingen per adres, en niet vlak na elkaar mailen.
    const { docs: open } = await payload.find({
      collection: 'vakmensen',
      where: { and: [{ aanmelderEmail: { equals: email } }, { moderatie: { equals: 'ingediend' } }] },
      depth: 0,
      limit: 10,
    });
    if (open.length >= MAX_OPEN_AANMELDINGEN_PER_ADRES || open.some((v) => recentGemaild(v.laatsteMailOp))) {
      console.log(`[vakmensen] aanmelding van ${email} genegeerd: limiet open aanmeldingen of mailinterval`);
      return { status: 'success' };
    }

    const token = nieuwToken();
    const vakmens = await payload.create({
      collection: 'vakmensen',
      data: {
        naam: velden.naam,
        vakken: vakken.map((v) => v.id),
        anderVak: velden.anderVak || undefined,
        telefoon: velden.telefoon || undefined,
        website: velden.website || undefined,
        status: 'draft',
        moderatie: 'ingediend',
        aanmelderNaam: velden.aanmelderNaam,
        aanmelderEmail: email,
        aanmelderToelichting: velden.toelichting || undefined,
        locale,
        token,
        laatsteMailOp: new Date().toISOString(),
      },
    });

    await verstuur(vakmensOntvangenMail(email, locale, velden.naam, token));
    await meldNieuweVakmensAanRedactie(payload, velden.naam, vakmens.id);
    return { status: 'success' };
  } catch (error) {
    console.error('[vakmensen] aanmelden mislukt', error);
    return fout('server');
  }
}

/** Klik op "intrekken": een aanmelding die nog niet is goedgekeurd verdwijnt helemaal. */
export async function trekVakmensIn(_prev: TokenState, formData: FormData): Promise<TokenState> {
  const token = str(formData, 'token');
  if (!TOKEN_RE.test(token)) return { status: 'invalid' };
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: 'vakmensen', where: { token: { equals: token } }, depth: 0, limit: 1 });
  const vakmens = docs[0];
  if (!vakmens || !(vakmens.moderatie === 'ingediend' || vakmens.moderatie === 'afgewezen')) return { status: 'invalid' };

  await payload.delete({ collection: 'vakmensen', id: vakmens.id });
  return { status: 'success' };
}
