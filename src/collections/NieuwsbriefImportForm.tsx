'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useConfig, toast, Button } from '@payloadcms/ui';
import type { NieuwsbriefImportResultaat } from './NieuwsbriefImportEndpoint';
import { csvNaarRijen, type CsvResultaat } from '../lib/nieuwsbrief/csv';

/**
 * Boven de lijst met abonnees: adressen plakken of een CSV kiezen en in één keer als actief toevoegen.
 * De CSV wordt in de browser gelezen; alleen naam en e-mail gaan naar de server. Alleen voor admin.
 */
export function NieuwsbriefImportForm() {
  const {
    config: { routes, serverURL },
  } = useConfig();
  const { user } = useAuth<{ role?: string }>();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [tekst, setTekst] = useState('');
  const [csv, setCsv] = useState<(CsvResultaat & { bestand: string }) | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [locale, setLocale] = useState<'nl' | 'en'>('nl');
  const [toestemming, setToestemming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultaat, setResultaat] = useState<NieuwsbriefImportResultaat | null>(null);

  if (user?.role !== 'admin') return null;

  async function handleFile(file: File | undefined) {
    if (!file) {
      setCsv(null);
      return;
    }
    const gelezen = csvNaarRijen(await file.text());
    if (!gelezen || gelezen.rijen.length === 0) {
      setCsv(null);
      setFileKey((k) => k + 1);
      toast.error('Geen e-mailadressen gevonden in dit bestand.');
      return;
    }
    setCsv({ ...gelezen, bestand: file.name });
  }

  async function handleImport() {
    if (!toestemming) {
      toast.error('Vink eerst aan dat deze mensen toestemming hebben gegeven.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${serverURL}${routes.api}/nieuwsbrief-abonnees/import`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tekst, rijen: csv?.rijen ?? [], locale, toestemming }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result?.message ?? 'Importeren mislukt.');
        return;
      }
      const r = result as NieuwsbriefImportResultaat;
      setResultaat(r);
      toast.success(`${r.toegevoegd} toegevoegd, ${r.geactiveerd} geactiveerd, ${r.alActief} stonden er al, ${r.naamAangevuld} namen aangevuld.`);
      setTekst('');
      setCsv(null);
      setFileKey((k) => k + 1);
      setToestemming(false);
      router.refresh();
    } catch {
      toast.error('Importeren mislukt, kon geen verbinding maken.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <div style={{ marginBottom: 'var(--base)' }}>
        <Button buttonStyle="secondary" onClick={() => setOpen(true)}>
          Adressen importeren
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'calc(var(--base) / 2)',
        marginBottom: 'var(--base)',
        padding: 'var(--base)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-m)',
        maxWidth: '48rem',
      }}
    >
      <label htmlFor="nieuwsbrief-import-tekst" style={{ fontWeight: 600 }}>
        Adressen importeren
      </label>
      <p style={{ margin: 0, color: 'var(--theme-elevation-500)' }}>
        Kies een CSV-bestand of plak adressen, één per regel. Een naam op dezelfde regel (&quot;Naam &lt;adres&gt;&quot;,
        &quot;Naam;adres&quot;) wordt meegenomen. Uit een CSV worden alleen de kolommen naam en e-mail gebruikt. Adressen
        worden direct actief, zonder bevestigingsmail. Afgemelde adressen worden overgeslagen en bestaande namen niet
        overschreven.
      </p>
      <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        CSV-bestand:
        <input key={fileKey} type="file" accept=".csv,text/csv" onChange={(e) => handleFile(e.target.files?.[0])} />
      </label>
      {csv ? (
        <div style={{ fontSize: '0.9em' }}>
          <p style={{ margin: 0 }}>
            {csv.bestand}: {csv.rijen.length} adressen gevonden in kolom &quot;{csv.emailKolom}&quot;
            {csv.naamKolom ? <>, namen uit &quot;{csv.naamKolom}&quot;</> : <>, geen naamkolom gevonden</>}
            {csv.zonderAdres > 0 ? <>. {csv.zonderAdres} rijen zonder adres worden overgeslagen</> : null}.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            {csv.rijen.slice(0, 5).map((r) => (
              <li key={r.email}>
                {r.naam ? `${r.naam} — ` : ''}
                {r.email}
              </li>
            ))}
            {csv.rijen.length > 5 ? <li>…</li> : null}
          </ul>
        </div>
      ) : null}
      <textarea
        id="nieuwsbrief-import-tekst"
        rows={8}
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        style={{
          width: '100%',
          padding: 'calc(var(--base) / 2)',
          fontFamily: 'var(--font-mono)',
          background: 'var(--theme-input-bg)',
          color: 'var(--theme-text)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 'var(--style-radius-s)',
        }}
      />
      <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        Taal van de mails:
        <select value={locale} onChange={(e) => setLocale(e.target.value === 'en' ? 'en' : 'nl')}>
          <option value="nl">Nederlands</option>
          <option value="en">English</option>
        </select>
      </label>
      <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input type="checkbox" checked={toestemming} onChange={(e) => setToestemming(e.target.checked)} />
        Deze mensen hebben toestemming gegeven om de nieuwsbrief te ontvangen.
      </label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button onClick={handleImport} disabled={loading || (!tekst.trim() && !csv)}>
          {loading ? 'Importeren…' : 'Importeren'}
        </Button>
        <Button buttonStyle="secondary" onClick={() => setOpen(false)}>
          Sluiten
        </Button>
      </div>

      {resultaat ? (
        <div style={{ fontSize: '0.9em' }}>
          <p style={{ margin: 0 }}>
            {resultaat.toegevoegd} toegevoegd, {resultaat.geactiveerd} van &quot;wacht op bevestiging&quot; naar actief,{' '}
            {resultaat.alActief} stonden er al, {resultaat.naamAangevuld} namen aangevuld.
          </p>
          {resultaat.afgemeldOvergeslagen.length > 0 ? (
            <p style={{ margin: 0 }}>
              Overgeslagen omdat ze zich hebben afgemeld: {resultaat.afgemeldOvergeslagen.join(', ')}
            </p>
          ) : null}
          {resultaat.ongeldig.length > 0 ? (
            <p style={{ margin: 0, color: 'var(--theme-error-500)' }}>Niet herkend: {resultaat.ongeldig.join(', ')}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
