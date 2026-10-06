import type { CollectionBeforeChangeHook, CollectionConfig, Where } from 'payload';
import { APIError } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';
import { hasRoleAtLeast } from '../access/roles';
import { PUBLIEKE_FASES } from '../lib/activiteiten/constants';
import { editieEndpoints } from '../endpoints/nieuwsbriefEdities';
import { mailEditor } from '../globals/editors';

const SERVERVELDEN = ['status', 'gestartOp', 'gestartDoor', 'verzondenOp', 'aantalOntvangers', 'aantalVerzonden'];

/**
 * Status en tellingen zet alleen de verzendlogica (`context.verzending`). Na de start ligt ook de inhoud
 * vast: alle ontvangers moeten dezelfde nieuwsbrief krijgen.
 */
const alleenConceptBewerken: CollectionBeforeChangeHook = ({ data, originalDoc, operation, context }) => {
  if (context.verzending) return data;
  if (operation === 'update' && originalDoc?.status !== 'concept') {
    throw new APIError('Deze editie wordt of is verstuurd; je kunt hem niet meer wijzigen.', 400, null, true);
  }
  return { ...Object.fromEntries(Object.entries(data).filter(([k]) => !SERVERVELDEN.includes(k))), status: 'concept' };
};

const gepubliceerd: Where = { status: { equals: 'published' } };

/**
 * Edities van de nieuwsbrief. Redactie stelt samen (intro + gekoppelde items), bekijkt een voorbeeld,
 * stuurt een testmail en verstuurt; zie src/lib/nieuwsbrief/verzenden.ts en EditieKnoppen.
 */
export const NieuwsbriefEdities: CollectionConfig = {
  slug: 'nieuwsbrief-edities',
  labels: { singular: 'Nieuwsbrief-editie', plural: 'Nieuwsbrief-edities' },
  typescript: { interface: 'NieuwsbriefEditie' },
  admin: {
    useAsTitle: 'onderwerp',
    group: 'Nieuwsbrief',
    defaultColumns: ['onderwerp', 'status', 'aantalVerzonden', 'aantalOntvangers', 'verzondenOp'],
    description:
      'Stel een nieuwsbrief samen, bekijk het voorbeeld en stuur een testmail. "Versturen" gaat naar alle actieve abonnees, in hun eigen taal; door de daglimiet kan dat over meerdere dagen verspreid gaan.',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default', '/components/admin/EditieKnoppen#default'],
      },
    },
  },
  access: {
    read: isRedacteurOrAdmin,
    create: isRedacteurOrAdmin,
    update: isRedacteurOrAdmin,
    delete: ({ req }): boolean | Where =>
      hasRoleAtLeast(req.user?.role, 'redacteur') ? { status: { in: ['concept', 'gestopt'] } } : false,
  },
  endpoints: editieEndpoints,
  hooks: {
    beforeChange: [alleenConceptBewerken],
    beforeDelete: [
      async ({ id, req }) => {
        await req.payload.delete({ collection: 'nieuwsbrief-verzendingen', where: { editie: { equals: id } }, overrideAccess: true, req });
      },
    ],
  },
  fields: [
    { name: 'onderwerp', type: 'text', required: true, localized: true, maxLength: 150 },
    {
      name: 'intro',
      type: 'richText',
      localized: true,
      editor: mailEditor,
      admin: { description: 'Komt bovenaan de mail, na de aanhef. Een afbeelding voeg je toe met "/" en dan Upload.' },
    },
    {
      name: 'items',
      label: 'Uitgelicht',
      type: 'relationship',
      relationTo: ['nieuws', 'agenda', 'activiteiten'],
      hasMany: true,
      filterOptions: ({ relationTo }): Where =>
        relationTo === 'activiteiten' ? { fase: { in: PUBLIEKE_FASES } } : gepubliceerd,
      admin: { description: 'Gepubliceerde berichten, agenda-items en activiteiten; ieder komt als blokje met link in de mail.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'concept',
      index: true,
      options: [
        { label: 'Concept', value: 'concept' },
        { label: 'Wordt verstuurd', value: 'verzenden' },
        { label: 'Verzonden', value: 'verzonden' },
        { label: 'Gestopt', value: 'gestopt' },
      ],
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'gestartOp', type: 'date', admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'gestartDoor', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'verzondenOp', label: 'Klaar op', type: 'date', admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'aantalOntvangers', type: 'number', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'aantalVerzonden', type: 'number', admin: { readOnly: true, position: 'sidebar' } },
  ],
};
