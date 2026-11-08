import { getTranslations } from 'next-intl/server';
import { haalActiviteitDeelinfo, haalDeelinfo, haalVakmanDeelinfo, type DeelCollectie, type Deelinfo } from '@/lib/deelinfo';
import { deelKaart } from './deelKaart';

const LABEL: Record<DeelCollectie, string> = {
  nieuws: 'nieuws',
  agenda: 'agenda',
  interviews: 'interviews',
  geschiedenis: 'geschiedenis',
  'duivelse-kunst': 'duivelseKunst',
  'praktische-info': 'praktischeInfo',
};

/**
 * Deelafbeelding voor een contentitem (zie deelKaart.tsx): de afbeelding van het item, de titel en
 * voor de agenda datum, tijd en plek, voor de rest de eerste zinnen. Een onbekend item geeft een 404.
 */
export async function deelAfbeelding(collectie: DeelCollectie, slug: string, locale: 'nl' | 'en') {
  const [info, t] = await Promise.all([haalDeelinfo(collectie, slug, locale), getTranslations({ locale, namespace: 'content.deel' })]);
  if (!info) return new Response('Niet gevonden', { status: 404 });

  return deelKaart({
    label: t(LABEL[collectie]),
    title: info.title,
    regels: info.regels,
    tekst: collectie === 'agenda' ? null : info.description,
    foto: info.imageUrl ? { url: info.imageUrl } : null,
  });
}

function kaartVan(info: Deelinfo | null, label: string) {
  if (!info) return new Response('Niet gevonden', { status: 404 });
  return deelKaart({ label, title: info.title, regels: info.regels, tekst: info.description, foto: info.imageUrl ? { url: info.imageUrl } : null });
}

/** Activiteit: titel, wanneer en de eerste zinnen, met de headerafbeelding. */
export async function activiteitAfbeelding(slug: string, locale: 'nl' | 'en') {
  const [info, t] = await Promise.all([haalActiviteitDeelinfo(slug, locale), getTranslations({ locale, namespace: 'content.deel' })]);
  return kaartVan(info, t('activiteit'));
}

/** Vakman: naam, vakken en de aanbeveling; nooit het telefoonnummer. */
export async function vakmanAfbeelding(slug: string, locale: 'nl' | 'en') {
  const [info, t] = await Promise.all([haalVakmanDeelinfo(slug, locale), getTranslations({ locale, namespace: 'content.deel' })]);
  return kaartVan(info, t('vaklui'));
}
