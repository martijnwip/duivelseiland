import { Resend } from 'resend';
import { localizedHref } from '@/i18n/localizedHref';

export type Locale = 'nl' | 'en';

export type Mail = { to: string; subject: string; html: string; replyTo?: string };

const FROM = () => process.env.RESEND_FROM_EMAIL || 'Duivelseiland <onboarding@resend.dev>';

export function siteUrl(locale: Locale, path: string) {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
  return `${base}${localizedHref(locale, path)}`;
}

export function adminUrl(path = '') {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
  return `${base}/admin${path}`;
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Platte tekst (bv. van een organisator) veilig als alinea's in HTML. */
export function tekstAlsHtml(tekst: string) {
  return tekst
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .filter((a) => a.trim())
    .map((a) => `<p>${escapeHtml(a.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/** Eenvoudige opmaak voor alle activiteitenmails. `alineas` is al HTML (escape gebruikersinvoer vooraf). */
export function mailHtml({ alineas, knop, voet }: { alineas: string[]; knop?: { label: string; url: string }; voet?: string[] }) {
  const body = alineas.map((a) => (a.startsWith('<p>') ? a : `<p>${a}</p>`)).join('');
  const button = knop ? `<p><a href="${knop.url}">${escapeHtml(knop.label)}</a></p><p style="color:#666;font-size:13px">${knop.url}</p>` : '';
  const footer = voet?.length
    ? `<hr style="border:none;border-top:1px solid #ddd;margin:24px 0"><p style="color:#666;font-size:13px">${voet.join('<br>')}</p>`
    : '';
  return `${body}${button}${footer}`;
}

/** Eén mail versturen. Zonder RESEND_API_KEY (lokaal) alleen loggen. */
export async function verstuur(mail: Mail) {
  if (!process.env.RESEND_API_KEY) {
    const links = [...mail.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    console.log(`[activiteiten] RESEND_API_KEY ontbreekt, mail aan ${mail.to}: "${mail.subject}"${links.length ? ` links: ${links.join(' ')}` : ''}`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: FROM(), ...mail });
  if (error) throw error;
}

/** Veel mails tegelijk (berichten aan deelnemers): per 100 via de batch-API, ieder een eigen mail. */
export async function verstuurBatch(mails: Mail[]) {
  if (!mails.length) return;
  if (!process.env.RESEND_API_KEY) {
    for (const mail of mails) await verstuur(mail);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  for (let i = 0; i < mails.length; i += 100) {
    const { error } = await resend.batch.send(mails.slice(i, i + 100).map((m) => ({ from: FROM(), ...m })));
    if (error) throw error;
  }
}

type T = Record<Locale, string>;
const t = (locale: Locale, teksten: T) => teksten[locale];

// --- Aanvrager van een idee ---------------------------------------------------------------

export function ideeBevestigenMail(to: string, locale: Locale, titel: string, token: string): Mail {
  const url = siteUrl(locale, `/activiteiten/idee/bevestigen/${token}`);
  const tt = escapeHtml(titel);
  return {
    to,
    subject: t(locale, { nl: 'Bevestig je idee voor een buurtactiviteit', en: 'Confirm your idea for a neighbourhood activity' }),
    html: mailHtml({
      alineas: [
        t(locale, {
          nl: `Leuk dat je een activiteit wilt organiseren: <strong>${tt}</strong>! Bevestig je e-mailadres, dan gaat je idee naar de redactie.`,
          en: `Great that you want to organise an activity: <strong>${tt}</strong>! Confirm your email address and your idea goes to the editors.`,
        }),
      ],
      knop: { label: t(locale, { nl: 'Idee bevestigen', en: 'Confirm idea' }), url },
      voet: [
        t(locale, {
          nl: 'Heb je niets aangemeld? Dan kun je deze e-mail negeren; het idee wordt dan na een week verwijderd.',
          en: "Didn't submit anything? Just ignore this email; the idea will be deleted after a week.",
        }),
      ],
    }),
  };
}

export function ideeOntvangenMail(to: string, locale: Locale, titel: string, token: string): Mail {
  const url = siteUrl(locale, `/activiteiten/idee/intrekken/${token}`);
  const tt = escapeHtml(titel);
  return {
    to,
    subject: t(locale, { nl: 'We hebben je idee ontvangen', en: "We've received your idea" }),
    html: mailHtml({
      alineas: [
        t(locale, {
          nl: `Bedankt voor je idee <strong>${tt}</strong>! De redactie kijkt er binnen een week naar en laat je weten of het online gaat.`,
          en: `Thanks for your idea <strong>${tt}</strong>! The editors will look at it within a week and let you know whether it goes online.`,
        }),
      ],
      voet: [
        t(locale, { nl: 'Was jij dit niet? Trek het idee dan in:', en: "Wasn't this you? Withdraw the idea:" }) +
          ` <a href="${url}">${url}</a>`,
      ],
    }),
  };
}

export function ideeGoedgekeurdMail(to: string, locale: Locale, titel: string, slug: string): Mail {
  const pagina = siteUrl(locale, `/activiteiten/${slug}`);
  const tt = escapeHtml(titel);
  return {
    to,
    subject: t(locale, { nl: `Je activiteit staat online: ${titel}`, en: `Your activity is online: ${titel}` }),
    html: mailHtml({
      alineas: [
        t(locale, {
          nl: `Goed nieuws: de redactie heeft <strong>${tt}</strong> goedgekeurd. De pagina staat online en buren kunnen zich aanmelden:`,
          en: `Good news: the editors approved <strong>${tt}</strong>. The page is online and neighbours can sign up:`,
        }),
        `<a href="${pagina}">${pagina}</a>`,
        t(locale, {
          nl: 'Vanaf nu ben jij de organisator. In het beheerpaneel zie je wie zich heeft aangemeld, stuur je berichten aan de groep, sluit je de inschrijving en zet je de activiteit op de agenda zodra hij doorgaat. Log in met dit e-mailadres; je krijgt dan een inloglink.',
          en: "From now on you're the organiser. In the admin panel you can see who signed up, send messages to the group, close sign-ups and put the activity on the calendar once it goes ahead. Log in with this email address and you'll receive a login link.",
        }),
      ],
      knop: { label: t(locale, { nl: 'Naar het beheerpaneel', en: 'Go to the admin panel' }), url: adminUrl() },
    }),
  };
}

export function ideeAfgewezenMail(to: string, locale: Locale, titel: string, reden: string): Mail {
  const tt = escapeHtml(titel);
  return {
    to,
    subject: t(locale, { nl: `Over je idee: ${titel}`, en: `About your idea: ${titel}` }),
    html: mailHtml({
      alineas: [
        t(locale, {
          nl: `Bedankt voor je idee <strong>${tt}</strong>. De redactie heeft het helaas niet goedgekeurd. De reden:`,
          en: `Thanks for your idea <strong>${tt}</strong>. Unfortunately the editors did not approve it. The reason:`,
        }),
        tekstAlsHtml(reden),
        t(locale, {
          nl: `Je bent van harte welkom om het idee aangepast opnieuw in te dienen: <a href="${siteUrl(locale, '/activiteiten/aanmelden')}">${siteUrl(locale, '/activiteiten/aanmelden')}</a>`,
          en: `You're very welcome to submit an adjusted idea: <a href="${siteUrl(locale, '/activiteiten/aanmelden')}">${siteUrl(locale, '/activiteiten/aanmelden')}</a>`,
        }),
      ],
    }),
  };
}

