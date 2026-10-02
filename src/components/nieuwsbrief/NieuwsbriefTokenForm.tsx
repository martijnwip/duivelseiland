'use client';

import { useActionState } from 'react';
import { afmeldenNieuwsbrief, bevestigNieuwsbrief, type NieuwsbriefTokenState } from './actions';

type Strings = { submit: string; submitting: string; success: string; invalid: string };

const initialState: NieuwsbriefTokenState = { status: 'idle' };

/**
 * Knop op de pagina achter de link in de mail. De wijziging gebeurt pas bij de klik (POST), niet bij het
 * openen van de link: mailscanners die links voorladen bevestigen of melden zo niemand per ongeluk af.
 */
export function NieuwsbriefTokenForm({
  kind,
  token,
  strings,
}: {
  kind: 'bevestigen' | 'afmelden';
  token: string;
  strings: Strings;
}) {
  const [state, formAction, pending] = useActionState(
    kind === 'bevestigen' ? bevestigNieuwsbrief : afmeldenNieuwsbrief,
    initialState,
  );

  if (state.status === 'success') return <p role="status" className="mt-6 font-medium text-primary">{strings.success}</p>;
  if (state.status === 'invalid') return <p role="status" className="mt-6 text-accent">{strings.invalid}</p>;

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="token" value={token} />
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
