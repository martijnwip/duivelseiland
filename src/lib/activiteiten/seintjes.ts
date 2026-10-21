import type { Payload } from 'payload';
import type { Activiteiten, NieuwsbriefAbonnee } from '../../../payload-types';
import { normaliseerEmail } from '../adresboek';
import { bulkmailToegestaan, escapeHtml, mailHtml, siteUrl, verstuurBatch, type Locale, type Mail } from '../mail';
import { beschikbaarBudget } from '../nieuwsbrief/verzenden';
import { ACTIEVE_FASES, voornaam } from './constants';
import { lexicalNaarTekst } from './lexical';

/**
 * Seintjes over nieuwe ideeën: abonnees met het vinkje `ideeen` krijgen een mail als de redactie een idee van
 * een buur goedkeurt. Eén keer per dag, met de cron van de nieuwsbrief (src/endpoints/nieuwsbriefVerzenden.ts):
 * wie die dag meerdere nieuwe ideeën heeft, krijgt ze in één mail. Telt mee in het dagquotum van de nieuwsbrief.
 */

// Ouder dan dit is geen nieuws meer, ook niet voor wie de seintjes een tijd niet kreeg (bv. door het quotum).
const MAX_OUDERDOM_MS = 30 * 24 * 60 * 60 * 1000;

type Idee = Pick<Activiteiten, 'id' | 'title' | 'slug' | 'content' | 'aanvragerNaam' | 'aanvragerEmail' | 'goedgekeurdOp'>;

const T = {
  nl: {
    eenBuur: 'Een buur',
    onderwerpEen: (naam: string, titel: string) => `${naam} heeft een idee: ${titel}`,
    onderwerpMeer: (titels: string) => `Nieuwe ideeën in de buurt: ${titels}`,
    intro: 'Een buur wil iets organiseren in de buurt. Lijkt het je wat? Meld je aan op de pagina, dan weet de organisator dat je meedoet.',
    regel: (naam: string, titel: string) => `<strong>${naam}</strong> heeft een idee: <strong>${titel}</strong>`,
    bekijk: 'Bekijk het idee',
    reden: 'Je krijgt deze mail omdat je een seintje wilde bij nieuwe ideeën voor activiteiten.',
    afmelden: 'Geen seintjes meer? Meld je af voor deze mails',
    blijft: 'De nieuwsbrief blijft gewoon komen.',
  },
  en: {
    eenBuur: 'A neighbour',
    onderwerpEen: (naam: string, titel: string) => `${naam} has an idea: ${titel}`,
    onderwerpMeer: (titels: string) => `New ideas in the neighbourhood: ${titels}`,
    intro: "A neighbour wants to organise something in the neighbourhood. Interested? Sign up on the page so the organiser knows you're in.",
    regel: (naam: string, titel: string) => `<strong>${naam}</strong> has an idea: <strong>${titel}</strong>`,
    bekijk: 'View the idea',
    reden: "You're receiving this because you asked for a heads-up about new activity ideas.",
    afmelden: 'No more heads-ups? Unsubscribe from these emails',
    blijft: "You'll still get the newsletter.",
  },
} satisfies Record<Locale, unknown>;

function kort(tekst: string, max = 200) {
  const schoon = tekst.replace(/\s+/g, ' ').trim();
  return schoon.length > max ? `${schoon.slice(0, max).replace(/\s+\S*$/, '')}…` : schoon;
}

/** Afmeldlink voor alleen de seintjes; de nieuwsbrief blijft. */
export const ideeenAfmeldLink = (locale: Locale, token: string) => siteUrl(locale, `/nieuwsbrief/ideeen-afmelden/${token}`);

export function seintjeMail(ideeen: Idee[], abonnee: Pick<NieuwsbriefAbonnee, 'email' | 'token'>, locale: Locale): Mail {
  const t = T[locale];
  const naam = (idee: Idee) => voornaam(idee.aanvragerNaam) || t.eenBuur;
  const subject = ideeen.length === 1 ? t.onderwerpEen(naam(ideeen[0]), ideeen[0].title) : t.onderwerpMeer(ideeen.map((i) => i.title).join(', '));
  const afmeldUrl = ideeenAfmeldLink(locale, abonnee.token);
  const blokken = ideeen.map((idee) => {
    const url = siteUrl(locale, `/activiteiten/${idee.slug}`);
    const tekst = kort(lexicalNaarTekst(idee.content));
    return `<p>${t.regel(escapeHtml(naam(idee)), escapeHtml(idee.title))}${tekst ? `<br>${escapeHtml(tekst)}` : ''}<br><a href="${url}">${t.bekijk}</a></p>`;
  });
  return {
    to: abonnee.email,
    subject,
    html: mailHtml({ alineas: [t.intro, ...blokken], voet: [t.reden, `<a href="${afmeldUrl}">${t.afmelden}</a>. ${t.blijft}`] }),
    headers: { 'List-Unsubscribe': `<${afmeldUrl}>` },
  };
}

