import type { CollectionConfig } from 'payload';
import { isRedacteurOrAdminField } from '../access/isAdmin';
import { editorOnlyContentAccess } from '../access/contentAccess';
import { setAuthor } from './shared/setAuthor';
import { revalidateHome } from './shared/revalidateHome';

export const HeroSlides: CollectionConfig = {
  slug: 'hero-slides',
  admin: {
    defaultColumns: ['image', 'order', 'status'],
  },
  access: editorOnlyContentAccess,
  hooks: {
    beforeChange: [setAuthor('author')],
    afterChange: [revalidateHome],
    afterDelete: [revalidateHome],
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published'],
      defaultValue: 'draft',
      required: true,
      access: {
        update: isRedacteurOrAdminField,
      },
    },
    {
      name: 'author',
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
