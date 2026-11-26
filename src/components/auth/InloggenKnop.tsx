'use client';

import { useState } from 'react';

/**
 * Gewoon formulier (GET) naar het verify-endpoint: pas deze klik gebruikt het token. Na één klik
 * staat de knop uit, zodat een dubbele klik het token niet twee keer probeert te gebruiken.
 */
export function InloggenKnop({
  action,
  velden,
  strings,
}: {
  action: string;
  velden: Record<string, string>;
  strings: { submit: string; submitting: string };
}) {
  const [bezig, setBezig] = useState(false);
  return (
    <form method="get" action={action} onSubmit={() => setBezig(true)} className="mt-6">
      {Object.entries(velden).map(([naam, waarde]) => (
        <input key={naam} type="hidden" name={naam} value={waarde} />
      ))}
      <button
        type="submit"
        disabled={bezig}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2 font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
      >
        {bezig ? strings.submitting : strings.submit}
      </button>
    </form>
  );
}
