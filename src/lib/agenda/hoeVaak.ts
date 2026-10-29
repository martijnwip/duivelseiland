import type { Agenda } from '../../../payload-types';

/**
 * Bij een agenda-item van een terugkerende activiteit: hoe vaak, in de woorden van de organisator
 * ("Elke donderdag van 10:30-12:00 uur"). Zo'n activiteit heeft vaak geen datum; de agenda toont hem dan
 * onder Vaste activiteiten. Vraagt `activiteit` als object (depth >= 1).
 */
export function hoeVaakVan(doc: Pick<Agenda, 'activiteit'>): string | null {
  const activiteit = typeof doc.activiteit === 'object' ? doc.activiteit : null;
  if (activiteit?.soort !== 'terugkerend') return null;
  return activiteit.soortToelichting?.trim() || null;
}
