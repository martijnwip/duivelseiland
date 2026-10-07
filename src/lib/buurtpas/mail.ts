import { escapeHtml, mailHtml, siteUrl, verstuur, type Locale } from '@/lib/mail';

export const TOKEN_GELDIG_MS = 30 * 60 * 1000;

const T = {
  nl: {
    subject: 'Je buurtpas voor Duivelseiland',
    intro: 'Je vroeg een buurtpas aan voor de website van Duivelseiland. Daarmee zie je op dit apparaat ook de contactgegevens van vakmensen en de berichten die alleen voor de buurt zijn.',
    knop: 'Buurtpas activeren',
    geldig: 'De link is 30 minuten geldig en werkt één keer. Je hebt geen account of wachtwoord nodig.',
    nieuwsbrief: 'Je vroeg ook om de nieuwsbrief. Met dezelfde klik meld je je daarvoor aan.',
    negeren: 'Heb je dit niet aangevraagd? Dan kun je deze e-mail negeren; er gebeurt niets.',
    privacy: 'Je e-mailadres staat in het adresboek van de buurtsite. Opzeggen kan altijd zelf op de buurtpaspagina.',
  },
  en: {
    subject: 'Your neighbourhood pass for Duivelseiland',
    intro: 'You requested a neighbourhood pass for the Duivelseiland website. With it, this device also shows the contact details of local tradespeople and posts meant only for the neighbourhood.',
    knop: 'Activate pass',
    geldig: 'The link is valid for 30 minutes and works once. You don’t need an account or password.',
    nieuwsbrief: 'You also asked for the newsletter. The same click subscribes you to it.',
    negeren: "Didn't request this? Just ignore this email; nothing will happen.",
    privacy: 'Your email address is kept in the address book of the neighbourhood site. You can cancel the pass yourself at any time on the pass page.',
  },
} satisfies Record<Locale, Record<string, string>>;

export function buurtpasLink(locale: Locale, token: string, terug: string) {
  return `${siteUrl(locale, `/buurtpas/${token}`)}?terug=${encodeURIComponent(terug)}`;
}

export async function sendBuurtpasMail({
  to,
  locale,
  token,
  terug,
  metNieuwsbrief,
}: {
  to: string;
  locale: Locale;
  token: string;
  terug: string;
  metNieuwsbrief: boolean;
}) {
  const t = T[locale];
  await verstuur({
    to,
    subject: t.subject,
    html: mailHtml({
      alineas: [escapeHtml(t.intro), ...(metNieuwsbrief ? [escapeHtml(t.nieuwsbrief)] : []), escapeHtml(t.geldig)],
      knop: { label: t.knop, url: buurtpasLink(locale, token, terug) },
      voet: [escapeHtml(t.negeren), escapeHtml(t.privacy)],
    }),
  });
}
