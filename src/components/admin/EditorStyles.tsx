'use client';

import type { ReactElement, ReactNode } from 'react';
import { Fraunces, Lexend, Source_Sans_3 } from 'next/font/google';
import './editor.css';

// Zelfde lettertypen als de site (app/(site)/[locale]/layout.tsx). Alleen de
// rich text-editor gebruikt ze, zie editor.css; de rest van de admin blijft
// de Payload-standaard.
const lexend = Lexend({ subsets: ['latin'], display: 'swap', variable: '--font-lexend' });
const sourceSans = Source_Sans_3({ subsets: ['latin'], display: 'swap', variable: '--font-source-sans' });
const fraunces = Fraunces({ subsets: ['latin'], display: 'swap', variable: '--font-fraunces' });

/** Provider die de font-variabelen beschikbaar maakt voor de hele admin. */
export default function EditorStyles({ children }: { children?: ReactNode }): ReactElement {
  return (
    <div className={`${lexend.variable} ${sourceSans.variable} ${fraunces.variable}`} style={{ display: 'contents' }}>
      {children}
    </div>
  );
}
