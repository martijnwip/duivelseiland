'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, toast, useDocumentInfo } from '@payloadcms/ui';

export default function TranslateButton() {
  const { id, collectionSlug, globalSlug } = useDocumentInfo();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (collectionSlug && id === undefined) return null;

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/translate-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(collectionSlug ? { collection: collectionSlug, id } : { global: globalSlug }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json?.error ?? 'Vertalen mislukt.');
        return;
      }
      if (json.translated === 0 && json.failed === 0) {
        toast.info('Niets te vertalen — er staat nog geen Nederlandse tekst.');
      } else if (json.failed > 0) {
        toast.warning(`Vertaald: ${json.translated}, mislukt: ${json.failed} (zie server-log).`);
      } else {
        toast.success(`Vertaald: ${json.translated} veld(en).`);
      }
      router.refresh();
    } catch {
      toast.error('Vertalen mislukt door een netwerkfout.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={isLoading} buttonStyle="secondary" size="small">
      {isLoading ? 'Vertalen…' : 'Vertaal naar Engels'}
    </Button>
  );
}
