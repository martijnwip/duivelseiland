'use client';

import { useEffect, useState, useTransition } from 'react';
import type { IdeeKey } from '@/collections/IdeeLikes';
import { getIdeeLikes, toggleIdeeLike, type IdeeLikesState } from './actions';
import { Icon, type BuurtborrelIconName } from './icons';

type Item = { key: IdeeKey; icon: BuurtborrelIconName; label: string };

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`idee-hart size-5 ${filled ? 'fill-current' : 'fill-none'}`} stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
      <path d="M12 20s-7-4.4-9-9.1C1.6 7.6 3.7 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.5 0 5.6 3.6 4.2 6.9C19 15.6 12 20 12 20z" />
    </svg>
  );
}

/**
 * De ideeën als knoppen met een hartje. De pagina zelf is statisch; tellingen worden na het laden
 * opgehaald, zodat ze altijd actueel zijn.
 */
export function IdeeLikes({ items, likeLabel }: { items: Item[]; likeLabel: string }) {
  const [state, setState] = useState<IdeeLikesState | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    getIdeeLikes().then(setState, () => {});
  }, []);

  function toggle(key: IdeeKey) {
    const prev = state;
    if (prev) {
      const on = prev.liked.includes(key);
      setState({
        counts: { ...prev.counts, [key]: Math.max(0, prev.counts[key] + (on ? -1 : 1)) },
        liked: on ? prev.liked.filter((k) => k !== key) : [...prev.liked, key],
      });
    }
    startTransition(async () => {
      try {
        setState(await toggleIdeeLike(key));
      } catch {
        setState(prev);
      }
    });
  }

  return items.map(({ key, icon, label }) => {
    const liked = state?.liked.includes(key) ?? false;
    const count = state?.counts[key];
    return (
      <li key={key}>
        <button
          type="button"
          onClick={() => toggle(key)}
          aria-pressed={liked}
          aria-label={likeLabel.replace('{idee}', label).replace('{count}', String(count ?? 0))}
          className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full border py-2 pr-3 pl-2.5 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            liked ? 'border-accent bg-card text-text' : 'border-border bg-card text-text hover:border-accent'
          }`}
        >
          <Icon name={icon} className="size-6 text-primary" />
          {label}
          <span className={`flex items-center gap-1 pl-1 tabular-nums ${liked ? 'text-accent' : 'text-muted'}`}>
            <Heart filled={liked} />
            {count !== undefined && <span className="min-w-[1ch] text-sm">{count}</span>}
          </span>
        </button>
      </li>
    );
  });
}
