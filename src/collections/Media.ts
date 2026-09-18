import type { CollectionConfig } from 'payload';
import { isRedacteurOrAdminField } from '../access/isAdmin';
import { setAuthor } from './shared/setAuthor';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default'],
      },
    },
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
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
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
