'use client';

import { useActionState, useState } from 'react';
import { submitWhatsapp, type WhatsappFormState, type WhatsappFoutReden } from './actions';
import { Honeypot } from '../activiteiten/Honeypot';
import { buttonCls, hintCls, inputCls, labelCls } from '../activiteiten/styles';

export type WhatsappFormStrings = {
  naam: string;
  telefoon: string;
  telefoonHint: string;
  groepen: string;
  groepenHint: string;
  akkoord: string;
  submit: string;
  submitting: string;
  success: string;
  error: Record<WhatsappFoutReden, string>;
};

const initialState: WhatsappFormState = { status: 'idle' };

/** Formulier op /whatsapp (alleen met buurtpas). */
export function WhatsappForm({
  locale,
  groepen,
  strings,
}: {
  locale: string;
  groepen: { value: string; naam: string; uitleg: string }[];
  strings: WhatsappFormStrings;
}) {
  const [state, formAction, pending] = useActionState(submitWhatsapp, initialState);
  const vorige = state.status === 'error' ? state.velden : undefined;
  // Het nummer is alleen nodig voor de Schoonmaak; voor de Buren-app gaat de uitnodiging per mail.
  // Na een actie zet React de vinkjes terug op `vorige`; het telefoonveld volgt dan mee.
  const [metSchoonmaak, setSchoonmaak] = useState(false);
  const [gezienState, setGezienState] = useState(state);
  if (state !== gezienState) {
    setGezienState(state);
    setSchoonmaak(Boolean(vorige?.groepen.includes('schoonmaak')));
  }

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

      <fieldset aria-describedby="whatsapp-groepen-hint">
        <legend className={labelCls}>{strings.groepen}</legend>
        <p id="whatsapp-groepen-hint" className={hintCls}>
          {strings.groepenHint}
        </p>
        <div className="mt-2 flex flex-col gap-1">
          {groepen.map((g) => (
            <label key={g.value} className="flex min-h-11 items-start gap-3 py-1.5 text-text">
              <input
                type="checkbox"
                name="groepen"
                value={g.value}
                defaultChecked={vorige ? vorige.groepen.includes(g.value) : g.value === 'buurt'}
                onChange={g.value === 'schoonmaak' ? (e) => setSchoonmaak(e.currentTarget.checked) : undefined}
                className="mt-1 size-4 accent-primary"
              />
              <span>
                <span className="block font-medium">{g.naam}</span>
                <span className="block text-sm text-muted">{g.uitleg}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="whatsapp-naam" className={labelCls}>
          {strings.naam}
        </label>
        <input id="whatsapp-naam" name="naam" required maxLength={80} autoComplete="name" defaultValue={vorige?.naam} className={inputCls} />
      </div>

      <div hidden={!metSchoonmaak}>
        <label htmlFor="whatsapp-telefoon" className={labelCls}>
          {strings.telefoon}
        </label>
        <input
          id="whatsapp-telefoon"
          name="telefoon"
          type="tel"
          required={metSchoonmaak}
          disabled={!metSchoonmaak}
          maxLength={20}
          autoComplete="tel"
          defaultValue={vorige?.telefoon}
          aria-describedby="whatsapp-telefoon-hint"
          className={inputCls}
        />
        <p id="whatsapp-telefoon-hint" className={hintCls}>
          {strings.telefoonHint}
        </p>
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
