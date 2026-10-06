'use client';

import { useActionState, useState } from 'react';
import { submitIdee, type IdeeFormState } from './actions';
import { Honeypot } from './Honeypot';
import { buttonCls, hintCls, inputCls, labelCls, optionCls } from './styles';

export type IdeeFormStrings = {
  titel: string;
  titelPlaceholder: string;
  omschrijving: string;
  omschrijvingHint: string;
  soort: string;
  eenmalig: string;
  terugkerend: string;
  soortToelichting: string;
  soortToelichtingPlaceholder: string;
  datum: string;
  datumHint: string;
  afbeelding: string;
  afbeeldingHint: string;
  afbeeldingTeGroot: string;
  naam: string;
  naamHint: string;
  email: string;
  emailHint: string;
  akkoord: string;
  submit: string;
  submitting: string;
  success: string;
  error: Record<'velden' | 'afbeelding' | 'akkoord' | 'server', string>;
};

const MAX_BYTES = 4 * 1024 * 1024;
const initialState: IdeeFormState = { status: 'idle' };

/** Formulier op /activiteiten/aanmelden. */
export function IdeeForm({ locale, strings }: { locale: string; strings: IdeeFormStrings }) {
  const [state, formAction, pending] = useActionState(submitIdee, initialState);
  const vorige = state.status === 'error' ? state.velden : undefined;
  const [soort, setSoort] = useState(vorige?.soort === 'terugkerend' ? 'terugkerend' : 'eenmalig');
  const [teGroot, setTeGroot] = useState(false);

  if (state.status === 'success') {
    return (
      <p role="status" className="font-medium text-primary">
        {strings.success}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label htmlFor="idee-titel" className={labelCls}>
          {strings.titel}
        </label>
        <input id="idee-titel" name="titel" required maxLength={80} defaultValue={vorige?.titel} placeholder={strings.titelPlaceholder} className={inputCls} />
      </div>

      <div>
        <label htmlFor="idee-omschrijving" className={labelCls}>
          {strings.omschrijving}
        </label>
        <p id="idee-omschrijving-hint" className={hintCls}>
          {strings.omschrijvingHint}
        </p>
        <textarea
          id="idee-omschrijving"
          name="omschrijving"
          required
          maxLength={2000}
          rows={6}
          aria-describedby="idee-omschrijving-hint"
          defaultValue={vorige?.omschrijving}
          className={inputCls}
        />
      </div>

      <fieldset>
        <legend className={labelCls}>{strings.soort}</legend>
        <div className="mt-1 flex gap-1 rounded-lg border border-border bg-background p-1">
          {(['eenmalig', 'terugkerend'] as const).map((value) => (
            <label key={value} className={optionCls}>
              <input type="radio" name="soort" value={value} checked={soort === value} onChange={() => setSoort(value)} className="sr-only" />
              {strings[value]}
            </label>
          ))}
        </div>
      </fieldset>

      {soort === 'terugkerend' ? (
        <div>
          <label htmlFor="idee-toelichting" className={labelCls}>
            {strings.soortToelichting}
          </label>
          <input
            id="idee-toelichting"
            name="soortToelichting"
            maxLength={120}
            defaultValue={vorige?.soortToelichting}
            placeholder={strings.soortToelichtingPlaceholder}
            className={inputCls}
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="idee-datum" className={labelCls}>
          {strings.datum}
        </label>
        <p id="idee-datum-hint" className={hintCls}>
          {strings.datumHint}
        </p>
        <input
          id="idee-datum"
          name="datum"
          type="date"
          aria-describedby="idee-datum-hint"
          defaultValue={vorige?.datum}
          className={`${inputCls} max-w-xs`}
        />
      </div>

      <div>
        <label htmlFor="idee-afbeelding" className={labelCls}>
          {strings.afbeelding}
        </label>
        <p id="idee-afbeelding-hint" className={hintCls}>
          {strings.afbeeldingHint}
        </p>
        <input
          id="idee-afbeelding"
          name="afbeelding"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-describedby="idee-afbeelding-hint"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            const groot = Boolean(file && file.size > MAX_BYTES);
            setTeGroot(groot);
            if (groot) e.currentTarget.value = '';
          }}
          className="mt-2 block w-full text-sm text-text file:mr-3 file:rounded-lg file:border file:border-border file:bg-card file:px-3 file:py-2 file:text-text"
        />
        {teGroot ? <p className="mt-1 text-sm text-accent">{strings.afbeeldingTeGroot}</p> : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="idee-naam" className={labelCls}>
            {strings.naam}
          </label>
          <input id="idee-naam" name="naam" required maxLength={80} autoComplete="name" defaultValue={vorige?.naam} aria-describedby="idee-naam-hint" className={inputCls} />
          <p id="idee-naam-hint" className={hintCls}>
            {strings.naamHint}
          </p>
        </div>
        <div>
          <label htmlFor="idee-email" className={labelCls}>
            {strings.email}
          </label>
          <input
            id="idee-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            defaultValue={vorige?.email}
            aria-describedby="idee-email-hint"
            className={inputCls}
          />
          <p id="idee-email-hint" className={hintCls}>
            {strings.emailHint}
          </p>
        </div>
      </div>

      <label className="flex items-start gap-3 text-text">
        <input type="checkbox" name="akkoord" required className="mt-1 size-4 accent-primary" />
        <span>{strings.akkoord}</span>
      </label>

      <Honeypot />

      <button type="submit" disabled={pending} className={buttonCls}>
        {pending ? strings.submitting : strings.submit}
      </button>

      <p role="status" className="min-h-6 text-sm">
        {state.status === 'error' ? <span className="text-accent">{strings.error[state.reden]}</span> : null}
      </p>
    </form>
  );
}
