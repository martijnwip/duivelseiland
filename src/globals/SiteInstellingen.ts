import type { GlobalConfig } from 'payload';
import { isAdmin, publiekOfAdmin } from '../access/isAdmin';
import { footerEditor, introEditor } from './editors';
import { revalidateSite } from './revalidateSite';

export const SiteInstellingen: GlobalConfig = {
  slug: 'site-instellingen',
  admin: {
    components: {
      elements: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default'],
      },
    },
  },
  access: {
    // Alleen de admin beheert de site-instellingen (PROJECT.md); de publieke site leest ze zonder user.
    read: publiekOfAdmin,
    update: isAdmin,
  },
  hooks: {
    afterChange: [revalidateSite],
  },
  fields: [
    {
      name: 'siteNaam',
      type: 'text',
      required: true,
    },
    {
      name: 'intro',
      type: 'richText',
      localized: true,
      editor: introEditor,
    },
    {
      name: 'menu',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'zichtbaar',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description:
              'Uitvinken om het item (tijdelijk) te verbergen, bv. als de pagina nog niet klaar is.',
          },
        },
      ],
    },
    {
      name: 'footer',
      type: 'richText',
      localized: true,
      editor: footerEditor,
    },
    {
      name: 'contactgegevens',
      type: 'group',
      fields: [
        {
          name: 'email',
          type: 'text',
        },
        {
          name: 'telefoon',
          type: 'text',
        },
        {
          name: 'adres',
          type: 'text',
        },
      ],
    },
  ],
};
