'use client';

import { useActionState } from 'react';
import { bevestigBuurtpas, type BuurtpasTokenState } from './actions';

const initialState: BuurtpasTokenState = { status: 'idle' };

/**
 * Knop op de pagina achter de link in de mail. De buurtpas wordt pas bij de klik gezet: mailscanners die
 * links voorladen verbruiken het token zo niet. Gelukt: de action stuurt door naar `terug`.
 */
export function BuurtpasTokenForm({
  token,
  terug,
  strings,
}: {
  token: string;
  terug: string;
  strings: { submit: string; submitting: string; invalid: string };
}) {
  const [state, formAction, pending] = useActionState(bevestigBuurtpas, initialState);

  if (state.status === 'invalid') return <p role="status" className="mt-6 text-accent">{strings.invalid}</p>;

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="terug" value={terug} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2 font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
      >
        {pending ? strings.submitting : strings.submit}
      </button>
    </form>
  );
}
