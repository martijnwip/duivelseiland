import type { GlobalConfig } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';

export const OverDeNaam: GlobalConfig = {
  slug: 'over-de-naam',
  access: {
    read: () => true,
    update: isRedacteurOrAdmin,
  },
  fields: [
    {
      name: 'titel',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'inhoud',
      type: 'richText',
      localized: true,
    },
  ],
};
