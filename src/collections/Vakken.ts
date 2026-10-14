import type { CollectionConfig } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';
import { metHoofdletter } from '../lib/vaklui/vaknaam';

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
      // Altijd met een hoofdletter opgeslagen, ook bij een vak dat met de + bij een vakman wordt toegevoegd.
      hooks: {
        beforeValidate: [({ value }) => (typeof value === 'string' ? metHoofdletter(value) : value)],
      },
    },
  ],
};
