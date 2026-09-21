import { getPayload } from 'payload';
import config from '@payload-config';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RichTextContent } from '@/components/site/RichTextContent';
import { localizedHref } from '@/i18n/localizedHref';
import type { ContentCollectionSlug } from './collections';

export async function ContentDetailPage({
  collection,
  routeSegment,
  slug,
  locale,
  backLabel,
}: {
  collection: ContentCollectionSlug;
  routeSegment: string;
  slug: string;
  locale: 'nl' | 'en';
  backLabel: string;
}) {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    locale,
    depth: 1,
    limit: 1,
  });

  const doc = docs[0];
  if (!doc) {
    notFound();
  }

  const image = typeof doc.image === 'object' && doc.image !== null ? doc.image : null;
  const imageUrl = image?.sizes?.hero?.url ?? image?.url ?? null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href={localizedHref(locale, `/${routeSegment}`)} className="text-sm text-primary hover:underline">
        ← {backLabel}
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-primary">{doc.title}</h1>

      {doc.date ? <p className="mt-1 text-sm text-muted">{new Date(doc.date).toLocaleDateString(locale)}</p> : null}

      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={image?.alt ?? ''} className="mt-6 w-full rounded object-cover" />
      ) : null}

      {doc.content ? <RichTextContent data={doc.content} className="mt-6" /> : null}
    </main>
  );
}
