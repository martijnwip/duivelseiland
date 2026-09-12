import type { GlobalConfig } from 'payload';
import { isAdmin } from '../access/isAdmin';
import { hasRoleAtLeast } from '../access/roles';

export const SiteInstellingen: GlobalConfig = {
  slug: 'site-instellingen',
  access: {
    // Public/anonymous requests and admins can read; a logged-in auteur or
    // redacteur cannot (PROJECT.md prose: only Admin manages site settings).
    read: ({ req }) => !req.user || hasRoleAtLeast(req.user.role, 'admin'),
    update: isAdmin,
  },
  fields: [
    {
      name: 'siteNaam',
      type: 'text',
      required: true,
    },
    {
      name: 'menu',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
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
      type: 'textarea',
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
