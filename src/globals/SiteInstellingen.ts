import type { GlobalConfig } from 'payload';
import { isAdmin, isAdminField, publiekOfAdmin } from '../access/isAdmin';
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
    {
      name: 'nieuwsbrief',
      type: 'group',
      // Niet voor de publieke site; de server leest het met overrideAccess (magVersturen in verzenden.ts).
      access: { read: isAdminField },
      fields: [
        {
          name: 'redacteurMagVersturen',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'Aan: ook redacteuren kunnen een editie naar alle abonnees versturen. Uit: alleen de admin; bij een redacteur staat de knop Versturen uit.',
          },
        },
      ],
    },
    {
      name: 'whatsapp',
      label: 'WhatsApp-groepen',
      type: 'group',
      // Niet voor de publieke site: de link is alleen voor buren die de redactie uitnodigt (src/lib/whatsapp-groepen).
      access: { read: isAdminField },
      fields: [
        {
          name: 'buurtUitnodiging',
          label: 'Uitnodigingslink Buren-app',
          type: 'text',
          admin: {
            description:
              'Wordt gemaild als de redactie bij een WhatsApp-aanmelding op "Uitnodiging sturen" klikt. Reset je de link in WhatsApp, plak hier dan de nieuwe.',
          },
          validate: (value: string | null | undefined) =>
            !value || /^https:\/\/chat\.whatsapp\.com\/\S+$/.test(value.trim()) || 'Plak een WhatsApp-uitnodigingslink, bv. https://chat.whatsapp.com/…',
        },
      ],
    },
  ],
};
