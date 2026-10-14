import type { CollectionConfig } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';

/**
 * Vakken (loodgieter, elektricien, ...) als tags voor Vaklui. Een redacteur kan bij een vakman
 * met de + in het veld Vakken direct een nieuw vak toevoegen.
 */
export const Vakken: CollectionConfig = {
  slug: 'vakken',
  labels: {
    singular: 'Vak',
    plural: 'Vakken',
  },
  admin: {
    useAsTitle: 'naam',
    group: 'Vaklui',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default'],
      },
    },
  },
  defaultSort: 'naam',
  access: {
    // De site toont de vaknamen bij de vaklui.
    read: () => true,
    create: isRedacteurOrAdmin,
    update: isRedacteurOrAdmin,
    delete: isRedacteurOrAdmin,
  },
  fields: [
    {
      name: 'naam',
      type: 'text',
      required: true,
      localized: true,
    },
  ],
};
