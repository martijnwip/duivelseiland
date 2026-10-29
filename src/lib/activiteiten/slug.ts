import type { Payload } from 'payload';
import { uniekeSlug as vrijeSlug } from '../slug';
import { GERESERVEERDE_SLUGS } from './constants';

/** Voorstel voor een unieke slug; de redactie kan hem bij de moderatie nog aanpassen. */
export function uniekeSlug(payload: Payload, titel: string) {
  return vrijeSlug(payload, 'activiteiten', titel, { gereserveerd: GERESERVEERDE_SLUGS, fallback: 'activiteit' });
}
