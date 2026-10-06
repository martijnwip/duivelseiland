'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@payloadcms/ui';
import { useOmgeving } from './omgeving';

const ROLLEN: Record<string, string> = { admin: 'admin', redacteur: 'redacteur', auteur: 'auteur', organisator: 'organisator' };

/**
 * In de kopbalk van /admin: met welk account je bent ingelogd (daar gaat ook een testmail heen), en een
 * label als je niet op de productiesite zit.
 */
export default function IngelogdAls() {
  const { user } = useAuth<{ email?: string; name?: string | null; role?: string }>();
  const omgeving = useOmgeving();
  if (!user?.email) return null;

  const label = omgeving === 'lokaal' ? 'LOKAAL' : omgeving === 'preview' ? 'PREVIEW' : null;

  return (
    <Link
      href="/admin/account"
      title="Je account. Een testmail gaat naar dit adres."
      style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, fontSize: 13, color: 'var(--theme-elevation-800)', textDecoration: 'none' }}
    >
      {label ? (
        <span
          style={{
            flexShrink: 0,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'var(--theme-warning-500, #d97706)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
      ) : null}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        Ingelogd als {user.name ? <strong>{user.name}</strong> : null}
        {user.name ? ' · ' : ''}
        {user.email}
        {user.role ? ` · ${ROLLEN[user.role] ?? user.role}` : ''}
      </span>
    </Link>
  );
}
