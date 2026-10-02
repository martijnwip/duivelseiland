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
      // Gezet bij goedkeuring van een activiteit (src/lib/activiteiten/agenda.ts). Alleen agenda-items mét koppeling tonen
      // een aanmeldknop naar de activiteit (docs/brief-activiteiten.md, flow 7).
      name: 'activiteit',
      type: 'relationship',
      relationTo: 'activiteiten',
      admin: {
        position: 'sidebar',
        description: 'Optioneel. Gekoppelde buurtactiviteit; bezoekers kunnen zich dan via dit agenda-item aanmelden.',
      },
    },
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
    {
      type: 'collapsible',
      label: 'Rijke pagina-indeling (optioneel)',
      admin: {
        description:
          'Voor een agenda-item dat meer nodig heeft dan de gewone tekst hierboven: een korte intro, een programma in stappen en een knop (bijv. naar een WhatsApp-groep). Leeg laten toont gewoon de tekst uit het veld "Content".',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'intro',
          type: 'textarea',
          localized: true,
          admin: {
            description: 'Korte introductiezin bovenaan de pagina, onder de titel.',
          },
        },
        {
          name: 'schedule',
          type: 'array',
          labels: {
            singular: 'Programmaonderdeel',
            plural: 'Programma',
          },
          admin: {
            description: 'De stappen van het programma, in volgorde (bijv. verzamelen, opruimen, koffie).',
          },
          fields: [
            {
              name: 'time',
              type: 'text',
              admin: {
                width: '30%',
                description: 'Bijv. 12:30 (mag leeg blijven)',
              },
            },
            {
              name: 'icon',
              type: 'select',
              defaultValue: 'meeting',
              admin: {
                width: '30%',
              },
              options: [
                { label: 'Verzamelen', value: 'meeting' },
                { label: 'Opruimen', value: 'cleanup' },
                { label: 'Koffie/afsluiting', value: 'coffee' },
                { label: 'Geen icoon', value: 'none' },
              ],
            },
            {
              name: 'title',
              type: 'text',
              // Bewust niet required: dit item is grotendeels statisch en hoeft niet
              // per se in elke locale vertaald te zijn. localization.fallback (zie
              // payload.config.ts) toont bij een lege locale automatisch de andere
              // taal, en AgendaDetailPage filtert stappen zonder titel toch al weg.
              localized: true,
              admin: {
                width: '40%',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
            },
          ],
        },
        {
          name: 'ctaLabel',
          type: 'text',
          localized: true,
          admin: {
            width: '50%',
            description: 'Tekst op de knop, bijv. "Join WhatsApp group".',
          },
        },
        {
          name: 'whatsappNumber',
          type: 'text',
          admin: {
            width: '50%',
            description:
              'Telefoonnummer voor de WhatsApp-knop, bijv. 0612345678 — wordt automatisch omgezet naar een wa.me-link. Heb je liever een kant-en-klare link (bijv. een groepsuitnodiging)? Vul die dan hieronder in bij "Link" in plaats van dit veld.',
          },
        },
        {
          name: 'ctaUrl',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Link waar de knop naartoe gaat (alleen gebruikt als hierboven geen WhatsApp-nummer is ingevuld).',
          },
        },
      ],
    },
  ],
};
