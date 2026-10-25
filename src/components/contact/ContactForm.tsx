'use client';

import { useActionState, useEffect, useState } from 'react';
import { submitContact, type ContactFormState, type ContactFoutReden } from './actions';
import { Honeypot } from '../activiteiten/Honeypot';
import { buttonCls, hintCls, inputCls, labelCls, optionCls } from '../activiteiten/styles';

export type ContactFormStrings = {
  soort: string;
  naam: string;
  email: string;
  emailHint: string;
  bericht: string;
  submit: string;
  submitting: string;
  success: string;
  error: Record<ContactFoutReden, string>;
};

const initialState: ContactFormState = { status: 'idle' };

/** Formulier op /contact. */
export function ContactForm({
  locale,
  soorten,
  strings,
}: {
  locale: string;
  soorten: { value: string; label: string }[];
  strings: ContactFormStrings;
}) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const vorige = state.status === 'error' ? state.velden : undefined;
  // Moment waarop het formulier verscheen; de server weigert (stil) wat binnen een paar seconden komt.
  const [start, setStart] = useState('');
  useEffect(() => setStart(String(Date.now())), []);

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
      <input type="hidden" name="start" value={start} />

      <fieldset>
        <legend className={labelCls}>{strings.soort}</legend>
        <div className="mt-2 flex gap-1 rounded-lg border border-border bg-background p-1">
          {soorten.map((s) => (
            <label key={s.value} className={optionCls}>
              <input
                type="radio"
                name="soort"
                value={s.value}
                required
                defaultChecked={(vorige?.soort ?? 'idee') === s.value}
                className="sr-only"
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="contact-naam" className={labelCls}>
          {strings.naam}
        </label>
        <input id="contact-naam" name="naam" required maxLength={80} autoComplete="name" defaultValue={vorige?.naam} className={inputCls} />
      </div>

      <div>
        <label htmlFor="contact-email" className={labelCls}>
          {strings.email}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          defaultValue={vorige?.email}
          aria-describedby="contact-email-hint"
          className={inputCls}
        />
        <p id="contact-email-hint" className={hintCls}>
          {strings.emailHint}
        </p>
      </div>

      <div>
        <label htmlFor="contact-bericht" className={labelCls}>
          {strings.bericht}
        </label>
        <textarea id="contact-bericht" name="bericht" required maxLength={5000} rows={6} defaultValue={vorige?.bericht} className={inputCls} />
      </div>

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
