'use client';

import { useActionState } from 'react';
import { submitVakmens, type VakmensFormState, type VakmensFoutReden } from './actions';
import { Honeypot } from '../activiteiten/Honeypot';
import { buttonCls, hintCls, inputCls, labelCls } from '../activiteiten/styles';

export type VakmensFormStrings = {
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
  error: Record<VakmensFoutReden, string>;
};

const initialState: VakmensFormState = { status: 'idle' };

/** Formulier op /vakmensen/aanmelden (alleen met buurtpas). */
export function VakmensForm({
  locale,
  vakken,
  strings,
}: {
  locale: string;
  vakken: { id: number; naam: string }[];
  strings: VakmensFormStrings;
}) {
  const [state, formAction, pending] = useActionState(submitVakmens, initialState);
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
        <label htmlFor="vakmens-naam" className={labelCls}>
          {strings.naam}
        </label>
        <input id="vakmens-naam" name="naam" required maxLength={80} defaultValue={vorige?.naam} placeholder={strings.naamPlaceholder} className={inputCls} />
      </div>

      <fieldset aria-describedby="vakmens-vakken-hint">
        <legend className={labelCls}>{strings.vakken}</legend>
        <p id="vakmens-vakken-hint" className={hintCls}>
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
          <label htmlFor="vakmens-ander-vak" className={labelCls}>
            {strings.anderVak}
          </label>
          <input
            id="vakmens-ander-vak"
            name="anderVak"
            maxLength={60}
            defaultValue={vorige?.anderVak}
            placeholder={strings.anderVakPlaceholder}
            className={inputCls}
          />
        </div>
      </fieldset>

      <div>
        <p id="vakmens-contact-hint" className={hintCls}>
          {strings.contactHint}
        </p>
        <div className="mt-2 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="vakmens-telefoon" className={labelCls}>
              {strings.telefoon}
            </label>
            <input
              id="vakmens-telefoon"
              name="telefoon"
              type="tel"
              maxLength={20}
              autoComplete="off"
              defaultValue={vorige?.telefoon}
              aria-describedby="vakmens-contact-hint"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="vakmens-website" className={labelCls}>
              {strings.website}
            </label>
            <input
              id="vakmens-website"
              name="website"
              type="text"
              inputMode="url"
              maxLength={200}
              autoComplete="off"
              defaultValue={vorige?.website}
              placeholder="www.voorbeeld.nl"
              aria-describedby="vakmens-contact-hint"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="vakmens-aanmelder" className={labelCls}>
          {strings.aanmelderNaam}
        </label>
        <input
          id="vakmens-aanmelder"
          name="aanmelderNaam"
          required
          maxLength={80}
          autoComplete="name"
          defaultValue={vorige?.aanmelderNaam}
          aria-describedby="vakmens-aanmelder-hint"
          className={inputCls}
        />
        <p id="vakmens-aanmelder-hint" className={hintCls}>
          {strings.aanmelderNaamHint}
        </p>
      </div>

      <div>
        <label htmlFor="vakmens-toelichting" className={labelCls}>
          {strings.toelichting}
        </label>
        <p id="vakmens-toelichting-hint" className={hintCls}>
          {strings.toelichtingHint}
        </p>
        <textarea
          id="vakmens-toelichting"
          name="toelichting"
          maxLength={500}
          rows={4}
          aria-describedby="vakmens-toelichting-hint"
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
