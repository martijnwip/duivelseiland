/**
 * Zet "In memoriam Kees Kroon" op de site (/in-memoriam/kees-kroon), in het Nederlands en het Engels.
 * De tekst komt uit het buurtblad (rubriek Buurtnieuws), met toestemming overgenomen; de foto is van
 * Marianne Plas. De foto wordt bijgesneden tot de afgedrukte foto (zonder tafel en muur eromheen) en
 * naar Media geüpload. De bronfoto staat niet in de repo: geef het pad mee.
 *
 * De pagina komt als concept binnen: bekijken en publiceren in /admin. Bestaat de slug al, dan gebeurt
 * er niets, tenzij met --force (tekst en foto opnieuw; status, foto's en seintjes blijven).
 *
 *   bun run seed:in-memoriam ~/Downloads/kees-kroon.jpg
 *   bun run seed:in-memoriam:prod ~/Downloads/kees-kroon.jpg
 */
import { existsSync } from 'node:fs';
import sharp from 'sharp';
import { getClient } from './lib/payload-client';

const SLUG = 'kees-kroon';
const NAAM = 'Kees Kroon';
// De bronfoto is met een telefoon van een afdruk gemaakt: alleen de afdruk zelf (3264×2448 → 2580×1660),
// daarna 1920 breed. De pagina toont deze hele foto (de Payload-maat `hero` snijdt hem bij tot 16:9).
const UITSNEDE = { left: 170, top: 0, width: 2580, height: 1660 };

type Locale = 'nl' | 'en';
type Tekst = Record<Locale, string>;

// ---- Lexical ----
const base = { format: '' as const, indent: 0, version: 1, direction: 'ltr' as const };
const text = (t: string) => ({ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: t, version: 1 });
const p = (t: string) => ({ ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: [text(t)] });
const richText = (alineas: string[]) => ({ root: { ...base, type: 'root', children: alineas.map(p) } });

// ---- Inhoud ----
const ONDERTITEL: Tekst = { nl: 'de markante melkhandelaar', en: 'the memorable milkman' };

const ALINEAS: Record<Locale, string[]> = {
  nl: [
    'Zo’n twintig jaar geleden was er nog een ouderwetse melkhandel in de Pieter Baststraat (Duivelseiland), waar buurtbewoners graag een paar straten voor omliepen, al was het alleen maar voor een paar ons van die verrukkelijke oude brokkelkaas, die Kees met krachtig handwerk vakkundig tot het laatste stukje wist op te snijden.',
    'Het was een kleine zaak met een marmeren toonbank en een paar planken met voedingsmiddelen. Meer dan drie klanten tegelijk pasten er niet in, dan werd er buiten gewacht. Men kwam er trouwens ook vooral voor de gezelligheid: Kees en Corry Kroon kenden hun klanten en hun sores. Je kon je bestelling doorbellen en wie slecht ter been was kreeg de boodschappen thuisbezorgd. Als een verwacht telefoontje uitbleef, belde Kees om te horen of alles goed ging. En wie in nood zat kon op zijn hulp rekenen: “Ik kom eraan!” en sloot hij even de winkel.',
    'Kees is op 9 april j.l. plotseling overleden. Hij kon nog wel afscheid nemen van zijn Corry, kinderen en kleinkinderen. Op de rouwkaart stond ‘Treur niet om mij, ik heb een mooi leven gehad. Luv you!’ Kees: altijd vrolijk en positief. Hij wordt gemist.',
  ],
  en: [
    'Some twenty years ago there was still an old-fashioned dairy shop on Pieter Baststraat (Duivelseiland). Neighbours happily walked a few streets out of their way for it, if only for a couple of hundred grams of that delicious, crumbly aged cheese, which Kees cut with strong, skilled hands down to the very last piece.',
    'It was a small shop with a marble counter and a few shelves of groceries. No more than three customers fitted inside at once; the rest waited outside. People mostly came for the company anyway: Kees and Corry Kroon knew their customers and their worries. You could phone in your order, and anyone who had trouble getting about had their shopping delivered. If an expected phone call did not come, Kees would ring to check that all was well. And anyone in trouble could count on his help: “I’m on my way!”, and he would close the shop for a while.',
    'Kees died suddenly on 9 April. He was still able to say goodbye to his Corry, his children and his grandchildren. His funeral card read: ‘Don’t grieve for me, I have had a good life. Luv you!’ Kees: always cheerful and positive. He will be missed.',
  ],
};