// --- Redactie (alleen Nederlands) ------------------------------------------------------------

export function redactieNieuwIdeeMail(to: string, titel: string, id: number): Mail {
  return {
    to,
    subject: `Nieuw activiteitidee: ${titel}`,
    html: mailHtml({
      alineas: [`Er is een nieuw idee voor een buurtactiviteit ingediend: <strong>${escapeHtml(titel)}</strong>. Keur het goed of wijs het af in het beheerpaneel.`],
      knop: { label: 'Bekijk het idee', url: adminUrl(`/collections/activiteiten/${id}`) },
    }),
  };
}

// --- Deelnemers -------------------------------------------------------------------------------

function afmeldVoet(locale: Locale, token: string, extra?: string) {
  const url = siteUrl(locale, `/activiteiten/inschrijving/afmelden/${token}`);
  return [
    ...(extra ? [extra] : []),
    t(locale, { nl: 'Afmelden voor deze activiteit:', en: 'Leave this activity:' }) + ` <a href="${url}">${url}</a>`,
  ];
}

export function inschrijvingBevestigenMail(to: string, locale: Locale, titel: string, token: string): Mail {
  const url = siteUrl(locale, `/activiteiten/inschrijving/bevestigen/${token}`);
  const tt = escapeHtml(titel);
  return {
    to,
    subject: t(locale, { nl: `Bevestig je aanmelding: ${titel}`, en: `Confirm your sign-up: ${titel}` }),
    html: mailHtml({
      alineas: [
        t(locale, {
          nl: `Je wilt meedoen met <strong>${tt}</strong>. Bevestig je aanmelding via deze link:`,
          en: `You'd like to join <strong>${tt}</strong>. Please confirm your sign-up via this link:`,
        }),
      ],
      knop: { label: t(locale, { nl: 'Aanmelding bevestigen', en: 'Confirm sign-up' }), url },
      voet: [
        t(locale, {
          nl: 'Heb je je niet aangemeld? Dan kun je deze e-mail negeren.',
          en: "Didn't sign up? Just ignore this email.",
        }),
      ],
    }),
  };
}

