import type { MetadataRoute } from 'next';
import { getPayload, type Where } from 'payload';
import config from '@payload-config';
import { routing } from '@/i18n/routing';
import { localizedHref } from '@/i18n/localizedHref';
import { PUBLIEKE_FASES } from '@/lib/activiteiten/constants';
import { PUBLIEK_CONTENT, heeftOpenbareItems, type OverzichtCollectie } from '@/lib/openbareItems';

/** /sitemap.xml: vaste pagina's en alle openbare items, elk in NL en EN (met hreflang-alternatieven). */

// Nieuwe items komen er binnen een uur bij; de sitemap hoeft niet per publicatie te verversen.
export const revalidate = 3600;

const BASIS = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '');

// Pagina's zonder token en zonder noindex. Formulieren en de geluid-/afvalkaarten horen erbij;
// de losse PNG-pagina's (…/instructie/afbeelding) en /styleguide niet.
const VASTE_PAGINAS = [
  '',
  '/nieuws',
  '/agenda',
  '/activiteiten',
  '/activiteiten/aanmelden',
  '/interviews',
  '/geschiedenis',
  '/duivelse-kunst',
  '/praktische-info',
  '/vaklui',
  '/vaklui/aanmelden',
  '/waar-komt-de-naam-vandaan',
  '/buurt-statistieken',
  '/fotos',
  '/afval',
  '/afval/instructie',
  '/geluid',
  '/geluid/instructie',
  '/geluid/briefje',
  '/buurtborrel',
  '/neighborhood-mascot',
  '/whatsapp',
  '/nieuwsbrief',
  '/buurtpas',
  '/contact',
];

// Items met "Alleen voor de buurt" tonen zonder buurtpas alleen titel en slot (noindex): niet opnemen (PUBLIEK_CONTENT).

const BRONNEN = [
  { collection: 'nieuws', pad: '/nieuws', where: PUBLIEK_CONTENT },
  // Agenda-items van een activiteit niet: hun canonical wijst naar /activiteiten/<slug>, en die staat er al in.
  { collection: 'agenda', pad: '/agenda', where: { and: [PUBLIEK_CONTENT, { activiteit: { exists: false } }] } },
  { collection: 'interviews', pad: '/interviews', where: PUBLIEK_CONTENT },
  { collection: 'geschiedenis', pad: '/geschiedenis', where: PUBLIEK_CONTENT },
  { collection: 'duivelse-kunst', pad: '/duivelse-kunst', where: PUBLIEK_CONTENT },
  { collection: 'praktische-info', pad: '/praktische-info', where: PUBLIEK_CONTENT },
  { collection: 'vaklui', pad: '/vaklui', where: { status: { equals: 'published' } } },
  { collection: 'in-memoriam', pad: '/in-memoriam', where: { status: { equals: 'published' } } },
  { collection: 'activiteiten', pad: '/activiteiten', where: { fase: { in: PUBLIEKE_FASES } } },
] as const satisfies ReadonlyArray<{ collection: string; pad: string; where: Where }>;

function regels(pad: string, lastModified?: string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, BASIS + (localizedHref(l, pad) || '/')]));
  return routing.locales.map((locale) => ({
    url: languages[locale],
    lastModified,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config });

  const items = await Promise.all(
    BRONNEN.map(async ({ collection, pad, where }) => {
      const { docs } = await payload.find({
        collection,
        where,
        select: { slug: true, updatedAt: true },
        pagination: false,
        depth: 0,
      });
      return docs.filter((d) => d.slug).flatMap((d) => regels(`${pad}/${d.slug}`, d.updatedAt));
    }),
  );

  // Lege overzichten staan op noindex (zie de pagina's), dus ook niet in de sitemap.
  const leeg = new Set<string>();
  for (const collection of ['interviews', 'duivelse-kunst'] as const satisfies OverzichtCollectie[]) {
    if (!(await heeftOpenbareItems(collection))) leeg.add(`/${collection}`);
  }

  return [...VASTE_PAGINAS.filter((pad) => !leeg.has(pad)).flatMap((pad) => regels(pad)), ...items.flat()];
}
