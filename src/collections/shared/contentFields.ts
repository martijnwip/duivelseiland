import type { Field } from 'payload';
import { slugField } from 'payload';
import { isRedacteurOrAdminField } from '../../access/isAdmin';

/** Concept of gepubliceerd; alleen redacteur en admin mogen het wijzigen. */
export const statusField: Field = {
  name: 'status',
  type: 'select',
  options: ['draft', 'published'],
  defaultValue: 'draft',
  required: true,
  access: {
    update: isRedacteurOrAdminField,
  },
};

/** Wie het item aanmaakte (gezet door setAuthor). */
export const authorField: Field = {
  name: 'author',
  type: 'relationship',
  relationTo: 'users',
  admin: {
    position: 'sidebar',
  },
  access: {
    update: isRedacteurOrAdminField,
  },
};

/**
 * Common field shape shared by every content collection (Nieuws, Agenda,
 * Interviews, Geschiedenis, Duivelse Kunst, Praktische info). Vaklui heeft eigen velden.
 */
export const contentFields = (): Field[] => [
  {
    name: 'title',
    type: 'text',
    required: true,
    localized: true,
  },
  slugField(),
  statusField,
  {
    name: 'alleenBuurt',
    label: 'Alleen voor de buurt',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
      description: 'Aan: alleen bezoekers met een buurtpas zien de inhoud. Anderen zien de titel met een slotje.',
    },
  },
  authorField,
  {
    name: 'content',
    type: 'richText',
    localized: true,
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
