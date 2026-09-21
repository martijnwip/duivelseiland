import type { Metadata } from 'next';
import { StyleguideSection } from '@/components/styleguide/StyleguideSection';

export const metadata: Metadata = {
  title: 'Styleguide – Duivelseiland',
  robots: { index: false, follow: false },
};

// Tailwind's scanner needs full literal class names in the source — a
// template-literal like `bg-${name}` would never be picked up and generated.
const colors = [
  { name: 'primary', hex: '#3b5d42', darkHex: '#6b9a73', swatchClass: 'bg-primary' },
  { name: 'secondary', hex: '#c99a46', darkHex: '#e0b368', swatchClass: 'bg-secondary' },
  { name: 'cta', hex: '#b5482e', darkHex: '#e2703f', swatchClass: 'bg-cta' },
  { name: 'cta-hover', hex: '#9c3a24', darkHex: '#c85a2e', swatchClass: 'bg-cta-hover' },
  { name: 'background', hex: '#f5efe3', darkHex: '#211c16', swatchClass: 'bg-background' },
  { name: 'text', hex: '#2b241c', darkHex: '#f1e8d8', swatchClass: 'bg-text' },
  { name: 'border', hex: '#e3d5be', darkHex: '#4a4136', swatchClass: 'bg-border' },
  { name: 'muted', hex: '#6b5f4f', darkHex: '#a99a85', swatchClass: 'bg-muted' },
];

// Grijzen die alleen in de donkere footer (bg-text) worden gebruikt; geen onderdeel van het thema.
const onDarkColors = [
  { name: 'white', hex: '#ffffff', swatchClass: 'bg-white', usage: 'Wordmark en kolomkoppen' },
  { name: 'gray-300', hex: '#d1d5db', swatchClass: 'bg-gray-300', usage: 'Links en contactregels' },
  { name: 'gray-400', hex: '#9ca3af', swatchClass: 'bg-gray-400', usage: 'Kleine lettertjes' },
  { name: 'gray-700', hex: '#374151', swatchClass: 'bg-gray-700', usage: 'Scheidingslijn' },
];

const radii = [
  { name: 'rounded', value: '4px', className: 'rounded', usage: 'Mobiele menulinks' },
  { name: 'rounded-lg', value: '8px', className: 'rounded-lg', usage: 'Knoppen, invoervelden, panelen' },
  { name: 'rounded-full', value: '9999px', className: 'rounded-full', usage: 'Ronde slideshow-pijlen' },
];

const spacing = [
  { name: '2', px: 8, className: 'w-2', usage: 'Verticale padding knop/invoerveld' },
  { name: '3', px: 12, className: 'w-3', usage: 'Horizontale padding invoerveld' },
  { name: '4', px: 16, className: 'w-4', usage: 'Paginamarge mobiel, formuliergaten' },
  { name: '6', px: 24, className: 'w-6', usage: 'Paginamarge tablet' },
  { name: '8', px: 32, className: 'w-8', usage: 'Paginamarge desktop, menu-afstand' },
  { name: '12', px: 48, className: 'w-12', usage: 'Footerkolommen' },
  { name: '16', px: 64, className: 'w-16', usage: 'Footer padding boven/onder' },
];

const logos = [
  { file: 'duivelseiland-mark-color.svg', label: 'Kleur', panelClass: 'bg-background' },
  { file: 'duivelseiland-mark-black.svg', label: 'Zwart', panelClass: 'bg-white' },
  { file: 'duivelseiland-mark-white.svg', label: 'Wit (reverse)', panelClass: 'bg-text' },
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
                <p className="text-xs text-muted">
                  licht {color.hex} · donker {color.darkHex}
                </p>
                <code className="text-xs text-muted">
                  bg-{color.name} / text-{color.name} / border-{color.name}
                </code>
              </div>
            ))}
          </div>
        </StyleguideSection>

        <StyleguideSection title="Kleuren op donker (footer)">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {onDarkColors.map((color) => (
              <div key={color.name}>
                <div className={`h-16 rounded border border-border ${color.swatchClass}`} />
                <p className="mt-2 text-sm font-medium">{color.name}</p>
                <p className="text-xs text-muted">{color.hex}</p>
                <p className="text-xs text-muted">{color.usage}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted">
            Standaard Tailwind-grijzen op de <code>bg-text</code>-ondergrond van de footer.
          </p>
        </StyleguideSection>

        <StyleguideSection title="Logo">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {logos.map((logo) => (
              <div key={logo.file}>
                <div
                  className={`flex h-56 items-center justify-center rounded-lg border border-border ${logo.panelClass}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/logo/${logo.file}`} alt="" className="h-44 w-auto" />
                </div>
                <p className="mt-2 text-sm font-medium">{logo.label}</p>
                <code className="text-xs text-muted">/logo/{logo.file}</code>
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

        <StyleguideSection title="Knop en invoerveld">
          <div className="flex flex-col items-start gap-4">
            <button
              type="button"
              className="rounded-lg bg-cta px-4 py-2 font-medium text-on-cta transition-colors hover:bg-cta-hover"
            >
              Versturen
            </button>
            <label className="block w-full max-w-xs text-sm font-medium text-text">
              E-mailadres
              <input
                type="email"
                placeholder="naam@voorbeeld.nl"
                className="mt-1 w-full rounded-lg border border-input-border px-3 py-2 text-text focus:border-primary focus:outline-none"
              />
            </label>
          </div>
        </StyleguideSection>

        <StyleguideSection title="Afronding">
          <div className="grid grid-cols-3 gap-6">
            {radii.map((radius) => (
              <div key={radius.name}>
                <div className={`h-16 border border-border bg-white ${radius.className}`} />
                <p className="mt-2 text-sm font-medium">{radius.name}</p>
                <p className="text-xs text-muted">{radius.value}</p>
                <p className="text-xs text-muted">{radius.usage}</p>
              </div>
            ))}
          </div>
        </StyleguideSection>

        <StyleguideSection title="Ruimte">
          <ul className="space-y-2">
            {spacing.map((step) => (
              <li key={step.name} className="flex items-center gap-4 text-sm">
                <span className="w-24 font-medium">{step.name} ({step.px}px)</span>
                <span className="flex w-16 shrink-0">
                  <span className={`h-3 bg-primary ${step.className}`} />
                </span>
                <span className="text-muted">{step.usage}</span>
              </li>
            ))}
          </ul>
        </StyleguideSection>
      </div>
    </main>
  );
}
