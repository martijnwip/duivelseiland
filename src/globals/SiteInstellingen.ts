import type { GlobalConfig } from 'payload';
import {
  BoldFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical';
import { isAdmin } from '../access/isAdmin';
import { hasRoleAtLeast } from '../access/roles';

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
      // Bewust beperkt: alinea's, vet/cursief, links en lijsten. De lijsten
      // zorgen ook dat het /-menu een paar nuttige opties heeft.
      editor: lexicalEditor({
        features: [
          ParagraphFeature(),
          BoldFeature(),
          ItalicFeature(),
          LinkFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          InlineToolbarFeature(),
        ],
      }),
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
      type: 'textarea',
      localized: true,
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
