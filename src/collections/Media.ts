import type { CollectionConfig } from 'payload';
import { isRedacteurOrAdminField } from '../access/isAdmin';
import { setAuthor } from './shared/setAuthor';

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [setAuthor('uploadedBy')],
  },
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
      access: {
        update: isRedacteurOrAdminField,
      },
    },
  ],
};
