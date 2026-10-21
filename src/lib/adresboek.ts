import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload, PayloadRequest } from 'payload';
import { heeftPlek, naAanmelding } from './activiteiten/deelnemers';
import { meldNieuwIdeeAanRedactie } from './activiteiten/workflow';

/**
 * Adresboek (collection `email-adressen`): één rij per e-mailadres dat ergens op de site voorkomt, met de
 * vraag of het adres bevestigd is. Alleen voor de admin. De rijen ontstaan vanzelf via de hooks hieronder;
 * de admin kan bevestigen, intrekken, toevoegen en verwijderen (zie src/collections/EmailAdressen.ts).
 */

export const normaliseerEmail = (email: string) => email.trim().toLowerCase();

/** Is dit adres bevestigd? Dan hoeft het bij een idee of aanmelding niet opnieuw per mail te bevestigen. */
export async function isBevestigdAdres(payload: Payload, email: string) {
  const { totalDocs } = await payload.count({
    collection: 'email-adressen',
    where: { and: [{ email: { equals: normaliseerEmail(email) } }, { bevestigd: { equals: true } }] },
  });
  return totalDocs > 0;
}

export type AdresRegel = { lijst: string; naam: string; status: string; datum: string | null; href: string };

const titelVan = (value: unknown) =>
  typeof value === 'object' && value !== null ? String((value as { title?: string }).title ?? '') : '';

/** Alles wat er over dit adres bekend is, per bron. */
export async function regelsVoorAdres(payload: Payload, email: string, req?: PayloadRequest): Promise<AdresRegel[]> {
  const where = { email: { equals: email } };
  // Vaste taal: binnen een request met locale 'all' zou de titel anders een object per taal zijn.
  const opties = { depth: 1, pagination: false as const, overrideAccess: true, locale: 'nl' as const, req };
  const [nieuwsbrief, deelnemer, aanvrager, vaklui, whatsapp, gebruiker] = await Promise.all([
    payload.find({ collection: 'nieuwsbrief-abonnees', where, ...opties }),
    payload.find({ collection: 'activiteit-inschrijvingen', where, ...opties }),
    payload.find({ collection: 'activiteiten', where: { aanvragerEmail: { equals: email } }, ...opties, depth: 0 }),
    payload.find({ collection: 'vaklui', where: { aanmelderEmail: { equals: email } }, ...opties, depth: 0 }),
    payload.find({ collection: 'whatsapp-aanmeldingen', where, ...opties, depth: 0 }),
    payload.find({ collection: 'users', where, ...opties, depth: 0 }),
  ]);
  return [
    ...nieuwsbrief.docs.map((d) => ({
      lijst: 'Nieuwsbrief',
      naam: '',
      status: d.status,
      datum: d.bevestigdOp ?? d.createdAt,
      href: `/admin/collections/nieuwsbrief-abonnees/${d.id}`,
    })),
    ...aanvrager.docs.map((d) => ({
      lijst: `${d.title} (aanvrager)`,
      naam: d.aanvragerNaam ?? '',
      status: d.fase,
      datum: d.createdAt,
      href: `/admin/collections/activiteiten/${d.id}`,
    })),
    ...deelnemer.docs.map((d) => ({
      lijst: `${titelVan(d.activiteit)} (deelnemer)`,
      naam: d.voornaam,
      status: d.status,
      datum: d.bevestigdOp ?? d.createdAt,
      href: `/admin/collections/activiteit-inschrijvingen/${d.id}`,
    })),
    ...vaklui.docs.map((d) => ({
      lijst: `${d.naam} (vakman aangemeld)`,
      naam: d.aanmelderNaam ?? '',
      status: d.moderatie ?? '',
      datum: d.createdAt,
      href: `/admin/collections/vaklui/${d.id}`,
    })),
    ...whatsapp.docs.map((d) => ({
      lijst: 'WhatsApp-groep',
      naam: d.naam,
      status: d.status,
      datum: d.createdAt,
      href: `/admin/collections/whatsapp-aanmeldingen/${d.id}`,
    })),
    ...gebruiker.docs.map((d) => ({
      lijst: 'Gebruiker',
      naam: d.name ?? '',
      status: d.role,
      datum: d.createdAt,
      href: `/admin/collections/users/${d.id}`,
    })),
  ];
}

/** Korte samenvatting voor de kolom "Lijsten", bv. "Nieuwsbrief (actief) · Boekenclub (deelnemer, actief)". */
export function samenvatting(regels: AdresRegel[]) {
  if (!regels.length) return '—';
  return regels
    .map((r) => (r.lijst.endsWith(')') ? `${r.lijst.slice(0, -1)}, ${r.status})` : `${r.lijst} (${r.status})`))
    .join(' · ');
}

