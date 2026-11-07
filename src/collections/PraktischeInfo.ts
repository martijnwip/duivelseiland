import type { CollectionConfig } from 'payload';
import { editorOnlyContentAccess, zonderBuurtitems } from '../access/contentAccess';
import { contentFields } from './shared/contentFields';
import { setAuthor } from './shared/setAuthor';
import { revalidateContentAfterChange, revalidateContentAfterDelete } from './shared/revalidateContent';

export const PraktischeInfo: CollectionConfig = {
  slug: 'praktische-info',
  labels: {
    singular: 'Praktische info',
    plural: 'Praktische info',
  },
  admin: {
    useAsTitle: 'title',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default'],
      },
    },
  },
  access: zonderBuurtitems(editorOnlyContentAccess),
  hooks: {
    beforeChange: [setAuthor('author')],
    afterChange: [revalidateContentAfterChange],
    afterDelete: [revalidateContentAfterDelete],
  },
  fields: contentFields(),
};
