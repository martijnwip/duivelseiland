import type { Endpoint, Where } from 'payload';

const DAG = 24 * 60 * 60 * 1000;
const geleden = (dagen: number) => new Date(Date.now() - dagen * DAG).toISOString();

/**
 * GET /api/activiteiten-opruimen, dagelijks via Vercel Cron (vercel.json). Bewaartermijnen uit
 * docs/brief-activiteiten.md, sectie 11:
 * - onbevestigde ideeën na 7 dagen weg (met hun afbeelding);
 * - afgewezen ideeën na 30 dagen weg (met hun afbeelding);
 * - aanmeldingen en berichten 90 dagen na afgelopen/afgelast weg; de activiteit zelf blijft.
 */
export const activiteitenOpruimenEndpoint: Endpoint = {
  path: '/activiteiten-opruimen',
  method: 'get',
  handler: async (req) => {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
      return Response.json({ error: 'Niet toegestaan.' }, { status: 401 });
    }
    const { payload } = req;

    const teVerwijderen: Where = {
      or: [
        { and: [{ fase: { equals: 'onbevestigd' } }, { createdAt: { less_than: geleden(7) } }] },
        { and: [{ fase: { equals: 'afgewezen' } }, { updatedAt: { less_than: geleden(30) } }] },
      ],
    };
    const { docs: ideeen } = await payload.find({
      collection: 'activiteiten',
      where: teVerwijderen,
      depth: 0,
      pagination: false,
      overrideAccess: true,
    });
    for (const idee of ideeen) {
      // beforeDelete ruimt ook eventuele aanmeldingen en berichten op.
      await payload.delete({ collection: 'activiteiten', id: idee.id, overrideAccess: true });
      const imageId = typeof idee.image === 'object' ? idee.image?.id : idee.image;
      // Alleen een anoniem geüploade afbeelding (van het formulier), niet iets uit de mediabibliotheek.
      if (imageId) {
        const media = await payload.findByID({ collection: 'media', id: imageId, depth: 0, overrideAccess: true, disableErrors: true });
        if (media && !media.uploadedBy) await payload.delete({ collection: 'media', id: imageId, overrideAccess: true });
      }
    }

    const { docs: afgerond } = await payload.find({
      collection: 'activiteiten',
      where: { and: [{ fase: { in: ['afgelopen', 'afgelast'] } }, { updatedAt: { less_than: geleden(90) } }] },
      select: { fase: true },
      depth: 0,
      pagination: false,
      overrideAccess: true,
    });
    const ids = afgerond.map((a) => a.id);
    let gegevens = 0;
    if (ids.length) {
      for (const collection of ['activiteit-inschrijvingen', 'activiteit-berichten'] as const) {
        const { docs } = await payload.delete({ collection, where: { activiteit: { in: ids } }, overrideAccess: true });
        gegevens += docs.length;
      }
    }

    return Response.json({ ok: true, ideeenVerwijderd: ideeen.length, gegevensVerwijderd: gegevens });
  },
};
