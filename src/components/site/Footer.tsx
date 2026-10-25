import type { ComponentProps } from 'react';
import Link from 'next/link';
import { RichText } from '@payloadcms/richtext-lexical/react';
import type { MenuItem } from './Header';
import { localizedHref } from '@/i18n/localizedHref';
import { hasRichTextContent } from '@/lib/richtext';
import { NieuwsbriefFooterForm, type NieuwsbriefFooterStrings } from '@/components/nieuwsbrief/NieuwsbriefFooterForm';

export type NieuwsbriefFooter = NieuwsbriefFooterStrings & { title: string; text: string; afmelden: string };

export type WhatsappFooter = { title: string; text: string; link: string };

export type ContactFooter = { link: string };

export type ContactInfo = { email?: string | null; telefoon?: string | null; adres?: string | null };

export function Footer({
  siteNaam,
  menu,
  locale,
  contactgegevens,
  footerTekst,
  nieuwsbrief,
  whatsapp,
  contact,
}: {
  siteNaam: string;
  menu: MenuItem[];
  locale: string;
  contactgegevens?: ContactInfo;
  footerTekst?: ComponentProps<typeof RichText>['data'] | null;
  nieuwsbrief: NieuwsbriefFooter;
  whatsapp: WhatsappFooter;
  contact: ContactFooter;
}) {
  const contactLines = [contactgegevens?.adres, contactgegevens?.telefoon, contactgegevens?.email].filter(Boolean);

  return (
    <footer className="bg-[#202020] py-16 text-white print:hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/duivelseiland-embleem.svg" alt="" width={96} height={93} className="h-24 w-auto" />
            <span className="font-serif text-xl font-bold">{siteNaam}</span>
          </div>

          {menu.length > 0 ? (
            <div>
              <h4 className="mb-4 text-lg font-bold">Snel naar</h4>
              <ul className="space-y-2 text-[#d1d1d1]">
                {menu.map((item) => (
                  <li key={item.url}>
                    <Link href={localizedHref(locale, item.url)} className="transition-colors hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h4 className="mb-4 text-lg font-bold">Contact</h4>
            <ul className="space-y-2 text-[#d1d1d1]">
              {contactLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
              <li>
                <Link href={localizedHref(locale, '/contact')} className="underline transition-colors hover:text-white">
                  {contact.link}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-bold">{nieuwsbrief.title}</h4>
            <p className="mb-3 text-[#d1d1d1]">{nieuwsbrief.text}</p>
            <NieuwsbriefFooterForm locale={locale} strings={nieuwsbrief} />
            <Link
              href={localizedHref(locale, '/nieuwsbrief')}
              className="text-sm text-[#a8a8a8] underline transition-colors hover:text-white"
            >
              {nieuwsbrief.afmelden}
            </Link>

            <h4 className="mt-8 mb-2 text-lg font-bold">{whatsapp.title}</h4>
            <p className="mb-2 text-[#d1d1d1]">{whatsapp.text}</p>
            <Link href={localizedHref(locale, '/whatsapp')} className="text-[#d1d1d1] underline transition-colors hover:text-white">
              {whatsapp.link}
            </Link>
          </div>
        </div>

        {hasRichTextContent(footerTekst) ? (
          <div className="border-t border-[#767676] pt-8 text-sm text-[#a8a8a8]">
            <RichText
              data={footerTekst}
              className="space-y-2 [&_a]:underline [&_a]:transition-colors [&_a:hover]:text-white"
            />
          </div>
        ) : null}
      </div>
    </footer>
  );
}
