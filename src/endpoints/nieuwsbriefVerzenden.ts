import type { Endpoint } from 'payload';
import { verstuurIdeeenSeintjes } from '../lib/activiteiten/seintjes';
import { ruimVerzendingenOp, verstuurPortie } from '../lib/nieuwsbrief/verzenden';

/**
 * GET /api/nieuwsbrief-verzenden, dagelijks via Vercel Cron (vercel.json): eerst de seintjes over nieuwe
 * ideeën (klein en tijdgebonden, src/lib/activiteiten/seintjes.ts), dan de volgende portie van edities die nog
 * worden verstuurd (src/lib/nieuwsbrief/verzenden.ts), en verzendrijen van afgeronde edities na 30 dagen weg.
 */
export const nieuwsbriefVerzendenEndpoint: Endpoint = {
  path: '/nieuwsbrief-verzenden',
  method: 'get',
  handler: async (req) => {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
      return Response.json({ error: 'Niet toegestaan.' }, { status: 401 });
    }
    const ideeen = await verstuurIdeeenSeintjes(req.payload);
    const portie = await verstuurPortie(req.payload);
    const opgeruimd = await ruimVerzendingenOp(req.payload);
    return Response.json({ ok: true, ideeen, ...portie, opgeruimd });
  },
};
