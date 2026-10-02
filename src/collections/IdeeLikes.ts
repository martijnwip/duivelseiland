import type { CollectionConfig } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';

/** Ideeën op de Buurtborrel-pagina waar bezoekers een hartje bij kunnen zetten. */
export const IDEE_KEYS = ['nieuwjaarstoast', 'picknick', 'paasbrunch', 'koningsdag', 'ruilbeurs'] as const;
export type IdeeKey = (typeof IDEE_KEYS)[number];

/**
 * Eén document per hartje. Aanmaken en weghalen gaat alleen via de server action
 * (src/components/buurtborrel/actions.ts); de stemmer is een anonieme id uit een cookie.
 */
export const IdeeLikes: CollectionConfig = {
  slug: 'idee-likes',
  labels: { singular: 'Idee-hartje', plural: 'Idee-hartjes' },
  admin: {
    useAsTitle: 'idee',
    defaultColumns: ['idee', 'createdAt'],
    description: 'Hartjes bij de ideeën op de Buurtborrel-pagina. Filter op idee om het aantal te zien.',
  },
  access: {
    read: isRedacteurOrAdmin,
    create: () => false,
    update: () => false,
    delete: isRedacteurOrAdmin,
  },
  fields: [
    {
      name: 'idee',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Nieuwjaarstoast', value: 'nieuwjaarstoast' },
        { label: 'Lente-potluckpicknick', value: 'picknick' },
        { label: 'Paasbrunch', value: 'paasbrunch' },
        { label: 'Koningsdag-bingo', value: 'koningsdag' },
        { label: 'Ruilbeurs', value: 'ruilbeurs' },
      ],
    },
    {
      name: 'stemmer',
      type: 'text',
      required: true,
      index: true,
      admin: { readOnly: true, description: 'Anonieme id van de browser; geen persoonsgegevens.' },
    },
  ],
};
