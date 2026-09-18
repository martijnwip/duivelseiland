import type { CollectionConfig } from 'payload';
import { editorOnlyContentAccess } from '../access/contentAccess';
import { contentFields } from './shared/contentFields';
import { setAuthor } from './shared/setAuthor';

export const PraktischeInfo: CollectionConfig = {
  slug: 'praktische-info',
  labels: {
    singular: 'Praktische info',
    plural: 'Praktische info',
  },
  admin: {
    useAsTitle: 'title',
  },
  access: editorOnlyContentAccess,
  hooks: {
    beforeChange: [setAuthor('author')],
  },
  fields: contentFields(),
};
