import type { CollectionConfig } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';
import { adresboekHooks } from '../lib/adresboek';

// Aanmelden kan alleen met een buurtpas, dus het adres is al bevestigd.
const adresboek = adresboekHooks<{ email?: string | null }>(
  (d) => d.email,
  () => true,
);

/**
 * Buren die een bericht willen als er foto's bij een In-memoriam-pagina komen. Aanmelden en afmelden gaan
 * op de pagina (met buurtpas) of via de afmeldlink in de mail. Het seintje verstuurt de admin met de knop
 * "Seintje: nieuwe foto's" op de pagina zelf.
 */
export const InMemoriamVolgers: CollectionConfig = {
  slug: 'in-memoriam-volgers',
  labels: { singular: 'In-memoriam-volger', plural: 'In-memoriam-volgers' },
  typescript: { interface: 'InMemoriamVolger' },
  admin: {
    useAsTitle: 'email',
    group: 'Buurt',
    defaultColumns: ['email', 'herdenkingNaam', 'laatstGemaildOp', 'createdAt'],
    description: 'Buren die een mail krijgen als er foto’s bij een In-memoriam-pagina komen.',
  },
  defaultSort: '-createdAt',
  access: {
    create: () => false,
    read: isRedacteurOrAdmin,
    update: isRedacteurOrAdmin,
    delete: isRedacteurOrAdmin,
  },
  indexes: [{ fields: ['herdenking', 'email'], unique: true }],
  hooks: {
    afterChange: [adresboek.afterChange],
    afterDelete: [adresboek.afterDelete],
  },
  fields: [
    { name: 'email', type: 'email', required: true, index: true, admin: { readOnly: true } },
    {
      name: 'herdenking',
      type: 'relationship',
      relationTo: 'in-memoriam',
      required: true,
      admin: { readOnly: true, condition: (_, __, { user }) => user?.role === 'admin' },
    },
    { name: 'herdenkingNaam', label: 'Bij', type: 'text', admin: { readOnly: true } },
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'nl',
      options: [
        { label: 'Nederlands', value: 'nl' },
        { label: 'Engels', value: 'en' },
      ],
      admin: { readOnly: true },
    },
    { name: 'laatstGemaildOp', label: 'Laatst gemaild', type: 'date', index: true, admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    // Voor de afmeldlink in de mail; nooit tonen.
    { name: 'afmeldToken', type: 'text', required: true, unique: true, index: true, admin: { hidden: true } },
  ],
};
