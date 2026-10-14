import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, Payload } from 'payload';
import { APIError } from 'payload';
import { redactieAdressen } from '../activiteiten/workflow';
import type { Locale } from '../mail';
import type { Moderatie } from './constants';
import { redactieNieuweVakmanMail, vakmanAfgewezenMail, vakmanGoedgekeurdMail, verstuur } from './mail';

const fout = (bericht: string, status = 400) => new APIError(bericht, status, null, true);

export async function meldNieuweVakmanAanRedactie(payload: Payload, naam: string, id: number) {
  for (const to of await redactieAdressen(payload)) {
    try {
      await verstuur(redactieNieuweVakmanMail(to, naam, id));
    } catch (error) {
      payload.logger.error(`[vaklui] melding nieuwe aanmelding aan ${to} mislukt: ${error}`);
    }
  }
}

/**
 * Moderatie van een aangemelde vakman: goedkeuren zet hem live, afkeuren (met reden) haalt hem offline.
 * Publiceert de redactie een aanmelding met de hand, dan telt dat als goedkeuren, zodat `status` en
 * `moderatie` niet uit de pas lopen.
 */
export const vakmanBeforeChange: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (operation !== 'update' || !originalDoc) return data;
  const oud = (originalDoc.moderatie ?? null) as Moderatie | null;
  let nieuw = ('moderatie' in data ? data.moderatie : oud) as Moderatie | null;

  const wordtGepubliceerd = data.status === 'published' && originalDoc.status !== 'published';
  if (nieuw === oud && wordtGepubliceerd && (oud === 'ingediend' || oud === 'afgewezen')) {
    nieuw = data.moderatie = 'goedgekeurd';
  }
  if (nieuw === oud) return data;

  if (nieuw === 'goedgekeurd') {
    const vakken = ('vakken' in data ? data.vakken : originalDoc.vakken) as unknown[] | null | undefined;
    if (!vakken?.length) {
      const ander = String(data.anderVak ?? originalDoc.anderVak ?? '').trim();
      throw fout(`Kies eerst een vak bij Vakken (met de + voeg je een nieuw vak toe)${ander ? `. De aanmelder noemde: "${ander}"` : ''}.`);
    }
    data.status = 'published';
    data.afwijsReden = null;
  }

  if (nieuw === 'afgewezen') {
    if (!String(data.afwijsReden ?? originalDoc.afwijsReden ?? '').trim()) {
      throw fout('Vul een reden in voordat je afkeurt; die wordt naar de aanmelder gemaild.');
    }
    data.status = 'draft';
  }
  return data;
};

/** Mail aan de aanmelder na goedkeuren of afkeuren. Fouten bij versturen worden gelogd, niet teruggegeven. */
export const vakmanAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== 'update' || !doc.aanmelderEmail || doc.moderatie === previousDoc?.moderatie) return doc;
  const locale: Locale = doc.locale === 'en' ? 'en' : 'nl';
  try {
    if (doc.moderatie === 'goedgekeurd') await verstuur(vakmanGoedgekeurdMail(doc.aanmelderEmail, locale, doc.naam));
    if (doc.moderatie === 'afgewezen') await verstuur(vakmanAfgewezenMail(doc.aanmelderEmail, locale, doc.naam, doc.afwijsReden ?? ''));
  } catch (error) {
    req.payload.logger.error(`[vaklui] mail na ${previousDoc?.moderatie} → ${doc.moderatie} mislukt voor ${doc.id}: ${error}`);
  }
  return doc;
};
