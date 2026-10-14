import { escapeHtml, mailHtml, siteUrl, adminUrl, tekstAlsHtml, type Locale, type Mail } from '../mail';

export { verstuur } from '../mail';

type T = Record<Locale, string>;
const t = (locale: Locale, teksten: T) => teksten[locale];

// --- Aanmelder (de buur met buurtpas) -------------------------------------------------------

export function vakmanOntvangenMail(to: string, locale: Locale, naam: string, token: string): Mail {
  const url = siteUrl(locale, `/vaklui/aanmelding/intrekken/${token}`);
  const nn = escapeHtml(naam);
  return {
    to,
    subject: t(locale, { nl: 'We hebben je aanmelding van een vakman ontvangen', en: "We've received your tradesperson submission" }),
    html: mailHtml({
      alineas: [
        t(locale, {
          nl: `Bedankt voor het aanmelden van <strong>${nn}</strong>! De redactie kijkt ernaar en laat je weten of de vakman op de site komt.`,
          en: `Thanks for submitting <strong>${nn}</strong>! The editors will review it and let you know whether the tradesperson goes on the site.`,
        }),
      ],
      voet: [
        t(locale, { nl: 'Was jij dit niet, of wil je het terugdraaien? Trek de aanmelding dan in:', en: "Wasn't this you, or changed your mind? Withdraw the submission:" }) +
          ` <a href="${url}">${url}</a>`,
      ],
    }),
  };
}

export function vakmanGoedgekeurdMail(to: string, locale: Locale, naam: string): Mail {
  const pagina = siteUrl(locale, '/vaklui');
  const nn = escapeHtml(naam);
  return {
    to,
    subject: t(locale, { nl: `${naam} staat bij de vaklui`, en: `${naam} is now listed` }),
    html: mailHtml({
      alineas: [
        t(locale, {
          nl: `Goed nieuws: de redactie heeft je aanmelding van <strong>${nn}</strong> goedgekeurd. De vakman staat nu op de site:`,
          en: `Good news: the editors approved your submission of <strong>${nn}</strong>. The tradesperson is now on the site:`,
        }),
        `<a href="${pagina}">${pagina}</a>`,
      ],
    }),
  };
}

export function vakmanAfgewezenMail(to: string, locale: Locale, naam: string, reden: string): Mail {
  const nn = escapeHtml(naam);
  const formulier = siteUrl(locale, '/vaklui/aanmelden');
  return {
    to,
    subject: t(locale, { nl: `Over je aanmelding: ${naam}`, en: `About your submission: ${naam}` }),
    html: mailHtml({
      alineas: [
        t(locale, {
          nl: `Bedankt voor het aanmelden van <strong>${nn}</strong>. De redactie heeft de aanmelding helaas niet goedgekeurd. De reden:`,
          en: `Thanks for submitting <strong>${nn}</strong>. Unfortunately the editors did not approve it. The reason:`,
        }),
        tekstAlsHtml(reden),
        t(locale, {
          nl: `Je kunt de vakman aangepast opnieuw aanmelden: <a href="${formulier}">${formulier}</a>`,
          en: `You can submit the tradesperson again with changes: <a href="${formulier}">${formulier}</a>`,
        }),
      ],
    }),
  };
}

// --- Redactie (alleen Nederlands) ------------------------------------------------------------

export function redactieNieuweVakmanMail(to: string, naam: string, id: number): Mail {
  return {
    to,
    subject: `Nieuwe vakman aangemeld: ${naam}`,
    html: mailHtml({
      alineas: [`Een buur heeft een vakman aangemeld: <strong>${escapeHtml(naam)}</strong>. Keur de aanmelding goed of af in het beheerpaneel.`],
      knop: { label: 'Bekijk de aanmelding', url: adminUrl(`/collections/vaklui/${id}`) },
    }),
  };
}
