import type { CollectionConfig } from 'payload';
import { editorOnlyContentAccess } from '../access/contentAccess';
import { authorField, statusField } from './shared/contentFields';
import { setAuthor } from './shared/setAuthor';

const TELEFOON = /^[0-9+\-()\s]{6,20}$/;
const WEBSITE = /^https?:\/\/\S+\.\S+$/;

/** Vakmensen uit de buurt: naam, vak(ken), telefoon en website. Getoond als één overzicht op /vakmensen. */
export const Vakmensen: CollectionConfig = {
  slug: 'vakmensen',
  labels: {
    singular: 'Vakmens',
    plural: 'Vakmensen',
  },
  admin: {
    useAsTitle: 'naam',
    group: 'Vakmensen',
    defaultColumns: ['naam', 'vakken', 'telefoon', 'status'],
  },
  defaultSort: 'naam',
  access: editorOnlyContentAccess,
  hooks: {
    beforeChange: [setAuthor('author')],
  },
  fields: [
    {
      name: 'naam',
      type: 'text',
      required: true,
    },
    {
      name: 'vakken',
      type: 'relationship',
      relationTo: 'vakken',
      hasMany: true,
      required: true,
      admin: {
        description: 'Kies één of meer vakken. Staat het vak er niet bij? Voeg het toe met de +.',
      },
    },
    {
      name: 'telefoon',
      type: 'text',
      validate: (value: string | null | undefined) =>
        !value || TELEFOON.test(value.trim()) || 'Vul een geldig telefoonnummer in, bv. 06 12345678.',
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Met http:// of https://, bv. https://www.voorbeeld.nl',
      },
      validate: (value: string | null | undefined) =>
        !value || WEBSITE.test(value.trim()) || 'Begin het adres met http:// of https://, bv. https://www.voorbeeld.nl',
    },
    statusField,
    authorField,
  ],
};
