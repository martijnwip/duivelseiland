import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, Payload, PayloadRequest } from 'payload';
import { APIError } from 'payload';
import { hasRoleAtLeast } from '../../access/roles';
import { synchroniseerAgenda } from './agenda';
import { ACTIEVE_FASES, ORGANISATOR_OVERGANGEN, type Fase } from './constants';
import { faseMail, ideeAfgewezenMail, ideeGoedgekeurdMail, redactieNieuwIdeeMail, verstuur, verstuurBatch, type Locale } from './mail';

type Id = number;
const idVan = (value: unknown): Id | null =>
  value == null ? null : typeof value === 'object' ? ((value as { id?: Id }).id ?? null) : (value as Id);

const fout = (bericht: string, status = 400) => new APIError(bericht, status, null, true);

/** Titel per taal (met terugval op Nederlands), voor mails in de taal van de ontvanger. */
export async function titels(payload: Payload, id: Id, req?: PayloadRequest): Promise<Record<Locale, string>> {
  const doc = await payload.findByID({ collection: 'activiteiten', id, locale: 'all', depth: 0, overrideAccess: true, req });
  const title = doc.title as unknown as Partial<Record<Locale, string>> | string;
  if (typeof title === 'string') return { nl: title, en: title };
  return { nl: title.nl ?? title.en ?? '', en: title.en || title.nl || '' };
}

/** E-mailadressen van alle redacteuren en admins. */
export async function redactieAdressen(payload: Payload, req?: PayloadRequest) {
  const { docs } = await payload.find({
    collection: 'users',
    where: { role: { in: ['redacteur', 'admin'] } },
    depth: 0,
    limit: 100,
    pagination: false,
    overrideAccess: true,
    req,
  });
  return docs.map((u) => u.email).filter(Boolean);
}

export async function meldNieuwIdeeAanRedactie(payload: Payload, titel: string, id: Id) {
  for (const to of await redactieAdressen(payload)) {
    try {
      await verstuur(redactieNieuwIdeeMail(to, titel, id));
    } catch (error) {
      payload.logger.error(`[activiteiten] melding nieuw idee aan ${to} mislukt: ${error}`);
    }
  }
}

/** Bestaande gebruiker bij dit adres, of een nieuwe met rol organisator. Een bestaande rol blijft staan. */
async function zorgVoorOrganisator(req: PayloadRequest, email: string, naam?: string | null): Promise<Id> {
  const { docs } = await req.payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  });
  if (docs[0]) return docs[0].id;
  req.context.skipInviteMail = true;
  const user = await req.payload.create({
    collection: 'users',
    data: { email, name: naam ?? undefined, role: 'organisator' },
    overrideAccess: true,
    req,
  });
  return user.id;
}

/**
 * Bewaakt de fase-overgangen (docs/brief-activiteiten.md, sectie 3) en koppelt bij goedkeuring de
 * aanvrager als eigenaar. Server actions draaien zonder `req.user` en vallen buiten de rolcontrole.
 */
export const activiteitBeforeChange: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  if (operation !== 'update' || !originalDoc) return data;
  const oud = originalDoc.fase as Fase;
  const nieuw = (data.fase ?? oud) as Fase;
  if (nieuw === oud) return data;

  if (req.user && !hasRoleAtLeast(req.user.role, 'redacteur')) {
    if (!ORGANISATOR_OVERGANGEN[oud]?.includes(nieuw)) {
      throw fout('Deze fasewijziging is voorbehouden aan de redactie.', 403);
    }
  }

  if (nieuw === 'afgewezen' && !String(data.afwijsReden ?? originalDoc.afwijsReden ?? '').trim()) {
    throw fout('Vul een reden in voordat je het idee afwijst; die wordt naar de aanvrager gemaild.');
  }

  // Een oude afwijsreden hoort niet meer bij een goedgekeurde activiteit (anders telt hij bij een volgende afkeuring).
  if (nieuw === 'goedgekeurd') data.afwijsReden = null;

  if (nieuw === 'goedgekeurd' && ['onbevestigd', 'ingediend', 'afgewezen'].includes(oud)) {
    if (!(data.slug ?? originalDoc.slug)) throw fout('Geef de activiteit een slug voordat je hem goedkeurt.');
    if (!idVan(data.eigenaar ?? originalDoc.eigenaar)) {
      const email = String(data.aanvragerEmail ?? originalDoc.aanvragerEmail ?? '').trim().toLowerCase();
      if (!email) throw fout('Er is geen eigenaar en geen e-mailadres van de aanvrager.');
      data.eigenaar = await zorgVoorOrganisator(req, email, data.aanvragerNaam ?? originalDoc.aanvragerNaam);
    }
  }
  return data;
};

