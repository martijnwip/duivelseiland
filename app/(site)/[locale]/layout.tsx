import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Fraunces, Lexend, Source_Sans_3 } from 'next/font/google';
import { getPayload } from 'payload';
import { ThemeProvider } from 'next-themes';
import config from '@payload-config';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import './globals.css';

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-sans',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

async function getSiteInstellingen(locale: string) {
  const payload = await getPayload({ config });
  return payload.findGlobal({
    slug: 'site-instellingen',
    locale: locale as 'nl' | 'en',
  });
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const site = await getSiteInstellingen(locale);
  const siteNaam = site.siteNaam || 'Duivelseiland';
  const menu = site.menu ?? [];

  return (
    <html
      lang={locale}
      className={`${lexend.variable} ${sourceSans.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <Header siteNaam={siteNaam} menu={menu} locale={locale} />
          {children}
          <Footer
            siteNaam={siteNaam}
            menu={menu}
            locale={locale}
            contactgegevens={site.contactgegevens}
            footerTekst={site.footer}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
