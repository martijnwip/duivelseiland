'use client';

import { useRowLabel } from '@payloadcms/ui';

/** Toont "1896–1906 · Een eiland zonder water" in plaats van "Tijdvak 02" in de admin. */
export function TijdvakRowLabel() {
  const { data, rowNumber } = useRowLabel<{ band?: string; titel?: string }>();
  const label = [data?.band, data?.titel].filter(Boolean).join(' · ');
  return <span>{label || `Tijdvak ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</span>;
}
