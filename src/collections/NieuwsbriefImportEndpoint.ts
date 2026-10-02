import type { PayloadHandler } from 'payload';
import { hasRoleAtLeast } from '../access/roles';
import { EMAIL_RE, nieuwToken } from '../lib/nieuwsbrief/token';

const MAX_ADRESSEN = 2000;
// Ruim alles wat op een adres lijkt, zodat enters, komma's, puntkomma's en "Naam <adres>" allemaal werken.
const KANDIDAAT_RE = /[^\s<>,;:"'()[\]]+@[^\s<>,;:"'()[\]]+/g;

export type NieuwsbriefImportResultaat = {
  toegevoegd: number;
  geactiveerd: number;
  alActief: number;
  afgemeldOvergeslagen: string[];
  ongeldig: string[];
};

/**
 * Admin plakt een lijst adressen van mensen die al toestemming gaven (bijv. de oude Buurtborrel-lijst).
 * Die worden direct actief, zonder bevestigingsmail; een afmelding wordt nooit teruggedraaid.
 */
export const nieuwsbriefImportEndpoint: PayloadHandler = async (req) => {
  if (!hasRoleAtLeast(req.user?.role, 'admin')) {
    return Response.json({ message: 'Alleen een admin kan adressen importeren.' }, { status: 403 });
  }

  const body = (await req.json?.()) as { tekst?: string; locale?: string; toestemming?: boolean } | undefined;
  if (body?.toestemming !== true) {
    return Response.json({ message: 'Bevestig eerst dat deze mensen toestemming hebben gegeven.' }, { status: 400 });
  }
  const locale = body.locale === 'en' ? 'en' : 'nl';
  const tekst = String(body.tekst ?? '');

  const kandidaten = [...new Set((tekst.match(KANDIDAAT_RE) ?? []).map((a) => a.replace(/\.+$/, '').toLowerCase()))];
  const geldig = kandidaten.filter((a) => a.length <= 254 && EMAIL_RE.test(a));
  const ongeldig = kandidaten.filter((a) => !geldig.includes(a));
  // Woorden zonder @ (bijv. "geen-adres") zijn ook ongeldig, maar namen als "Jan" naast "<jan@...>" niet.
  for (const regel of tekst.split(/[\n,;]+/).map((r) => r.trim())) {
    if (regel && !regel.includes('@')) ongeldig.push(regel);
  }

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
  const resultaat: NieuwsbriefImportResultaat = { toegevoegd: 0, geactiveerd: 0, alActief: 0, afgemeldOvergeslagen: [], ongeldig };

  for (const email of geldig) {
    const doc = bestaand.get(email);
    if (!doc) {
      await req.payload.create({
        collection: 'nieuwsbrief-abonnees',
        data: { email, status: 'actief', bron: 'import', locale, token: nieuwToken(), bevestigdOp: now },
        req,
      });
      resultaat.toegevoegd++;
    } else if (doc.status === 'pending') {
      await req.payload.update({
        collection: 'nieuwsbrief-abonnees',
        id: doc.id,
        data: { status: 'actief', bevestigdOp: now },
        req,
      });
      resultaat.geactiveerd++;
    } else if (doc.status === 'actief') {
      resultaat.alActief++;
    } else {
      resultaat.afgemeldOvergeslagen.push(email);
    }
  }

  return Response.json(resultaat);
};
