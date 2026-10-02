import Link from 'next/link';
import { getPayload } from 'payload';
import { getTranslations } from 'next-intl/server';
import config from '@payload-config';
import { localizedHref } from '@/i18n/localizedHref';
import { NieuwsbriefTokenForm } from './NieuwsbriefTokenForm';

async function tokenBestaat(token: string) {
  if (!/^[0-9a-f]{64}$/.test(token)) return false;
  const payload = await getPayload({ config });
  const { totalDocs } = await payload.count({ collection: 'nieuwsbrief-abonnees', where: { token: { equals: token } } });
  return totalDocs > 0;
}

/** Pagina achter de bevestigings- of afmeldlink uit de mail. */
export async function NieuwsbriefTokenPage({
  kind,
  locale,
  token,
}: {
  kind: 'bevestigen' | 'afmelden';
  locale: string;
  token: string;
}) {
  const t = await getTranslations({ locale, namespace: 'nieuwsbrief' });
  const geldig = await tokenBestaat(token);

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-text">{t(`${kind}.heading`)}</h1>
      {geldig ? (
        <>
          <p className="mt-2 text-muted">{t(`${kind}.text`)}</p>
          <NieuwsbriefTokenForm
            kind={kind}
            token={token}
            strings={{
              submit: t(`${kind}.submit`),
              submitting: t('form.submitting'),
              success: t(`${kind}.success`),
              invalid: t(`${kind}.invalid`),
            }}
          />
        </>
      ) : (
        <p className="mt-4 text-accent">{t(`${kind}.invalid`)}</p>
      )}
      <p className="mt-8">
        <Link href={localizedHref(locale, '/nieuwsbrief')} className="text-primary underline">
          {t('terug')}
        </Link>
      </p>
    </main>
  );
}
