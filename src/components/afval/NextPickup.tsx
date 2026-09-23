'use client';

import { useEffect, useState } from 'react';

const DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

/** Dag (0 = zondag) en datum in Amsterdam, los van de tijdzone van de bezoeker. */
function amsterdamToday(): Date {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return new Date(`${parts}T12:00:00Z`);
}

/**
 * Eerstvolgende ophaaldag op basis van de dagen uit de Afvalwijzer ("maandag" of "maandag, donderdag").
 * Draait in de browser, zodat de datum klopt ook als de pagina uit de cache komt.
 */
export function NextPickup({ dagen, locale, label }: { dagen: string; locale: string; label: string }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const wanted = dagen
      .toLowerCase()
      .split(',')
      .map((d) => DAGEN.indexOf(d.trim()))
      .filter((d) => d >= 0);
    if (!wanted.length) return;
    const today = amsterdamToday();
    for (let i = 0; i < 8; i++) {
      const d = new Date(today.getTime() + i * 86400_000);
      if (wanted.includes(d.getUTCDay())) {
        setText(new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d));
        return;
      }
    }
  }, [dagen, locale]);
  if (!text) return null;
  return (
    <p className="m-0 text-[15px] text-text">
      {label} <strong className="font-semibold">{text}</strong>
    </p>
  );
}
