import { DAG, dsoAll, safe } from '@/lib/afval/api';
import { BUURT_CODE } from '@/lib/afval/constants';
import type { Pt } from '@/lib/afval/geo';
import type { Result } from '@/lib/afval/types';

/** Wat een bewoner aan een vak wil weten; de rest is een gewoon (betaald) vak. */
export type VakSoort = 'laadpaal' | 'laden-lossen' | 'deelauto' | 'gehandicapt' | 'gewoon';

export type Parkeervak = { id: string; straat: string; soort: VakSoort; aantal: number; ring: Pt[] };

type Regime = { eType: string | null; bord: string | null };
type Row = {
  id: string;
  straatnaam: string | null;
  eType: string | null;
  aantal: number | null;
  geometry: { type: 'Polygon'; coordinates: Pt[][] } | null;
  regimes: Regime[] | null;
};

/**
 * RVV-bordcode van het vak of van een van zijn regimes (E6a/E6b gehandicapt, E7 laden en lossen,
 * E8 opladen, E9 vergunninghouders).
 */
function soortVan(r: Row): VakSoort {
  const regimes = r.regimes ?? [];
  const codes = [r.eType, ...regimes.map((g) => g.eType)].filter(Boolean) as string[];
  if (codes.includes('E8')) return 'laadpaal';
  if (codes.includes('E7')) return 'laden-lossen';
  if (codes.some((e) => e.startsWith('E6'))) return 'gehandicapt';
  // E9 is "alleen vergunninghouders"; bij deelauto's staat de naam van de autodeelorganisatie op het bord.
  if (codes.includes('E9') && regimes.some((g) => /autodate|deelauto|greenwheels|mywheels/i.test(g.bord ?? ''))) return 'deelauto';
  return 'gewoon';
}

/** Alle parkeervakken in de buurt (Parkeervakken, gemeente Amsterdam; dagelijks bijgewerkt). */
export function getParkeervakken(): Promise<Result<Parkeervak[]>> {
  return safe('parkeervakken', async () => {
    const rows = await dsoAll<'parkeervakken', Row>(
      'parkeervakken',
      '/parkeervakken/parkeervakken/',
      // Geen `_fields`: daarmee laat de API de velden binnen `regimes` leeg.
      { buurtcode: BUURT_CODE },
      DAG,
    );
    return rows
      .filter((r) => r.geometry?.type === 'Polygon')
      .map((r) => ({ id: r.id, straat: r.straatnaam ?? '', soort: soortVan(r), aantal: r.aantal ?? 1, ring: r.geometry!.coordinates[0] }));
  });
}
