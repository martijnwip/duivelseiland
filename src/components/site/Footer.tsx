import Link from 'next/link';
import type { MenuItem } from './Header';

export type ContactInfo = { email?: string | null; telefoon?: string | null; adres?: string | null };

export function Footer({
  siteNaam,
  menu,
  contactgegevens,
  footerTekst,
}: {
  siteNaam: string;
  menu: MenuItem[];
  contactgegevens?: ContactInfo;
  footerTekst?: string | null;
}) {
  const contactLines = [contactgegevens?.adres, contactgegevens?.telefoon, contactgegevens?.email].filter(Boolean);

  return (
    <footer className="bg-text py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mb-12 grid gap-12 md:grid-cols-3">
          <div>
            <span className="font-serif text-xl font-bold">{siteNaam}</span>
          </div>

          {menu.length > 0 ? (
            <div>
              <h4 className="mb-4 text-lg font-bold">Snel naar</h4>
              <ul className="space-y-2 text-gray-300">
                {menu.map((item) => (
                  <li key={item.url}>
                    <Link href={item.url} className="transition-colors hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {contactLines.length > 0 ? (
            <div>
              <h4 className="mb-4 text-lg font-bold">Contact</h4>
              <ul className="space-y-2 text-gray-300">
                {contactLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {footerTekst ? (
          <div className="border-t border-gray-700 pt-8 text-sm text-gray-400">{footerTekst}</div>
        ) : null}
      </div>
    </footer>
  );
}
