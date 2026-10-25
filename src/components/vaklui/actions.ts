'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { TOKEN_RE, nieuwToken } from '@/lib/nieuwsbrief/token';
import { buurtpasAdres } from '@/lib/buurtpas/toegang';
import { normaliseerEmail } from '@/lib/adresboek';
import { recentGemaild } from '@/lib/activiteiten/constants';
import { MAX_OPEN_AANMELDINGEN_PER_ADRES, TELEFOON, WEBSITE } from '@/lib/vaklui/constants';
import { verstuur, vakmanOntvangenMail } from '@/lib/vaklui/mail';
import { meldNieuweVakmanAanRedactie } from '@/lib/vaklui/workflow';
import type { TokenState } from '../activiteiten/actions';

const str = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();

export type VakmanVelden = {
  naam: string;
  vakken: string[];
  anderVak: string;
  telefoon: string;
  website: string;
  aanmelderNaam: string;
  toelichting: string;
};

export type VakmanFoutReden = 'velden' | 'vak' | 'contact' | 'akkoord' | 'buurtpas' | 'server';

// Bij een fout gaan de ingevulde waarden mee terug: React leegt het formulier na elke actie.
export type VakmanFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; reden: VakmanFoutReden; velden: VakmanVelden };

/** "www.voorbeeld.nl" wordt "https://www.voorbeeld.nl"; een adres met protocol blijft zoals het is. */
const metProtocol = (url: string) => (!url || /^https?:\/\//i.test(url) ? url : `https://${url}`);

/**
 * Een vakman aanmelden (alleen met buurtpas). Het e-mailadres van de aanmelder komt uit de buurtpas en is
 * dus al bevestigd: de aanmelding gaat direct naar de redactie, de aanmelder krijgt een mail met intrekken-link.
 */
export async function submitVakman(_prev: VakmanFormState, formData: FormData): Promise<VakmanFormState> {
  if (formData.get('website2')) return { status: 'success' };

  const velden: VakmanVelden = {
    naam: str(formData, 'naam'),
    vakken: formData.getAll('vakken').map(String),
    anderVak: str(formData, 'anderVak'),
    telefoon: str(formData, 'telefoon'),
    website: metProtocol(str(formData, 'website')),
    aanmelderNaam: str(formData, 'aanmelderNaam'),
    toelichting: str(formData, 'toelichting'),
  };
  const locale = formData.get('locale') === 'en' ? 'en' : 'nl';
  const fout = (reden: VakmanFoutReden) => ({ status: 'error' as const, reden, velden });

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
      collection: 'vaklui',
      where: { and: [{ aanmelderEmail: { equals: email } }, { moderatie: { equals: 'ingediend' } }] },
      depth: 0,
      limit: 10,
    });
    if (open.length >= MAX_OPEN_AANMELDINGEN_PER_ADRES || open.some((v) => recentGemaild(v.laatsteMailOp))) {
      console.log(`[vaklui] aanmelding van ${email} genegeerd: limiet open aanmeldingen of mailinterval`);
      return { status: 'success' };
    }

    const token = nieuwToken();
    const vakman = await payload.create({
      collection: 'vaklui',
      // De aanbeveling komt in de standaardtaal (nl), ook van een Engelstalige aanmelder: alleen daarop valt
      // de andere taal terug, dus zo staat hij in beide talen op de site.
      data: {
        naam: velden.naam,
        vakken: vakken.map((v) => v.id),
        anderVak: velden.anderVak || undefined,
        telefoon: velden.telefoon || undefined,
        website: velden.website || undefined,
        aanbeveling: velden.toelichting || undefined,
        status: 'draft',
        moderatie: 'ingediend',
        aanmelderNaam: velden.aanmelderNaam,
        aanmelderEmail: email,
        locale,
        token,
        laatsteMailOp: new Date().toISOString(),
      },
    });

    await verstuur(vakmanOntvangenMail(email, locale, velden.naam, token));
    await meldNieuweVakmanAanRedactie(payload, velden.naam, vakman.id);
    return { status: 'success' };
  } catch (error) {
    console.error('[vaklui] aanmelden mislukt', error);
    return fout('server');
  }
}

/** Klik op "intrekken": een aanmelding die nog niet is goedgekeurd verdwijnt helemaal. */
export async function trekVakmanIn(_prev: TokenState, formData: FormData): Promise<TokenState> {
  const token = str(formData, 'token');
  if (!TOKEN_RE.test(token)) return { status: 'invalid' };
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: 'vaklui', where: { token: { equals: token } }, depth: 0, limit: 1 });
  const vakman = docs[0];
  if (!vakman || !(vakman.moderatie === 'ingediend' || vakman.moderatie === 'afgewezen')) return { status: 'invalid' };

  await payload.delete({ collection: 'vaklui', id: vakman.id });
  return { status: 'success' };
}
