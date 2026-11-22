import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';
import { adresboekHooks } from '../lib/adresboek';
import { NAAM_MAX, REACTIE_MAX, REACTIE_STATUS } from '../lib/in-memoriam/constants';

// De schrijver heeft een buurtpas, dus het adres is al bevestigd.
const adresboek = adresboekHooks<{ email?: string | null }>(
  (d) => d.email,
  () => true,
);

const zetGoedgekeurdOp: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (data.status === 'goedgekeurd' && originalDoc?.status !== 'goedgekeurd') {
    return { ...data, goedgekeurdOp: new Date().toISOString() };
  }
  return data;
};

/**
 * Herinneringen van buren op een In-memoriam-pagina, via het formulier op de pagina (alleen met buurtpas).
 * Pas na goedkeuring door de redactie staan ze op de site. Openbaar staat er "Een buurtbewoner"; de naam
 * zien alleen buren met een buurtpas. Het e-mailadres staat nergens op de site.
 */
export const InMemoriamReacties: CollectionConfig = {
  slug: 'in-memoriam-reacties',
  labels: { singular: 'In-memoriam-reactie', plural: 'In-memoriam-reacties' },
  typescript: { interface: 'InMemoriamReactie' },
  admin: {
    useAsTitle: 'herdenkingNaam',
    group: 'Buurt',
    defaultColumns: ['herdenkingNaam', 'tekst', 'naam', 'status', 'createdAt'],
    description:
      'Herinneringen van buren op een In-memoriam-pagina. Pas na "Goedkeuren" staan ze op de site: openbaar als "Een buurtbewoner", met naam alleen voor buren met een buurtpas.',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/ReactieModeratieKnoppen#default'],
      },
    },
  },
  defaultSort: '-createdAt',
  access: {
    // Plaatsen gaat via het formulier (server action met de Local API), niet via de REST-API.
    create: () => false,
    read: isRedacteurOrAdmin,
    update: isRedacteurOrAdmin,
    delete: isRedacteurOrAdmin,
  },
  hooks: {
    beforeChange: [zetGoedgekeurdOp],
    // Geen revalidatie nodig: de pagina leest de buurtpas en wordt dus per request gerenderd.
    afterChange: [adresboek.afterChange],
    afterDelete: [adresboek.afterDelete],
  },
  fields: [
    {
      name: 'tekst',
      label: 'Herinnering',
      type: 'textarea',
      required: true,
      maxLength: REACTIE_MAX,
      admin: { description: 'Je kunt de tekst aanpassen voor je goedkeurt (bv. een achternaam of telefoonnummer weghalen).' },
    },
    {
      name: 'naam',
      type: 'text',
      maxLength: NAAM_MAX,
      admin: { description: 'Optioneel. Alleen zichtbaar voor buren met een buurtpas; anders staat er "Een buurtbewoner".' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'ingediend',
      index: true,
      options: REACTIE_STATUS.map((s) => ({ label: s.label, value: s.value })),
      admin: { position: 'sidebar' },
    },
    { name: 'goedgekeurdOp', type: 'date', admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'herdenking',
      type: 'relationship',
      relationTo: 'in-memoriam',
      required: true,
      index: true,
      // Alleen de admin kan de pagina zelf openen; de redactie ziet de naam hieronder.
      admin: { readOnly: true, position: 'sidebar', condition: (_, __, { user }) => user?.role === 'admin' },
    },
    { name: 'herdenkingNaam', label: 'Bij', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    {
      name: 'email',
      label: 'E-mailadres (uit de buurtpas)',
      type: 'email',
      required: true,
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'nl',
      options: [
        { label: 'Nederlands', value: 'nl' },
        { label: 'Engels', value: 'en' },
      ],
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
};
