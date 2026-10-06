'use client';

import { useActionState } from 'react';
import { afmeldenInschrijving, bevestigIdee, bevestigInschrijving, trekIdeeIn, type TokenState } from './actions';
import { buttonCls } from './styles';

export type TokenKind = 'idee-bevestigen' | 'idee-intrekken' | 'inschrijving-bevestigen' | 'inschrijving-afmelden';

const ACTIONS = {
  'idee-bevestigen': bevestigIdee,
  'idee-intrekken': trekIdeeIn,
  'inschrijving-bevestigen': bevestigInschrijving,
  'inschrijving-afmelden': afmeldenInschrijving,
} as const;

type Strings = { submit: string; submitting: string; success: string; invalid: string; gesloten: string };

const initialState: TokenState = { status: 'idle' };

/**
 * Knop op de pagina achter een link uit een mail. De wijziging gebeurt pas bij de klik (POST), zodat
 * mailscanners die links voorladen niets per ongeluk bevestigen, intrekken of afmelden.
 */
export function TokenForm({ kind, token, strings }: { kind: TokenKind; token: string; strings: Strings }) {
  const [state, formAction, pending] = useActionState(ACTIONS[kind], initialState);

  if (state.status === 'success') return <p role="status" className="mt-6 font-medium text-primary">{strings.success}</p>;
  if (state.status === 'invalid') return <p role="status" className="mt-6 text-accent">{strings.invalid}</p>;
  if (state.status === 'gesloten') return <p role="status" className="mt-6 text-accent">{strings.gesloten}</p>;

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="token" value={token} />
      <button type="submit" disabled={pending} className={buttonCls}>
        {pending ? strings.submitting : strings.submit}
      </button>
    </form>
  );
}
