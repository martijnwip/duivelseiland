'use client';

import { useActionState, useState } from 'react';
import { submitBuurtborrel, type BuurtborrelFormState } from './actions';

type Strings = {
  legend: string;
  aanmelden: string;
  afmelden: string;
  emailLabel: string;
  emailPlaceholder: string;
  berichtLabel: string;
  berichtHint: string;
  submitAanmelden: string;
  submitAfmelden: string;
  submitting: string;
  successAanmelden: string;
  successAfmelden: string;
  error: string;
};

const initialState: BuurtborrelFormState = { status: 'idle' };

const optionCls =
  'flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-md px-4 text-sm font-medium text-muted transition-colors has-[:checked]:bg-card has-[:checked]:text-text has-[:checked]:shadow-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary';
const inputCls = 'mt-1 w-full rounded-lg border border-input-border bg-card px-3 py-2 text-text focus:border-primary focus:outline-none';

export function BuurtborrelForm({ strings }: { strings: Strings }) {
  const [mode, setMode] = useState<'aanmelden' | 'afmelden'>('aanmelden');
  const [state, formAction, pending] = useActionState(submitBuurtborrel, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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

      <div>
        <label htmlFor="buurtborrel-email" className="block text-sm font-medium text-text">
          {strings.emailLabel}
        </label>
        <input
          id="buurtborrel-email"
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

      {mode === 'aanmelden' ? (
        <div>
          <label htmlFor="buurtborrel-bericht" className="block text-sm font-medium text-text">
            {strings.berichtLabel}
          </label>
          <p id="buurtborrel-bericht-hint" className="mt-0.5 text-sm text-muted">
            {strings.berichtHint}
          </p>
          <textarea
            id="buurtborrel-bericht"
            name="bericht"
            rows={3}
            maxLength={1000}
            aria-describedby="buurtborrel-bericht-hint"
            className={inputCls}
          />
        </div>
      ) : null}

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
