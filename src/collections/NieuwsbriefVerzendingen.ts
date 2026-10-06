import type { CollectionConfig } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';

/**
 * Eén rij per ontvanger per editie (src/lib/nieuwsbrief/verzenden.ts). Zo kan een editie over meerdere
 * dagen verspreid worden verstuurd en na een fout worden hervat. Alleen de server schrijft hierin; rijen
 * van afgeronde edities ruimt de cron na 30 dagen op.
 */
export const NieuwsbriefVerzendingen: CollectionConfig = {
  slug: 'nieuwsbrief-verzendingen',
  labels: { singular: 'Verzending', plural: 'Verzendingen' },
  admin: { hidden: true },
  access: {
    read: isRedacteurOrAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  indexes: [{ fields: ['editie', 'abonnee'], unique: true }],
  fields: [
    { name: 'editie', type: 'relationship', relationTo: 'nieuwsbrief-edities', required: true, index: true },
    { name: 'abonnee', type: 'relationship', relationTo: 'nieuwsbrief-abonnees', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'wachtend',
      index: true,
      options: [
        { label: 'Wachtend', value: 'wachtend' },
        { label: 'Verzonden', value: 'verzonden' },
        { label: 'Overgeslagen', value: 'overgeslagen' },
      ],
    },
    { name: 'verzondenOp', type: 'date', index: true },
  ],
};
