'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, toast, useAuth, useDocumentInfo, useFormFields, useFormModified } from '@payloadcms/ui';

type Wijziging = { moderatie: 'goedgekeurd' | 'afgewezen'; afwijsReden?: string };

const MELDINGEN = {
  goedgekeurd: 'Goedgekeurd: de vakman staat online en de aanmelder is gemaild.',
  afgewezen: 'Afgekeurd: de vakman is offline en de aanmelder krijgt een mail met de reden.',
};

/**
 * Knoppen voor de redactie bovenaan een vakman die een buur via de site heeft aangemeld: goedkeuren en
 * afkeuren. De regels en mails staan op de server (src/lib/vaklui/workflow.ts), niet hier.
 */
export default function VakmanModeratieKnoppen() {
  const { id } = useDocumentInfo();
  const { user } = useAuth<{ role?: string }>();
  const router = useRouter();
  const modified = useFormModified();
  const moderatie = useFormFields(([fields]) => fields.moderatie?.value) as string | undefined;
  const afwijsReden = useFormFields(([fields]) => fields.afwijsReden?.value) as string | undefined;
  const [bezig, setBezig] = useState(false);

  const redactie = user?.role === 'redacteur' || user?.role === 'admin';
  if (id === undefined || !redactie || !moderatie) return null;

  const opslaan = async (wijziging: Wijziging) => {
    // Bij afkeuren mag de reden net getypt zijn (die gaat mee); andere niet-opgeslagen wijzigingen gaan verloren.
    if (modified && !wijziging.afwijsReden) {
      toast.error('Sla eerst je wijzigingen op.');
      return;
    }
    setBezig(true);
    try {
      const res = await fetch(`/api/vaklui/${id}`, {
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
      toast.success(MELDINGEN[wijziging.moderatie]);
      router.refresh();
    } catch {
      toast.error('Opslaan mislukt door een netwerkfout.');
    } finally {
      setBezig(false);
    }
  };

  const afkeuren = () => {
    if (!afwijsReden?.trim()) {
      toast.error('Vul eerst bij "Reden van afkeuren" (zijbalk) in waarom; die wordt naar de aanmelder gemaild.');
      return;
    }
    opslaan({ moderatie: 'afgewezen', afwijsReden });
  };

  return (
    <>
      {moderatie !== 'afgewezen' ? (
        <Button onClick={afkeuren} disabled={bezig} buttonStyle="secondary" size="small">
          Afkeuren
        </Button>
      ) : null}
      {moderatie !== 'goedgekeurd' ? (
        <Button onClick={() => opslaan({ moderatie: 'goedgekeurd' })} disabled={bezig} buttonStyle="primary" size="small">
          {bezig ? 'Bezig…' : moderatie === 'afgewezen' ? 'Opnieuw goedkeuren' : 'Goedkeuren'}
        </Button>
      ) : null}
    </>
  );
}