export function ingeschrevenMail(to: string, locale: Locale, titel: string, slug: string, token: string): Mail {
  const tt = escapeHtml(titel);
  const pagina = siteUrl(locale, `/activiteiten/${slug}`);
  return {
    to,
    subject: t(locale, { nl: `Je bent aangemeld: ${titel}`, en: `You've signed up: ${titel}` }),
    html: mailHtml({
      alineas: [
        t(locale, {
          nl: `Je bent aangemeld voor <strong>${tt}</strong>. De organisator houdt je per mail op de hoogte.`,
          en: `You've signed up for <strong>${tt}</strong>. The organiser will keep you posted by email.`,
        }),
        `<a href="${pagina}">${pagina}</a>`,
      ],
      voet: afmeldVoet(locale, token, t(locale, { nl: 'Was jij dit niet? Meld je dan af via de link hieronder.', en: "Wasn't this you? Leave via the link below." })),
    }),
  };
}

export function afmeldlinkMail(to: string, locale: Locale, titel: string, token: string): Mail {
  const url = siteUrl(locale, `/activiteiten/inschrijving/afmelden/${token}`);
  const tt = escapeHtml(titel);
  return {
    to,
    subject: t(locale, { nl: `Afmelden: ${titel}`, en: `Leave: ${titel}` }),
    html: mailHtml({
      alineas: [
        t(locale, {
          nl: `Je hebt gevraagd om je af te melden voor <strong>${tt}</strong>. Via deze link meld je je af:`,
          en: `You asked to leave <strong>${tt}</strong>. Use this link to leave:`,
        }),
      ],
      knop: { label: t(locale, { nl: 'Afmelden', en: 'Leave' }), url },
      voet: [
        t(locale, {
          nl: 'Heb je dit niet gevraagd? Dan kun je deze e-mail negeren; je blijft aangemeld.',
          en: "Didn't ask for this? Just ignore this email and you'll stay signed up.",
        }),
      ],
    }),
  };
}

