'use server';

import { getPayload, type Payload } from 'payload';
import config from '@payload-config';
import type { Activiteiten } from '../../../payload-types';
import { EMAIL_RE, TOKEN_RE, nieuwToken } from '@/lib/nieuwsbrief/token';
import { isBevestigdAdres } from '@/lib/adresboek';
import { heeftPlek, naAanmelding } from '@/lib/activiteiten/deelnemers';
import {
  ACTIEVE_FASES,
  AFBEELDING_TYPES,
  MAX_AFBEELDING_BYTES,
  MAX_OPEN_IDEEEN_PER_ADRES,
  OPEN_IDEE_FASES,
  recentGemaild,
} from '@/lib/activiteiten/constants';
import { tekstNaarLexical } from '@/lib/activiteiten/lexical';
import {
  afmeldlinkMail,
  ideeBevestigenMail,
  ideeOntvangenMail,
  ingeschrevenMail,
  inschrijvingBevestigenMail,
  verstuur,
  type Locale,
} from '@/lib/activiteiten/mail';
import { uniekeSlug } from '@/lib/activiteiten/slug';
import { meldNieuwIdeeAanRedactie, titels } from '@/lib/activiteiten/workflow';

const str = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();
const localeVan = (formData: FormData): Locale => (formData.get('locale') === 'en' ? 'en' : 'nl');

// ---------------------------------------------------------------------------------------------
// Idee aanmelden (flow 1)
// ---------------------------------------------------------------------------------------------

export type IdeeVelden = {
  titel: string;
  omschrijving: string;
  soort: string;
  soortToelichting: string;
  voorlopigeDatum: string;
  naam: string;
  email: string;
};

// Bij een fout gaan de ingevulde waarden mee terug: React leegt het formulier na elke actie.
export type IdeeFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; reden: 'velden' | 'afbeelding' | 'akkoord' | 'server'; velden: IdeeVelden };

/**
 * Een idee indienen. Onbekend adres: eerst e-mail bevestigen. Al bevestigd adres (nieuwsbrief, andere
 * activiteit, gebruiker): direct naar de redactie, met een intrekken-link in de mail. De bezoeker krijgt
 * in beide gevallen hetzelfde antwoord.
 */
export async function submitIdee(_prev: IdeeFormState, formData: FormData): Promise<IdeeFormState> {
  if (formData.get('website')) return { status: 'success' };

  const velden: IdeeVelden = {
    titel: str(formData, 'titel'),
    omschrijving: str(formData, 'omschrijving'),
    soort: formData.get('soort') === 'terugkerend' ? 'terugkerend' : 'eenmalig',
    soortToelichting: str(formData, 'soortToelichting'),
    voorlopigeDatum: str(formData, 'voorlopigeDatum'),
    naam: str(formData, 'naam'),
    email: str(formData, 'email').toLowerCase(),
  };
  const locale = localeVan(formData);
  const fout = (reden: 'velden' | 'afbeelding' | 'akkoord' | 'server') => ({ status: 'error' as const, reden, velden });

  if (
    !velden.titel ||
    velden.titel.length > 80 ||
    !velden.omschrijving ||
    velden.omschrijving.length > 2000 ||
    velden.soortToelichting.length > 120 ||
    !velden.naam ||
    velden.naam.length > 80 ||
    velden.email.length > 254 ||
    !EMAIL_RE.test(velden.email) ||
    (velden.voorlopigeDatum && Number.isNaN(Date.parse(velden.voorlopigeDatum)))
  ) {
    return fout('velden');
  }
  if (formData.get('akkoord') !== 'on') return fout('akkoord');

  const afbeelding = formData.get('afbeelding');
  const heeftAfbeelding = afbeelding instanceof File && afbeelding.size > 0;
  if (heeftAfbeelding && (afbeelding.size > MAX_AFBEELDING_BYTES || !AFBEELDING_TYPES.includes(afbeelding.type))) {
    return fout('afbeelding');
  }

  try {
    const payload = await getPayload({ config });

    // Rem op misbruik: maximaal een paar openstaande ideeën per adres, en niet vlak na elkaar mailen.
    const { docs: open } = await payload.find({
      collection: 'activiteiten',
      where: { and: [{ aanvragerEmail: { equals: velden.email } }, { fase: { in: OPEN_IDEE_FASES } }] },
      depth: 0,
      limit: 10,
    });
    if (open.length >= MAX_OPEN_IDEEEN_PER_ADRES || open.some((a) => recentGemaild(a.laatsteMailOp))) {
      console.log(`[activiteiten] idee van ${velden.email} genegeerd: limiet open ideeën of mailinterval`);
      return { status: 'success' };
    }

    const bekend = await isBevestigdAdres(payload, velden.email);

    let image: number | undefined;
    if (heeftAfbeelding) {
      const media = await payload.create({
        collection: 'media',
        data: { alt: velden.titel },
        file: {
          data: Buffer.from(await afbeelding.arrayBuffer()),
          mimetype: afbeelding.type,
          name: afbeelding.name || 'activiteit.jpg',
          size: afbeelding.size,
        },
      });
      image = media.id;
    }

    const token = nieuwToken();
    const activiteit = await payload.create({
      collection: 'activiteiten',
      // Ideeën komen in één taal binnen en worden als Nederlands opgeslagen; de redactie vult het Engels.
      locale: 'nl',
      data: {
        title: velden.titel,
        content: tekstNaarLexical(velden.omschrijving) as Activiteiten['content'],
        soort: velden.soort as 'eenmalig' | 'terugkerend',
        soortToelichting: velden.soort === 'terugkerend' ? velden.soortToelichting || undefined : undefined,
        voorlopigeDatum: velden.voorlopigeDatum ? new Date(velden.voorlopigeDatum).toISOString() : undefined,
        image,
        fase: bekend ? 'ingediend' : 'onbevestigd',
        inschrijving: 'open',
        slug: await uniekeSlug(payload, velden.titel),
        aanvragerNaam: velden.naam,
        aanvragerEmail: velden.email,
        locale,
        token,
        laatsteMailOp: new Date().toISOString(),
      },
    });

    if (bekend) {
      await verstuur(ideeOntvangenMail(velden.email, locale, velden.titel, token));
      await meldNieuwIdeeAanRedactie(payload, velden.titel, activiteit.id);
    } else {
      await verstuur(ideeBevestigenMail(velden.email, locale, velden.titel, token));
    }
    return { status: 'success' };
  } catch (error) {
    console.error('[activiteiten] idee indienen mislukt', error);
    return fout('server');
  }
}

