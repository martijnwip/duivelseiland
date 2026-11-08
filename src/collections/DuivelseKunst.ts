import type { CollectionConfig } from 'payload';
import { adminOnlyContentAccess } from '../access/contentAccess';
import { contentFields } from './shared/contentFields';
import { setAuthor } from './shared/setAuthor';
import { revalidateContentAfterChange, revalidateContentAfterDelete } from './shared/revalidateContent';

export const DuivelseKunst: CollectionConfig = {
  slug: 'duivelse-kunst',
  labels: {
    singular: 'Duivelse Kunst',
    plural: 'Duivelse Kunst',
  },
  admin: {
    useAsTitle: 'title',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default'],
      },
    },
  },
  access: adminOnlyContentAccess,
  hooks: {
    beforeChange: [setAuthor('author')],
    afterChange: [revalidateContentAfterChange],
    afterDelete: [revalidateContentAfterDelete],
  },
  fields: contentFields(),
};
