import { getPayload } from 'payload';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import config from '@payload-config';
import { RichText } from '@payloadcms/richtext-lexical/react';

export default async function OverDeNaamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.overDeNaam' });

  const payload = await getPayload({ config });
  const overDeNaam = await payload.findGlobal({
    slug: 'over-de-naam',
    locale: locale as 'nl' | 'en',
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-primary">{overDeNaam.titel || t('heading')}</h1>
      {overDeNaam.inhoud ? (
        <div className="mt-6 space-y-4 text-text">
          <RichText data={overDeNaam.inhoud} />
        </div>
      ) : null}
    </main>
  );
}
