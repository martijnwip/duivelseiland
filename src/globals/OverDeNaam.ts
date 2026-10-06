import type { GlobalConfig } from 'payload';
import { isAdmin, publiekOfAdmin } from '../access/isAdmin';

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
    read: publiekOfAdmin,
    update: isAdmin,
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