/** Ideeën die sinds `sinds` zijn goedgekeurd en nog open zijn, in één taal. */
async function nieuweIdeeen(payload: Payload, locale: Locale, sinds: Date, tot: string) {
  const { docs } = await payload.find({
    collection: 'activiteiten',
    where: {
      and: [
        { fase: { in: ACTIEVE_FASES } },
        { goedgekeurdOp: { greater_than: sinds.toISOString() } },
        { goedgekeurdOp: { less_than_equal: tot } },
      ],
    },
    select: { title: true, slug: true, content: true, aanvragerNaam: true, aanvragerEmail: true, goedgekeurdOp: true },
    sort: 'goedgekeurdOp',
    locale,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  });
  return docs as Idee[];
}

/**
 * Stuurt de seintjes die klaarstaan, zoveel als het quotum toelaat; de rest volgt de volgende dag. Buiten
 * productie gebeurt er niets (zoals bij de nieuwsbrief). Wie zelf het idee had, krijgt er geen seintje over.
 */
export async function verstuurIdeeenSeintjes(payload: Payload) {
  if (!bulkmailToegestaan()) return { verzonden: 0, geblokkeerd: true };
  const tot = new Date().toISOString();
  const oudste = new Date(Date.now() - MAX_OUDERDOM_MS);
  const ideeen = { nl: await nieuweIdeeen(payload, 'nl', oudste, tot), en: await nieuweIdeeen(payload, 'en', oudste, tot) };
  if (!ideeen.nl.length) return { verzonden: 0 };
  const nieuwste = ideeen.nl.at(-1)!.goedgekeurdOp!;

  const budget = await beschikbaarBudget(payload);
  if (budget === 0) return { verzonden: 0 };

  const { docs: abonnees } = await payload.find({
    collection: 'nieuwsbrief-abonnees',
    where: { and: [{ status: { equals: 'actief' } }, { ideeen: { equals: true } }, { ideeenVanaf: { less_than: nieuwste } }] },
    sort: 'id',
    limit: budget,
    depth: 0,
    overrideAccess: true,
  });

  let verzonden = 0;
  for (let i = 0; i < abonnees.length; i += 100) {
    const portie = abonnees.slice(i, i + 100);
    const mails: Mail[] = [];
    for (const abonnee of portie) {
      const locale: Locale = abonnee.locale === 'en' ? 'en' : 'nl';
      const vanaf = Math.max(oudste.getTime(), abonnee.ideeenVanaf ? new Date(abonnee.ideeenVanaf).getTime() : 0);
      const email = normaliseerEmail(abonnee.email);
      const voorDeze = ideeen[locale].filter(
        (idee) => new Date(idee.goedgekeurdOp!).getTime() > vanaf && normaliseerEmail(idee.aanvragerEmail ?? '') !== email,
      );
      if (voorDeze.length) mails.push(seintjeMail(voorDeze, abonnee, locale));
    }
    try {
      await verstuurBatch(mails, { idempotencyKey: `ideeen-${tot}-${portie[0].id}-${portie.at(-1)!.id}` });
    } catch (error) {
      payload.logger.error(`[ideeen] seintjes versturen mislukt, volgende run probeert opnieuw: ${JSON.stringify(error)}`);
      return { verzonden, fout: true };
    }
    // Ook wie alleen een eigen idee had, is bijgewerkt: die hoeft er morgen niet opnieuw langs.
    await payload.update({
      collection: 'nieuwsbrief-abonnees',
      where: { id: { in: portie.map((a) => a.id) } },
      data: { ideeenVanaf: tot },
      overrideAccess: true,
    });
    const gemaild = new Set(mails.map((m) => normaliseerEmail(m.to)));
    const ids = portie.filter((a) => gemaild.has(normaliseerEmail(a.email))).map((a) => a.id);
    if (ids.length) {
      await payload.update({ collection: 'nieuwsbrief-abonnees', where: { id: { in: ids } }, data: { ideeenGemaildOp: tot }, overrideAccess: true });
    }
    verzonden += mails.length;
  }
  return { verzonden };
}
