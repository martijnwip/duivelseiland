import type { MetadataRoute } from 'next';
import { getPayload, type Where } from 'payload';
import config from '@payload-config';
import { routing } from '@/i18n/routing';
import { localizedHref } from '@/i18n/localizedHref';
import { PUBLIEKE_FASES } from '@/lib/activiteiten/constants';

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

// Items met "Alleen voor de buurt" tonen zonder buurtpas alleen titel en slot (noindex): niet opnemen.
const PUBLIEK_CONTENT: Where = {
  and: [
    { status: { equals: 'published' } },
    { or: [{ alleenBuurt: { equals: false } }, { alleenBuurt: { exists: false } }] },
  ],
};

const BRONNEN = [
  { collection: 'nieuws', pad: '/nieuws', where: PUBLIEK_CONTENT },
  { collection: 'agenda', pad: '/agenda', where: PUBLIEK_CONTENT },
  { collection: 'interviews', pad: '/interviews', where: PUBLIEK_CONTENT },
  { collection: 'geschiedenis', pad: '/geschiedenis', where: PUBLIEK_CONTENT },
  { collection: 'duivelse-kunst', pad: '/duivelse-kunst', where: PUBLIEK_CONTENT },
  { collection: 'praktische-info', pad: '/praktische-info', where: PUBLIEK_CONTENT },
  { collection: 'vaklui', pad: '/vaklui', where: { status: { equals: 'published' } } },
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

  return [...VASTE_PAGINAS.flatMap((pad) => regels(pad)), ...items.flat()];
}
