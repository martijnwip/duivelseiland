'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, toast, useAuth, useDocumentInfo, useFormFields, useFormModified } from '@payloadcms/ui';

/**
 * Goedkeuren of afkeuren van een herinnering op een In-memoriam-pagina (redacteur en admin). Wie de tekst
 * eerst aanpast, slaat eerst op. De rechten liggen op de collection (alleen redactie mag wijzigen).
 */
export default function ReactieModeratieKnoppen() {
  const { id } = useDocumentInfo();
  const { user } = useAuth<{ role?: string }>();
  const router = useRouter();
  const modified = useFormModified();
  const status = useFormFields(([fields]) => fields.status?.value) as string | undefined;
  const [bezig, setBezig] = useState(false);

  if (id === undefined || !(user?.role === 'redacteur' || user?.role === 'admin')) return null;

  const zet = async (nieuw: 'goedgekeurd' | 'afgekeurd') => {
    if (modified) {
      toast.error('Sla eerst je wijzigingen op.');
      return;
    }
    setBezig(true);
    try {
      const res = await fetch(`/api/in-memoriam-reacties/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nieuw }),
      });
      if (!res.ok) {
        toast.error('Opslaan mislukt.');
        return;
      }
      toast.success(nieuw === 'goedgekeurd' ? 'Goedgekeurd: de herinnering staat op de pagina.' : 'Afgekeurd: de herinnering staat niet op de pagina.');
      router.refresh();
    } catch {
      toast.error('Opslaan mislukt door een netwerkfout.');
    } finally {
      setBezig(false);
    }
  };

  return (
    <>
      {status !== 'goedgekeurd' ? (
        <Button onClick={() => zet('goedgekeurd')} disabled={bezig} buttonStyle="primary" size="small">
          Goedkeuren
        </Button>
      ) : null}
      {status !== 'afgekeurd' ? (
        <Button onClick={() => zet('afgekeurd')} disabled={bezig} buttonStyle="secondary" size="small">
          {status === 'goedgekeurd' ? 'Van de pagina halen' : 'Afkeuren'}
        </Button>
      ) : null}
    </>
  );
}
