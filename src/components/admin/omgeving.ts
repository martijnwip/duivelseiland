'use client';

import { useEffect, useState } from 'react';

export type Omgeving = 'lokaal' | 'preview' | 'productie';

/**
 * Waar draait de admin? Lokaal herkend aan de hostnaam, preview aan NEXT_PUBLIC_VERCEL_ENV (zet Vercel zelf).
 * Alleen voor de weergave; het echte slot op bulkmail zit op de server (bulkmailToegestaan in src/lib/mail.ts).
 * Pas na het laden bepaald, zodat server- en browserweergave gelijk beginnen.
 */
export function useOmgeving(): Omgeving | null {
  const [omgeving, setOmgeving] = useState<Omgeving | null>(null);
  useEffect(() => {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) setOmgeving('lokaal');
    else if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') setOmgeving('preview');
    else setOmgeving('productie');
  }, []);
  return omgeving;
}
