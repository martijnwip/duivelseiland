'use client';

import { useActionState, useState } from 'react';
import { submitNieuwsbrief, type NieuwsbriefFormState } from './actions';

export type NieuwsbriefFormStrings = {
  legend: string;
  aanmelden: string;
  afmelden: string;
  naamLabel: string;
  naamPlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  submitAanmelden: string;
  submitAfmelden: string;
  submitting: string;
  successAanmelden: string;
  successAfmelden: string;
  error: string;
};

const initialState: NieuwsbriefFormState = { status: 'idle' };

const optionCls =
  'flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-md px-4 text-sm font-medium text-muted transition-colors has-[:checked]:bg-card has-[:checked]:text-text has-[:checked]:shadow-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary';
const inputCls = 'mt-1 w-full rounded-lg border border-input-border bg-card px-3 py-2 text-text focus:border-primary focus:outline-none';

/** Aanmelden of een afmeldlink aanvragen op /nieuwsbrief. Beide sturen eerst een mail met een link. */
export function NieuwsbriefForm({ locale, strings }: { locale: string; strings: NieuwsbriefFormStrings }) {
  const [mode, setMode] = useState<'aanmelden' | 'afmelden'>('aanmelden');
  const [state, formAction, pending] = useActionState(submitNieuwsbrief, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <fieldset>
        <legend className="sr-only">{strings.legend}</legend>
        <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
          {(['aanmelden', 'afmelden'] as const).map((value) => (
            <label key={value} className={optionCls}>
              <input
                type="radio"
                name="mode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
                className="sr-only"
              />
              {strings[value]}
            </label>
          ))}
        </div>
      </fieldset>

      {mode === 'aanmelden' ? (
        <div>
          <label htmlFor="nieuwsbrief-naam" className="block text-sm font-medium text-text">
            {strings.naamLabel}
          </label>
          <input
            id="nieuwsbrief-naam"
            name="naam"
            type="text"
            maxLength={200}
            autoComplete="name"
            defaultValue={state.status === 'error' ? state.naam : undefined}
            placeholder={strings.naamPlaceholder}
            className={inputCls}
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="nieuwsbrief-email" className="block text-sm font-medium text-text">
          {strings.emailLabel}
        </label>
        <input
          id="nieuwsbrief-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          defaultValue={state.status === 'error' ? state.email : undefined}
          placeholder={strings.emailPlaceholder}
          className={inputCls}
        />
      </div>

      {/* Honeypot: onzichtbaar voor mensen, bots vullen het in. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-primary px-5 py-2 font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
      >
        {pending ? strings.submitting : mode === 'aanmelden' ? strings.submitAanmelden : strings.submitAfmelden}
      </button>

      <p role="status" className="min-h-6 text-sm">
        {state.status === 'success' ? (
          <span className="font-medium text-primary">
            {state.mode === 'aanmelden' ? strings.successAanmelden : strings.successAfmelden}
          </span>
        ) : state.status === 'error' ? (
          <span className="text-accent">{strings.error}</span>
        ) : null}
      </p>
    </form>
  );
}
