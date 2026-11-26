import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { InloggenKnop } from '@/components/auth/InloggenKnop';
import { INLOGGEN_PAD, VERIFY_PAD, VERIFY_PARAMS } from '@/lib/auth/inlogLink';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'inloggen' });
  // Tokenlink: niet in zoekmachines, en het token niet via de Referer naar andere sites.
  return { title: t('heading'), robots: { index: false, follow: false }, referrer: 'no-referrer' };
}

type Zoek = Partial<Record<(typeof VERIFY_PARAMS)[number] | 'error', string | string[]>>;
const eerste = (waarde: string | string[] | undefined) => (Array.isArray(waarde) ? waarde[0] : waarde);

/**
 * Pagina achter de link in de inlogmail voor /admin (src/lib/auth/inlogLink.ts). Of het token geldig
 * is, blijkt pas bij de klik. Is het verlopen of al gebruikt, dan stuurt better-auth terug naar deze
 * pagina met `?error=INVALID_TOKEN`.
 */
export default async function InloggenRoute({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Zoek>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'inloggen' });
  const zoek = await searchParams;

  const velden: Record<string, string> = {};
  for (const naam of VERIFY_PARAMS) {
    const waarde = eerste(zoek[naam]);
    if (waarde) velden[naam] = waarde;
  }
  // Bij een verlopen of gebruikte link terug hierheen, met een uitleg in plaats van "invalid token".
  velden.errorCallbackURL ??= INLOGGEN_PAD;
  const fout = eerste(zoek.error);
  const melding = fout ? (fout === 'INVALID_TOKEN' ? 'ongeldig' : 'mislukt') : velden.token ? null : 'onvolledig';

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-text">{t('heading')}</h1>
      {melding ? (
        <p role="status" className="mt-2 text-accent">
          {t(melding)}
        </p>
      ) : (
        <>
          <p className="mt-2 text-muted">{t('text')}</p>
          <InloggenKnop action={VERIFY_PAD} velden={velden} strings={{ submit: t('submit'), submitting: t('submitting') }} />
        </>
      )}
      <p className="mt-8">
        {/* /admin is een gewone link: het loginscherm van Payload, geen Next-route met prefetch. */}
        <a href="/admin" className="text-primary underline">
          {t('opnieuw')}
        </a>
      </p>
    </main>
  );
}
