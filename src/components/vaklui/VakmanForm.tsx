'use client';

import { useActionState } from 'react';
import { submitVakman, type VakmanFormState, type VakmanFoutReden } from './actions';
import { Honeypot } from '../activiteiten/Honeypot';
import { buttonCls, hintCls, inputCls, labelCls } from '../activiteiten/styles';

export type VakmanFormStrings = {
  naam: string;
  naamPlaceholder: string;
  vakken: string;
  vakkenHint: string;
  anderVak: string;
  anderVakPlaceholder: string;
  telefoon: string;
  website: string;
  contactHint: string;
  aanmelderNaam: string;
  aanmelderNaamHint: string;
  toelichting: string;
  toelichtingHint: string;
  akkoord: string;
  submit: string;
  submitting: string;
  success: string;
  error: Record<VakmanFoutReden, string>;
};

const initialState: VakmanFormState = { status: 'idle' };

/** Formulier op /vaklui/aanmelden (alleen met buurtpas). */
export function VakmanForm({
  locale,
  vakken,
  strings,
}: {
  locale: string;
  vakken: { id: number; naam: string }[];
  strings: VakmanFormStrings;
}) {
  const [state, formAction, pending] = useActionState(submitVakman, initialState);
  const vorige = state.status === 'error' ? state.velden : undefined;

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
        <label htmlFor="vakman-naam" className={labelCls}>
          {strings.naam}
        </label>
        <input id="vakman-naam" name="naam" required maxLength={80} defaultValue={vorige?.naam} placeholder={strings.naamPlaceholder} className={inputCls} />
      </div>

      <fieldset aria-describedby="vakman-vakken-hint">
        <legend className={labelCls}>{strings.vakken}</legend>
        <p id="vakman-vakken-hint" className={hintCls}>
          {strings.vakkenHint}
        </p>
        {vakken.length ? (
          <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
            {vakken.map((vak) => (
              <label key={vak.id} className="flex min-h-11 items-center gap-3 text-text">
                <input
                  type="checkbox"
                  name="vakken"
                  value={vak.id}
                  defaultChecked={vorige?.vakken.includes(String(vak.id))}
                  className="size-4 accent-primary"
                />
                <span>{vak.naam}</span>
              </label>
            ))}
          </div>
        ) : null}
        <div className="mt-3">
          <label htmlFor="vakman-ander-vak" className={labelCls}>
            {strings.anderVak}
          </label>
          <input
            id="vakman-ander-vak"
            name="anderVak"
            maxLength={60}
            defaultValue={vorige?.anderVak}
            placeholder={strings.anderVakPlaceholder}
            className={inputCls}
          />
        </div>
      </fieldset>

      <div>
        <p id="vakman-contact-hint" className={hintCls}>
          {strings.contactHint}
        </p>
        <div className="mt-2 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="vakman-telefoon" className={labelCls}>
              {strings.telefoon}
            </label>
            <input
              id="vakman-telefoon"
              name="telefoon"
              type="tel"
              maxLength={20}
              autoComplete="off"
              defaultValue={vorige?.telefoon}
              aria-describedby="vakman-contact-hint"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="vakman-website" className={labelCls}>
              {strings.website}
            </label>
            <input
              id="vakman-website"
              name="website"
              type="text"
              inputMode="url"
              maxLength={200}
              autoComplete="off"
              defaultValue={vorige?.website}
              placeholder="www.voorbeeld.nl"
              aria-describedby="vakman-contact-hint"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="vakman-aanmelder" className={labelCls}>
          {strings.aanmelderNaam}
        </label>
        <input
          id="vakman-aanmelder"
          name="aanmelderNaam"
          required
          maxLength={80}
          autoComplete="name"
          defaultValue={vorige?.aanmelderNaam}
          aria-describedby="vakman-aanmelder-hint"
          className={inputCls}
        />
        <p id="vakman-aanmelder-hint" className={hintCls}>
          {strings.aanmelderNaamHint}
        </p>
      </div>

      <div>
        <label htmlFor="vakman-toelichting" className={labelCls}>
          {strings.toelichting}
        </label>
        <p id="vakman-toelichting-hint" className={hintCls}>
          {strings.toelichtingHint}
        </p>
        <textarea
          id="vakman-toelichting"
          name="toelichting"
          maxLength={500}
          rows={4}
          aria-describedby="vakman-toelichting-hint"
          defaultValue={vorige?.toelichting}
          className={inputCls}
        />
      </div>

      <label className="flex items-start gap-3 text-text">
        <input type="checkbox" name="akkoord" required className="mt-1 size-4 accent-primary" />
        <span>{strings.akkoord}</span>
      </label>

      <Honeypot name="website2" />

      <button type="submit" disabled={pending} className={buttonCls}>
        {pending ? strings.submitting : strings.submit}
      </button>

      <p role="status" className="min-h-6 text-sm">
        {state.status === 'error' ? <span className="text-accent">{strings.error[state.reden]}</span> : null}
      </p>
    </form>
  );
}
