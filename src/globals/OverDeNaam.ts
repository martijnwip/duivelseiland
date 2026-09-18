import type { GlobalConfig } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';

export const OverDeNaam: GlobalConfig = {
  slug: 'over-de-naam',
  admin: {
    components: {
      elements: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default'],
      },
    },
  },
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
