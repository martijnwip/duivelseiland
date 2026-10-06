const TZ = 'Europe/Amsterdam';

const uurMinuut = (d: Date) =>
  d.toLocaleTimeString('nl', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TZ });

/** `JJJJ-MM-DD` uit het ideeformulier als middernacht in Amsterdam (ISO), of null als de datum ongeldig is. */
export function amsterdamMiddernacht(dag: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dag)) return null;
  const utc = new Date(`${dag}T00:00:00Z`);
  if (Number.isNaN(utc.getTime())) return null;
  // Amsterdam loopt 1 of 2 uur voor op UTC; middernacht daar is dus 23:00 of 22:00 UTC de dag ervoor.
  const [uur] = uurMinuut(utc).split(':').map(Number);
  return new Date(utc.getTime() - uur * 3600_000).toISOString();
}

/** Datum met tijd; zonder tijd als die op 00:00 staat (een datum zonder tijd uit het ideeformulier). */
export function formatDatumTijd(iso: string, locale: string) {
  const d = new Date(iso);
  const metTijd = uurMinuut(d) !== '00:00';
  return d.toLocaleString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(metTijd ? { hour: '2-digit', minute: '2-digit' } : {}),
    timeZone: TZ,
  });
}
