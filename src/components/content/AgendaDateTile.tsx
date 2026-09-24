/**
 * Kalenderblaadje-icoon voor een agenda-datum: maand boven (band in
 * primary-kleur), dag eronder groot. text-background op de band buigt vanzelf
 * mee met licht/donker (background is crème in licht, bijna zwart in donker —
 * zelfde truc als on-primary, maar dan voor een primary-vlak).
 */
export function AgendaDateTile({ date, locale }: { date: Date; locale: 'nl' | 'en' }) {
  const day = date.toLocaleDateString(locale, { day: 'numeric' });
  const month = date.toLocaleDateString(locale, { month: 'short' }).replace('.', '').toUpperCase();

  return (
    <div className="flex w-15 flex-none flex-col overflow-hidden rounded-lg border border-border" aria-hidden>
      <div className="bg-primary py-1 text-center text-[11px] font-semibold tracking-[0.08em] text-background">{month}</div>
      <div className="flex flex-1 items-center justify-center bg-card py-1.5">
        <span className="font-heading text-2xl leading-none font-semibold text-text">{day}</span>
      </div>
    </div>
  );
}
