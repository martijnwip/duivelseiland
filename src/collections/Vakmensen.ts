import type { CollectionConfig } from 'payload';
import { authoredContentAccess } from '../access/contentAccess';
import { contentFields } from './shared/contentFields';
import { setAuthor } from './shared/setAuthor';

export const Vakmensen: CollectionConfig = {
  slug: 'vakmensen',
  admin: {
    useAsTitle: 'title',
  },
  access: authoredContentAccess,
  hooks: {
    beforeChange: [setAuthor('author')],
  },
  fields: contentFields(),
};
