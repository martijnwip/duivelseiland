import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';
import { slugField } from 'payload';
import { isAdmin } from '../access/isAdmin';
import { hasRoleAtLeast } from '../access/roles';
import { authorField, statusField } from './shared/contentFields';
import { setAuthor } from './shared/setAuthor';
import { revalidateContentAfterChange, revalidateContentAfterDelete } from './shared/revalidateContent';
import { fotoSeintjeEndpoint } from '../lib/in-memoriam/seintje';

type FotoRij = { id?: string | null; toegevoegdOp?: string | null };

/** Elke nieuwe foto krijgt een datum; daarmee weet de knop "Seintje" welke foto's nieuw zijn. */
const dateerNieuweFotos: CollectionBeforeChangeHook = ({ data }) => {
  if (!Array.isArray(data?.fotos)) return data;
  const nu = new Date().toISOString();
  return { ...data, fotos: (data.fotos as FotoRij[]).map((rij) => (rij.toegevoegdOp ? rij : { ...rij, toegevoegdOp: nu })) };
};

/**
 * Herdenkingspagina's voor buren die er niet meer zijn (/in-memoriam/<slug>). Alleen de admin beheert ze,
 * net als Interviews. Buren met een buurtpas kunnen een herinnering achterlaten (In-memoriam-reacties, de
 * redactie keurt ze goed) en zich aanmelden voor een bericht als er foto's bij komen (In-memoriam-volgers):
 * voeg foto's toe onder "Foto's", sla op en klik op "Seintje: nieuwe foto's".
 */
export const InMemoriam: CollectionConfig = {
  slug: 'in-memoriam',
  labels: { singular: 'In memoriam', plural: 'In memoriam' },
  typescript: { interface: 'InMemoriam' },
  admin: {
    useAsTitle: 'naam',
    defaultColumns: ['naam', 'overleden', 'status', 'updatedAt'],
    description: 'Herdenkingspagina’s (/in-memoriam/<slug>). Herinneringen van buren staan bij In-memoriam-reacties.',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default', '/components/admin/FotoSeintjeKnop#default'],
      },
    },
  },
  access: {
    // Bezoekers lezen gepubliceerde pagina's; verder alleen de admin (net als Interviews, zo blijft /admin van de redacteur overzichtelijk).
    read: ({ req }) => (req.user ? hasRoleAtLeast(req.user.role, 'admin') : { status: { equals: 'published' } }),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  endpoints: [fotoSeintjeEndpoint],
  hooks: {
    beforeChange: [setAuthor('author'), dateerNieuweFotos],
    afterChange: [revalidateContentAfterChange],
    afterDelete: [revalidateContentAfterDelete],
  },
  fields: [
    { name: 'naam', type: 'text', required: true, admin: { description: 'Bv. "Kees Kroon".' } },
    slugField({
      useAsSlug: 'naam',
      overrides: (field) => {
        const [, slug] = field.fields;
        if (slug && 'admin' in slug) {
          slug.admin = { ...slug.admin, description: 'Adres: /in-memoriam/<slug>. Niet meer wijzigen als de link gedeeld is.' };
        }
        return field;
      },
    }),
    {
      name: 'ondertitel',
      type: 'text',
      localized: true,
      admin: { description: 'Korte typering onder de naam, bv. "de markante melkhandelaar".' },
    },
    { name: 'overleden', type: 'date', admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' } } },
    statusField,
    {
      type: 'collapsible',
      label: 'Hoofdfoto',
      fields: [
        { name: 'hero', label: 'Foto', type: 'upload', relationTo: 'media' },
        { name: 'heroOnderschrift', label: 'Onderschrift', type: 'text', localized: true },
        {
          name: 'deelUitsnede',
          label: 'Uitsnede in het linkvoorbeeld',
          type: 'number',
          min: 0,
          max: 1,
          defaultValue: 0.2,
          admin: {
            step: 0.05,
            description:
              'Het linkvoorbeeld (WhatsApp) toont een staande strook van de foto. 0 = de linkerkant, 1 = de rechterkant, 0,5 = het midden.',
          },
        },
      ],
    },
    {
      name: 'citaat',
      type: 'textarea',
      localized: true,
      admin: { description: 'Een zin die apart en groot op de pagina staat, bv. de tekst op de rouwkaart.' },
    },
    { name: 'content', label: 'Tekst', type: 'richText', localized: true },
    { name: 'bron', type: 'text', localized: true, admin: { description: 'Onder de tekst, bv. "Met informatie van ...".' } },
    {
      name: 'fotos',
      label: 'Foto’s',
      type: 'array',
      labels: { singular: 'Foto', plural: 'Foto’s' },
      admin: {
        description: 'Meer foto’s. Na het opslaan kun je de buren die dat willen een seintje sturen (knop bovenaan).',
        initCollapsed: true,
      },
      fields: [
        { name: 'foto', type: 'upload', relationTo: 'media', required: true },
        { name: 'onderschrift', type: 'text', localized: true },
        { name: 'toegevoegdOp', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    {
      name: 'laatsteSeintjeOp',
      label: 'Laatste seintje over foto’s',
      type: 'date',
      access: { update: () => false },
      admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    authorField,
  ],
};