async function zoekRij(payload: Payload, email: string, req?: PayloadRequest) {
  const { docs } = await payload.find({
    collection: 'email-adressen',
    where: { email: { equals: email } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
  });
  return docs[0] ?? null;
}

/** Werkt de kolom "Lijsten" bij voor dit adres (als het in het adresboek staat). */
export async function werkLijstenBij(payload: Payload, email: string, req?: PayloadRequest) {
  const rij = await zoekRij(payload, email, req);
  if (!rij) return;
  const lijsten = samenvatting(await regelsVoorAdres(payload, email, req));
  if (lijsten === rij.lijsten) return;
  await payload.update({ collection: 'email-adressen', id: rij.id, data: { lijsten }, overrideAccess: true, req });
}

/**
 * Zet het adres in het adresboek. `bevestigd` maakt het hooguit bevestigd, nooit onbevestigd: dat laatste
 * is een beslissing van de admin.
 */
export async function registreerAdres(payload: Payload, ruw: string, { bevestigd, req }: { bevestigd: boolean; req?: PayloadRequest }) {
  const email = normaliseerEmail(ruw);
  if (!email) return;
  const rij = await zoekRij(payload, email, req);
  if (!rij) {
    await payload.create({ collection: 'email-adressen', data: { email, bevestigd }, overrideAccess: true, req });
  } else if (bevestigd && !rij.bevestigd) {
    await payload.update({ collection: 'email-adressen', id: rij.id, data: { bevestigd: true }, overrideAccess: true, req });
  }
  await werkLijstenBij(payload, email, req);
}

/**
 * Hooks voor een bron (nieuwsbrief, aanmeldingen, ideeën, gebruikers): houden het adresboek bij.
 * Fouten worden gelogd en nooit doorgegeven; opslaan van de bron gaat altijd voor.
 */
export function adresboekHooks<T>(
  emailVan: (doc: T) => string | null | undefined,
  bevestigdVan: (doc: T) => boolean,
): { afterChange: CollectionAfterChangeHook; afterDelete: CollectionAfterDeleteHook } {
  return {
    afterChange: async ({ doc, previousDoc, operation, req }) => {
      try {
        const email = emailVan(doc);
        const vorig = operation === 'update' ? emailVan(previousDoc) : null;
        if (vorig && (!email || normaliseerEmail(vorig) !== normaliseerEmail(email))) {
          await werkLijstenBij(req.payload, normaliseerEmail(vorig), req);
        }
        // Alleen een overgang naar bevestigd telt (nieuw, of net bevestigd). Anders zou een gewone wijziging,
        // zoals een login of een afmeldverzoek, een adres dat de admin op niet bevestigd zette terugzetten.
        const netBevestigd = bevestigdVan(doc) && (operation === 'create' || !bevestigdVan(previousDoc) || vorig !== email);
        if (email) await registreerAdres(req.payload, email, { bevestigd: netBevestigd, req });
      } catch (error) {
        req.payload.logger.error(`[adresboek] bijwerken mislukt: ${error}`);
      }
      return doc;
    },
    afterDelete: async ({ doc, req }) => {
      try {
        const email = emailVan(doc);
        if (email) await werkLijstenBij(req.payload, normaliseerEmail(email), req);
      } catch (error) {
        req.payload.logger.error(`[adresboek] bijwerken na verwijderen mislukt: ${error}`);
      }
      return doc;
    },
  };
}

/**
 * Een adres is (net) bevestigd: wat nog op bevestiging wachtte, gaat door. Een onbevestigd idee gaat naar
 * de redactie, een wachtende aanmelding wordt actief (als er plek is), een wachtende nieuwsbrief actief.
 */
export async function zetOpenstaandeDoor(payload: Payload, email: string, req?: PayloadRequest) {
  const now = new Date().toISOString();

  const { docs: ideeen } = await payload.find({
    collection: 'activiteiten',
    where: { and: [{ aanvragerEmail: { equals: email } }, { fase: { equals: 'onbevestigd' } }] },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  });
  for (const idee of ideeen) {
    await payload.update({ collection: 'activiteiten', id: idee.id, data: { fase: 'ingediend' }, overrideAccess: true, req });
    await meldNieuwIdeeAanRedactie(payload, idee.title, idee.id);
  }

  const { docs: aanmeldingen } = await payload.find({
    collection: 'activiteit-inschrijvingen',
    where: { and: [{ email: { equals: email } }, { status: { equals: 'pending' } }] },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  });
  for (const aanmelding of aanmeldingen) {
    const activiteitId = typeof aanmelding.activiteit === 'object' ? aanmelding.activiteit.id : aanmelding.activiteit;
    const activiteit = await payload.findByID({ collection: 'activiteiten', id: activiteitId, depth: 0, disableErrors: true, overrideAccess: true, req });
    if (!activiteit || !(await heeftPlek(payload, activiteit, req))) continue;
    await payload.update({
      collection: 'activiteit-inschrijvingen',
      id: aanmelding.id,
      data: { status: 'actief', bevestigdOp: now, afgemeldOp: null },
      overrideAccess: true,
      req,
    });
    await naAanmelding(payload, activiteit, aanmelding, req);
  }

  await payload.update({
    collection: 'nieuwsbrief-abonnees',
    where: { and: [{ email: { equals: email } }, { status: { equals: 'pending' } }] },
    data: { status: 'actief', bevestigdOp: now, afgemeldOp: null },
    overrideAccess: true,
    req,
  });
}

/**
 * Het adres moet overal weg ("vergeet mij"): nieuwsbrief, aanmeldingen en nog niet goedgekeurde ideeën
 * (met hun anoniem geüploade afbeelding). Bij goedgekeurde activiteiten verdwijnen alleen naam en e-mail
 * van de aanvrager; de activiteit en de andere deelnemers blijven. Zo ook bij aangemelde vaklui: een
 * open of afgekeurde aanmelding verdwijnt, bij een goedgekeurde alleen de gegevens van de aanmelder.
 * Aanmeldingen voor de WhatsApp-groepen verdwijnen helemaal.
 * Gebruikersaccounts blijven bestaan.
 */
export async function verwijderAdresOveral(payload: Payload, email: string, req?: PayloadRequest) {
  await payload.delete({ collection: 'nieuwsbrief-abonnees', where: { email: { equals: email } }, overrideAccess: true, req });
  await payload.delete({ collection: 'activiteit-inschrijvingen', where: { email: { equals: email } }, overrideAccess: true, req });
  await payload.delete({ collection: 'whatsapp-aanmeldingen', where: { email: { equals: email } }, overrideAccess: true, req });

  const { docs: activiteiten } = await payload.find({
    collection: 'activiteiten',
    where: { aanvragerEmail: { equals: email } },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  });
  for (const a of activiteiten) {
    if (['onbevestigd', 'ingediend', 'afgewezen'].includes(a.fase)) {
      await payload.delete({ collection: 'activiteiten', id: a.id, overrideAccess: true, req });
      const imageId = typeof a.image === 'object' ? a.image?.id : a.image;
      if (imageId) {
        const media = await payload.findByID({ collection: 'media', id: imageId, depth: 0, disableErrors: true, overrideAccess: true, req });
        if (media && !media.uploadedBy) await payload.delete({ collection: 'media', id: imageId, overrideAccess: true, req });
      }
    } else {
      await payload.update({
        collection: 'activiteiten',
        id: a.id,
        data: { aanvragerNaam: null, aanvragerEmail: null },
        overrideAccess: true,
        context: { skipWorkflow: true },
        req,
      });
    }
  }

  const { docs: vaklui } = await payload.find({
    collection: 'vaklui',
    where: { aanmelderEmail: { equals: email } },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  });
  for (const v of vaklui) {
    if (v.moderatie === 'goedgekeurd') {
      await payload.update({
        collection: 'vaklui',
        id: v.id,
        data: { aanmelderNaam: null, aanmelderEmail: null, aanmelderToelichting: null },
        overrideAccess: true,
        req,
      });
    } else {
      await payload.delete({ collection: 'vaklui', id: v.id, overrideAccess: true, req });
    }
  }
}

/**
 * Eenmalig (migratie): alle bestaande adressen in het adresboek zetten, met dezelfde regels als de hooks.
 * Zonder doorzetten van openstaande zaken; de migratie verandert verder niets.
 */
export async function vulAdresboek(payload: Payload, req?: PayloadRequest) {
  const opties = { depth: 0, pagination: false as const, overrideAccess: true, req };
  const [nieuwsbrief, deelnemers, ideeen, gebruikers] = await Promise.all([
    payload.find({ collection: 'nieuwsbrief-abonnees', ...opties }),
    payload.find({ collection: 'activiteit-inschrijvingen', ...opties }),
    payload.find({ collection: 'activiteiten', ...opties }),
    payload.find({ collection: 'users', ...opties }),
  ]);
  const adressen = new Map<string, boolean>();
  const zet = (email: string | null | undefined, bevestigd: boolean) => {
    if (!email) return;
    const e = normaliseerEmail(email);
    adressen.set(e, (adressen.get(e) ?? false) || bevestigd);
  };
  nieuwsbrief.docs.forEach((d) => zet(d.email, d.status === 'actief'));
  deelnemers.docs.forEach((d) => zet(d.email, d.status === 'actief'));
  ideeen.docs.forEach((d) => zet(d.aanvragerEmail, d.fase !== 'onbevestigd'));
  gebruikers.docs.forEach((d) => zet(d.email, true));

  for (const [email, bevestigd] of adressen) {
    if (await zoekRij(payload, email, req)) continue;
    await payload.create({
      collection: 'email-adressen',
      data: { email, bevestigd, lijsten: samenvatting(await regelsVoorAdres(payload, email, req)) },
      overrideAccess: true,
      context: { geenPromotie: true },
      req,
    });
  }
  return adressen.size;
}
