import type { CollectionBeforeDeleteHook, CollectionConfig } from 'payload';
import { isRedacteurOrAdmin, isRedacteurOrAdminField } from '../access/isAdmin';
import { isOwnerOrRedacteur } from '../access/isOwnerOrRedacteur';
import { readActiviteiten, redactieOfEigenaarField } from '../access/activiteiten';
import { ACTIEVE_FASES, FASES, FASE_LABELS, GERESERVEERDE_SLUGS } from '../lib/activiteiten/constants';
import { activiteitAfterChange, activiteitBeforeChange } from '../lib/activiteiten/workflow';
import { adresboekHooks } from '../lib/adresboek';

// De aanvrager staat in het adresboek; bevestigd zodra het idee niet meer op e-mailbevestiging wacht.
const adresboek = adresboekHooks<{ aanvragerEmail?: string | null; fase: string }>(
  (d) => d.aanvragerEmail,
  (d) => d.fase !== 'onbevestigd',
);

// Aanmeldinstellingen horen pas bij een goedgekeurde activiteit.
const naGoedkeuring = (data: { fase?: string } | undefined) => ACTIEVE_FASES.includes(data?.fase as never);

// Persoonsgegevens van deelnemers en berichten horen bij de activiteit; ze gaan mee als die verdwijnt.
// Vóór het verwijderen: hun `activiteit`-kolom is verplicht, dus de database weigert anders.
const ruimGekoppeldeOp: CollectionBeforeDeleteHook = async ({ id, req }) => {
  for (const collection of ['activiteit-inschrijvingen', 'activiteit-berichten'] as const) {
    await req.payload.delete({ collection, where: { activiteit: { equals: id } }, overrideAccess: true, req });
  }
  // agenda.activiteit_id is via ALTER TABLE toegevoegd en heeft daardoor geen ON DELETE SET NULL.
  await req.payload.update({
    collection: 'agenda',
    where: { activiteit: { equals: id } },
    data: { activiteit: null },
    overrideAccess: true,
    req,
  });
};

/**
 * Buurtactiviteiten die bewoners zelf aanmelden en organiseren; zie docs/brief-activiteiten.md.
 * Aanmaken gaat via het formulier op /activiteiten/aanmelden (server action), niet via /admin.
 */
