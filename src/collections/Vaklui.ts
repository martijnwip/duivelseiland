import type { CollectionConfig } from 'payload';
import { editorOnlyContentAccess } from '../access/contentAccess';
import { authorField, statusField } from './shared/contentFields';
import { alleenIngelogdField, isRedacteurOrAdminField } from '../access/isAdmin';
import { setAuthor } from './shared/setAuthor';
import { adresboekHooks } from '../lib/adresboek';
import { MODERATIE, MODERATIE_LABELS, TELEFOON, WEBSITE } from '../lib/vaklui/constants';
import { vakmanAfterChange, vakmanBeforeChange } from '../lib/vaklui/workflow';

// De aanmelder heeft een buurtpas, dus het adres is al bevestigd.
const adresboek = adresboekHooks<{ aanmelderEmail?: string | null }>(
  (d) => d.aanmelderEmail,
  () => true,
);

const isAanmelding = (data: { moderatie?: string | null } | undefined) => Boolean(data?.moderatie);

/**
 * Vaklui uit de buurt: naam, vak(ken), telefoon en website. Getoond als één overzicht op /vaklui.
 * Buren met een buurtpas kunnen er een aanmelden via /vaklui/aanmelden; de redactie keurt die goed of af.
 */
export const Vaklui: CollectionConfig = {
  slug: 'vaklui',
  labels: {
    singular: 'Vakman',
    plural: 'Vaklui',
  },
  admin: {
    useAsTitle: 'naam',
    group: 'Vaklui',
    defaultColumns: ['naam', 'vakken', 'telefoon', 'status', 'moderatie'],
    description:
      'Aanmeldingen van buren staan op "Wacht op goedkeuring": keur goed of af met een reden (knoppen bovenaan het item). Goedkeuren zet de vakman direct online.',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/VakmanModeratieKnoppen#default'],
      },
    },
  },
  defaultSort: 'naam',
  access: editorOnlyContentAccess,
  hooks: {
    beforeChange: [setAuthor('author'), vakmanBeforeChange],
    afterChange: [vakmanAfterChange, adresboek.afterChange],
    afterDelete: [adresboek.afterDelete],
  },
  fields: [
    {
      name: 'naam',
      type: 'text',
      required: true,
    },
    {
      name: 'vakken',
      type: 'relationship',
      relationTo: 'vakken',
      hasMany: true,
      admin: {
        description: 'Kies één of meer vakken. Staat het vak er niet bij? Voeg het toe met de +.',
      },
      // Een aanmelding mag zonder vak binnenkomen (alleen "Ander vak"); live zetten kan pas met een vak.
      validate: (value: unknown, { siblingData }: { siblingData: { status?: string } }) =>
        siblingData?.status !== 'published' || (Array.isArray(value) && value.length > 0) || 'Kies minstens één vak.',
    },
    {
      name: 'anderVak',
      label: 'Ander vak (volgens de aanmelder)',
      type: 'text',
      maxLength: 60,
      admin: {
        description: 'Uit het aanmeldformulier. Voeg het vak toe bij Vakken (met de +) en maak dit veld daarna leeg.',
        condition: (data) => Boolean(data?.anderVak),
      },
    },
    {
      name: 'telefoon',
      type: 'text',
      // Alleen voor bezoekers met een buurtpas (src/lib/buurtpas); via de API alleen voor ingelogde gebruikers.
      access: { read: alleenIngelogdField },
      admin: { description: 'Alleen zichtbaar voor bezoekers met een buurtpas.' },
      validate: (value: string | null | undefined) =>
        !value || TELEFOON.test(value.trim()) || 'Vul een geldig telefoonnummer in, bv. 06 12345678.',
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Met http:// of https://, bv. https://www.voorbeeld.nl',
      },
      validate: (value: string | null | undefined) =>
        !value || WEBSITE.test(value.trim()) || 'Begin het adres met http:// of https://, bv. https://www.voorbeeld.nl',
    },
    statusField,
    authorField,

    // --- Moderatie (alleen bij een aanmelding via de site) ---
    {
      name: 'moderatie',
      type: 'select',
      index: true,
      options: MODERATIE.map((value) => ({ value, label: MODERATIE_LABELS[value] })),
      access: { update: isRedacteurOrAdminField },
      admin: {
        position: 'sidebar',
        description: 'Alleen bij een aanmelding via de site. Goedkeuren en afkeuren gaat met de knoppen bovenaan.',
        condition: isAanmelding,
      },
    },
    {
      name: 'afwijsReden',
      label: 'Reden van afkeuren',
      type: 'textarea',
      access: { read: isRedacteurOrAdminField, update: isRedacteurOrAdminField },
      admin: {
        position: 'sidebar',
        description: 'Alleen invullen als je afkeurt; wordt naar de aanmelder gemaild.',
        condition: isAanmelding,
      },
    },
    {
      name: 'aanmelderNaam',
      label: 'Aangemeld door',
      type: 'text',
      access: { read: isRedacteurOrAdminField, update: isRedacteurOrAdminField },
      admin: { position: 'sidebar', condition: isAanmelding },
    },
    {
      name: 'aanmelderEmail',
      label: 'E-mail aanmelder',
      type: 'email',
      access: { read: isRedacteurOrAdminField, update: isRedacteurOrAdminField },
      admin: { position: 'sidebar', description: 'Uit de buurtpas, nooit publiek.', condition: isAanmelding },
    },
    {
      name: 'aanmelderToelichting',
      label: 'Toelichting van de aanmelder',
      type: 'textarea',
      maxLength: 500,
      access: { read: isRedacteurOrAdminField, update: isRedacteurOrAdminField },
      admin: { position: 'sidebar', description: 'Alleen voor de redactie.', condition: isAanmelding },
    },
    {
      name: 'locale',
      label: 'Taal van de mails',
      type: 'select',
      options: [
        { label: 'Nederlands', value: 'nl' },
        { label: 'English', value: 'en' },
      ],
      access: { read: isRedacteurOrAdminField },
      admin: { position: 'sidebar', condition: isAanmelding },
    },

    // --- Intern ---
    // Token voor de intrekken-link van de aanmelder.
    { name: 'token', type: 'text', index: true, access: { read: () => false, update: () => false }, admin: { hidden: true } },
    { name: 'laatsteMailOp', type: 'date', access: { read: () => false, update: () => false }, admin: { hidden: true } },
  ],
};
