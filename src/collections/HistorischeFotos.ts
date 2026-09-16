import type { CollectionConfig } from 'payload';
import { authoredContentAccess } from '../access/contentAccess';
import { isRedacteurOrAdminField } from '../access/isAdmin';
import { setAuthor } from './shared/setAuthor';
import { revalidateHome } from './shared/revalidateHome';
import { historischeFotosImportEndpoint } from './HistorischeFotosImportEndpoint';

export const HistorischeFotos: CollectionConfig = {
  slug: 'historische-fotos',
  admin: {
    useAsTitle: 'title',
    components: {
      beforeListTable: ['/src/collections/HistorischeFotosImportButton#HistorischeFotosImportButton'],
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
    afterChange: [revalidateHome],
    afterDelete: [revalidateHome],
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
          Field: '/src/collections/HistorischeFotosImagePreview#HistorischeFotosImagePreview',
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
