import { formatDatumTijd } from './datum';
import { escapeHtml, mailHtml, siteUrl, adminUrl, tekstAlsHtml, type Locale, type Mail } from '../mail';

export { escapeHtml, mailHtml, siteUrl, adminUrl, tekstAlsHtml, verstuur, verstuurBatch, type Locale, type Mail } from '../mail';

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
          nl: `Goed nieuws: de redactie heeft <strong>${tt}</strong> getoetst aan de spelregels en goedgekeurd. De pagina staat online en op de agenda, als <em>nog niet definitief</em>. Buren kunnen zich nu aanmelden:`,
          en: `Good news: the editors checked <strong>${tt}</strong> against the ground rules and approved it. The page is online and on the calendar, marked <em>not yet final</em>. Neighbours can now sign up:`,
        }),
        `<a href="${pagina}">${pagina}</a>`,
        t(locale, {
          nl: 'Nu ben jij aan zet: vertel buren erover en verzamel aanmeldingen. Jij beslist of het doorgaat. Zet de activiteit in het beheerpaneel op <em>Gaat door</em> (met een datum) of op <em>Afgelast</em>. De datum kun je altijd wijzigen; deelnemers krijgen daar automatisch een mail over.',
          en: "Now it's up to you: tell your neighbours and gather sign-ups. You decide whether it goes ahead. In the admin panel, set the activity to <em>Gaat door</em> (with a date) or <em>Afgelast</em>. You can always change the date; participants are emailed automatically when you do.",
        }),
        t(locale, {
          nl: 'In het beheerpaneel zie je ook wie zich heeft aangemeld, stuur je berichten aan de groep en sluit je de aanmelding als het vol is. Log in met dit e-mailadres; je krijgt dan een inloglink.',
          en: "In the admin panel you can also see who signed up, send messages to the group and close sign-ups when it's full. Log in with this email address and you'll receive a login link.",
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
  fase: 'gaat-door' | 'afgelast' | 'niet-definitief';
  datum?: string | null;
  token: string;
  replyTo?: string;
}): Mail {
  const tt = escapeHtml(titel);
  const wanneer = datum ? formatDatumTijd(datum, locale) : null;
  const pagina = siteUrl(locale, `/activiteiten/${slug}`);
  const alineas =
    fase === 'niet-definitief'
      ? [
          t(locale, {
            nl: `<strong>${tt}</strong> is weer <em>nog niet definitief</em>: de organisator weet nog niet zeker of het doorgaat. Je blijft ingeschreven en hoort het zodra er meer duidelijk is.`,
            en: `<strong>${tt}</strong> is <em>not yet final</em> again: the organiser isn't sure yet whether it will go ahead. You're still signed up and will hear as soon as there's news.`,
          }),
          `<a href="${pagina}">${pagina}</a>`,
        ]
      : fase === 'gaat-door'
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
      fase === 'niet-definitief'
        ? t(locale, { nl: `Nog niet definitief: ${titel}`, en: `Not yet final: ${titel}` })
        : fase === 'gaat-door'
        ? t(locale, { nl: `Het gaat door: ${titel}`, en: `It's on: ${titel}` })
        : t(locale, { nl: `Afgelast: ${titel}`, en: `Cancelled: ${titel}` }),
    html: mailHtml({ alineas, voet: fase === 'afgelast' ? undefined : afmeldVoet(locale, token) }),
  };
}

/** De organisator heeft de datum gewijzigd. `definitief` is false zolang de fase goedgekeurd is. */
export function datumGewijzigdMail({
  to,
  locale,
  titel,
  slug,
  datum,
  definitief,
  token,
  replyTo,
}: {
  to: string;
  locale: Locale;
  titel: string;
  slug: string;
  datum?: string | null;
  definitief: boolean;
  token: string;
  replyTo?: string;
}): Mail {
  const tt = escapeHtml(titel);
  const pagina = siteUrl(locale, `/activiteiten/${slug}`);
  const wanneer = datum
    ? t(locale, { nl: `Nieuwe datum: ${formatDatumTijd(datum, locale)}`, en: `New date: ${formatDatumTijd(datum, locale)}` }) +
      (definitief ? '' : t(locale, { nl: ' (nog niet definitief)', en: ' (not yet final)' }))
    : t(locale, { nl: 'De datum is nog niet bekend.', en: 'The date is not known yet.' });
  return {
    to,
    replyTo,
    subject: t(locale, { nl: `Datum gewijzigd: ${titel}`, en: `Date changed: ${titel}` }),
    html: mailHtml({
      alineas: [
        t(locale, {
          nl: `De organisator heeft de datum van <strong>${tt}</strong> gewijzigd.`,
          en: `The organiser has changed the date of <strong>${tt}</strong>.`,
        }),
        wanneer,
        `<a href="${pagina}">${pagina}</a>`,
      ],
      voet: afmeldVoet(locale, token),
    }),
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
