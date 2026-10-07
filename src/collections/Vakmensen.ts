import type { CollectionConfig } from 'payload';
import { editorOnlyContentAccess } from '../access/contentAccess';
import { contentFields } from './shared/contentFields';
import { setAuthor } from './shared/setAuthor';

export const Vakmensen: CollectionConfig = {
  slug: 'vakmensen',
  labels: {
    singular: 'Vakmensen',
    plural: 'Vakmensen',
  },
  admin: {
    useAsTitle: 'title',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default'],
      },
    },
  },
  access: editorOnlyContentAccess,
  hooks: {
    beforeChange: [setAuthor('author')],
  },
  fields: contentFields(),
};