export const Activiteiten: CollectionConfig = {
  slug: 'activiteiten',
  labels: { singular: 'Activiteit', plural: 'Activiteiten' },
  admin: {
    useAsTitle: 'title',
    group: 'Activiteiten',
    defaultColumns: ['title', 'fase', 'aanvragerNaam', 'aanvragerEmail', 'inschrijving', 'updatedAt'],
    description:
      'Ideeën en activiteiten van buurtbewoners. Nieuwe ideeën staan op "Wacht op goedkeuring": keur goed of wijs af met een reden (knoppen bovenaan het item). Na goedkeuring staat de activiteit online en kunnen buren zich aanmelden.',
    components: {
      edit: {
        beforeDocumentControls: [
          '/components/admin/ModeratieKnoppen#default',
          '/components/admin/TranslateButton#default',
        ],
      },
    },
  },
  access: {
    read: readActiviteiten,
    create: isRedacteurOrAdmin,
    update: isOwnerOrRedacteur('eigenaar'),
    delete: isRedacteurOrAdmin,
  },
  hooks: {
    beforeChange: [activiteitBeforeChange],
    afterChange: [activiteitAfterChange, adresboek.afterChange],
    afterDelete: [adresboek.afterDelete],
    beforeDelete: [ruimGekoppeldeOp],
  },
  fields: [
    { name: 'title', label: 'Titel', type: 'text', required: true, localized: true, maxLength: 80 },
    {
      name: 'content',
      label: 'Omschrijving',
      type: 'richText',
      localized: true,
      admin: { description: 'Wat, voor wie, hoe vaak en waar ongeveer.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'soort',
          type: 'select',
          required: true,
          defaultValue: 'eenmalig',
          options: [
            { label: 'Eenmalig', value: 'eenmalig' },
            { label: 'Terugkerend', value: 'terugkerend' },
          ],
          admin: { width: '40%' },
        },
        {
          name: 'soortToelichting',
          label: 'Hoe vaak',
          type: 'text',
          localized: true,
          maxLength: 120,
          admin: {
            width: '60%',
            description: 'Bijv. "elke eerste dinsdag van de maand".',
            condition: (data) => data?.soort === 'terugkerend',
          },
        },
      ],
    },
    {
      name: 'datum',
      label: 'Datum en tijd',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy HH:mm' },
        description:
          'Kan altijd nog gewijzigd worden. Nodig om de activiteit op de agenda te zetten. Zolang de fase Goedgekeurd is, staat er "Nog niet definitief" bij.',
      },
    },
    { name: 'image', label: 'Headerafbeelding', type: 'upload', relationTo: 'media' },
    {
      name: 'locale',
      label: 'Taal van de mails',
      type: 'select',
      required: true,
      defaultValue: 'nl',
      options: [
        { label: 'Nederlands', value: 'nl' },
        { label: 'English', value: 'en' },
      ],
      admin: { description: 'De taal waarin aanvrager en organisator mails krijgen.' },
    },

    // --- Zijbalk ---
    {
      name: 'fase',
      type: 'select',
      required: true,
      defaultValue: 'ingediend',
      index: true,
      options: FASES.map((value) => ({ value, label: FASE_LABELS[value] })),
      admin: {
        position: 'sidebar',
        description: 'Goedkeuren en afwijzen doet de redactie (knoppen bovenaan). Daarna kiest de organisator: Gaat door, Afgelast of Afgelopen.',
      },
    },
    {
      name: 'afwijsReden',
      label: 'Reden van afkeuren',
      type: 'textarea',
      access: { read: redactieOfEigenaarField, update: isRedacteurOrAdminField },
      admin: {
        position: 'sidebar',
        description: 'Alleen invullen als je afkeurt; wordt naar de organisator gemaild.',
        // De redactie kan in elke fase afkeuren; de organisator ziet de reden alleen als het is afgekeurd.
        condition: (data, _siblingData, { user }) =>
          data?.fase === 'afgewezen' || user?.role === 'redacteur' || user?.role === 'admin',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      access: { update: isRedacteurOrAdminField },
      admin: { position: 'sidebar', description: 'Adres van de pagina: /activiteiten/<slug>. Na goedkeuring niet meer wijzigen.' },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
          return 'Alleen kleine letters, cijfers en streepjes.';
        }
        if (GERESERVEERDE_SLUGS.includes(value)) return `"${value}" is gereserveerd.`;
        return true;
      },
    },
    {
      name: 'inschrijving',
      label: 'Aanmelden voor buren',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Open (buren kunnen zich aanmelden)', value: 'open' },
        { label: 'Gesloten (niemand kan er meer bij)', value: 'gesloten' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Staat na goedkeuring open. De organisator sluit hem als het vol is; de activiteit blijft dan zichtbaar.',
        condition: naGoedkeuring,
      },
    },
    {
      name: 'maxDeelnemers',
      label: 'Maximum aantal deelnemers',
      type: 'number',
      min: 1,
      admin: { position: 'sidebar', description: 'Optioneel. Bij dit aantal sluit de aanmelding vanzelf.', condition: naGoedkeuring },
    },
    {
      name: 'toonAantal',
      label: 'Aantal aanmeldingen tonen op de site',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', condition: naGoedkeuring },
    },
    {
      name: 'meldingBijInschrijving',
      label: 'Mail mij bij elke nieuwe aanmelding',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', condition: naGoedkeuring },
    },
    // Aanvrager = de organisator. Vóór goedkeuring is er nog geen account; dan tonen we de gegevens van het
    // formulier, daarna het gekoppelde account (veld eigenaar).
    {
      name: 'aanvragerNaam',
      label: 'Organisator: naam',
      type: 'text',
      access: { update: isRedacteurOrAdminField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'aanvragerEmail',
      label: 'Organisator: e-mail',
      type: 'email',
      access: { read: redactieOfEigenaarField, update: isRedacteurOrAdminField },
      admin: {
        position: 'sidebar',
        description: 'Uit het aanmeldformulier, nooit publiek. Wordt bij goedkeuring automatisch de organisator.',
      },
    },
    {
      name: 'eigenaar',
      label: 'Organisator: account',
      type: 'relationship',
      relationTo: 'users',
      access: { update: isRedacteurOrAdminField },
      admin: {
        position: 'sidebar',
        description: 'Gekoppeld bij goedkeuring. De redactie kan het eigenaarschap overdragen.',
        condition: (data) => !['onbevestigd', 'ingediend', 'afgewezen'].includes(data?.fase),
      },
    },
    {
      name: 'agendaItem',
      label: 'Agenda-item',
      type: 'relationship',
      relationTo: 'agenda',
      access: { update: isRedacteurOrAdminField },
      admin: { position: 'sidebar', readOnly: true },
    },

    // --- Intern ---
    // Token voor de bevestig- en intrekken-link van de aanvrager.
    { name: 'token', type: 'text', index: true, access: { read: () => false, update: () => false }, admin: { hidden: true } },
    { name: 'laatsteMailOp', type: 'date', access: { read: () => false, update: () => false }, admin: { hidden: true } },
  ],
};
