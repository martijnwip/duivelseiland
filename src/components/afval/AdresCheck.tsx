'use client';

import { useId, useState, type FormEvent } from 'react';
import type { Regel } from '@/lib/afval/types';
import { RegelItem, type RegelLabels } from './RegelItem';

type Labels = RegelLabels & {
  title: string;
  intro: string;
  postcode: string;
  huisnummer: string;
  toevoeging: string;
  submit: string;
  loading: string;
  invalid: string;
  notFound: string;
  unavailable: string;
  resultFor: string;
  fracties: Record<string, string>;
};

type State = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; msg: string } | { kind: 'done'; regels: Regel[]; adres: string };

const input =
  'min-h-11 w-full rounded-md border border-input-border bg-background px-3 text-[15px] text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** Postcode + huisnummer: welke regels gelden voor jouw adres (Afvalwijzer, via onze eigen route). */
export function AdresCheck({ locale, labels }: { locale: string; labels: Labels }) {
  const id = useId();
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const postcode = String(form.get('postcode') ?? '').replace(/\s/g, '').toUpperCase();
    const huisnummer = String(form.get('huisnummer') ?? '').trim();
    const toevoeging = String(form.get('toevoeging') ?? '').trim();
    if (!/^[1-9]\d{3}[A-Z]{2}$/.test(postcode) || !/^\d{1,5}$/.test(huisnummer)) {
      setState({ kind: 'error', msg: labels.invalid });
      return;
    }
    setState({ kind: 'loading' });
    try {
      const qs = new URLSearchParams({ postcode, huisnummer, toevoeging });
      const res = await fetch(`/api/afval/adres?${qs}`);
      if (!res.ok) throw new Error(String(res.status));
      const { regels } = (await res.json()) as { regels: Regel[] };
      if (!regels.length) setState({ kind: 'error', msg: labels.notFound });
      else setState({ kind: 'done', regels, adres: `${postcode.slice(0, 4)} ${postcode.slice(4)} ${huisnummer}${toevoeging ? ` ${toevoeging}` : ''}` });
    } catch {
      setState({ kind: 'error', msg: labels.unavailable });
    }
  }

  return (
    <section aria-labelledby={`${id}-t`} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 xl:p-6">
      <div>
        <h3 id={`${id}-t`} className="m-0 text-[17px] leading-[1.3] font-semibold text-text xl:text-lg">
          {labels.title}
        </h3>
        <p className="mt-1 mb-0 text-sm leading-[1.4] text-muted">{labels.intro}</p>
      </div>
      <form onSubmit={onSubmit} className="grid grid-cols-2 items-end gap-3" noValidate>
        <label className="col-span-2 flex flex-col gap-1 text-sm font-medium text-text">
          {labels.postcode}
          <input name="postcode" autoComplete="postal-code" placeholder="1071 TS" maxLength={7} required className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-text">
          {labels.huisnummer}
          <input name="huisnummer" inputMode="numeric" maxLength={5} required className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-text">
          {labels.toevoeging}
          <input name="toevoeging" maxLength={8} className={input} />
        </label>
        <button
          type="submit"
          disabled={state.kind === 'loading'}
          className="col-span-2 min-h-11 cursor-pointer rounded-md border-0 bg-cta px-5 text-[15px] font-semibold text-on-cta hover:bg-cta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
        >
          {state.kind === 'loading' ? labels.loading : labels.submit}
        </button>
      </form>
      <div aria-live="polite">
        {state.kind === 'error' && <p className="m-0 text-sm text-cta">{state.msg}</p>}
        {state.kind === 'done' && (
          <div className="flex flex-col gap-1">
            <p className="m-0 text-sm text-muted">
              {labels.resultFor} <strong className="font-semibold text-text">{state.adres}</strong>
            </p>
            <ul className="m-0 list-none p-0">
              {state.regels.map((r) => (
                <RegelItem key={r.code} regel={r} naam={labels.fracties[r.code] ?? r.fractie} locale={locale} labels={labels} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
