import type { CollectionConfig } from 'payload';
import { authoredContentAccess } from '../access/contentAccess';
import { isRedacteurOrAdminField } from '../access/isAdmin';
import { setAuthor } from './shared/setAuthor';
import { revalidateHome } from './shared/revalidateHome';
import { revalidateGeschiedenis } from './shared/revalidateGeschiedenis';
import { historischeFotosImportEndpoint } from './HistorischeFotosImportEndpoint';

export const HistorischeFotos: CollectionConfig = {
  slug: 'historische-fotos',
  admin: {
    useAsTitle: 'title',
    components: {
      beforeListTable: ['/collections/HistorischeFotosImportButton#HistorischeFotosImportButton'],
      edit: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default'],
      },
    },
  },
  access: authoredContentAccess,
  endpoints: [
    {
      method: 'post',
      path: '/import',
      handler: historischeFotosImportEndpoint,
    },
  ],
  hooks: {
    beforeChange: [setAuthor('author')],
    afterChange: [revalidateHome, revalidateGeschiedenis],
    afterDelete: [revalidateHome, revalidateGeschiedenis],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'geografischeAanduiding',
      type: 'text',
    },
    {
      name: 'imageUrl',
      type: 'text',
      required: true,
      admin: {
        description:
          'Externe afbeeldings-URL (bijv. Stadsarchief beeldbank). Wordt rechtstreeks als <img src> gebruikt, niet gehost op deze site.',
      },
    },
    {
      name: 'imagePreview',
      type: 'ui',
      admin: {
        components: {
          Field: '/collections/HistorischeFotosImagePreview#HistorischeFotosImagePreview',
        },
      },
    },
    {
      name: 'bronUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Link naar de originele bronpagina (bronvermelding, later opnieuw importeren).',
      },
    },
    {
      name: 'datering',
      type: 'text',
      admin: { description: 'Zoals het Stadsarchief het vermeldt, bijv. "17 januari 1906" of "ca. 1930".' },
    },
    {
      name: 'vervaardiger',
      type: 'text',
      admin: { description: 'Fotograaf of tekenaar, zoals vermeld in de Beeldbank.' },
    },
    {
      name: 'rechten',
      type: 'select',
      defaultValue: 'onbekend',
      required: true,
      options: [
        { label: 'Vrij te gebruiken', value: 'vrij' },
        { label: 'Toestemming nodig', value: 'toestemming' },
        { label: 'Onbekend', value: 'onbekend' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Bij "Toestemming nodig" toont de site de foto niet, alleen een link naar de Beeldbank. De geschiedenispagina toont alleen "Vrij te gebruiken".',
      },
      access: {
        update: isRedacteurOrAdminField,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published'],
      defaultValue: 'draft',
      required: true,
      access: {
        update: isRedacteurOrAdminField,
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
      access: {
        update: isRedacteurOrAdminField,
      },
    },
    {
      name: 'slideshows',
      type: 'relationship',
      relationTo: 'slideshows',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Bepaalt de volgorde binnen een slideshow (samen met de order van HeroSlides).',
      },
    },
  ],
};
