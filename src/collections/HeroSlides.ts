import type { CollectionConfig } from 'payload';
import { revalidatePath } from 'next/cache';
import { isRedacteurOrAdminField } from '../access/isAdmin';
import { editorOnlyContentAccess } from '../access/contentAccess';
import { setAuthor } from './shared/setAuthor';

/**
 * revalidatePath needs an active Next.js request context (works from
 * /admin and /api), which isn't present when the Local API is invoked
 * from a standalone script (e.g. scripts/seed-hero-slides.ts).
 */
function revalidateHome() {
  try {
    revalidatePath('/');
  } catch {
    // Not running inside a Next.js request — nothing to revalidate.
  }
}

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
