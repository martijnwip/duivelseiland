import type { Parkeervak, VakSoort } from './api';

/** Aantal plekken per soort; een vak kan meer dan één plek tellen (`aantal`). */
export function perSoort(vakken: Parkeervak[]): Record<VakSoort | 'totaal', number> {
  const n = { totaal: 0, laadpaal: 0, 'laden-lossen': 0, deelauto: 0, gehandicapt: 0, gewoon: 0 };
  for (const v of vakken) {
    n.totaal += v.aantal;
    n[v.soort] += v.aantal;
  }
  return n;
}
