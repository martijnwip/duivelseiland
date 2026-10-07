import type { Payload } from 'payload';
import { nieuwToken } from '@/lib/nieuwsbrief/token';

/**
 * Nieuwsbrief aan of uit voor een adres waarvan we al weten dat het van de bezoeker is (buurtpas, of de
 * klik op de buurtpaslink). Daarom zonder aparte bevestigingsmail: direct actief of afgemeld.
 */
export async function zetNieuwsbrief(payload: Payload, email: string, { aan, locale }: { aan: boolean; locale: 'nl' | 'en' }) {
  const { docs } = await payload.find({
    collection: 'nieuwsbrief-abonnees',
    where: { email: { equals: email } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  });
  const abonnee = docs[0];
  const nu = new Date().toISOString();

  if (aan) {
    if (!abonnee) {
      await payload.create({
        collection: 'nieuwsbrief-abonnees',
        data: { email, status: 'actief', bron: 'formulier', locale, token: nieuwToken(), bevestigdOp: nu },
        overrideAccess: true,
      });
    } else if (abonnee.status !== 'actief') {
      await payload.update({
        collection: 'nieuwsbrief-abonnees',
        id: abonnee.id,
        data: { status: 'actief', locale, bevestigdOp: nu, afgemeldOp: null },
        overrideAccess: true,
      });
    }
  } else if (abonnee && abonnee.status !== 'afgemeld') {
    await payload.update({
      collection: 'nieuwsbrief-abonnees',
      id: abonnee.id,
      data: { status: 'afgemeld', afgemeldOp: nu, laatsteMailOp: null },
      overrideAccess: true,
    });
  }
}

/** Krijgt dit adres de nieuwsbrief? */
export async function krijgtNieuwsbrief(payload: Payload, email: string) {
  const { totalDocs } = await payload.count({
    collection: 'nieuwsbrief-abonnees',
    where: { and: [{ email: { equals: email } }, { status: { equals: 'actief' } }] },
    overrideAccess: true,
  });
  return totalDocs > 0;
}
