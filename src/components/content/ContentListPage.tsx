import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import { localizedHref } from '@/i18n/localizedHref';
import type { ContentCollectionSlug } from './collections';

type ListItem = {
  id: number;
  slug: string;
  title: string;
  date: string | null;
  imageUrl: string | null;
};

export async function ContentListPage({
  collection,
  routeSegment,
  locale,
  heading,
  emptyText,
}: {
  collection: ContentCollectionSlug;
  routeSegment: string;
  locale: 'nl' | 'en';
  heading: string;
  emptyText: string;
}) {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection,
    where: { status: { equals: 'published' } },
    sort: '-createdAt',
    locale,
    depth: 1,
  });

  const items: ListItem[] = docs.map((doc) => {
    const image = typeof doc.image === 'object' && doc.image !== null ? doc.image : null;
    return {
      id: doc.id,
      slug: doc.slug ?? '',
      title: doc.title,
      date: doc.date ?? null,
      imageUrl: image?.sizes?.card?.url ?? image?.url ?? null,
    };
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-primary">{heading}</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-muted">{emptyText}</p>
      ) : (
        <ul className="mt-8 space-y-8">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={localizedHref(locale, `/${routeSegment}/${item.slug}`)} className="group block">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="mb-3 h-48 w-full rounded object-cover" />
                ) : null}
                <h2 className="text-xl font-semibold text-text group-hover:text-primary">{item.title}</h2>
                {item.date ? (
                  <p className="mt-1 text-sm text-muted">{new Date(item.date).toLocaleDateString(locale)}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