export function berichtMail({
  to,
  locale,
  titel,
  organisator,
  replyTo,
  onderwerp,
  tekst,
  token,
}: {
  to: string;
  locale: Locale;
  titel: string;
  organisator: string;
  replyTo?: string;
  onderwerp: string;
  tekst: string;
  token: string;
}): Mail {
  const o = escapeHtml(organisator);
  const tt = escapeHtml(titel);
  return {
    to,
    replyTo,
    subject: `${titel}: ${onderwerp}`,
    html: mailHtml({
      alineas: [tekstAlsHtml(tekst)],
      voet: afmeldVoet(
        locale,
        token,
        t(locale, {
          nl: `Je ontvangt dit bericht via de website van Duivelseiland namens ${o}, organisator van ${tt}. Beantwoord je deze mail, dan komt je antwoord bij de organisator.`,
          en: `You're receiving this message via the Duivelseiland website on behalf of ${o}, organiser of ${tt}. If you reply to this email, your answer goes to the organiser.`,
        }),
      ),
    }),
  };
}

export function faseMail({
  to,
  locale,
  titel,
  slug,
  fase,
  datum,
  token,
  replyTo,
}: {
  to: string;
  locale: Locale;
  titel: string;
  slug: string;
  fase: 'gaat-door' | 'afgelast';
  datum?: string | null;
  token: string;
  replyTo?: string;
}): Mail {
  const tt = escapeHtml(titel);
  const wanneer = datum
    ? new Date(datum).toLocaleString(locale, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' })
    : null;
  const pagina = siteUrl(locale, `/activiteiten/${slug}`);
  const alineas =
    fase === 'gaat-door'
      ? [
          t(locale, { nl: `Het gaat door! <strong>${tt}</strong> vindt plaats.`, en: `It's on! <strong>${tt}</strong> is going ahead.` }),
          ...(wanneer ? [t(locale, { nl: `Wanneer: ${wanneer}`, en: `When: ${wanneer}` })] : []),
          `<a href="${pagina}">${pagina}</a>`,
        ]
      : [
          t(locale, {
            nl: `Helaas: <strong>${tt}</strong> gaat niet door. De organisator heeft de activiteit afgelast.`,
            en: `Unfortunately <strong>${tt}</strong> won't go ahead. The organiser has cancelled the activity.`,
          }),
        ];
  return {
    to,
    replyTo,
    subject:
      fase === 'gaat-door'
        ? t(locale, { nl: `Het gaat door: ${titel}`, en: `It's on: ${titel}` })
        : t(locale, { nl: `Afgelast: ${titel}`, en: `Cancelled: ${titel}` }),
    html: mailHtml({ alineas, voet: fase === 'gaat-door' ? afmeldVoet(locale, token) : undefined }),
  };
}

// --- Organisator ------------------------------------------------------------------------------

export function nieuweDeelnemerMail(to: string, locale: Locale, titel: string, deelnemer: string, aantal: number, opmerking?: string | null): Mail {
  const tt = escapeHtml(titel);
  const d = escapeHtml(deelnemer);
  return {
    to,
    subject: t(locale, { nl: `Nieuwe aanmelding voor ${titel}`, en: `New sign-up for ${titel}` }),
    html: mailHtml({
      alineas: [
        t(locale, {
          nl: `<strong>${d}</strong> doet mee met <strong>${tt}</strong>. Er zijn nu ${aantal} aanmelding(en).`,
          en: `<strong>${d}</strong> joined <strong>${tt}</strong>. There are now ${aantal} sign-up(s).`,
        }),
        ...(opmerking ? [t(locale, { nl: 'Opmerking:', en: 'Comment:' }), tekstAlsHtml(opmerking)] : []),
      ],
      knop: { label: t(locale, { nl: 'Bekijk de aanmeldingen', en: 'View sign-ups' }), url: adminUrl('/collections/activiteit-inschrijvingen') },
      voet: [
        t(locale, {
          nl: 'Deze meldingen zet je uit bij je activiteit in het beheerpaneel.',
          en: 'You can turn these notifications off on your activity in the admin panel.',
        }),
      ],
    }),
  };
}
