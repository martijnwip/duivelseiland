'use client';

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-input-border bg-card px-4 text-[15px] font-medium text-text hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary print:hidden"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2" />
        <rect x="6" y="14" width="12" height="7" />
      </svg>
      {label}
    </button>
  );
}
