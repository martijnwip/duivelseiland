import type { Field } from 'payload';
import { slugField } from 'payload';
import { isRedacteurOrAdminField } from '../../access/isAdmin';

/**
 * Common field shape shared by every content collection (Nieuws, Agenda,
 * Interviews, Geschiedenis, Duivelse Kunst, Vakmensen, Praktische info).
 */
export const contentFields = (): Field[] => [
  {
    name: 'title',
    type: 'text',
    required: true,
  },
  slugField(),
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
  {
    name: 'content',
    type: 'richText',
  },
  {
    name: 'date',
    type: 'date',
  },
  {
    name: 'image',
    type: 'upload',
    relationTo: 'media',
  },
];
