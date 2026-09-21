import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

// Op de server (en tijdens hydration) is de voorkeur onbekend: uitgaan van "geen voorkeur".
function getServerSnapshot(): boolean {
  return false;
}

/** Volgt de OS-instelling "beweging verminderen", ook als die tijdens het bezoek verandert. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
