import type { Metadata } from 'next';
import { StyleguideSection } from '@/components/styleguide/StyleguideSection';

export const metadata: Metadata = {
  title: 'Styleguide – Duivelseiland',
  robots: { index: false, follow: false },
};

// Tailwind's scanner needs full literal class names in the source — a
// template-literal like `bg-${name}` would never be picked up and generated.
const colors = [
  { name: 'primary', hex: '#00893c', darkHex: '#2fbf6a', swatchClass: 'bg-primary', usage: 'Links, knoppen, focus, iconen' },
  { name: 'primary-hover', hex: '#10552b', darkHex: '#5fd08e', swatchClass: 'bg-primary-hover', usage: 'Hover op knoppen en links' },
  { name: 'on-primary', hex: '#ffffff', darkHex: '#181818', swatchClass: 'bg-on-primary', usage: 'Tekst op een groen vlak' },
  { name: 'accent', hex: '#ec0000', darkHex: '#ff5c5c', swatchClass: 'bg-accent', usage: 'Merkrood, fouten, waarschuwingen' },
  { name: 'accent-hover', hex: '#b70000', darkHex: '#ff8080', swatchClass: 'bg-accent-hover', usage: 'Hover op rode elementen' },
  { name: 'secondary', hex: '#009de6', darkHex: '#3fbef5', swatchClass: 'bg-secondary', usage: 'Grafieken en badges, geen tekst' },
  { name: 'background', hex: '#ffffff', darkHex: '#181818', swatchClass: 'bg-background', usage: 'Pagina' },
  { name: 'card', hex: '#ffffff', darkHex: '#232323', swatchClass: 'bg-card', usage: 'Kaartvlakken (met rand)' },
  { name: 'text', hex: '#202020', darkHex: '#ededed', swatchClass: 'bg-text', usage: 'Tekst en koppen' },
  { name: 'muted', hex: '#767676', darkHex: '#a8a8a8', swatchClass: 'bg-muted', usage: 'Ondersteunende tekst' },
  { name: 'border', hex: '#d1d1d1', darkHex: '#3a3a3a', swatchClass: 'bg-border', usage: 'Scheidingslijnen' },
  { name: 'input-border', hex: '#767676', darkHex: '#8a8a8a', swatchClass: 'bg-input-border', usage: 'Rand invoerveld (≥3:1)' },
];

// Vaste kleuren in de footer (altijd donker, ook in het lichte thema); Amsterdam-neutralen.
const onDarkColors = [
  { name: 'neutral-100', hex: '#202020', swatchClass: 'bg-[#202020]', usage: 'Footerachtergrond' },
  { name: 'white', hex: '#ffffff', swatchClass: 'bg-white', usage: 'Wordmark en kolomkoppen' },
  { name: 'neutral-20', hex: '#d1d1d1', swatchClass: 'bg-[#d1d1d1]', usage: 'Links en contactregels' },
  { name: '#a8a8a8', hex: '#a8a8a8', swatchClass: 'bg-[#a8a8a8]', usage: 'Kleine lettertjes' },
  { name: 'neutral-60', hex: '#767676', swatchClass: 'bg-[#767676]', usage: 'Scheidingslijn' },
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
      <h1 className="text-3xl font-bold text-text">Styleguide</h1>
      <p className="mt-2 text-muted">
        Interne referentiepagina voor kleuren, typografie en (later) componenten.
      </p>

      <div className="mt-8">
        <StyleguideSection title="Gebaseerd op het Amsterdam Design System">
          <p>
            De kleuren komen uit het{' '}
            <a
              href="https://designsystem.amsterdam/?path=/docs/brand-design-tokens-colour--docs"
              className="text-primary underline underline-offset-3 hover:text-primary-hover"
            >
              Amsterdam Design System
            </a>
            . We gebruiken twee primaire kleuren: groen (green-60) en rood (red-60), met hun level 80 als hover.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Groen is interactief</strong>: links, knoppen en focus. Het neemt de rol over die Amsterdam aan blauw
              geeft.
            </li>
            <li>
              <strong>Rood is merk- en foutkleur</strong>: logo, accenten, foutmeldingen, &lsquo;niet toegestaan&rsquo;.
            </li>
            <li>Koppen en tekst zijn neutraal (#202020). Groen betekent &lsquo;klikbaar&rsquo;.</li>
            <li>Op wit: tekst #202020, links groen. Op een groen of rood vlak: tekst en links wit (&lsquo;inverse&rsquo;).</li>
            <li>
              Rood en groen hebben onderling contrast 1:1 en zijn voor kleurenblinden niet te onderscheiden. Gebruik
              kleur daarom nooit als enige verschil: zorg ook voor een icoon, label, doorstreping of lijnstijl.
            </li>
            <li>
              Kaartvlakken zijn wit met een rand: op een grijze tint haalt groen/rood/grijs geen 4,5:1 meer. Azure
              (secondary) haalt als tekst geen 4,5:1 en wordt alleen voor vlakken gebruikt.
            </li>
          </ul>
          <p className="text-sm text-muted">
            Amsterdam heeft geen donkere modus; de donkere waarden zijn van dezelfde kleuren afgeleid en halen
            minimaal 4,5:1 op <code>card</code>.
          </p>
        </StyleguideSection>

        <StyleguideSection title="Kleuren">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {colors.map((color) => (
              <div key={color.name}>
                <div className={`h-16 rounded border border-border ${color.swatchClass}`} />
                <p className="mt-2 text-sm font-medium">{color.name}</p>
                <p className="text-xs text-muted">
                  licht {color.hex} · donker {color.darkHex}
                </p>
                <p className="text-xs text-muted">{color.usage}</p>
                <code className="text-xs text-muted">
                  bg-{color.name} / text-{color.name} / border-{color.name}
                </code>
              </div>
            ))}
          </div>
        </StyleguideSection>

        <StyleguideSection title="Kleuren op donker (footer)">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
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
            Vaste waarden: de footer blijft donker, ook als de site in het lichte thema staat.
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
              className="rounded-lg bg-primary px-4 py-2 font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Versturen
            </button>
            <a href="#" className="text-primary underline underline-offset-3 hover:text-primary-hover">
              Tekstlink
            </a>
            <label className="block w-full max-w-xs text-sm font-medium text-text">
              E-mailadres
              <input
                type="email"
                placeholder="naam@voorbeeld.nl"
                className="mt-1 w-full rounded-lg border border-input-border px-3 py-2 text-text focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block w-full max-w-xs text-sm font-medium text-text">
              Postcode
              <input
                type="text"
                defaultValue="1234"
                aria-invalid="true"
                aria-describedby="sg-postcode-fout"
                className="mt-1 w-full rounded-lg border-2 border-accent px-3 py-2 text-text focus:outline-none"
              />
              <span id="sg-postcode-fout" className="mt-1 block text-accent">
                Vul een geldige postcode in, bijvoorbeeld 1071 AB.
              </span>
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
