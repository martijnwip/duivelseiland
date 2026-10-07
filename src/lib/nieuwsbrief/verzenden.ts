import type { Payload, PayloadRequest } from 'payload';
import { APIError } from 'payload';
import { hasRoleAtLeast, type Role } from '../../access/roles';
import type { Locale } from '../mail';
import { bulkmailToegestaan, verstuurBatch } from '../mail';
import { BULK_DAGLIMIET, NIEUWSBRIEF_DAGLIMIET, bulkMailsLaatste24Uur } from '../mailQuotum';
import { editieMail, renderEditie, type GerenderdeEditie } from './editieMail';

/**
 * Versturen van een editie, verspreid over dagen (gratis Resend-plan). Bij de start krijgt elke actieve
 * abonnee een rij in `nieuwsbrief-verzendingen` (`wachtend`); daarna gaat er per run zoveel uit als het
 * dagquotum toelaat. De rest volgt met de dagelijkse cron (src/endpoints/nieuwsbriefVerzenden.ts).
 */

const DAG = 24 * 60 * 60 * 1000;
const fout = (bericht: string, status = 400) => new APIError(bericht, status, null, true);
// Alleen de verzendlogica mag status en tellingen van een editie zetten (zie NieuwsbriefEdities.ts).
const context = { verzending: true };

/**
 * Mag deze gebruiker een editie naar alle abonnees versturen? De admin altijd; een redacteur alleen als de
 * admin dat in Site-instellingen heeft aangezet (standaard uit, tegen per ongeluk versturen).
 */
export async function magVersturen(payload: Payload, role: Role | undefined, req?: PayloadRequest) {
  if (hasRoleAtLeast(role, 'admin')) return true;
  if (!hasRoleAtLeast(role, 'redacteur')) return false;
  const instellingen = await payload.findGlobal({ slug: 'site-instellingen', depth: 0, overrideAccess: true, req });
  return instellingen.nieuwsbrief?.redacteurMagVersturen === true;
}

/** Hoeveel nieuwsbriefmails er nu nog uit mogen. */
export async function beschikbaarBudget(payload: Payload, req?: PayloadRequest) {
  const { nieuwsbrief, berichten } = await bulkMailsLaatste24Uur(payload, req);
  return Math.max(0, Math.min(NIEUWSBRIEF_DAGLIMIET - nieuwsbrief, BULK_DAGLIMIET - nieuwsbrief - berichten));
}

/** Aantal dagen dat het versturen naar `aantal` ontvangers ongeveer duurt. */
export const verwachteDagen = (aantal: number) => Math.max(1, Math.ceil(aantal / NIEUWSBRIEF_DAGLIMIET));

/** Tellingen van de editie bijwerken, en de editie afsluiten als er niets meer wacht. */
async function werkEditieBij(payload: Payload, editieId: number, req?: PayloadRequest) {
  const [{ totalDocs: verzonden }, { totalDocs: wachtend }, editie] = await Promise.all([
    payload.count({ collection: 'nieuwsbrief-verzendingen', where: { and: [{ editie: { equals: editieId } }, { status: { equals: 'verzonden' } }] }, overrideAccess: true, req }),
    payload.count({ collection: 'nieuwsbrief-verzendingen', where: { and: [{ editie: { equals: editieId } }, { status: { equals: 'wachtend' } }] }, overrideAccess: true, req }),
    payload.findByID({ collection: 'nieuwsbrief-edities', id: editieId, depth: 0, overrideAccess: true, req }),
  ]);
  const klaar = editie.status === 'verzenden' && wachtend === 0;
  await payload.update({
    collection: 'nieuwsbrief-edities',
    id: editieId,
    data: { aantalVerzonden: verzonden, ...(klaar ? { status: 'verzonden', verzondenOp: new Date().toISOString() } : {}) },
    overrideAccess: true,
    context,
    req,
  });
}

/**
 * Verstuurt de oudste wachtende mails, tot het dagquotum op is. Buiten productie gebeurt er niets. Wie tussendoor is afgemeld, wordt
 * overgeslagen. Rijen worden pas na een geslaagde batch `verzonden`; bij een fout stopt de run en probeert
 * de volgende het opnieuw. De idempotency-key hangt aan de precieze set rijen, zodat een herhaalde batch
 * binnen 24 uur geen dubbele mails geeft.
 */
