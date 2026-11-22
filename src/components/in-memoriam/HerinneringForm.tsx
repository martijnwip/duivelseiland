'use client';

import { useActionState, useEffect, useState } from 'react';
import { plaatsHerinnering, type HerinneringFormState, type HerinneringFoutReden } from './actions';
import { Honeypot } from '../activiteiten/Honeypot';
import { buttonCls, hintCls, inputCls, labelCls } from '../activiteiten/styles';
import { NAAM_MAX, REACTIE_MAX } from '@/lib/in-memoriam/constants';

export type HerinneringFormStrings = {
  tekst: string;
  naam: string;
  naamHint: string;
  uitleg: string;
  submit: string;
  submitting: string;
  success: string;
  error: Record<HerinneringFoutReden, string>;
};

const initialState: HerinneringFormState = { status: 'idle' };

/** Een herinnering delen op een In-memoriam-pagina (alleen met buurtpas; de redactie keurt goed). */
export function HerinneringForm({ locale, herdenking, strings }: { locale: string; herdenking: number; strings: HerinneringFormStrings }) {
  const [state, formAction, pending] = useActionState(plaatsHerinnering, initialState);
  const vorige = state.status === 'error' ? state.velden : undefined;
  // Moment waarop het formulier verscheen; de server weigert (stil) wat binnen een paar seconden komt.
  const [start, setStart] = useState('');
  useEffect(() => setStart(String(Date.now())), []);

  if (state.status === 'success') {
    return (
      <p role="status" className="m-0 font-medium text-primary">
        {strings.success}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="herdenking" value={herdenking} />
      <input type="hidden" name="start" value={start} />

      <div>
        <label htmlFor="herinnering-tekst" className={labelCls}>
          {strings.tekst}
        </label>
        <textarea
          id="herinnering-tekst"
          name="tekst"
          required
          rows={6}
          maxLength={REACTIE_MAX}
          defaultValue={vorige?.tekst}
          aria-describedby="herinnering-uitleg"
          className={`${inputCls} resize-y leading-[1.5]`}
        />
        <p id="herinnering-uitleg" className={hintCls}>
          {strings.uitleg}
        </p>
      </div>

      <div>
        <label htmlFor="herinnering-naam" className={labelCls}>
          {strings.naam}
        </label>
        <input
          id="herinnering-naam"
          name="naam"
          maxLength={NAAM_MAX}
          autoComplete="name"
          defaultValue={vorige?.naam}
          aria-describedby="herinnering-naam-hint"
          className={inputCls}
        />
        <p id="herinnering-naam-hint" className={hintCls}>
          {strings.naamHint}
        </p>
      </div>

      <Honeypot name="website2" />

      <button type="submit" disabled={pending} className={buttonCls}>
        {pending ? strings.submitting : strings.submit}
      </button>

      <p role="status" className="m-0 min-h-6 text-sm">
        {state.status === 'error' ? <span className="text-accent">{strings.error[state.reden]}</span> : null}
      </p>
    </form>
  );
}
