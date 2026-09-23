import { ICONS } from './icons';

type Labels = { zondag: string; maandag: string; teVroeg: string; buiten: string; teLaat: string; label: string };

const H = 170;
const START = 18; // zondag 18:00
const END = 33; // maandag 09:00
const BAR_Y = 70;
const BAR_H = 34;

/** Nested icoon op een vaste plek in de tijdlijn. */
function At({ name, x, y, size = 30 }: { name: 'maan' | 'zon'; x: number; y: number; size?: number }) {
  return (
    <svg x={x - size / 2} y={y} width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="text-text">
      {ICONS[name]}
    </svg>
  );
}

/**
 * Tijdlijn zondag 18:00 → maandag 09:00 met het venster 21:00–07:00 waarin grof vuil buiten mag.
 * Mobiel krijgt een smallere tekening (minder uren), zodat de tekst leesbaar blijft.
 */
export function Tijdvak({ labels }: { labels: Labels }) {
  return (
    <>
      <div className="hidden sm:block">
        <Lijn labels={labels} W={640} hours={[18, 21, 24, 27, 31, 33]} />
      </div>
      <div className="sm:hidden">
        <Lijn labels={labels} W={380} hours={[21, 24, 31]} />
      </div>
    </>
  );
}

function Lijn({ labels, W, hours }: { labels: Labels; W: number; hours: number[] }) {
  const L = 4;
  const R = W - 4;
  const X = (h: number) => L + ((h - START) * (R - L)) / (END - START);
  const hh = (h: number) => `${String(h % 24).padStart(2, '0')}:00`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={labels.label} className="block h-auto w-full">
      <title>{labels.label}</title>
      <defs>
        <pattern id={`tijdvak-arcering-${W}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" className="fill-card" />
          <path d="M0 0v8" strokeWidth={3} className="stroke-cta-soft" />
        </pattern>
      </defs>

      {/* Dagen */}
      <text x={(X(START) + X(24)) / 2} y={16} textAnchor="middle" className="fill-muted font-heading text-[13px] font-semibold tracking-[0.08em] uppercase">
        {labels.zondag}
      </text>
      <text x={(X(24) + X(END)) / 2} y={16} textAnchor="middle" className="fill-muted font-heading text-[13px] font-semibold tracking-[0.08em] uppercase">
        {labels.maandag}
      </text>
      <path d={`M${X(24)} 6V${BAR_Y + BAR_H + 10}`} strokeDasharray="3 4" strokeWidth={1.5} className="stroke-input-border" />

      {/* Maan om 21:00, zon om 07:00 */}
      <At name="maan" x={X(21)} y={30} />
      <At name="zon" x={X(31)} y={30} />

      {/* Balk */}
      <rect x={X(START)} y={BAR_Y} width={X(21) - X(START)} height={BAR_H} rx={6} fill={`url(#tijdvak-arcering-${W})`} />
      <rect x={X(31)} y={BAR_Y} width={X(END) - X(31)} height={BAR_H} rx={6} fill={`url(#tijdvak-arcering-${W})`} />
      <rect x={X(21)} y={BAR_Y} width={X(31) - X(21)} height={BAR_H} rx={6} className="fill-primary" />
      <text x={(X(21) + X(31)) / 2} y={BAR_Y + BAR_H / 2 + 6} textAnchor="middle" className="fill-background font-heading text-[17px] font-semibold">
        ✓ {labels.buiten}
      </text>
      <text x={(X(START) + X(21)) / 2} y={BAR_Y + BAR_H / 2 + 5} textAnchor="middle" className="fill-text font-heading text-[13px] font-semibold">
        ✗ {labels.teVroeg}
      </text>
      <text x={(X(31) + X(END)) / 2} y={BAR_Y + BAR_H / 2 + 5} textAnchor="middle" className="fill-text font-heading text-[13px] font-semibold">
        ✗ {labels.teLaat}
      </text>

      {/* Uren */}
      {hours.map((h) => {
        const key = h === 21 || h === 31;
        return (
          <g key={h}>
            <path d={`M${X(h)} ${BAR_Y + BAR_H + 4}v8`} strokeWidth={key ? 2.5 : 1.5} className={key ? 'stroke-text' : 'stroke-input-border'} />
            <text
              x={X(h)}
              y={BAR_Y + BAR_H + 32}
              textAnchor={h === START ? 'start' : h === END ? 'end' : 'middle'}
              className={key ? 'fill-text font-heading text-[20px] font-bold' : 'fill-muted font-heading text-[13px]'}
            >
              {hh(h)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
