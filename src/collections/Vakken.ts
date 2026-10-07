import type { CollectionConfig } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';

/**
 * Vakken (loodgieter, elektricien, ...) als tags voor Vakmensen. Een redacteur kan bij een vakmens
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
    group: 'Vakmensen',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default'],
      },
    },
  },
  defaultSort: 'naam',
  access: {
    // De site toont de vaknamen bij de vakmensen.
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
