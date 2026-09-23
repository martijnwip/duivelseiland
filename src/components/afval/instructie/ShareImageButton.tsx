'use client';

import { useState } from 'react';

/**
 * Deelt de instructiekaart als afbeelding. Op telefoons (Web Share API met bestanden) opent het
 * deelmenu, zodat je hem direct in WhatsApp kunt zetten; elders wordt de PNG gedownload.
 */
export function ShareImageButton({ src, fileName, title, text, label }: { src: string; fileName: string; title: string; text: string; label: string }) {
  const [busy, setBusy] = useState(false);

  function download() {
    const a = document.createElement('a');
    a.href = src;
    a.download = fileName;
    a.click();
  }

  async function onClick() {
    setBusy(true);
    try {
      const blob = await (await fetch(src)).blob();
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title, text });
      } else {
        download();
      }
    } catch (e) {
      // Annuleren van het deelmenu is geen fout; bij andere fouten valt hij terug op downloaden.
      if (!(e instanceof DOMException && e.name === 'AbortError')) download();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border-0 bg-primary px-4 text-[15px] font-semibold text-background hover:bg-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 print:hidden"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </svg>
      {label}
    </button>
  );
}
