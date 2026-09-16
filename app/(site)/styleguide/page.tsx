import type { Metadata } from 'next';
import { StyleguideSection } from '@/components/styleguide/StyleguideSection';

export const metadata: Metadata = {
  title: 'Styleguide – Duivelseiland',
  robots: { index: false, follow: false },
};

// Tailwind's scanner needs full literal class names in the source — a
// template-literal like `bg-${name}` would never be picked up and generated.
const colors = [
  { name: 'primary', hex: '#3b5d42', swatchClass: 'bg-primary' },
  { name: 'secondary', hex: '#c99a46', swatchClass: 'bg-secondary' },
  { name: 'cta', hex: '#b5482e', swatchClass: 'bg-cta' },
  { name: 'cta-hover', hex: '#9c3a24', swatchClass: 'bg-cta-hover' },
  { name: 'background', hex: '#f5efe3', swatchClass: 'bg-background' },
  { name: 'text', hex: '#2b241c', swatchClass: 'bg-text' },
  { name: 'border', hex: '#e3d5be', swatchClass: 'bg-border' },
  { name: 'muted', hex: '#6b5f4f', swatchClass: 'bg-muted' },
];

export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-primary">Styleguide</h1>
      <p className="mt-2 text-muted">
        Interne referentiepagina voor kleuren, typografie en (later) componenten.
      </p>

      <div className="mt-8">
        <StyleguideSection title="Kleuren">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {colors.map((color) => (
              <div key={color.name}>
                <div className={`h-16 rounded border border-border ${color.swatchClass}`} />
                <p className="mt-2 text-sm font-medium">{color.name}</p>
                <p className="text-xs text-muted">{color.hex}</p>
                <code className="text-xs text-muted">
                  bg-{color.name} / text-{color.name} / border-{color.name}
                </code>
              </div>
            ))}
          </div>
        </StyleguideSection>

        <StyleguideSection title="Typografie">
          <div>
            <p className="text-sm text-muted">font-serif (Fraunces) — alleen h1</p>
            <h1 className="text-4xl">Kop niveau 1 (h1)</h1>
          </div>

          <div>
            <p className="text-sm text-muted">font-heading (Lexend) — h2 t/m h6</p>
            <h2 className="text-3xl">Kop niveau 2 (h2)</h2>
            <h3 className="text-2xl">Kop niveau 3 (h3)</h3>
            <h4 className="text-xl">Kop niveau 4 (h4)</h4>
            <h5 className="text-lg">Kop niveau 5 (h5)</h5>
            <h6 className="text-base">Kop niveau 6 (h6)</h6>
          </div>

          <div className="font-body">
            <p className="text-sm text-muted">font-body (Source Sans 3)</p>
            <p className="text-lg">Tekstgrootte lg — voorbeeldtekst voor body copy.</p>
            <p className="text-base">Tekstgrootte base — standaard bodytekst.</p>
            <p className="text-sm">Tekstgrootte sm — kleinere ondersteunende tekst.</p>
            <p className="text-xs">Tekstgrootte xs — labels, footnotes.</p>
          </div>
        </StyleguideSection>
      </div>
    </main>
  );
}