export async function verstuurPortie(payload: Payload, req?: PayloadRequest) {
  if (!bulkmailToegestaan()) return { verzonden: 0, overgeslagen: 0, geblokkeerd: true };
  const budget = await beschikbaarBudget(payload, req);
  if (budget === 0) return { verzonden: 0, overgeslagen: 0 };

  const { docs: rijen } = await payload.find({
    collection: 'nieuwsbrief-verzendingen',
    where: { status: { equals: 'wachtend' } },
    sort: 'id',
    limit: budget,
    depth: 0,
    overrideAccess: true,
    req,
  });

  const perEditie = new Map<number, typeof rijen>();
  for (const rij of rijen) {
    const editieId = typeof rij.editie === 'object' ? rij.editie.id : rij.editie;
    perEditie.set(editieId, [...(perEditie.get(editieId) ?? []), rij]);
  }

  let verzonden = 0;
  let overgeslagen = 0;
  for (const [editieId, editieRijen] of perEditie) {
    const abonneeIds = editieRijen.map((r) => (typeof r.abonnee === 'object' ? r.abonnee.id : r.abonnee));
    const { docs: abonnees } = await payload.find({
      collection: 'nieuwsbrief-abonnees',
      where: { id: { in: abonneeIds } },
      pagination: false,
      depth: 0,
      overrideAccess: true,
      req,
    });
    const actief = new Map(abonnees.filter((a) => a.status === 'actief').map((a) => [a.id, a]));

    const overslaan = editieRijen.filter((r) => !actief.has(typeof r.abonnee === 'object' ? r.abonnee.id : r.abonnee));
    if (overslaan.length) {
      await payload.update({
        collection: 'nieuwsbrief-verzendingen',
        where: { id: { in: overslaan.map((r) => r.id) } },
        data: { status: 'overgeslagen' },
        overrideAccess: true,
        req,
      });
      overgeslagen += overslaan.length;
    }

    const teVersturen = editieRijen.filter((r) => !overslaan.includes(r));
    const gerenderd = new Map<Locale, GerenderdeEditie>();
    for (let i = 0; i < teVersturen.length; i += 100) {
      const portie = teVersturen.slice(i, i + 100);
      const mails = [];
      for (const rij of portie) {
        const abonnee = actief.get(typeof rij.abonnee === 'object' ? rij.abonnee.id : rij.abonnee)!;
        const locale: Locale = abonnee.locale === 'en' ? 'en' : 'nl';
        if (!gerenderd.has(locale)) gerenderd.set(locale, await renderEditie(payload, editieId, locale, req));
        mails.push(editieMail(gerenderd.get(locale)!, abonnee));
      }
      try {
        await verstuurBatch(mails, {
          idempotencyKey: `nieuwsbrief-${editieId}-${portie[0].id}-${portie.at(-1)!.id}-${portie.length}`,
        });
      } catch (error) {
        payload.logger.error(`[nieuwsbrief] versturen van editie ${editieId} mislukt, volgende run probeert opnieuw: ${JSON.stringify(error)}`);
        await werkEditieBij(payload, editieId, req);
        return { verzonden, overgeslagen, fout: true };
      }
      await payload.update({
        collection: 'nieuwsbrief-verzendingen',
        where: { id: { in: portie.map((r) => r.id) } },
        data: { status: 'verzonden', verzondenOp: new Date().toISOString() },
        overrideAccess: true,
        req,
      });
      verzonden += portie.length;
    }
    await werkEditieBij(payload, editieId, req);
  }
  return { verzonden, overgeslagen };
}

/** Wie de editie krijgt: alle actieve abonnees, per taal geteld. */
export async function ontvangers(payload: Payload, req?: PayloadRequest) {
  const { docs } = await payload.find({
    collection: 'nieuwsbrief-abonnees',
    where: { status: { equals: 'actief' } },
    select: { locale: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
    req,
  });
  return { ids: docs.map((d) => d.id), nl: docs.filter((d) => d.locale !== 'en').length, en: docs.filter((d) => d.locale === 'en').length };
}

/** Start het versturen: rijen voor alle actieve abonnees, dan meteen de eerste portie. */
export async function startEditie(payload: Payload, id: number, userId: number, req?: PayloadRequest) {
  if (!bulkmailToegestaan()) {
    throw fout('Versturen naar alle abonnees kan alleen op de productiesite. Gebruik hier Voorbeeld of Testmail.');
  }
  const editie = await payload.findByID({ collection: 'nieuwsbrief-edities', id, depth: 0, locale: 'nl', overrideAccess: true, req });
  if (editie.status !== 'concept') throw fout('Deze editie is al verstuurd of wordt verstuurd.');
  if (!editie.onderwerp?.trim()) throw fout('Vul eerst een onderwerp in.');

  const { ids } = await ontvangers(payload, req);
  if (!ids.length) throw fout('Er zijn nog geen actieve abonnees.');

  // Eerst de status, zodat een tweede klik op Versturen niet nog een set rijen aanmaakt.
  await payload.update({
    collection: 'nieuwsbrief-edities',
    id,
    data: { status: 'verzenden', gestartOp: new Date().toISOString(), gestartDoor: userId, aantalOntvangers: ids.length, aantalVerzonden: 0 },
    overrideAccess: true,
    context,
    req,
  });
  for (const abonnee of ids) {
    await payload.create({ collection: 'nieuwsbrief-verzendingen', data: { editie: id, abonnee, status: 'wachtend' }, overrideAccess: true, req });
  }

  const portie = await verstuurPortie(payload, req);
  return { ontvangers: ids.length, ...portie, dagen: verwachteDagen(ids.length) };
}

/** Stopt het versturen: wat nog wacht, wordt overgeslagen. Wat al weg is, blijft weg. */
export async function stopEditie(payload: Payload, id: number, req?: PayloadRequest) {
  const editie = await payload.findByID({ collection: 'nieuwsbrief-edities', id, depth: 0, overrideAccess: true, req });
  if (editie.status !== 'verzenden') throw fout('Deze editie wordt niet verstuurd.');
  await payload.update({ collection: 'nieuwsbrief-edities', id, data: { status: 'gestopt' }, overrideAccess: true, context, req });
  await payload.update({
    collection: 'nieuwsbrief-verzendingen',
    where: { and: [{ editie: { equals: id } }, { status: { equals: 'wachtend' } }] },
    data: { status: 'overgeslagen' },
    overrideAccess: true,
    req,
  });
  await werkEditieBij(payload, id, req);
}

/** Verzendrijen van afgeronde edities na 30 dagen weg; de tellingen op de editie blijven. */
export async function ruimVerzendingenOp(payload: Payload) {
  const { docs: edities } = await payload.find({
    collection: 'nieuwsbrief-edities',
    where: { and: [{ status: { in: ['verzonden', 'gestopt'] } }, { updatedAt: { less_than: new Date(Date.now() - 30 * DAG).toISOString() } }] },
    select: { status: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  });
  if (!edities.length) return 0;
  const { docs } = await payload.delete({
    collection: 'nieuwsbrief-verzendingen',
    where: { editie: { in: edities.map((e) => e.id) } },
    overrideAccess: true,
  });
  return docs.length;
}
