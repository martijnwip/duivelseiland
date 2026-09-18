'use client';

import { useFormFields } from '@payloadcms/ui';

export function HistorischeFotosImagePreview() {
  const imageUrl = useFormFields(([fields]) => fields?.imageUrl?.value as string | undefined);

  if (!imageUrl) {
    return null;
  }

  return (
    <div style={{ marginBottom: 'var(--base)' }}>
      <img
        src={imageUrl}
        alt=""
        style={{
          maxWidth: '320px',
          maxHeight: '320px',
          display: 'block',
          borderRadius: '4px',
          border: '1px solid var(--theme-elevation-150)',
        }}
      />
    </div>
  );
}
