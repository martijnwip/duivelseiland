'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDocumentInfo } from '@payloadcms/ui';
import type { AdresRegel } from '../../lib/adresboek';

const cel: React.CSSProperties = { padding: '6px 12px 6px 0', borderBottom: '1px solid var(--theme-elevation-100)', textAlign: 'left' };

/** Tabel op een adres in het adresboek: alle lijsten waarin het voorkomt, met status en link. */
export default function AdresOverzicht() {
  const { id } = useDocumentInfo();
  const [regels, setRegels] = useState<AdresRegel[] | null>(null);
  const [fout, setFout] = useState(false);

  useEffect(() => {
    if (id === undefined) return;
    fetch(`/api/email-adressen/${id}/overzicht`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => setRegels(json.regels))
      .catch(() => setFout(true));
  }, [id]);

  if (id === undefined) return null;

  return (
    <div style={{ marginBottom: 'var(--base)' }}>
      <h4 style={{ marginBottom: 8 }}>Waar komt dit adres voor?</h4>
      {fout ? (
        <p>Overzicht laden mislukt.</p>
      ) : !regels ? (
        <p>Laden…</p>
      ) : regels.length === 0 ? (
        <p>Nergens: dit adres staat alleen in het adresboek.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={cel}>Lijst</th>
              <th style={cel}>Naam</th>
              <th style={cel}>Status</th>
              <th style={cel}>Datum</th>
            </tr>
          </thead>
          <tbody>
            {regels.map((r) => (
              <tr key={r.href}>
                <td style={cel}>
                  <Link href={r.href}>{r.lijst}</Link>
                </td>
                <td style={cel}>{r.naam}</td>
                <td style={cel}>{r.status}</td>
                <td style={cel}>{r.datum ? new Date(r.datum).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
