import type { Payload, PayloadRequest } from 'payload';
import type { Activiteiten } from '../../../payload-types';
import { ACTIEVE_FASES } from './constants';
import { nieuweDeelnemerMail, verstuur, type Locale } from './mail';
import { titels } from './workflow';

export const telActief = (payload: Payload, activiteitId: number, req?: PayloadRequest) =>
  payload
    .count({
      collection: 'activiteit-inschrijvingen',
      where: { and: [{ activiteit: { equals: activiteitId } }, { status: { equals: 'actief' } }] },
      req,
    })
    .then((r) => r.totalDocs);

/** Kan er nog iemand bij? Fase actief, inschrijving open en (als ingesteld) nog niet vol. */
export async function heeftPlek(payload: Payload, activiteit: Activiteiten, req?: PayloadRequest) {
  if (!ACTIEVE_FASES.includes(activiteit.fase) || activiteit.inschrijving !== 'open') return false;
  if (!activiteit.maxDeelnemers) return true;
  return (await telActief(payload, activiteit.id, req)) < activiteit.maxDeelnemers;
}

/** Na een nieuwe actieve deelnemer: sluiten bij het maximum en de organisator een melding sturen. */
export async function naAanmelding(
  payload: Payload,
  activiteit: Activiteiten,
  deelnemer: { voornaam: string; opmerking?: string | null },
  req?: PayloadRequest,
) {
  const aantal = await telActief(payload, activiteit.id, req);
  if (activiteit.maxDeelnemers && aantal >= activiteit.maxDeelnemers && activiteit.inschrijving === 'open') {
    await payload.update({
      collection: 'activiteiten',
      id: activiteit.id,
      data: { inschrijving: 'gesloten' },
      context: { skipWorkflow: true },
      req,
    });
  }
  const eigenaarId = typeof activiteit.eigenaar === 'object' ? activiteit.eigenaar?.id : activiteit.eigenaar;
  if (!activiteit.meldingBijInschrijving || !eigenaarId) return;
  try {
    const eigenaar = await payload.findByID({ collection: 'users', id: eigenaarId, depth: 0, disableErrors: true, req });
    const locale: Locale = activiteit.locale === 'en' ? 'en' : 'nl';
    const t = await titels(payload, activiteit.id, req);
    if (eigenaar?.email) await verstuur(nieuweDeelnemerMail(eigenaar.email, locale, t[locale], deelnemer.voornaam, aantal, deelnemer.opmerking));
  } catch (error) {
    payload.logger.error(`[activiteiten] melding aan organisator mislukt: ${error}`);
  }
}
