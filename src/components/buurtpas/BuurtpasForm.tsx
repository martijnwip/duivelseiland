'use client';

import { useActionState } from 'react';
import { Honeypot } from '@/components/activiteiten/Honeypot';
import { vraagBuurtpasAan, type BuurtpasFormState } from './actions';

export type BuurtpasFormStrings = {
  emailLabel: string;
  emailPlaceholder: string;
  nieuwsbrief: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
};

const initialState: BuurtpasFormState = { status: 'idle' };

/** E-mailadres invullen, link in de mail krijgen. `terug`: waar de bezoeker na het activeren uitkomt. */
export function BuurtpasForm({ locale, terug, strings }: { locale: string; terug: string; strings: BuurtpasFormStrings }) {
  const [state, formAction, pending] = useActionState(vraagBuurtpasAan, initialState);

  if (state.status === 'success') {
    return (
      <p role="status" className="m-0 font-medium text-primary">
        {strings.success}
      </p>
    );
  }

  return (
    <form action={formAction} className="relative flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="terug" value={terug} />
      <div className="flex-1">
        <label htmlFor="buurtpas-email" className="block text-sm font-medium text-text">
          {strings.emailLabel}
        </label>
        <input
          id="buurtpas-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          defaultValue={state.status === 'error' ? state.email : undefined}
          placeholder={strings.emailPlaceholder}
          className="mt-1 w-full rounded-lg border border-input-border bg-card px-3 py-2 text-text focus:border-primary focus:outline-none"
        />
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm text-text sm:order-last sm:basis-full">
        <input type="checkbox" name="nieuwsbrief" value="ja" className="size-4 accent-primary" />
        {strings.nieuwsbrief}
      </label>
      <Honeypot />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2 font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
      >
        {pending ? strings.submitting : strings.submit}
      </button>
      {state.status === 'error' ? (
        <p role="status" className="m-0 text-sm text-accent sm:basis-full">
          {strings.error}
        </p>
      ) : null}
    </form>
  );
}
