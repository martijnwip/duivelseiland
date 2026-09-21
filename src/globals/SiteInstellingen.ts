import type { GlobalConfig } from 'payload';
import { isAdmin } from '../access/isAdmin';
import { hasRoleAtLeast } from '../access/roles';
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
    // Public/anonymous requests and admins can read; a logged-in auteur or
    // redacteur cannot (PROJECT.md prose: only Admin manages site settings).
    read: ({ req }) => !req.user || hasRoleAtLeast(req.user.role, 'admin'),
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
