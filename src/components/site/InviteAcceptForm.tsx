'use client';

import { useState, type FormEvent } from 'react';

type Strings = {
  emailLabel: string;
  emailPlaceholder: string;
  submit: string;
  submitting: string;
  successHeading: string;
  successDescription: string;
  genericError: string;
};

export function InviteAcceptForm({ token, strings }: { token: string; strings: Strings }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);

    try {
      const response = await fetch('/api/invite-links/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setError(result?.message || strings.genericError);
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setError(strings.genericError);
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div>
        <h2 className="text-xl font-semibold text-primary">{strings.successHeading}</h2>
        <p className="mt-2 text-muted">{strings.successDescription}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="invite-email" className="block text-sm font-medium text-text">
          {strings.emailLabel}
        </label>
        <input
          id="invite-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={strings.emailPlaceholder}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-text focus:border-primary focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-cta">{error}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-lg bg-cta px-4 py-2 font-medium text-white transition-colors hover:bg-cta-hover disabled:opacity-60"
      >
        {status === 'submitting' ? strings.submitting : strings.submit}
      </button>
    </form>
  );
}
