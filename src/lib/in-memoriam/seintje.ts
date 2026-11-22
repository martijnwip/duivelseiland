import type { Endpoint } from 'payload';
import { isAdmin } from '../../access/isAdmin';
import { BULK_DAGLIMIET, bulkMailsVandaag } from '../mailQuotum';
import { bulkmailToegestaan, verstuurBatch } from '../mail';
import { fotoSeintjeMail } from './mail';

type Foto = { toegevoegdOp?: string | null };

/** Foto's die na het vorige seintje zijn toegevoegd (zonder vorig seintje: allemaal). */
export function nieuweFotos(fotos: Foto[] | null | undefined, laatsteSeintjeOp: string | null | undefined): Foto[] {
  const sinds = laatsteSeintjeOp ? new Date(laatsteSeintjeOp).getTime() : 0;
  return (fotos ?? []).filter((f) => f.toegevoegdOp && new Date(f.toegevoegdOp).getTime() > sinds);
}

/**
 * POST /api/in-memoriam/:id/seintje: mailt iedereen die om een bericht vroeg dat er foto's bij zijn.
 * Alleen de admin. Op productie gaan de mails echt uit (zie bulkmailToegestaan), elders worden ze gelogd.
 * Past het niet in het dagquotum van de mailprovider, dan gaat er niets uit en kan het morgen.
 */
export const fotoSeintjeEndpoint: Endpoint = {
  path: '/:id/seintje',
  method: 'post',
  handler: async (req) => {
    if (!isAdmin({ req } as never)) return Response.json({ error: 'Alleen voor de admin.' }, { status: 403 });

    const doc = await req.payload.findByID({
      collection: 'in-memoriam',
      id: Number(req.routeParams?.id),
      depth: 0,
      locale: 'nl',
      disableErrors: true,
      overrideAccess: true,
    });
    if (!doc) return Response.json({ error: 'Pagina niet gevonden.' }, { status: 404 });
    if (doc.status !== 'published') return Response.json({ error: 'Publiceer de pagina eerst.' }, { status: 400 });

    const nieuw = nieuweFotos(doc.fotos, doc.laatsteSeintjeOp);
    if (!nieuw.length) return Response.json({ error: 'Er zijn geen nieuwe foto’s sinds het vorige seintje. Sla eerst op.' }, { status: 400 });

    const { docs: volgers } = await req.payload.find({
      collection: 'in-memoriam-volgers',
      where: { herdenking: { equals: doc.id } },
      depth: 0,
      pagination: false,
      overrideAccess: true,
    });

    const nu = new Date().toISOString();
    if (volgers.length) {
      const { nieuwsbrief, berichten } = await bulkMailsVandaag(req.payload);
      const over = BULK_DAGLIMIET - nieuwsbrief - berichten;
      if (volgers.length > over) {
        return Response.json(
          { error: `Vandaag kunnen er nog ${Math.max(0, over)} mails uit en er zijn ${volgers.length} ontvangers. Probeer het morgen opnieuw.` },
          { status: 429 },
        );
      }

      const mails = volgers.map((v) => fotoSeintjeMail(v.email, v.locale === 'en' ? 'en' : 'nl', doc.naam, doc.slug, nieuw.length, v.afmeldToken));
      try {
        await verstuurBatch(mails, { idempotencyKey: `in-memoriam-${doc.id}-${nieuw.at(-1)?.toegevoegdOp}` });
      } catch (error) {
        req.payload.logger.error(`[in-memoriam] seintje over foto's mislukt: ${error}`);
        return Response.json({ error: 'De mails konden niet worden verstuurd. Probeer het later opnieuw.' }, { status: 502 });
      }
      await req.payload.update({
        collection: 'in-memoriam-volgers',
        where: { id: { in: volgers.map((v) => v.id) } },
        data: { laatstGemaildOp: nu },
        overrideAccess: true,
      });
    }

    await req.payload.update({
      collection: 'in-memoriam',
      id: doc.id,
      data: { laatsteSeintjeOp: nu },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    return Response.json({ ontvangers: volgers.length, fotos: nieuw.length, echt: bulkmailToegestaan() });
  },
};
