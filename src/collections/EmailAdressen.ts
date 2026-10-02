import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/isAdmin';
import { normaliseerEmail, regelsVoorAdres, verwijderAdresOveral, zetOpenstaandeDoor } from '../lib/adresboek';

/**
 * Adresboek: elk e-mailadres dat op de site voorkomt, in welke lijsten het staat en of het bevestigd is.
 * Alleen voor de admin. Een bevestigd adres hoeft bij een idee of aanmelding niet opnieuw per mail te
 * bevestigen (src/lib/adresboek.ts). Rijen ontstaan vanzelf; de admin kan ze ook zelf toevoegen.
 */
export const EmailAdressen: CollectionConfig = {
  slug: 'email-adressen',
  labels: { singular: 'E-mailadres', plural: 'E-mailadressen' },
  admin: {
    useAsTitle: 'email',
    group: 'Beheer',
    defaultColumns: ['email', 'bevestigd', 'lijsten', 'updatedAt'],
    description:
      'Alle e-mailadressen op de site. Bevestigd = hoeft niet opnieuw per mail te bevestigen. Bevestigen zet wat nog wacht door (idee naar de redactie, aanmelding en nieuwsbrief actief). Niet bevestigd geldt alleen voor nieuwe aanmeldingen. Verwijderen haalt het adres overal weg (nieuwsbrief, aanmeldingen, niet goedgekeurde ideeën); gebruikersaccounts beheer je bij Users.',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  endpoints: [
    {
      path: '/:id/overzicht',
      method: 'get',
      handler: async (req) => {
        if (!isAdmin({ req } as never)) return Response.json({ error: 'Alleen voor admins.' }, { status: 403 });
        const rij = await req.payload.findByID({
          collection: 'email-adressen',
          id: Number(req.routeParams?.id),
          depth: 0,
          disableErrors: true,
          overrideAccess: true,
        });
        if (!rij) return Response.json({ error: 'Niet gevonden.' }, { status: 404 });
        return Response.json({ regels: await regelsVoorAdres(req.payload, rij.email) });
      },
    },
  ],
  hooks: {
    beforeValidate: [({ data }) => (data?.email ? { ...data, email: normaliseerEmail(data.email) } : data)],
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data.bevestigd && !originalDoc?.bevestigd) return { ...data, bevestigdOp: new Date().toISOString() };
        if (data.bevestigd === false) return { ...data, bevestigdOp: null };
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req, context }) => {
        if (context.geenPromotie || !doc.bevestigd || previousDoc?.bevestigd) return doc;
        try {
          await zetOpenstaandeDoor(req.payload, doc.email, req);
        } catch (error) {
          req.payload.logger.error(`[adresboek] openstaande zaken doorzetten mislukt voor ${doc.email}: ${error}`);
        }
        return doc;
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const rij = await req.payload.findByID({ collection: 'email-adressen', id, depth: 0, overrideAccess: true, req });
        await verwijderAdresOveral(req.payload, rij.email, req);
      },
    ],
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    {
      name: 'bevestigd',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { description: 'Aan: geen bevestigingsmail meer nodig, en wat nog wacht gaat door.' },
    },
    { name: 'bevestigdOp', label: 'Bevestigd op', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'lijsten',
      type: 'text',
      admin: { readOnly: true, description: 'Wordt automatisch bijgehouden.' },
    },
    { name: 'notitie', type: 'textarea' },
    {
      name: 'overzicht',
      type: 'ui',
      admin: { components: { Field: '/components/admin/AdresOverzicht#default' } },
    },
  ],
};