/** Mails en vervolgstappen na een fasewissel. Fouten bij versturen worden gelogd, niet teruggegeven. */
export const activiteitAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req, context }) => {
  if (operation !== 'update' || context.skipWorkflow) return doc;
  const { payload } = req;

  // Bij elke wijziging (ook titel, tekst of datum) het agenda-item bijwerken.
  try {
    await synchroniseerAgenda(payload, doc.id, req);
  } catch (error) {
    payload.logger.error(`[activiteiten] agenda bijwerken mislukt voor ${doc.id}: ${error}`);
  }

  const oud = previousDoc?.fase as Fase | undefined;
  const nieuw = doc.fase as Fase;
  if (!oud || oud === nieuw) return doc;

  const locale: Locale = doc.locale === 'en' ? 'en' : 'nl';

  try {
    const t = await titels(payload, doc.id, req);

    if (nieuw === 'goedgekeurd' && ['onbevestigd', 'ingediend', 'afgewezen'].includes(oud)) {
      const eigenaarId = idVan(doc.eigenaar);
      const eigenaar = eigenaarId
        ? await payload.findByID({ collection: 'users', id: eigenaarId, depth: 0, overrideAccess: true, req })
        : null;
      if (eigenaar?.email) await verstuur(ideeGoedgekeurdMail(eigenaar.email, locale, t[locale], doc.slug));
    }

    if (nieuw === 'afgewezen' && doc.aanvragerEmail) {
      await verstuur(ideeAfgewezenMail(doc.aanvragerEmail, locale, t[locale], doc.afwijsReden ?? ''));
    }

    // Afgelast, of door de redactie afgekeurd terwijl hij al online stond: deelnemers horen dat het niet doorgaat.
    const stopt = (nieuw === 'afgelast' || nieuw === 'afgewezen') && ACTIEVE_FASES.includes(oud);
    if ((nieuw === 'gaat-door' && oud === 'goedgekeurd') || stopt) {
      const eigenaarId = idVan(doc.eigenaar);
      const eigenaar = eigenaarId
        ? await payload.findByID({ collection: 'users', id: eigenaarId, depth: 0, overrideAccess: true, req })
        : null;
      const { docs: deelnemers } = await payload.find({
        collection: 'activiteit-inschrijvingen',
        where: { and: [{ activiteit: { equals: doc.id } }, { status: { equals: 'actief' } }] },
        depth: 0,
        pagination: false,
        overrideAccess: true,
        req,
      });
      await verstuurBatch(
        deelnemers.map((d) => {
          const l: Locale = d.locale === 'en' ? 'en' : 'nl';
          return faseMail({
            to: d.email,
            locale: l,
            titel: t[l],
            slug: doc.slug,
            fase: nieuw === 'gaat-door' ? 'gaat-door' : 'afgelast',
            datum: doc.datum,
            token: d.token,
            replyTo: eigenaar?.email,
          });
        }),
      );
    }

  } catch (error) {
    payload.logger.error(`[activiteiten] vervolgstap na fase ${oud} → ${nieuw} mislukt voor ${doc.id}: ${error}`);
  }
  return doc;
};
