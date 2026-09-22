/**
 * Velden van de "Rijke pagina-indeling" op een Agenda-item (zie
 * src/collections/Agenda.ts: intro/schedule/ctaLabel/ctaUrl). Lokaal
 * getypeerd — zelfde reden als AgendaRecurrenceFields in nextOccurrence.ts —
 * zodat code die deze velden leest compileert vóórdat `payload-types.ts`
 * opnieuw is gegenereerd (`bun run payload generate:types`). Eén bron voor
 * AgendaDetailPage, AgendaListPage en HomeDuivelseSchoonmaak, in plaats van
 * drie keer dezelfde vorm.
 */
export type AgendaScheduleStep = {
  time?: string | null;
  icon?: string | null;
  title: string;
  description?: string | null;
};

export type AgendaRichFields = {
  intro?: string | null;
  schedule?: AgendaScheduleStep[] | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};
