'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, toast, useAuth, useDocumentInfo, useFormFields, useFormModified } from '@payloadcms/ui';

/**
 * Knop bovenaan een In-memoriam-pagina: mailt de buren die erom vroegen dat er foto's bij zijn. Alleen
 * zichtbaar als er na het vorige seintje foto's zijn toegevoegd. De regels staan op de server
 * (src/lib/in-memoriam/seintje.ts).
 */
export default function FotoSeintjeKnop() {
  const { id } = useDocumentInfo();
  const { user } = useAuth<{ role?: string }>();
  const router = useRouter();
  const modified = useFormModified();
  // Een getal (geen nieuwe array), zodat de knop alleen opnieuw rendert als het aantal verandert.
  const nieuw = useFormFields(([fields]) => {
    const laatste = fields.laatsteSeintjeOp?.value as string | undefined;
    const sinds = laatste ? new Date(laatste).getTime() : 0;
    const aantal = Number(fields.fotos?.value) || 0;
    let n = 0;
    for (let i = 0; i < aantal; i++) {
      const op = fields[`fotos.${i}.toegevoegdOp`]?.value as string | null | undefined;
      if (op && new Date(op).getTime() > sinds) n++;
    }
    return n;
  });
  const [bezig, setBezig] = useState(false);

  if (id === undefined || user?.role !== 'admin' || !nieuw) return null;

  const stuur = async () => {
    if (modified) {
      toast.error('Sla eerst je wijzigingen op.');
      return;
    }
    if (!window.confirm(`Buren die erom vroegen een mail sturen over ${nieuw === 1 ? '1 nieuwe foto' : `${nieuw} nieuwe foto’s`}?`)) return;
    setBezig(true);
    try {
      const res = await fetch(`/api/in-memoriam/${id}/seintje`, { method: 'POST', credentials: 'include' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json?.error ?? 'Versturen mislukt.');
        return;
      }
      toast.success(
        json.ontvangers === 0
          ? 'Er heeft nog niemand om een bericht gevraagd. De foto’s tellen nu als gemeld.'
          : `Seintje ${json.echt ? 'gemaild' : 'gelogd (geen productie, niet echt verstuurd)'} naar ${json.ontvangers} ${json.ontvangers === 1 ? 'buur' : 'buren'}.`,
      );
      router.refresh();
    } catch {
      toast.error('Versturen mislukt door een netwerkfout.');
    } finally {
      setBezig(false);
    }
  };

  return (
    <Button onClick={stuur} disabled={bezig} buttonStyle="primary" size="small">
      {bezig ? 'Bezig…' : `Seintje: nieuwe foto’s (${nieuw})`}
    </Button>
  );
}
