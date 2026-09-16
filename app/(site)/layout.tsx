import type { Metadata } from 'next';
import { Lexend, Source_Sans_3 } from 'next/font/google';
import { getPayload } from 'payload';
import config from '@payload-config';
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

export const metadata: Metadata = {
  title: 'Duivelseiland',
  description: 'Wijkwebsite voor Amsterdam',
};

async function getSiteInstellingen() {
  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: 'site-instellingen' });
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteInstellingen();
  const siteNaam = site.siteNaam || 'Duivelseiland';
  const menu = site.menu ?? [];

  return (
    <html lang="nl" className={`${lexend.variable} ${sourceSans.variable}`}>
      <body>
        <Header siteNaam={siteNaam} menu={menu} />
        {children}
        <Footer
          siteNaam={siteNaam}
          menu={menu}
          contactgegevens={site.contactgegevens}
          footerTekst={site.footer}
        />
      </body>
    </html>
  );
}
