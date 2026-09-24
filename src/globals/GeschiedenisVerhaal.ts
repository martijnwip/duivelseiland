import type { GlobalConfig } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';
import { revalidateGeschiedenis } from '../collections/shared/revalidateGeschiedenis';
import { introEditor } from './editors';
import { revalidateHome } from '../collections/shared/revalidateHome';

/** Iconen voor de knopen op de tijdlijn; de tekeningen staan in src/components/geschiedenis/icons.tsx. */
export const TIJDLIJN_ICONEN = [
  'school',
  'brandweer',
  'kaart',
  'brug',
  'eiland',
  'duivel',
  'camera',
  'fabriek',
  'circus',
  'fiets',
  'zwemmer',
  'huis',
  'kroon',
] as const;

/** Vaste infographics (React/SVG) die na een tijdvak kunnen komen; labels staan in messages/. */
export const INFOGRAPHICS = ['groeit', 'eilanden', 'fabriek', 'omDeHoek', 'maten'] as const;

const fotoRelatie = {
  type: 'relationship' as const,
  relationTo: 'historische-fotos' as const,
  filterOptions: { status: { equals: 'published' } },
};

/**
 * Het verhaal op /geschiedenis: een tijdlijn van tijdvakken met gebeurtenissen.
 * Zie docs/design-brief-geschiedenis.md voor de opbouw.
 */
export const GeschiedenisVerhaal: GlobalConfig = {
  slug: 'geschiedenis-verhaal',
  label: 'Geschiedenisverhaal',
  admin: {
    description: 'Het verhaal op de pagina Geschiedenis. Losse geschiedenis-items verschijnen daaronder als "Meer verhalen".',
    components: {
      elements: {
        beforeDocumentControls: ['/components/admin/TranslateButton#default'],
      },
    },
  },
  access: {
    read: () => true,
    update: isRedacteurOrAdmin,
  },
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        revalidateGeschiedenis({ req });
        if (!req.context?.disableRevalidate) revalidateHome();
        return doc;
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Opening',
          fields: [
            { name: 'titel', type: 'text', required: true, localized: true },
            { name: 'ondertitel', type: 'text', localized: true },
            {
              name: 'openingszin',
              type: 'text',
              localized: true,
              admin: { description: 'Eén korte, opvallende zin, in het rood onder de ondertitel.' },
            },
            { name: 'intro', type: 'textarea', localized: true },
            { name: 'heroFoto', ...fotoRelatie, admin: { description: 'Alleen foto\'s met rechten "Vrij te gebruiken" worden getoond.' } },
            {
              name: 'kerncijfers',
              type: 'array',
              maxRows: 4,
              fields: [
                { name: 'waarde', type: 'text', required: true, localized: true },
                { name: 'label', type: 'text', required: true, localized: true },
              ],
            },
          ],
        },
        {
          label: 'Tijdvakken',
          fields: [
            {
              name: 'tijdvakken',
              type: 'array',
              labels: { singular: 'Tijdvak', plural: 'Tijdvakken' },
              admin: { initCollapsed: true, components: { RowLabel: '/globals/TijdvakRowLabel#TijdvakRowLabel' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'anker',
                      type: 'text',
                      required: true,
                      admin: { width: '33%', description: 'Voor links, bijv. "naam" → /geschiedenis#naam.' },
                    },
                    {
                      name: 'band',
                      type: 'text',
                      required: true,
                      localized: true,
                      admin: { width: '33%', description: 'Periode op de tijdlijn, bijv. "1896–1906".' },
                    },
                    {
                      name: 'kleur',
                      type: 'select',
                      defaultValue: 'groen',
                      options: ['grijs', 'rood', 'blauw', 'groen'],
                      admin: { width: '33%' },
                    },
                  ],
                },
                { name: 'titel', type: 'text', required: true, localized: true },
                { name: 'kernzin', type: 'text', localized: true },
                { name: 'tekst', type: 'richText', localized: true, editor: introEditor },
                {
                  name: 'gebeurtenissen',
                  type: 'array',
                  labels: { singular: 'Gebeurtenis', plural: 'Gebeurtenissen' },
                  admin: { description: 'De knopen op de tijdlijn.' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'datum',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: { width: '33%', description: 'Zoals getoond, bijv. "ca. 1920".' },
                        },
                        {
                          name: 'jaar',
                          type: 'number',
                          admin: { width: '33%', description: 'Voor de jaarteller; leeg laten mag.' },
                        },
                        {
                          name: 'icoon',
                          type: 'select',
                          required: true,
                          defaultValue: 'huis',
                          options: [...TIJDLIJN_ICONEN],
                          admin: { width: '33%' },
                        },
                      ],
                    },
                    { name: 'titel', type: 'text', required: true, localized: true },
                    { name: 'tekst', type: 'textarea', localized: true },
                    { name: 'foto', ...fotoRelatie },
                    {
                      name: 'breukLabel',
                      type: 'text',
                      localized: true,
                      admin: { description: 'Optioneel: toont vóór deze gebeurtenis een onderbroken as, bijv. "12 jaar later".' },
                    },
                  ],
                },
                {
                  name: 'fotos',
                  ...fotoRelatie,
                  hasMany: true,
                  admin: { description: 'Extra foto\'s onder de tijdlijn van dit tijdvak.' },
                },
                {
                  name: 'kader',
                  type: 'group',
                  admin: { description: 'Optioneel uitlegkader, bijv. "Wie was Dreyfus?".' },
                  fields: [
                    { name: 'titel', type: 'text', localized: true },
                    { name: 'tekst', type: 'textarea', localized: true },
                  ],
                },
                {
                  name: 'infographic',
                  type: 'select',
                  options: [...INFOGRAPHICS],
                  admin: { description: 'Vaste infographic die na dit tijdvak komt.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Afsluiting',
          fields: [
            {
              name: 'archief',
              ...fotoRelatie,
              hasMany: true,
              admin: { description: 'Slideshow "Uit het archief". Alleen foto\'s met rechten "Vrij te gebruiken" worden getoond.' },
            },
            { name: 'onbekendTekst', type: 'richText', localized: true, editor: introEditor, admin: { description: 'Blok "Wat we (nog) niet weten".' } },
            {
              name: 'bronnen',
              type: 'array',
              fields: [{ name: 'tekst', type: 'text', required: true, localized: true }],
            },
          ],
        },
      ],
    },
  ],
};
