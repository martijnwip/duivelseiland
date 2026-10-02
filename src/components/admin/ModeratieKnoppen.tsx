'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, toast, useAuth, useDocumentInfo, useFormFields, useFormModified } from '@payloadcms/ui';

type Wijziging = { fase?: 'goedgekeurd' | 'afgewezen'; afwijsReden?: string; inschrijving?: 'open' | 'gesloten' };

const MELDINGEN: Record<string, string> = {
  goedgekeurd: 'Goedgekeurd: de activiteit staat online en op de agenda, aanmelden kan, en de organisator is gemaild.',
  afgewezen: 'Afgekeurd: de activiteit is offline en de organisator krijgt een mail met de reden.',
  gesloten: 'Aanmelding gesloten: de activiteit blijft zichtbaar, maar niemand kan zich nog aanmelden.',
  open: 'Aanmelding geopend: buren kunnen zich weer aanmelden.',
};

/**
 * Knoppen voor de redactie (redacteur of admin) bovenaan een activiteit: goedkeuren, afkeuren en de
 * aanmelding sluiten of openen, in elke fase. De rechten en gevolgen (mails, agenda) worden op de server
 * geregeld (src/lib/activiteiten/workflow.ts), niet hier.
 */
export default function ModeratieKnoppen() {
  const { id } = useDocumentInfo();
  const { user } = useAuth<{ role?: string }>();
  const router = useRouter();
  const modified = useFormModified();
  const fase = useFormFields(([fields]) => fields.fase?.value) as string | undefined;
  const inschrijving = useFormFields(([fields]) => fields.inschrijving?.value) as string | undefined;
  const afwijsReden = useFormFields(([fields]) => fields.afwijsReden?.value) as string | undefined;
  const [bezig, setBezig] = useState(false);

  const redactie = user?.role === 'redacteur' || user?.role === 'admin';
  if (id === undefined || !redactie || !fase) return null;

  const actief = fase === 'goedgekeurd' || fase === 'gaat-door';
  const kanGoedkeuren = ['onbevestigd', 'ingediend', 'afgewezen', 'afgelast'].includes(fase);
  const kanAfkeuren = ['onbevestigd', 'ingediend', 'goedgekeurd', 'gaat-door'].includes(fase);

  const opslaan = async (wijziging: Wijziging, melding: string) => {
    // Bij afkeuren mag de reden net getypt zijn (die gaat mee); andere niet-opgeslagen wijzigingen gaan verloren.
    if (modified && !wijziging.afwijsReden) {
      toast.error('Sla eerst je wijzigingen op.');
      return;
    }
    setBezig(true);
    try {
      const res = await fetch(`/api/activiteiten/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wijziging),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json?.errors?.[0]?.message ?? 'Opslaan mislukt.');
        return;
      }
      toast.success(MELDINGEN[melding]);
      router.refresh();
    } catch {
      toast.error('Opslaan mislukt door een netwerkfout.');
    } finally {
      setBezig(false);
    }
  };

  const afkeuren = () => {
    if (!afwijsReden?.trim()) {
      toast.error('Vul eerst bij "Reden van afkeuren" (zijbalk) in waarom; die wordt naar de organisator gemaild.');
      return;
    }
    opslaan({ fase: 'afgewezen', afwijsReden }, 'afgewezen');
  };

  return (
    <>
      {actief ? (
        inschrijving === 'gesloten' ? (
          <Button onClick={() => opslaan({ inschrijving: 'open' }, 'open')} disabled={bezig} buttonStyle="secondary" size="small">
            Aanmelding openen
          </Button>
        ) : (
          <Button onClick={() => opslaan({ inschrijving: 'gesloten' }, 'gesloten')} disabled={bezig} buttonStyle="secondary" size="small">
            Aanmelding sluiten
          </Button>
        )
      ) : null}
      {kanAfkeuren ? (
        <Button onClick={afkeuren} disabled={bezig} buttonStyle="secondary" size="small">
          Afkeuren
        </Button>
      ) : null}
      {kanGoedkeuren ? (
        <Button onClick={() => opslaan({ fase: 'goedgekeurd' }, 'goedgekeurd')} disabled={bezig} buttonStyle="primary" size="small">
          {bezig ? 'Bezig…' : fase === 'afgewezen' || fase === 'afgelast' ? 'Opnieuw goedkeuren' : 'Goedkeuren'}
        </Button>
      ) : null}
    </>
  );
}
