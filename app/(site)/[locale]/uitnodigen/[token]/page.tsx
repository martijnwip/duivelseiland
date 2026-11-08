import type { Metadata } from 'next';
import { getPayload } from 'payload';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import config from '@payload-config';
import { InviteAcceptForm } from '@/components/site/InviteAcceptForm';

async function getInviteState(token: string) {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'invite-links',
    where: { token: { equals: token } },
    overrideAccess: true,
    limit: 1,
  });
  const invite = docs[0];

  if (!invite) return 'invalid' as const;
  if (invite.status !== 'pending') return 'used' as const;
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) return 'expired' as const;
  return 'pending' as const;
}

/** Uitnodigingslink met token: niet indexeren en niet bedoeld om te delen. */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'invite' });
  return { title: t('heading'), robots: { index: false, follow: false } };
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'invite' });

  const state = await getInviteState(token);

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-text">{t('heading')}</h1>

      {state === 'pending' ? (
        <>
          <p className="mt-2 text-muted">{t('description')}</p>
          <div className="mt-6">
            <InviteAcceptForm
              token={token}
              strings={{
                emailLabel: t('emailLabel'),
                emailPlaceholder: t('emailPlaceholder'),
                submit: t('submit'),
                submitting: t('submitting'),
                successHeading: t('successHeading'),
                successDescription: t('successDescription'),
                genericError: t('genericError'),
              }}
            />
          </div>
        </>
      ) : (
        <p className="mt-4 text-accent">
          {state === 'used' && t('usedToken')}
          {state === 'expired' && t('expiredToken')}
          {state === 'invalid' && t('invalidToken')}
        </p>
      )}
    </main>
  );
}
