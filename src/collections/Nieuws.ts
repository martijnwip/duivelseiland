import type { CollectionConfig } from 'payload';
import { authoredContentAccess, zonderBuurtitems } from '../access/contentAccess';
import { contentFields } from './shared/contentFields';
import { setAuthor } from './shared/setAuthor';
import { revalidateContentAfterChange, revalidateContentAfterDelete } from './shared/revalidateContent';

export const Nieuws: CollectionConfig = {
  slug: 'nieuws',
  admin: {
    useAsTitle: 'title',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default'],
      },
    },
  },
  access: zonderBuurtitems(authoredContentAccess),
  hooks: {
    beforeChange: [setAuthor('author')],
    afterChange: [revalidateContentAfterChange],
    afterDelete: [revalidateContentAfterDelete],
  },
  fields: contentFields(),
};
