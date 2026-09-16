import type { CollectionConfig } from 'payload';
import { slugField } from 'payload';
import { editorOnlyContentAccess } from '../access/contentAccess';

export const Slideshows: CollectionConfig = {
  slug: 'slideshows',
  admin: {
    useAsTitle: 'name',
  },
  access: editorOnlyContentAccess,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({ useAsSlug: 'name' }),
  ],
};
