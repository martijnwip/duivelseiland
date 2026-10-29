import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';
import { isRedacteurOrAdmin } from '../access/isAdmin';
import { adresboekHooks } from '../lib/adresboek';
import { TELEFOON } from '../lib/vaklui/constants';
import { WHATSAPP_GROEPEN, WHATSAPP_STATUS } from '../lib/whatsapp-groepen/constants';
import { uitnodigenEndpoint } from '../lib/whatsapp-groepen/uitnodigen';

// De aanmelder heeft een buurtpas, dus het adres is al bevestigd.
const adresboek = adresboekHooks<{ email?: string | null }>(
  (d) => d.email,
  () => true,
);

/** Toegevoegd aan de groep(en): het telefoonnummer is niet meer nodig en gaat weg. */
const wisNummerNaToevoegen: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (data.status === 'toegevoegd' && originalDoc?.status !== 'toegevoegd') {
    return { ...data, telefoon: null, toegevoegdOp: new Date().toISOString() };
  }
  return data;
};

/**
 * Aanmeldingen voor de WhatsApp-groepen van de buurt, via /whatsapp (alleen met buurtpas). Voor de Buren-app
 * mailt de redactie de uitnodigingslink (knop "Uitnodiging sturen"); voor de Schoonmaak voegt ze het nummer
 * met de hand toe en zet de aanmelding op "Toegevoegd". Het nummer wordt dan gewist.
 */
export const WhatsappAanmeldingen: CollectionConfig = {
  slug: 'whatsapp-aanmeldingen',
  labels: { singular: 'WhatsApp-aanmelding', plural: 'WhatsApp-aanmeldingen' },
  typescript: { interface: 'WhatsappAanmelding' },
  admin: {
    useAsTitle: 'naam',
    group: 'Buurt',
    defaultColumns: ['naam', 'groepen', 'telefoon', 'status', 'createdAt'],
    description:
      'Buren die in een WhatsApp-groep willen. Buren-app: klik op "Uitnodiging sturen" (de aanvrager krijgt de link per mail). Duivelse Schoonmaak: voeg het nummer toe in WhatsApp en zet de status op "Toegevoegd". Het telefoonnummer wordt dan gewist.',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/WhatsappUitnodigenKnop#default'],
      },
    },
  },
  defaultSort: '-createdAt',
  access: {
    // Aanmelden gaat via het formulier (server action met de Local API), niet via de REST-API.
    create: () => false,
    read: isRedacteurOrAdmin,
    update: isRedacteurOrAdmin,
    delete: isRedacteurOrAdmin,
  },
  endpoints: [uitnodigenEndpoint],
  hooks: {
    beforeChange: [wisNummerNaToevoegen],
    afterChange: [adresboek.afterChange],
    afterDelete: [adresboek.afterDelete],
  },
  fields: [
    { name: 'naam', type: 'text', required: true, maxLength: 80 },
    {
      name: 'telefoon',
      type: 'text',
      admin: { description: 'Wordt gewist zodra de status op "Toegevoegd" gaat.' },
      validate: (value: string | null | undefined, { data }: { data: { status?: string; groepen?: string[] } }) =>
        // Verplicht voor de Schoonmaak (die voegt de redactie met het nummer toe); de Buren-app gaat met de uitnodigingslink.
        data?.status === 'toegevoegd' ||
        (value ? TELEFOON.test(value) : !data?.groepen?.includes('schoonmaak')) ||
        'Vul een geldig telefoonnummer in (verplicht voor de Duivelse Schoonmaak).',
    },
    {
      name: 'groepen',
      type: 'select',
      hasMany: true,
      required: true,
      options: WHATSAPP_GROEPEN.map((g) => ({ label: g.label, value: g.value })),
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'aangemeld',
      index: true,
      options: WHATSAPP_STATUS.map((s) => ({ label: s.label, value: s.value })),
      admin: { position: 'sidebar' },
    },
    { name: 'toegevoegdOp', type: 'date', admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'uitgenodigdOp',
      label: 'Uitnodiging Buren-app gemaild op',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' }, condition: (data) => Boolean(data?.uitgenodigdOp) },
    },
    {
      name: 'email',
      label: 'E-mailadres (uit de buurtpas)',
      type: 'email',
      required: true,
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'nl',
      options: [
        { label: 'Nederlands', value: 'nl' },
        { label: 'Engels', value: 'en' },
      ],
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
};
