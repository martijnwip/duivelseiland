import type { Endpoint, PayloadHandler, PayloadRequest } from 'payload';
import { APIError } from 'payload';
import { hasRoleAtLeast } from '../access/roles';
import { bulkmailToegestaan, verstuur, type Locale } from '../lib/mail';
import { editieMail, renderEditie } from '../lib/nieuwsbrief/editieMail';
import { ontvangers, startEditie, stopEditie, verwachteDagen } from '../lib/nieuwsbrief/verzenden';

/** Endpoints op /api/nieuwsbrief-edities/:id/…, alleen voor redacteur en admin (knoppen: EditieKnoppen). */

const TESTMAIL_INTERVAL_MS = 60 * 1000;
// Per serverinstantie; genoeg om per ongeluk dubbelklikken op "Testmail" af te remmen.
const laatsteTestmail = new Map<number, number>();

const localeVan = (req: PayloadRequest): Locale => (req.searchParams.get('locale') === 'en' ? 'en' : 'nl');

/** Alleen redactie; geeft het editie-id, of een foutantwoord. */
function redactie(handler: (req: PayloadRequest, id: number) => Promise<Response>): PayloadHandler {
  return async (req) => {
    if (!hasRoleAtLeast(req.user?.role, 'redacteur')) return Response.json({ message: 'Alleen voor de redactie.' }, { status: 403 });
    const id = Number(req.routeParams?.id);
    if (!Number.isInteger(id)) return Response.json({ message: 'Onbekende editie.' }, { status: 404 });
    try {
      return await handler(req, id);
    } catch (error) {
      if (error instanceof APIError) return Response.json({ message: error.message }, { status: error.status });
      req.payload.logger.error(`[nieuwsbrief] ${req.url} mislukt: ${error}`);
      return Response.json({ message: 'Er ging iets mis. Probeer het opnieuw.' }, { status: 500 });
    }
  };
}

export const editieEndpoints: Endpoint[] = [
  {
    // De mail zoals een abonnee hem krijgt (zonder aanhef), om in de browser te bekijken. Kost geen quotum.
    path: '/:id/voorbeeld',
    method: 'get',
    handler: redactie(async (req, id) => {
      const gerenderd = await renderEditie(req.payload, id, localeVan(req), req);
      const mail = editieMail(gerenderd, { email: req.user!.email, naam: null, token: '' }, { test: true });
      return new Response(mail.html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }),
  },
  {
    // Voor de bevestigingsstap: hoeveel ontvangers, per taal, hoe lang het duurt en of de Engelse versie leeg is.
    path: '/:id/ontvangers',
    method: 'get',
    handler: redactie(async (req, id) => {
      const [{ ids, nl, en }, engels] = await Promise.all([
        ontvangers(req.payload, req),
        req.payload.findByID({ collection: 'nieuwsbrief-edities', id, depth: 0, locale: 'en', fallbackLocale: false, overrideAccess: true, req }),
      ]);
      return Response.json({ totaal: ids.length, nl, en, dagen: verwachteDagen(ids.length), engelsLeeg: !engels.onderwerp?.trim(), opProductie: bulkmailToegestaan() });
    }),
  },
  {
    // De NL- en de EN-versie naar het eigen adres.
    path: '/:id/testmail',
    method: 'post',
    handler: redactie(async (req, id) => {
      const vorige = laatsteTestmail.get(id);
      if (vorige && Date.now() - vorige < TESTMAIL_INTERVAL_MS) {
        return Response.json({ message: 'Wacht een minuut voor de volgende testmail.' }, { status: 429 });
      }
      laatsteTestmail.set(id, Date.now());
      const ontvanger = { email: req.user!.email, naam: req.user!.name ?? null, token: '' };
      for (const locale of ['nl', 'en'] as const) {
        await verstuur(editieMail(await renderEditie(req.payload, id, locale, req), ontvanger, { test: true }));
      }
      return Response.json({ message: `Testmail (NL en EN) verstuurd naar ${ontvanger.email}.` });
    }),
  },
  {
    path: '/:id/versturen',
    method: 'post',
    handler: redactie(async (req, id) => Response.json(await startEditie(req.payload, id, Number(req.user!.id), req))),
  },
  {
    path: '/:id/stoppen',
    method: 'post',
    handler: redactie(async (req, id) => {
      await stopEditie(req.payload, id, req);
      return Response.json({ ok: true });
    }),
  },
];
