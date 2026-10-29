'use client';

import { useState } from 'react';

/**
 * Deelt de link naar één vakman. Op telefoons opent het deelmenu (WhatsApp enzovoort);
 * elders wordt de link gekopieerd, met een korte melding.
 */
export function DeelLink({ pad, titel, label, gekopieerd }: { pad: string; titel: string; label: string; gekopieerd: string }) {
  const [melding, setMelding] = useState('');

  async function onClick() {
    const url = new URL(pad, location.origin).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: titel, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMelding(gekopieerd);
      setTimeout(() => setMelding(''), 2500);
    } catch (e) {
      // Annuleren van het deelmenu is geen fout.
      if (e instanceof DOMException && e.name === 'AbortError') return;
      window.prompt(label, url);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <span role="status" className="rounded-full bg-text px-2.5 py-1 text-xs font-medium text-background empty:hidden">
        {melding}
      </span>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-muted transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary print:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      </button>
    </div>
  );
}
