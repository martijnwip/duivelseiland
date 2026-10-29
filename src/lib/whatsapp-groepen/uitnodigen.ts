import type { Endpoint } from 'payload';
import { isRedacteurOrAdmin } from '../../access/isAdmin';
import { verstuur } from '../mail';
import { uitnodigingMail } from './mail';

/**
 * POST /api/whatsapp-aanmeldingen/:id/uitnodigen — mailt de aanvrager de uitnodigingslink van de Buren-app
 * (uit Site-instellingen). Wie alleen voor de Buren-app kwam, staat daarna op "Toegevoegd" (nummer gewist);
 * met ook de Schoonmaak blijft de aanmelding open, want die groep voegt de redactie met de hand toe.
 */
export const uitnodigenEndpoint: Endpoint = {
  path: '/:id/uitnodigen',
  method: 'post',
  handler: async (req) => {
    if (!isRedacteurOrAdmin({ req } as never)) return Response.json({ error: 'Alleen voor de redactie.' }, { status: 403 });

    const aanmelding = await req.payload.findByID({
      collection: 'whatsapp-aanmeldingen',
      id: Number(req.routeParams?.id),
      depth: 0,
      disableErrors: true,
      overrideAccess: true,
    });
    if (!aanmelding) return Response.json({ error: 'Aanmelding niet gevonden.' }, { status: 404 });
    if (!aanmelding.groepen.includes('buurt')) {
      return Response.json({ error: 'Deze aanmelding is niet voor de Buren-app.' }, { status: 400 });
    }

    const instellingen = await req.payload.findGlobal({ slug: 'site-instellingen', depth: 0, overrideAccess: true });
    const link = instellingen.whatsapp?.buurtUitnodiging?.trim();
    if (!link) {
      return Response.json({ error: 'Zet eerst de uitnodigingslink in Site-instellingen (alleen de admin kan dat).' }, { status: 400 });
    }

    const ookSchoonmaak = aanmelding.groepen.includes('schoonmaak');
    try {
      await verstuur(uitnodigingMail(aanmelding.email, aanmelding.locale === 'en' ? 'en' : 'nl', aanmelding.naam, link, ookSchoonmaak));
    } catch (error) {
      req.payload.logger.error(`[whatsapp] uitnodiging aan ${aanmelding.email} mislukt: ${error}`);
      return Response.json({ error: 'De mail kon niet worden verstuurd. Probeer het later opnieuw.' }, { status: 502 });
    }

    await req.payload.update({
      collection: 'whatsapp-aanmeldingen',
      id: aanmelding.id,
      data: { uitgenodigdOp: new Date().toISOString(), ...(ookSchoonmaak ? {} : { status: 'toegevoegd' as const }) },
      overrideAccess: true,
    });
    return Response.json({ email: aanmelding.email, toegevoegd: !ookSchoonmaak });
  },
};
