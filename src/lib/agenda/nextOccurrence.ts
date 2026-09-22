/**
 * Helpers for computing the "effective" date of an Agenda item, i.e. the date
 * used for sorting and display. One-off items just use their `date` field;
 * recurring items (currently only "elke eerste zondag van de maand") have
 * their next occurrence computed on the fly, so an editor only has to set
 * this up once.
 */

/** Strips the time portion so two dates can be compared by day only. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The first Sunday of the given month (monthIndex is 0-based, like Date). */
function getFirstSundayOfMonth(year: number, monthIndex: number): Date {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const offsetToSunday = (7 - firstOfMonth.getDay()) % 7;
  return new Date(year, monthIndex, 1 + offsetToSunday);
}

/**
 * The next first-Sunday-of-the-month on or after `from` (compared by day,
 * not time of day) — so the event keeps showing on the day itself, and only
 * rolls over to next month the day after.
 */
export function getNextFirstSundayOfMonth(from: Date): Date {
  const fromDay = startOfDay(from);
  const thisMonth = getFirstSundayOfMonth(fromDay.getFullYear(), fromDay.getMonth());
  if (thisMonth >= fromDay) {
    return thisMonth;
  }
  return getFirstSundayOfMonth(fromDay.getFullYear(), fromDay.getMonth() + 1);
}

/** Merges a "HH:mm" time string into a date, if it parses; otherwise returns the date unchanged. */
function withTime(date: Date, time?: string | null): Date {
  if (!time) return date;
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return date;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return date;
  const withTimeApplied = new Date(date);
  withTimeApplied.setHours(hours, minutes, 0, 0);
  return withTimeApplied;
}

export type AgendaRecurrenceFields = {
  recurrence?: ('none' | 'monthly-first-sunday') | string | null;
  recurrenceTime?: string | null;
  date?: string | null;
};

/**
 * The date to sort/display an agenda item by: the computed next occurrence
 * for recurring items, or the plain `date` field for one-off items. Returns
 * `null` when there's nothing to go on (no recurrence and no date set).
 */
export function getAgendaEffectiveDate(doc: AgendaRecurrenceFields, now: Date = new Date()): Date | null {
  if (doc.recurrence === 'monthly-first-sunday') {
    return withTime(getNextFirstSundayOfMonth(now), doc.recurrenceTime);
  }
  return doc.date ? new Date(doc.date) : null;
}

export function isRecurring(doc: AgendaRecurrenceFields): boolean {
  return doc.recurrence === 'monthly-first-sunday';
}
