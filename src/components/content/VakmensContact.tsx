import { getTranslations } from 'next-intl/server';
import { buildWhatsAppLink } from '@/lib/whatsapp';

export type Contact = {
  telefoon?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  adres?: string | null;
};

const linkCls = 'text-primary underline';

/** Contactgegevens van een vakmens. Alleen aanmaken als heeftBuurtpas() waar is. */
export async function VakmensContact({ contact, locale }: { contact: Contact; locale: 'nl' | 'en' }) {
  const t = await getTranslations({ locale, namespace: 'buurtpas.contact' });
  const whatsapp = buildWhatsAppLink(contact.whatsapp);
  const website = contact.website && /^https?:\/\//i.test(contact.website) ? contact.website : null;

  const regels = [
    contact.telefoon && { label: t('telefoon'), waarde: <a href={`tel:${contact.telefoon.replace(/[^\d+]/g, '')}`} className={linkCls}>{contact.telefoon}</a> },
    whatsapp && { label: t('whatsapp'), waarde: <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkCls}>{contact.whatsapp}</a> },
    contact.email && { label: t('email'), waarde: <a href={`mailto:${contact.email}`} className={linkCls}>{contact.email}</a> },
    website && { label: t('website'), waarde: <a href={website} target="_blank" rel="noopener noreferrer" className={linkCls}>{website.replace(/^https?:\/\//i, '')}</a> },
    contact.adres && { label: t('adres'), waarde: <span className="whitespace-pre-line">{contact.adres}</span> },
  ].filter(Boolean) as { label: string; waarde: React.ReactNode }[];

  return (
    <section className="rounded-lg border border-border bg-card px-5 py-4">
      <h2 className="m-0 text-lg font-semibold text-text">{t('titel')}</h2>
      <dl className="mt-3 mb-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-text">
        {regels.map(({ label, waarde }) => (
          <div key={label} className="contents">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="m-0 min-w-0 break-words">{waarde}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
