'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, toast, useAuth, useDocumentInfo, useFormFields, useFormModified } from '@payloadcms/ui';

/**
 * Knop bovenaan een WhatsApp-aanmelding voor de Buren-app: mailt de aanvrager de uitnodigingslink uit
 * Site-instellingen. De regels staan op de server (src/lib/whatsapp-groepen/uitnodigen.ts), niet hier.
 */
export default function WhatsappUitnodigenKnop() {
  const { id } = useDocumentInfo();
  const { user } = useAuth<{ role?: string }>();
  const router = useRouter();
  const modified = useFormModified();
  const groepen = useFormFields(([fields]) => fields.groepen?.value) as string[] | undefined;
  const uitgenodigdOp = useFormFields(([fields]) => fields.uitgenodigdOp?.value) as string | undefined;
  const [bezig, setBezig] = useState(false);

  const redactie = user?.role === 'redacteur' || user?.role === 'admin';
  if (id === undefined || !redactie || !groepen?.includes('buurt')) return null;

  const uitnodigen = async () => {
    if (modified) {
      toast.error('Sla eerst je wijzigingen op.');
      return;
    }
    setBezig(true);
    try {
      const res = await fetch(`/api/whatsapp-aanmeldingen/${id}/uitnodigen`, { method: 'POST', credentials: 'include' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json?.error ?? 'Versturen mislukt.');
        return;
      }
      toast.success(
        json.toegevoegd
          ? `Uitnodiging gemaild naar ${json.email}. De aanmelding staat op "Toegevoegd".`
          : `Uitnodiging gemaild naar ${json.email}. Voeg het nummer nog toe aan de Duivelse Schoonmaak.`,
      );
      router.refresh();
    } catch {
      toast.error('Versturen mislukt door een netwerkfout.');
    } finally {
      setBezig(false);
    }
  };

  return (
    <Button onClick={uitnodigen} disabled={bezig} buttonStyle={uitgenodigdOp ? 'secondary' : 'primary'} size="small">
      {bezig ? 'Bezig…' : uitgenodigdOp ? 'Uitnodiging opnieuw sturen' : 'Uitnodiging sturen'}
    </Button>
  );
}