const CITAAT: Tekst = {
  nl: 'Treur niet om mij, ik heb een mooi leven gehad. Luv you!',
  en: 'Don’t grieve for me, I have had a good life. Luv you!',
};
const ONDERSCHRIFT: Tekst = {
  nl: 'Kees en Corry Kroon, met hun zoon en een klant. Foto: Marianne Plas',
  en: 'Kees and Corry Kroon, with their son and a customer. Photo: Marianne Plas',
};
const ALT: Tekst = {
  nl: 'Kees Kroon leunt op de toonbank van zijn melkhandel; achter hem lachen Corry en hun zoon, rechts staat een klant.',
  en: 'Kees Kroon leans on the counter of his dairy shop; behind him Corry and their son are laughing, a customer stands on the right.',
};
const BRON: Tekst = {
  nl: 'Met informatie van Marianne Plas uit de Ruysdaelstraat.',
  en: 'With information from Marianne Plas of Ruysdaelstraat.',
};

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const bron = args.find((a) => !a.startsWith('--'));
  if (!bron || !existsSync(bron)) {
    console.error('Geef het pad naar de foto mee, bv.: bun run seed:in-memoriam ~/Downloads/kees-kroon.jpg');
    process.exit(1);
  }

  const payload = await getClient();
  const context = { disableRevalidate: true };
  const { docs } = await payload.find({ collection: 'in-memoriam', where: { slug: { equals: SLUG } }, depth: 0, limit: 1, overrideAccess: true });
  const bestaand = docs[0];
  if (bestaand && !force) {
    console.log(`/in-memoriam/${SLUG} bestaat al (id ${bestaand.id}). Gebruik --force om tekst en foto opnieuw te zetten.`);
    process.exit(0);
  }

  const data = await sharp(bron).rotate().extract(UITSNEDE).resize({ width: 1920 }).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  const foto = await payload.create({
    collection: 'media',
    overrideAccess: true,
    locale: 'nl',
    data: { alt: ALT.nl, caption: ONDERSCHRIFT.nl },
    file: { data, mimetype: 'image/jpeg', name: 'kees-kroon.jpg', size: data.length },
    context,
  });
  await payload.update({ collection: 'media', id: foto.id, overrideAccess: true, locale: 'en', data: { alt: ALT.en, caption: ONDERSCHRIFT.en }, context });

  const perTaal = (l: Locale) => ({
    ondertitel: ONDERTITEL[l],
    heroOnderschrift: ONDERSCHRIFT[l],
    citaat: CITAAT[l],
    content: richText(ALINEAS[l]),
    bron: BRON[l],
  });
  const vast = {
    naam: NAAM,
    slug: SLUG,
    overleden: '2026-04-09T12:00:00.000Z',
    hero: foto.id,
    // Kees staat links op de foto.
    deelUitsnede: 0,
  };

  const doc = bestaand
    ? await payload.update({ collection: 'in-memoriam', id: bestaand.id, overrideAccess: true, locale: 'nl', data: { ...vast, ...perTaal('nl') }, context })
    : await payload.create({ collection: 'in-memoriam', overrideAccess: true, locale: 'nl', data: { ...vast, status: 'draft', ...perTaal('nl') }, context });
  await payload.update({ collection: 'in-memoriam', id: doc.id, overrideAccess: true, locale: 'en', data: perTaal('en'), context });

  console.log(`${bestaand ? 'Bijgewerkt' : 'Aangemaakt'}: In memoriam ${NAAM} (id ${doc.id}, status ${doc.status}).`);
  console.log(`Bekijk en publiceer: /admin/collections/in-memoriam/${doc.id}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
