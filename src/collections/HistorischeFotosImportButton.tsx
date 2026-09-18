'use client';

import { useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useConfig, toast, Button, TextInput } from '@payloadcms/ui';

export function HistorischeFotosImportButton() {
  const {
    config: { routes, serverURL },
  } = useConfig();
  const router = useRouter();

  const [link, setLink] = useState('');
  const [geografischeAanduiding, setGeografischeAanduiding] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    if (!link) {
      toast.error('Vul eerst een link in.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${serverURL}${routes.api}/historische-fotos/import`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link, geografischeAanduiding: geografischeAanduiding || undefined }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result?.message ?? 'Importeren mislukt.');
        return;
      }

      toast.success(`Concept aangemaakt: "${result.doc.title}"`);
      router.push(`${routes.admin}/collections/historische-fotos/${result.doc.id}`);
    } catch {
      toast.error('Importeren mislukt — kon geen verbinding maken.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'flex-end',
        marginBottom: 'var(--base)',
        flexWrap: 'wrap',
      }}
    >
      <TextInput
        path="beeldbankLink"
        label="Beeldbank-link"
        value={link}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setLink(e.target.value)}
      />
      <TextInput
        path="beeldbankGeografischeAanduiding"
        label="Geografische aanduiding (optioneel)"
        value={geografischeAanduiding}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setGeografischeAanduiding(e.target.value)}
      />
      <Button onClick={handleImport} disabled={loading}>
        {loading ? 'Importeren…' : 'Importeren via link'}
      </Button>
    </div>
  );
}
