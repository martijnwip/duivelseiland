import { BaseMap, at } from '@/components/afval/BaseMap';
import { FILL, STROKE } from '@/components/stats/charts/base';
import type { Tone } from '@/lib/stats/scale';
import type { Parkeervak, VakSoort } from '@/lib/parkeren/api';

export const SOORT_TONE: Record<Exclude<VakSoort, 'gewoon'>, Tone> = { laadpaal: 'p', 'laden-lossen': 'c', deelauto: 's', gehandicapt: 'm' };

const pad = (ring: Parkeervak['ring']) => `M${ring.map((p) => at(p).map((n) => n.toFixed(1)).join(',')).join('L')}Z`;

/** Alle parkeervakken van de buurt: de bijzondere vakken gekleurd, de gewone als dunne omtrek. */
export function ParkeerKaart({ vakken, label }: { vakken: Parkeervak[]; label: string }) {
  const gewoon = vakken.filter((v) => v.soort === 'gewoon');
  const bijzonder = vakken.filter((v) => v.soort !== 'gewoon');

  return (
    <BaseMap label={label}>
      <g aria-hidden>
        {gewoon.map((v) => (
          <path key={v.id} d={pad(v.ring)} fill="none" strokeWidth={0.5} className={STROKE.m} />
        ))}
        {bijzonder.map((v) => {
          const tone = SOORT_TONE[v.soort as keyof typeof SOORT_TONE];
          // Een vak is maar zo'n 2 bij 5 meter; met een dikke rand in dezelfde kleur blijft het zichtbaar.
          return <path key={v.id} d={pad(v.ring)} strokeWidth={1.4} strokeLinejoin="round" className={`${FILL[tone]} ${STROKE[tone]}`} />;
        })}
      </g>
    </BaseMap>
  );
}
