import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload';
import { editorOnlyContentAccess } from '../access/contentAccess';
import { authorField, statusField } from './shared/contentFields';
import { isRedacteurOrAdminField, telefoonLeesbaar } from '../access/isAdmin';
import { setAuthor } from './shared/setAuthor';
import { adresboekHooks } from '../lib/adresboek';
import { GERESERVEERDE_SLUGS, MODERATIE, MODERATIE_LABELS, TELEFOON, WEBSITE } from '../lib/vaklui/constants';
import { SLUG_PATROON, uniekeSlug } from '../lib/slug';
import { vakmanAfterChange, vakmanBeforeChange } from '../lib/vaklui/workflow';

// De aanmelder heeft een buurtpas, dus het adres is al bevestigd.
const adresboek = adresboekHooks<{ aanmelderEmail?: string | null }>(
  (d) => d.aanmelderEmail,
  () => true,
);

// Alleen als hij nog leeg is: een nieuwe naam verandert de slug niet, zodat gedeelde links blijven werken.
const vulSlug: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  if (!data || ('slug' in data ? data.slug : originalDoc?.slug)) return data;
  const naam = data.naam ?? originalDoc?.naam;
  if (naam) data.slug = await uniekeSlug(req.payload, 'vaklui', naam, { gereserveerd: GERESERVEERDE_SLUGS, fallback: 'vakman' });
  return data;
};

const isAanmelding = (data: { moderatie?: string | null } | undefined) => Boolean(data?.moderatie);

/**
 * Vaklui uit de buurt: naam, vak(ken), telefoon, website en eventueel een aanbeveling van een buur. Getoond als één overzicht op /vaklui.
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
    beforeValidate: [vulSlug],
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
      // Openbaar als telefoonPubliek aanstaat; anders alleen voor bezoekers met een buurtpas (src/lib/buurtpas).
      access: { read: telefoonLeesbaar },
      admin: { description: 'Zichtbaar met een buurtpas, of voor iedereen als het vinkje hieronder aanstaat.' },
      validate: (value: string | null | undefined) =>
        !value || TELEFOON.test(value.trim()) || 'Vul een geldig telefoonnummer in, bv. 06 12345678.',
    },
    {
      name: 'telefoonPubliek',
      label: 'Telefoonnummer openbaar tonen',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Aan: iedereen ziet het nummer. Uit: alleen bezoekers met een buurtpas.' },
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
    {
      name: 'aanbeveling',
      type: 'textarea',
      maxLength: 500,
      localized: true,
      admin: {
        description:
          'Uit het aanmeldformulier, zonder naam van de aanmelder. Staat op de site zodra de vakman gepubliceerd is; pas aan of maak leeg als het niet geschikt is.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      access: { update: isRedacteurOrAdminField },
      admin: {
        position: 'sidebar',
        description: 'Adres van de pagina: /vaklui/<slug>. Wordt gemaakt uit de naam. Niet meer wijzigen als de link gedeeld is.',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return true; // vulSlug vult hem
        if (!SLUG_PATROON.test(value)) return 'Alleen kleine letters, cijfers en streepjes.';
        if (GERESERVEERDE_SLUGS.includes(value)) return `"${value}" is gereserveerd.`;
        return true;
      },
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