export type TokenState = { status: 'idle' | 'success' | 'invalid' | 'gesloten' };

async function ideeBijToken(payload: Payload, token: string) {
  if (!TOKEN_RE.test(token)) return null;
  const { docs } = await payload.find({ collection: 'activiteiten', where: { token: { equals: token } }, depth: 0, limit: 1 });
  return docs[0] ?? null;
}

/** Klik op "bevestigen" achter de link in de bevestigingsmail van een idee. */
export async function bevestigIdee(_prev: TokenState, formData: FormData): Promise<TokenState> {
  const payload = await getPayload({ config });
  const idee = await ideeBijToken(payload, str(formData, 'token'));
  if (!idee) return { status: 'invalid' };
  if (idee.fase !== 'onbevestigd') return { status: idee.fase === 'ingediend' ? 'success' : 'invalid' };

  await payload.update({ collection: 'activiteiten', id: idee.id, data: { fase: 'ingediend' }, context: { skipWorkflow: true } });
  await meldNieuwIdeeAanRedactie(payload, idee.title, idee.id);
  return { status: 'success' };
}

/** Klik op "intrekken": een idee dat nog niet is goedgekeurd verdwijnt helemaal, met de geüploade afbeelding. */
export async function trekIdeeIn(_prev: TokenState, formData: FormData): Promise<TokenState> {
  const payload = await getPayload({ config });
  const idee = await ideeBijToken(payload, str(formData, 'token'));
  if (!idee || !OPEN_IDEE_FASES.includes(idee.fase)) return { status: 'invalid' };

  await payload.delete({ collection: 'activiteiten', id: idee.id });
  const imageId = typeof idee.image === 'object' ? idee.image?.id : idee.image;
  if (imageId) {
    const media = await payload.findByID({ collection: 'media', id: imageId, depth: 0, disableErrors: true });
    if (media && !media.uploadedBy) await payload.delete({ collection: 'media', id: imageId });
  }
  return { status: 'success' };
}

// ---------------------------------------------------------------------------------------------
// Inschrijven en afmelden (flow 4)
// ---------------------------------------------------------------------------------------------

export type InschrijfFormState =
  | { status: 'idle' }
  | { status: 'success'; mode: 'aanmelden' | 'afmelden' }
  | { status: 'gesloten' }
  | { status: 'error'; velden: { voornaam: string; email: string; opmerking: string } };

/**
 * Aanmelden of een afmeldlink aanvragen. Het antwoord is altijd hetzelfde, of het adres nu bekend is
 * of niet. Een al bevestigd adres is meteen actief en krijgt een mail met afmeldlink ("was jij dit niet?").
 */
