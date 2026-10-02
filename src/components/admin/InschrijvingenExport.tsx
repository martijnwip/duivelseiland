import React from 'react';

/** Downloadlink boven de lijst met aanmeldingen: actieve deelnemers als CSV (alleen wat je mag zien). */
export default function InschrijvingenExport() {
  return (
    <div style={{ marginBottom: 'var(--base)' }}>
      <a href="/api/activiteit-inschrijvingen/export" className="btn btn--style-secondary btn--size-small" download>
        Deelnemers downloaden (CSV)
      </a>
    </div>
  );
}
