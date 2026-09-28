/**
 * Vervangt in het geschiedenisverhaal (global `geschiedenis-verhaal`) een Beeldbank-foto door
 * een andere, zonder de rest van het verhaal aan te raken (anders dan `seed:geschiedenis --force`).
 * De nieuwe foto wordt geïmporteerd als hij nog niet in `historische-fotos` staat; de oude blijft staan.
 *
 *   bun run foto:vervang <oude-beeldbank-link> <nieuwe-beeldbank-link>
 *   bun run foto:vervang:prod <oude-beeldbank-link> <nieuwe-beeldbank-link>
 */
import { getClient } from './lib/payload-client';
import { fetchBeeldbankMetadata } from '../src/lib/beeldbank';

const [oudeLink, nieuweLink] = process.argv.slice(2);

if (!oudeLink || !nieuweLink) {
  console.error('[vervang-foto] gebruik: bun run foto:vervang <oude-beeldbank-link> <nieuwe-beeldbank-link>');
  process.exit(1);
}

type Id = number;
const idVan = (v: unknown): Id | null => (v == null ? null : typeof v === 'object' ? (v as { id: Id }).id : (v as Id));

async function run() {
  const payload = await getClient();
  const context = { disableRevalidate: true };

  const zoek = async (bronUrl: string) =>
    (await payload.find({ collection: 'historische-fotos', where: { bronUrl: { equals: bronUrl } }, limit: 1, overrideAccess: true })).docs[0];

  const oud = await zoek(oudeLink);
  if (!oud) {
    console.error(`[vervang-foto] oude foto staat niet in historische-fotos: ${oudeLink}`);
    process.exit(1);
  }

  let nieuw = await zoek(nieuweLink);
  if (!nieuw) {
    const m = await fetchBeeldbankMetadata(nieuweLink);
    nieuw = await payload.create({
      collection: 'historische-fotos',
      overrideAccess: true,
      context,
      data: {
        title: m.title,
        description: m.description,
        imageUrl: m.imageUrl,
        bronUrl: nieuweLink,
        datering: m.datering,
        vervaardiger: m.vervaardiger,
        rechten: m.rechten,
        status: 'published',
      },
    });
    console.log(`[vervang-foto] foto geïmporteerd: id ${nieuw.id} (${m.rechten}) — ${m.title}`);
  }

  let aantal = 0;
  const vervang = (v: unknown): Id | null => {
    const id = idVan(v);
    if (id === oud.id) {
      aantal++;
      return nieuw.id;
    }
    return id;
  };

  // foto-relaties zijn niet gelokaliseerd; één update (met de NL-waarden van de rest) volstaat.
  const verhaal = await payload.findGlobal({ slug: 'geschiedenis-verhaal', locale: 'nl', depth: 0, overrideAccess: true });
  const heroFoto = vervang(verhaal.heroFoto);
  const archief = (verhaal.archief ?? []).map(vervang);
  const tijdvakken = (verhaal.tijdvakken ?? []).map((tv) => ({
    ...tv,
    fotos: (tv.fotos ?? []).map(vervang),
    gebeurtenissen: (tv.gebeurtenissen ?? []).map((g) => ({ ...g, foto: vervang(g.foto) })),
  }));

  if (aantal === 0) {
    console.log('[vervang-foto] de oude foto komt niet (meer) voor in het verhaal — niets gedaan.');
    process.exit(0);
  }

  await payload.updateGlobal({
    slug: 'geschiedenis-verhaal',
    locale: 'nl',
    data: { heroFoto, archief, tijdvakken } as never,
    overrideAccess: true,
    context,
    depth: 0,
  });

  console.log(`[vervang-foto] ${aantal} verwijzing(en) vervangen: id ${oud.id} → ${nieuw.id}.`);
  console.log('[vervang-foto] op productie: sla het Geschiedenisverhaal één keer op in /admin, dan wordt /geschiedenis ververst.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[vervang-foto] MISLUKT:', err instanceof Error ? err.message : err);
  process.exit(1);
});
