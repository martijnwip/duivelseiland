import type { CSSProperties } from 'react';
import { ADVIES_LAWAAI_VANAF, BOUW } from '@/lib/geluid/constants';

export type WeekBalkLabels = { dagen: string[]; mag: string; advies: string; niet: string; summary: string };

/** Gearceerd = mag niet; dezelfde arcering als de tijdlijn op de afvalkaart. */
const arcering: CSSProperties = {
  backgroundImage: 'repeating-linear-gradient(45deg, var(--color-accent-soft) 0 3px, var(--color-card) 3px 8px)',
};

const pct = (h: number) => `${(h / 24) * 100}%`;
const TICKS = [0, BOUW.van, 12, BOUW.tot, 24];

/**
 * Week van maandag tot en met zondag, elk een balk van 0 tot 24 uur: groen waar bouwen mag,
 * licht groen waar het mag maar lawaaiig werk liever nog niet, gearceerd waar het niet mag.
 * HTML in plaats van SVG, zodat de tekst op een telefoon niet mee krimpt. De tekening is
 * aria-hidden; `summary` vertelt hetzelfde aan schermlezers. `groot` is voor de deelafbeelding.
 */
export function WeekBalk({ labels, groot = false }: { labels: WeekBalkLabels; groot?: boolean }) {
  const rij = groot ? 'h-[44px]' : 'h-6 print:h-5';
  const tekst = groot ? 'text-[28px]' : 'text-[13px] print:text-[11px]';
  const label = groot ? 'w-[72px]' : 'w-9';
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className="sr-only">{labels.summary}</p>
      <div aria-hidden className={`flex flex-col ${groot ? 'gap-2.5' : 'gap-1.5'}`}>
        {labels.dagen.map((dag, i) => {
          const zondag = i === 6;
          return (
            <div key={dag} className="flex items-center gap-2">
              <span className={`${label} flex-none font-heading font-semibold text-text ${tekst}`}>{dag}</span>
              <div className={`relative flex-1 overflow-hidden rounded-md border border-input-border ${rij}`} style={arcering}>
                {!zondag && (
                  <>
                    <span className="absolute inset-y-0 bg-primary-soft" style={{ left: pct(BOUW.van), width: pct(ADVIES_LAWAAI_VANAF - BOUW.van) }} />
                    <span className="absolute inset-y-0 bg-primary" style={{ left: pct(ADVIES_LAWAAI_VANAF), width: pct(BOUW.tot - ADVIES_LAWAAI_VANAF) }} />
                  </>
                )}
              </div>
            </div>
          );
        })}
        {/* Uren onder de balken, uitgelijnd met de balk (niet met de daglabels) */}
        <div className="flex gap-2">
          <span className={`${label} flex-none`} />
          <div className={`relative flex-1 ${groot ? 'h-9' : 'h-5'}`}>
            {TICKS.map((h) => (
              <span
                key={h}
                className={`absolute top-0 font-heading tabular-nums ${tekst} ${h === BOUW.van || h === BOUW.tot ? 'font-bold text-text' : 'text-muted'}`}
                style={{ left: pct(h), transform: h === 0 ? undefined : h === 24 ? 'translateX(-100%)' : 'translateX(-50%)' }}
              >
                {String(h).padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>
      </div>
      <ul aria-hidden className={`m-0 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 ${tekst}`}>
        <li className="flex items-center gap-1.5 text-text">
          <span className={`flex-none rounded-sm bg-primary ${groot ? 'size-7' : 'size-3.5'}`} />
          {labels.mag}
        </li>
        <li className="flex items-center gap-1.5 text-text">
          <span className={`flex-none rounded-sm bg-primary-soft ${groot ? 'size-7' : 'size-3.5'}`} />
          {labels.advies}
        </li>
        <li className="flex items-center gap-1.5 text-text">
          <span className={`flex-none rounded-sm border border-input-border ${groot ? 'size-7' : 'size-3.5'}`} style={arcering} />
          {labels.niet}
        </li>
      </ul>
    </div>
  );
}
