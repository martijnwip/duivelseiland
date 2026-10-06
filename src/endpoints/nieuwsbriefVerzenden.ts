import type { Endpoint } from 'payload';
import { ruimVerzendingenOp, verstuurPortie } from '../lib/nieuwsbrief/verzenden';

/**
 * GET /api/nieuwsbrief-verzenden, dagelijks via Vercel Cron (vercel.json): de volgende portie van edities
 * die nog worden verstuurd (src/lib/nieuwsbrief/verzenden.ts), en verzendrijen van afgeronde edities na
 * 30 dagen weg.
 */
export const nieuwsbriefVerzendenEndpoint: Endpoint = {
  path: '/nieuwsbrief-verzenden',
  method: 'get',
  handler: async (req) => {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
      return Response.json({ error: 'Niet toegestaan.' }, { status: 401 });
    }
    const portie = await verstuurPortie(req.payload);
    const opgeruimd = await ruimVerzendingenOp(req.payload);
    return Response.json({ ok: true, ...portie, opgeruimd });
  },
};
