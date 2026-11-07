import { getPayload } from 'payload';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import config from '@payload-config';
import Image from 'next/image';

export default async function FotosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.fotos' });
  const tc = await getTranslations({ locale, namespace: 'content' });

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'historische-fotos',
    // Foto's waarvoor toestemming nodig is tonen we niet (zie het veld `rechten`).
    where: { status: { equals: 'published' }, rechten: { not_equals: 'toestemming' } },
    sort: 'order',
    locale: locale as 'nl' | 'en',
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-text">{t('heading')}</h1>

      {docs.length === 0 ? (
        <p className="mt-6 text-muted">{tc('empty')}</p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((foto, index) => (
            <li key={foto.id} className="overflow-hidden rounded border border-border">
              {/* Beeldbank-foto via next/image: eigen domein, AVIF/WebP, kolombreedte. De eerste is de LCP.
                  alt="": de titel staat er direct onder als kop; anders leest een schermlezer hem twee keer. */}
              <Image
                src={foto.imageUrl}
                alt=""
                width={640}
                height={360}
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                priority={index === 0}
                fetchPriority={index === 0 ? 'high' : undefined}
                className="aspect-video h-auto w-full object-cover"
              />
              <div className="p-4">
                <h2 className="font-semibold text-text">{foto.title}</h2>
                {foto.description ? <p className="mt-1 text-sm text-muted">{foto.description}</p> : null}
                {foto.geografischeAanduiding ? (
                  <p className="mt-1 text-xs text-muted">{foto.geografischeAanduiding}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
