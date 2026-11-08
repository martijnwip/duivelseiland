import { readFile } from 'fs/promises';
import { join } from 'path';
import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import { inkorten } from '@/lib/deelinfo';

/**
 * De deelafbeelding (1200×630) die WhatsApp en sociale media bij een gedeelde link tonen: links een beeld,
 * rechts het label, de titel, de belangrijkste gegevens (bv. datum, tijd en plek) en een korte tekst.
 * Het resultaat is een JPEG: als PNG is een foto al snel ~600 kB, de grens van WhatsApp.
 *
 * Gebruikt door de opengraph-image.tsx-bestanden onder app/(site)/[locale]; zie deelAfbeelding.tsx
 * (nieuws, agenda en andere items) en paginaAfbeelding.ts (vaste pagina's).
 */
export type DeelFoto =
  /** Een afbeelding op een URL, bv. uit Media. */
  | { url: string }
  /** Een bestand in public/, met bovenkant of midden in beeld. */
  | { pad: string; positie?: 'top' | 'centre'; /** Horizontale uitsnede, 0 = links, 1 = rechts (standaard het midden). */ x?: number };

export type DeelKaartInput = {
  /** Klein label boven de titel, bv. "Agenda". "Duivelseiland · " komt er vanzelf voor. */
  label?: string;
  title: string;
  /** Belangrijkste gegevens, groot onder de titel (bv. datum, tijd en plek). */
  regels?: string[];
  /** Korte tekst onder de regels, afgekapt op een paar regels. */
  tekst?: string | null;
  /** Zonder (werkende) foto: de kaart van de buurt. */
  foto?: DeelFoto | null;
};

const SIZE = { width: 1200, height: 630 };
const FOTO = { width: 460, height: 630 };
// De kaart van de buurt, met de naam "DUIVELSEILAND" helemaal in beeld.
const STANDAARD_FOTO: DeelFoto = { pad: 'kaart/duivelseiland.png', x: 0.8 };
const C = { bg: '#f3eee4', text: '#202020', muted: '#5f5f5f', primary: '#00893c' };

async function fotoBytes(foto: DeelFoto): Promise<Buffer | null> {
  try {
    if ('url' in foto) {
      const res = await fetch(foto.url);
      return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
    }
    return await readFile(join(process.cwd(), 'public', foto.pad));
  } catch {
    return null;
  }
}

async function fotoDataUrl(foto: DeelFoto): Promise<string | null> {
  const bytes = await fotoBytes(foto);
  if (!bytes) return null;
  const positie = 'pad' in foto && foto.positie === 'top' ? 'top' : 'centre';
  const x = 'pad' in foto ? foto.x : undefined;
  let beeld = sharp(bytes);
  if (x !== undefined) {
    // Eerst op hoogte schalen, dan zelf de uitsnede kiezen.
    const geschaald = await sharp(bytes).resize({ height: FOTO.height }).toBuffer({ resolveWithObject: true });
    const ruimte = Math.max(0, geschaald.info.width - FOTO.width);
    beeld = sharp(geschaald.data).extract({ left: Math.round(ruimte * x), top: 0, width: Math.min(FOTO.width, geschaald.info.width), height: FOTO.height });
  }
  const jpeg = await beeld
    .resize(FOTO.width, FOTO.height, { fit: 'cover', position: positie })
    .jpeg({ quality: 72 })
    .toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
}

function titelGrootte(title: string): number {
  if (title.length > 70) return 44;
  if (title.length > 45) return 50;
  return 58;
}

export async function deelKaart({ label, title, regels = [], tekst, foto }: DeelKaartInput): Promise<Response> {
  const [fotoSrc, badge] = await Promise.all([
    (foto ? fotoDataUrl(foto) : Promise.resolve(null)).then((src) => src ?? fotoDataUrl(STANDAARD_FOTO)),
    readFile(join(process.cwd(), 'public/logo/mail-badge.png')),
  ]);
  const badgeSrc = `data:image/png;base64,${badge.toString('base64')}`;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const siteHost = serverUrl && URL.canParse(serverUrl) ? new URL(serverUrl).host : 'duivelseiland.amsterdam';
  const zichtbareRegels = regels.filter(Boolean);
  // Op hele zinnen inkorten, zodat de tekst niet midden in een woord stopt; korter als er regels boven staan.
  const korteTekst = tekst ? inkorten(tekst, zichtbareRegels.length > 0 ? 100 : 170) : null;

  const png = new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: C.bg, color: C.text }}>
        {fotoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fotoSrc} width={FOTO.width} height={FOTO.height} alt="" style={{ objectFit: 'cover' }} />
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '48px 56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={badgeSrc} width={52} height={52} alt="" />
            <div style={{ display: 'flex', fontSize: 24, letterSpacing: 4, color: C.primary, textTransform: 'uppercase' }}>
              {label ? `Duivelseiland · ${label}` : 'Duivelseiland'}
            </div>
          </div>

          <div style={{ display: 'flex', fontSize: titelGrootte(title), lineHeight: 1.1, marginTop: 28, letterSpacing: -1 }}>{title}</div>

          {zichtbareRegels.length > 0 || korteTekst ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 28, borderTop: `2px solid ${C.text}`, paddingTop: 20 }}>
              {zichtbareRegels.map((regel, i) => (
                <div key={regel} style={{ display: 'flex', fontSize: i === 0 ? 34 : 30 }}>
                  {regel}
                </div>
              ))}
              {korteTekst ? (
                <div
                  style={{
                    display: 'block',
                    fontSize: 27,
                    lineHeight: 1.35,
                    color: C.muted,
                    marginTop: zichtbareRegels.length > 0 ? 10 : 0,
                    lineClamp: zichtbareRegels.length > 0 ? 2 : 4,
                  }}
                >
                  {korteTekst}
                </div>
              ) : null}
            </div>
          ) : null}

          <div style={{ display: 'flex', marginTop: 'auto', fontSize: 22, color: C.muted }}>{siteHost}</div>
        </div>
      </div>
    ),
    SIZE,
  );

  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': png.headers.get('Cache-Control') ?? 'public, max-age=0, must-revalidate',
    },
  });
}
