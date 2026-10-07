import type { CollectionConfig } from 'payload';
import { adminOnlyContentAccess } from '../access/contentAccess';
import { alleenIngelogdField } from '../access/isAdmin';
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
  access: adminOnlyContentAccess,
  hooks: {
    beforeChange: [setAuthor('author')],
  },
  fields: [
    ...contentFields(),
    {
      name: 'contact',
      label: 'Contactgegevens',
      type: 'group',
      access: { read: alleenIngelogdField },
      admin: {
        description:
          'Alleen zichtbaar voor bezoekers met een buurtpas. Zet telefoonnummers en adressen hier, niet in de tekst: wat in de tekst staat, ziet iedereen.',
      },
      fields: [
        { name: 'telefoon', type: 'text', admin: { width: '50%' } },
        { name: 'whatsapp', label: 'WhatsApp', type: 'text', admin: { width: '50%', description: 'Telefoonnummer, wordt een wa.me-link.' } },
        { name: 'email', label: 'E-mail', type: 'email', admin: { width: '50%' } },
        { name: 'website', type: 'text', admin: { width: '50%', description: 'Volledige link, bv. https://…' } },
        { name: 'adres', type: 'textarea' },
      ],
    },
  ],
};
