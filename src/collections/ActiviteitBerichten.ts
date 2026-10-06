import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig, Where } from 'payload';
import { APIError } from 'payload';
import { isAdmin } from '../access/isAdmin';
import { hasRoleAtLeast } from '../access/roles';
import { viaEigenActiviteit } from '../access/activiteiten';
import { ACTIEVE_FASES, BERICHTEN_DAGLIMIET, MAX_BERICHTEN_PER_WEEK, voornaam } from '../lib/activiteiten/constants';
import { berichtMail, verstuurBatch, type Locale } from '../lib/activiteiten/mail';
import { bulkMailsLaatste24Uur } from '../lib/mailQuotum';
import { titels } from '../lib/activiteiten/workflow';

const DAG = 24 * 60 * 60 * 1000;
const fout = (bericht: string, status = 400) => new APIError(bericht, status, null, true);

/** Alleen de eigenaar (of de redactie), alleen bij een lopende activiteit, en binnen de limieten. */
const controleer: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data;
  if (!req.user) throw fout('Niet ingelogd.', 401);
  const activiteitId = typeof data.activiteit === 'object' ? data.activiteit?.id : data.activiteit;
  const activiteit = await req.payload.findByID({ collection: 'activiteiten', id: activiteitId, depth: 0, overrideAccess: true, req });
  const redactie = hasRoleAtLeast(req.user.role, 'redacteur');
  const eigenaarId = typeof activiteit.eigenaar === 'object' ? activiteit.eigenaar?.id : activiteit.eigenaar;

  if (!redactie && String(eigenaarId) !== String(req.user.id)) throw fout('Je kunt alleen berichten sturen voor je eigen activiteit.', 403);
  if (!ACTIEVE_FASES.includes(activiteit.fase)) throw fout('Berichten sturen kan alleen bij een goedgekeurde activiteit of een die doorgaat.');

  if (!redactie) {
    const { totalDocs } = await req.payload.count({
      collection: 'activiteit-berichten',
      where: { and: [{ activiteit: { equals: activiteitId } }, { createdAt: { greater_than: new Date(Date.now() - 7 * DAG).toISOString() } }] },
      req,
    });
    if (totalDocs >= MAX_BERICHTEN_PER_WEEK) {
      throw fout(`Je kunt maximaal ${MAX_BERICHTEN_PER_WEEK} berichten per 7 dagen sturen. Probeer het later opnieuw.`);
    }
  }

  // Rem op het mailquotum: berichten aan deelnemers en de nieuwsbrief van de afgelopen 24 uur samen.
  const [recent, { totalDocs: ontvangers }] = await Promise.all([
    bulkMailsLaatste24Uur(req.payload, req),
    req.payload.count({
      collection: 'activiteit-inschrijvingen',
      where: { and: [{ activiteit: { equals: activiteitId } }, { status: { equals: 'actief' } }] },
      req,
    }),
  ]);
  if (ontvangers === 0) throw fout('Er zijn nog geen deelnemers om een bericht aan te sturen.');
  if (recent.berichten + recent.nieuwsbrief + ontvangers > BERICHTEN_DAGLIMIET) {
    throw fout('Het maximum aantal mails voor vandaag is bereikt. Probeer het morgen opnieuw.');
  }

  return { ...data, afzender: req.user.id };
};

/** Na opslaan: iedere actieve deelnemer krijgt een eigen mail met afmeldlink; reply-to is de afzender. */
const verstuurBericht: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc;
  const activiteitId = typeof doc.activiteit === 'object' ? doc.activiteit?.id : doc.activiteit;
  const activiteit = await req.payload.findByID({ collection: 'activiteiten', id: activiteitId, depth: 0, overrideAccess: true, req });
  const t = await titels(req.payload, activiteitId, req);
  const afzender = req.user;
  const naam = voornaam(afzender?.name) || voornaam(activiteit.aanvragerNaam) || 'de organisator';

  const { docs: deelnemers } = await req.payload.find({
    collection: 'activiteit-inschrijvingen',
    where: { and: [{ activiteit: { equals: activiteitId } }, { status: { equals: 'actief' } }] },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  });

  await verstuurBatch(
    deelnemers.map((d) => {
      const locale: Locale = d.locale === 'en' ? 'en' : 'nl';
      return berichtMail({
        to: d.email,
        locale,
        titel: t[locale],
        organisator: naam,
        replyTo: afzender?.email,
        onderwerp: doc.onderwerp,
        tekst: doc.tekst,
        token: d.token,
      });
    }),
  );

  const bijgewerkt = await req.payload.update({
    collection: 'activiteit-berichten',
    id: doc.id,
    overrideAccess: true,
    req,
    data: { verzondenOp: new Date().toISOString(), aantalOntvangers: deelnemers.length },
  });
  return bijgewerkt;
};

/** Berichten van een organisator aan de deelnemers. Opslaan is versturen; daarna alleen nog lezen. */
export const ActiviteitBerichten: CollectionConfig = {
  slug: 'activiteit-berichten',
  labels: { singular: 'Bericht aan deelnemers', plural: 'Berichten aan deelnemers' },
  admin: {
    useAsTitle: 'onderwerp',
    group: 'Activiteiten',
    defaultColumns: ['onderwerp', 'activiteit', 'aantalOntvangers', 'verzondenOp'],
    description: `Opslaan = versturen aan alle actieve deelnemers. Antwoorden komen bij jou binnen. Maximaal ${MAX_BERICHTEN_PER_WEEK} berichten per 7 dagen per activiteit.`,
  },
  access: {
    read: viaEigenActiviteit,
    create: ({ req }) => Boolean(req.user),
    update: () => false,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [controleer],
    afterChange: [verstuurBericht],
  },
  fields: [
    {
      name: 'activiteit',
      type: 'relationship',
      relationTo: 'activiteiten',
      required: true,
      index: true,
      filterOptions: ({ user }): Where =>
        hasRoleAtLeast(user?.role, 'redacteur')
          ? { fase: { in: ACTIEVE_FASES } }
          : { and: [{ eigenaar: { equals: user?.id } }, { fase: { in: ACTIEVE_FASES } }] },
    },
    { name: 'onderwerp', type: 'text', required: true, maxLength: 120 },
    {
      name: 'tekst',
      type: 'textarea',
      required: true,
      maxLength: 5000,
      admin: { description: 'Platte tekst; links mogen. Onder elke mail komt automatisch een afmeldlink.' },
    },
    { name: 'afzender', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'verzondenOp', type: 'date', admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'aantalOntvangers', type: 'number', admin: { readOnly: true, position: 'sidebar' } },
  ],
};
