'use client';

import { useActionState } from 'react';
import { submitNieuwsbrief, type NieuwsbriefFormState } from './actions';

export type NieuwsbriefFooterStrings = {
  emailLabel: string;
  emailPlaceholder: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
};

const initialState: NieuwsbriefFormState = { status: 'idle' };

/** Compact aanmeldformulier in de (donkere) footer; afmelden gaat via /nieuwsbrief. */
export function NieuwsbriefFooterForm({ locale, strings }: { locale: string; strings: NieuwsbriefFooterStrings }) {
  const [state, formAction, pending] = useActionState(submitNieuwsbrief, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="mode" value="aanmelden" />
      <label htmlFor="footer-nieuwsbrief-email" className="sr-only">
        {strings.emailLabel}
      </label>
      <div className="flex gap-2">
        <input
          id="footer-nieuwsbrief-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          defaultValue={state.status === 'error' ? state.email : undefined}
          placeholder={strings.emailPlaceholder}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#767676] bg-[#2b2b2b] px-3 py-2 text-white placeholder:text-[#a8a8a8] focus:border-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 shrink-0 rounded-lg bg-white px-4 py-2 font-medium text-[#202020] transition-colors hover:bg-[#d1d1d1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
        >
          {pending ? strings.submitting : strings.submit}
        </button>
      </div>

      {/* Honeypot: onzichtbaar voor mensen, bots vullen het in. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <p role="status" className="min-h-5 text-sm">
        {state.status === 'success' ? (
          <span className="text-white">{strings.success}</span>
        ) : state.status === 'error' ? (
          <span className="text-[#ffb4a8]">{strings.error}</span>
        ) : null}
      </p>
    </form>
  );
}
