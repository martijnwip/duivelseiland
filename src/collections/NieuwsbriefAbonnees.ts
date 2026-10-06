import type { CollectionConfig } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';
import { adresboekHooks } from '../lib/adresboek';
import { nieuwsbriefImportEndpoint } from './NieuwsbriefImportEndpoint';

const adresboek = adresboekHooks<{ email: string; status: string }>((d) => d.email, (d) => d.status === 'actief');

/**
 * Aanmeldingen voor de nieuwsbrief, met dubbele opt-in. Aanmaken gaat alleen via de server actions
 * (src/components/nieuwsbrief/actions.ts): eerst `pending`, na klik op de bevestigingslink `actief`.
 * Het token zit in de bevestigings- en afmeldlink en blijft na bevestiging gelijk.
 */
export const NieuwsbriefAbonnees: CollectionConfig = {
  slug: 'nieuwsbrief-abonnees',
  labels: { singular: 'Nieuwsbrief-abonnee', plural: 'Nieuwsbrief-abonnees' },
  admin: {
    useAsTitle: 'email',
    group: 'Nieuwsbrief',
    defaultColumns: ['email', 'naam', 'status', 'bron', 'locale', 'createdAt'],
    components: {
      beforeListTable: ['/collections/NieuwsbriefImportForm#NieuwsbriefImportForm'],
    },
    description:
      'Aanmeldingen voor de nieuwsbrief. Alleen "actief" heeft de aanmelding bevestigd. Dit zijn persoonsgegevens: alleen gebruiken voor de nieuwsbrief.',
  },
  access: {
    read: isRedacteurOrAdmin,
    create: () => false,
    update: isRedacteurOrAdmin,
    delete: isRedacteurOrAdmin,
  },
  endpoints: [{ method: 'post', path: '/import', handler: nieuwsbriefImportEndpoint }],
  hooks: {
    afterChange: [adresboek.afterChange],
    // Vóór het verwijderen (de verzendrij verwijst verplicht naar de abonnee); geldt ook voor "vergeet mij".
    beforeDelete: [
      async ({ id, req }) => {
        await req.payload.delete({ collection: 'nieuwsbrief-verzendingen', where: { abonnee: { equals: id } }, overrideAccess: true, req });
      },
    ],
    afterDelete: [adresboek.afterDelete],
  },
  fields: [
    {
      name: 'naam',
      type: 'text',
      maxLength: 200,
      admin: { description: 'Vrije tekst; mag meerdere namen bevatten, bijv. "Guus en Henkje".' },
    },
    { name: 'email', type: 'email', required: true, unique: true, index: true },
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
      admin: { description: 'Taal van de mails aan deze abonnee.' },
    },
    {
      name: 'bron',
      type: 'select',
      required: true,
      defaultValue: 'formulier',
      options: [
        { label: 'Formulier (bevestigd per mail)', value: 'formulier' },
        { label: 'Import door admin', value: 'import' },
      ],
      admin: { readOnly: true, position: 'sidebar', description: 'Import = toegevoegd zonder bevestigingsmail.' },
    },
    { name: 'token', type: 'text', required: true, unique: true, index: true, admin: { hidden: true } },
    { name: 'bevestigdOp', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'afgemeldOp', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    // Rem op het herhaald versturen van bevestigings- en afmeldmails naar hetzelfde adres.
    { name: 'laatsteMailOp', type: 'date', admin: { hidden: true } },
  ],
};
