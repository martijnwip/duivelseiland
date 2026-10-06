import type { PayloadHandler } from 'payload';
import { hasRoleAtLeast } from '../access/roles';
import { tekstNaarRijen, type ImportRij } from '../lib/nieuwsbrief/csv';
import { EMAIL_RE, nieuwToken } from '../lib/nieuwsbrief/token';

const MAX_ADRESSEN = 2000;

export type NieuwsbriefImportResultaat = {
  toegevoegd: number;
  geactiveerd: number;
  alActief: number;
  naamAangevuld: number;
  afgemeldOvergeslagen: string[];
  ongeldig: string[];
};

/**
 * Admin plakt een lijst adressen, of uploadt een CSV (die de browser al tot `rijen` omzet), van mensen
 * die al toestemming gaven (bijv. de oude Buurtborrel-lijst). Die worden direct actief, zonder
 * bevestigingsmail. Een afmelding wordt nooit teruggedraaid en een bestaande naam nooit overschreven.
 */
export const nieuwsbriefImportEndpoint: PayloadHandler = async (req) => {
  if (!hasRoleAtLeast(req.user?.role, 'admin')) {
    return Response.json({ message: 'Alleen een admin kan adressen importeren.' }, { status: 403 });
  }

  const body = (await req.json?.()) as
    | { tekst?: string; rijen?: ImportRij[]; locale?: string; toestemming?: boolean }
    | undefined;
  if (body?.toestemming !== true) {
    return Response.json({ message: 'Bevestig eerst dat deze mensen toestemming hebben gegeven.' }, { status: 400 });
  }
  const locale = body.locale === 'en' ? 'en' : 'nl';

  const geplakt = tekstNaarRijen(String(body.tekst ?? ''));
  const invoer = [...(Array.isArray(body.rijen) ? body.rijen : []), ...geplakt.rijen];
  const ongeldig = [...geplakt.zonderAdres];

  // Per adres: unieke namen samen ("Guus & Henkje" als hetzelfde adres twee keer met een andere naam staat).
  const namen = new Map<string, string[]>();
  for (const rij of invoer) {
    const email = String(rij?.email ?? '').trim().toLowerCase();
    if (email.length > 254 || !EMAIL_RE.test(email)) {
      if (email) ongeldig.push(email);
      continue;
    }
    const lijst = namen.get(email) ?? [];
    const naam = String(rij?.naam ?? '').trim().slice(0, 200);
    if (naam && !lijst.some((n) => n.toLowerCase() === naam.toLowerCase())) lijst.push(naam);
    namen.set(email, lijst);
  }
  const geldig = [...namen.keys()];

  if (geldig.length === 0) {
    return Response.json({ message: 'Geen geldige e-mailadressen gevonden.', ongeldig }, { status: 400 });
  }
  if (geldig.length > MAX_ADRESSEN) {
    return Response.json({ message: `Maximaal ${MAX_ADRESSEN} adressen per keer.` }, { status: 400 });
  }

  const { docs } = await req.payload.find({
    collection: 'nieuwsbrief-abonnees',
    where: { email: { in: geldig } },
    pagination: false,
    depth: 0,
    req,
  });
  const bestaand = new Map(docs.map((d) => [d.email, d]));

  const now = new Date().toISOString();
  const resultaat: NieuwsbriefImportResultaat = {
    toegevoegd: 0,
    geactiveerd: 0,
    alActief: 0,
    naamAangevuld: 0,
    afgemeldOvergeslagen: [],
    ongeldig,
  };

  for (const email of geldig) {
    const naam = namen.get(email)!.join(' & ').slice(0, 200) || null;
    const doc = bestaand.get(email);
    if (!doc) {
      await req.payload.create({
        collection: 'nieuwsbrief-abonnees',
        data: { email, naam, status: 'actief', bron: 'import', locale, token: nieuwToken(), bevestigdOp: now },
        req,
      });
      resultaat.toegevoegd++;
      continue;
    }
    if (doc.status === 'afgemeld') {
      resultaat.afgemeldOvergeslagen.push(email);
      continue;
    }

    const vulNaamAan = Boolean(naam && !doc.naam);
    if (vulNaamAan) resultaat.naamAangevuld++;
    if (doc.status === 'pending') {
      await req.payload.update({
        collection: 'nieuwsbrief-abonnees',
        id: doc.id,
        data: { status: 'actief', bevestigdOp: now, ...(vulNaamAan ? { naam } : {}) },
        req,
      });
      resultaat.geactiveerd++;
    } else {
      if (vulNaamAan) {
        await req.payload.update({ collection: 'nieuwsbrief-abonnees', id: doc.id, data: { naam }, req });
      }
      resultaat.alActief++;
    }
  }

  return Response.json(resultaat);
};
