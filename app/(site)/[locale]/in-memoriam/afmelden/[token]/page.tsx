import type { Metadata } from 'next';
import Link from 'next/link';
import { getPayload } from 'payload';
import config from '@payload-config';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { afmeldenMetToken } from '@/components/in-memoriam/actions';
import { buttonCls } from '@/components/activiteiten/styles';
import { inMemoriamPad } from '@/lib/in-memoriam/constants';
import { TOKEN_RE } from '@/lib/nieuwsbrief/token';
import { localizedHref } from '@/i18n/localizedHref';

type Params = {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<{ klaar?: string }>;
};

// Persoonlijke link uit een mail: niet in zoekmachines en niet om te delen.
export const metadata: Metadata = { robots: { index: false } };

/** Afmelden voor berichten over nieuwe foto's, via de link in de mail. Pas bij de klik (mailscanners openen links). */
export default async function AfmeldenRoute({ params, searchParams }: Params) {
  const { locale, token } = await params;
  const { klaar } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.inMemoriam.afmelden' });

  const payload = await getPayload({ config });
  const { docs } = TOKEN_RE.test(token)
    ? await payload.find({ collection: 'in-memoriam-volgers', where: { afmeldToken: { equals: token } }, depth: 1, limit: 1, overrideAccess: true })
    : { docs: [] };
  const volger = docs[0];
  const herdenking = volger && typeof volger.herdenking === 'object' ? volger.herdenking : null;
  const pad = localizedHref(locale, `/in-memoriam/afmelden/${token}`);

  return (
    <main className="mx-auto max-w-xl px-4 py-12 xl:py-16">
      <h1 className="m-0 font-serif text-3xl font-semibold text-text">{t('heading')}</h1>
      {klaar ? (
        <p role="status" className="mt-4 text-lg font-medium text-primary">
          {t('klaar')}
        </p>
      ) : volger ? (
        <form action={afmeldenMetToken} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="terug" value={pad} />
          <p className="m-0 text-lg text-text">{t('uitleg', { naam: volger.herdenkingNaam ?? '' })}</p>
          <button type="submit" className={buttonCls}>
            {t('knop')}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-lg text-text">{t('onbekend')}</p>
      )}
      {herdenking?.status === 'published' ? (
        <p className="mt-8">
          <Link href={localizedHref(locale, inMemoriamPad(herdenking.slug))} className="text-primary underline">
            {t('terug')}
          </Link>
        </p>
      ) : null}
    </main>
  );
}
