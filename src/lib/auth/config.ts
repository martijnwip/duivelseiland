import type { BetterAuthOptions } from 'better-auth';
import { magicLink } from 'better-auth/plugins';
import { Resend } from 'resend';

async function sendMagicLink({
  email,
  url,
  metadata,
}: {
  email: string;
  url: string;
  metadata?: Record<string, unknown>;
}) {
  const isInvite = Boolean(metadata?.invite);
  const subject = isInvite
    ? 'Je bent uitgenodigd voor het Duivelseiland-beheerpaneel'
    : 'Inloglink voor Duivelseiland';
  const intro = isInvite
    ? 'Je hebt toegang gekregen tot het Duivelseiland-beheerpaneel. Klik op onderstaande link om in te loggen:'
    : 'Klik op onderstaande link om in te loggen op het Duivelseiland-beheerpaneel:';

  if (!process.env.RESEND_API_KEY) {
    console.log(
      `[magic-link] RESEND_API_KEY ontbreekt, ${isInvite ? 'uitnodiging' : 'inloglink'} voor ${email}: ${url}`,
    );
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Duivelseiland <onboarding@resend.dev>',
    to: email,
    subject,
    html: `<p>${intro}</p><p><a href="${url}">${url}</a></p><p>Deze link is 5 minuten geldig. Heb je dit niet aangevraagd, dan kun je deze e-mail negeren.</p>`,
  });
}

export const betterAuthOptions = {
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'auteur', input: false },
    },
  },
  emailAndPassword: { enabled: false },
  plugins: [
    magicLink({
      sendMagicLink,
      disableSignUp: true,
    }),
  ],
} satisfies Partial<BetterAuthOptions>;
