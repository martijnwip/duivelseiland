import Link from 'next/link';
import { getPayload } from 'payload';
import { getTranslations } from 'next-intl/server';
import config from '@payload-config';
import { localizedHref } from '@/i18n/localizedHref';
import { TOKEN_RE } from '@/lib/nieuwsbrief/token';
import { TokenForm, type TokenKind } from './TokenForm';

async function tokenBestaat(kind: TokenKind, token: string) {
  if (!TOKEN_RE.test(token)) return false;
  const payload = await getPayload({ config });
  const collection = kind.startsWith('idee') ? 'activiteiten' : kind.startsWith('vakman') ? 'vaklui' : 'activiteit-inschrijvingen';
  const { totalDocs } = await payload.count({ collection, where: { token: { equals: token } } });
  return totalDocs > 0;
}

/** Pagina achter een link uit een mail over een activiteit of een aangemelde vakman (bevestigen, intrekken, afmelden). */
export async function TokenPage({ kind, locale, token }: { kind: TokenKind; locale: string; token: string }) {
  const t = await getTranslations({ locale, namespace: 'activiteiten.token' });
  const geldig = await tokenBestaat(kind, token);
  const vakman = kind.startsWith('vakman');

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-text">{t(`${kind}.heading`)}</h1>
      {geldig ? (
        <>
          <p className="mt-2 text-muted">{t(`${kind}.text`)}</p>
          <TokenForm
            kind={kind}
            token={token}
            strings={{
              submit: t(`${kind}.submit`),
              submitting: t('submitting'),
              success: t(`${kind}.success`),
              invalid: t(`${kind}.invalid`),
              gesloten: t('gesloten'),
            }}
          />
        </>
      ) : (
        <p className="mt-4 text-accent">{t(`${kind}.invalid`)}</p>
      )}
      <p className="mt-8">
        <Link href={localizedHref(locale, vakman ? '/vaklui' : '/activiteiten')} className="text-primary underline">
          {t(vakman ? 'terugVaklui' : 'terug')}
        </Link>
      </p>
    </main>
  );
}
