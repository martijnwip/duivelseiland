'use client';

import { useActionState, useState } from 'react';
import { submitInschrijving, type InschrijfFormState } from './actions';
import { Honeypot } from './Honeypot';
import { buttonCls, inputCls, labelCls, optionCls } from './styles';

export type InschrijfFormStrings = {
  legend: string;
  aanmelden: string;
  afmelden: string;
  voornaam: string;
  email: string;
  emailPlaceholder: string;
  opmerking: string;
  opmerkingPlaceholder: string;
  submitAanmelden: string;
  submitAfmelden: string;
  submitting: string;
  successAanmelden: string;
  successAfmelden: string;
  gesloten: string;
  error: string;
};

const initialState: InschrijfFormState = { status: 'idle' };

/**
 * Aanmelden voor een activiteit, of een afmeldlink aanvragen. `alleenAfmelden` als de inschrijving
 * gesloten is: afmelden moet dan nog wel kunnen.
 */
export function InschrijfForm({
  activiteitId,
  locale,
  alleenAfmelden,
  strings,
}: {
  activiteitId: number;
  locale: string;
  alleenAfmelden?: boolean;
  strings: InschrijfFormStrings;
}) {
  const [mode, setMode] = useState<'aanmelden' | 'afmelden'>(alleenAfmelden ? 'afmelden' : 'aanmelden');
  const [state, formAction, pending] = useActionState(submitInschrijving, initialState);
  const vorige = state.status === 'error' ? state.velden : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="activiteit" value={activiteitId} />
      {alleenAfmelden ? (
        <input type="hidden" name="mode" value="afmelden" />
      ) : (
        <fieldset>
          <legend className="sr-only">{strings.legend}</legend>
          <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
            {(['aanmelden', 'afmelden'] as const).map((value) => (
              <label key={value} className={optionCls}>
                <input type="radio" name="mode" value={value} checked={mode === value} onChange={() => setMode(value)} className="sr-only" />
                {strings[value]}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {mode === 'aanmelden' ? (
        <div>
          <label htmlFor="inschrijving-voornaam" className={labelCls}>
            {strings.voornaam}
          </label>
          <input
            id="inschrijving-voornaam"
            name="voornaam"
            required
            maxLength={60}
            autoComplete="given-name"
            defaultValue={vorige?.voornaam}
            className={inputCls}
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="inschrijving-email" className={labelCls}>
          {strings.email}
        </label>
        <input
          id="inschrijving-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          defaultValue={vorige?.email}
          placeholder={strings.emailPlaceholder}
          className={inputCls}
        />
      </div>

      {mode === 'aanmelden' ? (
        <div>
          <label htmlFor="inschrijving-opmerking" className={labelCls}>
            {strings.opmerking}
          </label>
          <textarea
            id="inschrijving-opmerking"
            name="opmerking"
            maxLength={500}
            rows={3}
            defaultValue={vorige?.opmerking}
            placeholder={strings.opmerkingPlaceholder}
            className={inputCls}
          />
        </div>
      ) : null}

      <Honeypot />

      <button type="submit" disabled={pending} className={buttonCls}>
        {pending ? strings.submitting : mode === 'aanmelden' ? strings.submitAanmelden : strings.submitAfmelden}
      </button>

      <p role="status" className="min-h-6 text-sm">
        {state.status === 'success' ? (
          <span className="font-medium text-primary">{state.mode === 'aanmelden' ? strings.successAanmelden : strings.successAfmelden}</span>
        ) : state.status === 'gesloten' ? (
          <span className="text-accent">{strings.gesloten}</span>
        ) : state.status === 'error' ? (
          <span className="text-accent">{strings.error}</span>
        ) : null}
      </p>
    </form>
  );
}
