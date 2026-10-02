import type { CollectionConfig, Endpoint } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';
import { viaEigenActiviteit } from '../access/activiteiten';
import { adresboekHooks } from '../lib/adresboek';

const adresboek = adresboekHooks<{ email: string; status: string }>((d) => d.email, (d) => d.status === 'actief');

function csvCel(value: unknown) {
  const s = value == null ? '' : String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** GET /api/activiteit-inschrijvingen/export: actieve deelnemers als CSV, met de rechten van de gebruiker. */
const exportEndpoint: Endpoint = {
  path: '/export',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Niet ingelogd.' }, { status: 401 });
    const { docs } = await req.payload.find({
      collection: 'activiteit-inschrijvingen',
      where: { status: { equals: 'actief' } },
      overrideAccess: false,
      user: req.user,
      depth: 1,
      pagination: false,
      sort: 'activiteit',
    });
    const regels = [
      ['activiteit', 'voornaam', 'email', 'opmerking', 'aangemeld_op'],
      ...docs.map((d) => [
        typeof d.activiteit === 'object' ? d.activiteit?.title : d.activiteit,
        d.voornaam,
        d.email,
        d.opmerking,
        d.bevestigdOp,
      ]),
    ];
    const csv = regels.map((r) => r.map(csvCel).join(';')).join('\r\n');
    return new Response(`﻿${csv}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="deelnemers.csv"',
      },
    });
  },
};

/**
 * Aanmeldingen voor een activiteit, met dubbele opt-in (of direct actief voor een al bevestigd adres).
 * Aanmaken gaat alleen via de server actions in src/components/activiteiten/actions.ts.
 */
export const ActiviteitInschrijvingen: CollectionConfig = {
  slug: 'activiteit-inschrijvingen',
  labels: { singular: 'Aanmelding', plural: 'Aanmeldingen' },
  admin: {
    useAsTitle: 'email',
    group: 'Activiteiten',
    defaultColumns: ['voornaam', 'email', 'activiteit', 'status', 'bevestigdOp'],
    components: {
      beforeListTable: ['/components/admin/InschrijvingenExport#default'],
    },
    description:
      'Wie meedoet met een activiteit. Alleen "Actief" telt mee. Dit zijn persoonsgegevens: alleen gebruiken voor deze activiteit.',
  },
  access: {
    read: viaEigenActiviteit,
    create: () => false,
    update: isRedacteurOrAdmin,
    delete: viaEigenActiviteit,
  },
  indexes: [{ fields: ['activiteit', 'email'], unique: true }],
  endpoints: [exportEndpoint],
  hooks: {
    afterChange: [adresboek.afterChange],
    afterDelete: [adresboek.afterDelete],
  },
  fields: [
    { name: 'activiteit', type: 'relationship', relationTo: 'activiteiten', required: true, index: true },
    { name: 'voornaam', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'opmerking', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Wacht op bevestiging', value: 'pending' },
        { label: 'Actief', value: 'actief' },
        { label: 'Afgemeld', value: 'afgemeld' },
      ],
    },
    {
      name: 'locale',
      type: 'select',
      required: true,
      defaultValue: 'nl',
      options: [
        { label: 'Nederlands', value: 'nl' },
        { label: 'English', value: 'en' },
      ],
    },
    { name: 'token', type: 'text', required: true, unique: true, index: true, access: { read: () => false }, admin: { hidden: true } },
    { name: 'bevestigdOp', label: 'Aangemeld op', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'afgemeldOp', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'laatsteMailOp', type: 'date', access: { read: () => false }, admin: { hidden: true } },
  ],
};
