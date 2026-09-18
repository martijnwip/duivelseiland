import type { CollectionConfig } from 'payload';
import { authoredContentAccess } from '../access/contentAccess';
import { contentFields } from './shared/contentFields';
import { setAuthor } from './shared/setAuthor';

export const DuivelseKunst: CollectionConfig = {
  slug: 'duivelse-kunst',
  admin: {
    useAsTitle: 'title',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default'],
      },
    },
  },
  access: authoredContentAccess,
  hooks: {
    beforeChange: [setAuthor('author')],
  },
  fields: contentFields(),
};
