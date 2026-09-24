import { getPayload } from 'payload';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import config from '@payload-config';
import Link from 'next/link';
import { RichTextContent } from '@/components/site/RichTextContent';
import { localizedHref } from '@/i18n/localizedHref';

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
      <h1 className="text-3xl font-bold text-text">{overDeNaam.titel || t('heading')}</h1>
      {overDeNaam.inhoud ? <RichTextContent data={overDeNaam.inhoud} className="mt-6" /> : null}
      <p className="mt-8">
        <Link href={localizedHref(locale, '/geschiedenis#naam')} className="font-semibold text-primary hover:text-primary-hover">
          {t('verhaalLink')}
        </Link>
      </p>
    </main>
  );
}
