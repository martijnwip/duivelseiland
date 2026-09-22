import type { CollectionConfig } from 'payload';
import { authoredContentAccess } from '../access/contentAccess';
import { contentFields } from './shared/contentFields';
import { setAuthor } from './shared/setAuthor';

export const Agenda: CollectionConfig = {
  slug: 'agenda',
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
  fields: [
    ...contentFields(),
    {
      name: 'recurrence',
      type: 'select',
      options: [
        { label: 'Geen (eenmalig)', value: 'none' },
        { label: 'Elke eerste zondag van de maand', value: 'monthly-first-sunday' },
      ],
      defaultValue: 'none',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'recurrenceTime',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Tijdstip van het event, bijv. 12:30',
        condition: (data) => data?.recurrence && data.recurrence !== 'none',
      },
    },
  ],
};
