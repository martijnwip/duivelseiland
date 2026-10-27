import type { Payload, PayloadRequest } from 'payload';

/** Rem op het Resend-quotum (gratis: 100 per dag). Berichten aan deelnemers en de nieuwsbrief samen. */
export const BULK_DAGLIMIET = Number(process.env.ACTIVITEITEN_MAIL_DAGLIMIET) || 80;
/** Deel van het quotum voor de nieuwsbrief; de rest blijft over voor berichten van organisatoren. */
export const NIEUWSBRIEF_DAGLIMIET = Number(process.env.NIEUWSBRIEF_DAGLIMIET) || 60;

/**
 * Bulkmails van vandaag: nieuwsbrief-verzendingen plus seintjes over nieuwe ideeën (samen `nieuwsbrief`) en
 * ontvangers van berichten aan deelnemers. Vandaag is de UTC-dag, net als het dagquotum van Resend (reset om
 * middernacht UTC). Een schuivend venster van 24 uur liet de dagelijkse cron soms een dag overslaan.
 */
export async function bulkMailsVandaag(payload: Payload, req?: PayloadRequest) {
  const sinds = new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString();
  const [{ totalDocs: edities }, { totalDocs: seintjes }, { docs: berichten }] = await Promise.all([
    payload.count({
      collection: 'nieuwsbrief-verzendingen',
      where: { and: [{ status: { equals: 'verzonden' } }, { verzondenOp: { greater_than_equal: sinds } }] },
      overrideAccess: true,
      req,
    }),
    payload.count({ collection: 'nieuwsbrief-abonnees', where: { ideeenGemaildOp: { greater_than_equal: sinds } }, overrideAccess: true, req }),
    payload.find({
      collection: 'activiteit-berichten',
      where: { createdAt: { greater_than_equal: sinds } },
      select: { aantalOntvangers: true },
      pagination: false,
      depth: 0,
      overrideAccess: true,
      req,
    }),
  ]);
  return { nieuwsbrief: edities + seintjes, berichten: berichten.reduce((som, b) => som + (b.aantalOntvangers ?? 0), 0) };
}
