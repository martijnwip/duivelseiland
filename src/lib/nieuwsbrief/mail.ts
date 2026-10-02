import { Resend } from 'resend';
import { localizedHref } from '@/i18n/localizedHref';

export type NieuwsbriefMailKind = 'bevestigen' | 'afmelden';
type Locale = 'nl' | 'en';

const TEKSTEN: Record<Locale, Record<NieuwsbriefMailKind, { subject: string; intro: string; knop: string; negeren: string }>> = {
  nl: {
    bevestigen: {
      subject: 'Bevestig je aanmelding voor de Duivelseiland-nieuwsbrief',
      intro: 'Leuk dat je de nieuwsbrief van Duivelseiland wilt ontvangen! Bevestig je aanmelding via deze link:',
      knop: 'Aanmelding bevestigen',
      negeren: 'Heb je je niet aangemeld? Dan kun je deze e-mail negeren; je krijgt dan niets van ons.',
    },
    afmelden: {
      subject: 'Afmelden voor de Duivelseiland-nieuwsbrief',
      intro: 'Je hebt gevraagd om je af te melden voor de nieuwsbrief van Duivelseiland. Via deze link meld je je af:',
      knop: 'Afmelden',
      negeren: 'Heb je dit niet gevraagd? Dan kun je deze e-mail negeren; je blijft gewoon aangemeld.',
    },
  },
  en: {
    bevestigen: {
      subject: 'Confirm your subscription to the Duivelseiland newsletter',
      intro: 'Great that you want to receive the Duivelseiland newsletter! Please confirm your subscription via this link:',
      knop: 'Confirm subscription',
      negeren: "Didn't sign up? Just ignore this email and you won't hear from us.",
    },
    afmelden: {
      subject: 'Unsubscribe from the Duivelseiland newsletter',
      intro: 'You asked to unsubscribe from the Duivelseiland newsletter. Use this link to unsubscribe:',
      knop: 'Unsubscribe',
      negeren: "Didn't ask for this? Just ignore this email and you'll stay subscribed.",
    },
  },
};

/** Volledige URL van de bevestig- of afmeldpagina voor dit token. Ook bruikbaar als afmeldlink in de nieuwsbrief. */
export function nieuwsbriefLink(locale: Locale, kind: NieuwsbriefMailKind, token: string) {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
  return `${base}${localizedHref(locale, `/nieuwsbrief/${kind}/${token}`)}`;
}

export async function sendNieuwsbriefMail({
  to,
  locale,
  kind,
  token,
}: {
  to: string;
  locale: Locale;
  kind: NieuwsbriefMailKind;
  token: string;
}) {
  const url = nieuwsbriefLink(locale, kind, token);
  const t = TEKSTEN[locale][kind];

  if (!process.env.RESEND_API_KEY) {
    console.log(`[nieuwsbrief] RESEND_API_KEY ontbreekt, ${kind}-link voor ${to}: ${url}`);
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Duivelseiland <onboarding@resend.dev>',
    to,
    subject: t.subject,
    html: `<p>${t.intro}</p><p><a href="${url}">${t.knop}</a></p><p>${url}</p><p>${t.negeren}</p>`,
  });
  if (error) throw error;
}