export async function submitInschrijving(_prev: InschrijfFormState, formData: FormData): Promise<InschrijfFormState> {
  const mode = formData.get('mode') === 'afmelden' ? 'afmelden' : 'aanmelden';
  if (formData.get('website')) return { status: 'success', mode };

  const velden = {
    voornaam: str(formData, 'voornaam'),
    email: str(formData, 'email').toLowerCase(),
    opmerking: str(formData, 'opmerking'),
  };
  const locale = localeVan(formData);
  const activiteitId = Number(formData.get('activiteit'));
  const fout = { status: 'error' as const, velden };

  if (!Number.isInteger(activiteitId) || velden.email.length > 254 || !EMAIL_RE.test(velden.email)) return fout;
  if (mode === 'aanmelden' && (!velden.voornaam || velden.voornaam.length > 60 || velden.opmerking.length > 500)) return fout;

  try {
    const payload = await getPayload({ config });
    const activiteit = await payload.findByID({ collection: 'activiteiten', id: activiteitId, depth: 0, disableErrors: true });
    if (!activiteit || !ACTIEVE_FASES.includes(activiteit.fase)) return fout;

    const { docs } = await payload.find({
      collection: 'activiteit-inschrijvingen',
      where: { and: [{ activiteit: { equals: activiteitId } }, { email: { equals: velden.email } }] },
      depth: 0,
      limit: 1,
    });
    const bestaand = docs[0];
    const now = new Date().toISOString();
    const t = await titels(payload, activiteitId);

    if (mode === 'afmelden') {
      if (bestaand && bestaand.status !== 'afgemeld' && !recentGemaild(bestaand.laatsteMailOp)) {
        await payload.update({ collection: 'activiteit-inschrijvingen', id: bestaand.id, data: { laatsteMailOp: now } });
        await verstuur(afmeldlinkMail(velden.email, bestaand.locale ?? locale, t[bestaand.locale ?? locale], bestaand.token));
      }
      return { status: 'success', mode };
    }

    if (!(await heeftPlek(payload, activiteit))) return { status: 'gesloten' };
    if (bestaand && (bestaand.status === 'actief' || recentGemaild(bestaand.laatsteMailOp))) return { status: 'success', mode };

    const bekend = await isBevestigdAdres(payload, velden.email);
    // Nieuw token, zodat een oude bevestigings- of afmeldlink niet meer werkt.
    const token = nieuwToken();
    const data = {
      voornaam: velden.voornaam,
      opmerking: velden.opmerking || null,
      locale,
      token,
      laatsteMailOp: now,
      ...(bekend ? { status: 'actief' as const, bevestigdOp: now, afgemeldOp: null } : { status: 'pending' as const }),
    };
    if (bestaand) {
      await payload.update({ collection: 'activiteit-inschrijvingen', id: bestaand.id, data });
    } else {
      await payload.create({ collection: 'activiteit-inschrijvingen', data: { ...data, activiteit: activiteitId, email: velden.email } });
    }

    if (bekend) {
      await verstuur(ingeschrevenMail(velden.email, locale, t[locale], activiteit.slug, token));
      await naAanmelding(payload, activiteit, velden);
    } else {
      await verstuur(inschrijvingBevestigenMail(velden.email, locale, t[locale], token));
    }
    return { status: 'success', mode };
  } catch (error) {
    console.error(`[activiteiten] ${mode} mislukt`, error);
    return fout;
  }
}

async function inschrijvingBijToken(payload: Payload, token: string) {
  if (!TOKEN_RE.test(token)) return null;
  const { docs } = await payload.find({
    collection: 'activiteit-inschrijvingen',
    where: { token: { equals: token } },
    depth: 0,
    limit: 1,
  });
  return docs[0] ?? null;
}

/** Klik op "bevestigen" achter de link in de bevestigingsmail. Alleen zolang er plek is. */
export async function bevestigInschrijving(_prev: TokenState, formData: FormData): Promise<TokenState> {
  const payload = await getPayload({ config });
  const inschrijving = await inschrijvingBijToken(payload, str(formData, 'token'));
  if (!inschrijving) return { status: 'invalid' };
  if (inschrijving.status === 'actief') return { status: 'success' };
  // Een oude bevestigingslink mag een afmelding niet terugdraaien; daarvoor meld je je opnieuw aan.
  if (inschrijving.status === 'afgemeld') return { status: 'invalid' };

  const activiteitId = typeof inschrijving.activiteit === 'object' ? inschrijving.activiteit.id : inschrijving.activiteit;
  const activiteit = await payload.findByID({ collection: 'activiteiten', id: activiteitId, depth: 0, disableErrors: true });
  if (!activiteit || !(await heeftPlek(payload, activiteit))) return { status: 'gesloten' };

  await payload.update({
    collection: 'activiteit-inschrijvingen',
    id: inschrijving.id,
    data: { status: 'actief', bevestigdOp: new Date().toISOString(), afgemeldOp: null },
  });
  await naAanmelding(payload, activiteit, inschrijving);
  return { status: 'success' };
}

/** Klik op "afmelden" achter de afmeldlink (in elke mail over de activiteit). */
export async function afmeldenInschrijving(_prev: TokenState, formData: FormData): Promise<TokenState> {
  const payload = await getPayload({ config });
  const inschrijving = await inschrijvingBijToken(payload, str(formData, 'token'));
  if (!inschrijving) return { status: 'invalid' };
  if (inschrijving.status === 'afgemeld') return { status: 'success' };

  await payload.update({
    collection: 'activiteit-inschrijvingen',
    id: inschrijving.id,
    data: { status: 'afgemeld', afgemeldOp: new Date().toISOString(), laatsteMailOp: null },
  });
  return { status: 'success' };
}

