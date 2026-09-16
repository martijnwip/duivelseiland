import { getPayload } from 'payload';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import config from '@payload-config';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });

  const payload = await getPayload({ config });
  const siteInstellingen = await payload.findGlobal({
    slug: 'site-instellingen',
    locale: locale as 'nl' | 'en',
  });

  return (
    <main>
      <h1>{t('heading')}</h1>
      <p>{siteInstellingen.intro || t('underConstruction')}</p>
    </main>
  );
}
