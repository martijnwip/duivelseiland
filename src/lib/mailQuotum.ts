import type { Payload, PayloadRequest } from 'payload';

const DAG = 24 * 60 * 60 * 1000;

/** Rem op het Resend-quotum (gratis: 100 per dag). Berichten aan deelnemers en de nieuwsbrief samen. */
export const BULK_DAGLIMIET = Number(process.env.ACTIVITEITEN_MAIL_DAGLIMIET) || 80;
/** Deel van het quotum voor de nieuwsbrief; de rest blijft over voor berichten van organisatoren. */
export const NIEUWSBRIEF_DAGLIMIET = Number(process.env.NIEUWSBRIEF_DAGLIMIET) || 60;

/**
 * Bulkmails van de afgelopen 24 uur: nieuwsbrief-verzendingen plus seintjes over nieuwe ideeën (samen `nieuwsbrief`)
 * en ontvangers van berichten aan deelnemers.
 */
export async function bulkMailsLaatste24Uur(payload: Payload, req?: PayloadRequest) {
  const sinds = new Date(Date.now() - DAG).toISOString();
  const [{ totalDocs: edities }, { totalDocs: seintjes }, { docs: berichten }] = await Promise.all([
    payload.count({
      collection: 'nieuwsbrief-verzendingen',
      where: { and: [{ status: { equals: 'verzonden' } }, { verzondenOp: { greater_than: sinds } }] },
      overrideAccess: true,
      req,
    }),
    payload.count({ collection: 'nieuwsbrief-abonnees', where: { ideeenGemaildOp: { greater_than: sinds } }, overrideAccess: true, req }),
    payload.find({
      collection: 'activiteit-berichten',
      where: { createdAt: { greater_than: sinds } },
      select: { aantalOntvangers: true },
      pagination: false,
      depth: 0,
      overrideAccess: true,
      req,
    }),
  ]);
  return { nieuwsbrief: edities + seintjes, berichten: berichten.reduce((som, b) => som + (b.aantalOntvangers ?? 0), 0) };
}
