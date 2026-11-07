import { readFile } from 'fs/promises';
import { join } from 'path';
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import sharp from 'sharp';

/** Deelafbeelding (WhatsApp, sociale media): Mimi's paspoort met stempel. */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Rij = { label: string; value: string };

const C = { bg: '#f3eee4', card: '#ffffff', text: '#202020', muted: '#767676', border: '#c9c2b4', primary: '#00893c', accent: '#ec0000' };

export const alt = "Mimi, de buurtmascotte van Duivelseiland / the neighborhood mascot of Duivelseiland";

// Next 15 geeft params als object, Next 16 als Promise; await werkt voor allebei.
export default async function Image({ params }: { params: { locale: string } | Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.mascotte' });
  const rijen = t.raw('paspoort.rows') as Rij[];
  // Woont bij, specialiteit, keer 'gevonden'; de naam staat groot bovenaan.
  const getoond = [rijen[1], rijen[4], rijen[5]];

  // Klein en als JPEG ingebed, zodat de PNG onder de grens van WhatsApp (~600 kB) blijft.
  const foto = await sharp(await readFile(join(process.cwd(), 'public/mascotte/mimi-1.jpg')))
    .resize(380, 475, { fit: 'cover' })
    .jpeg({ quality: 72 })
    .toBuffer();
  const fotoSrc = `data:image/jpeg;base64,${foto.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', background: C.bg, padding: '0 64px', gap: 56, color: C.text }}>
        {/* Polaroid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: C.card,
            padding: '18px 18px 14px',
            transform: 'rotate(-4deg)',
            boxShadow: '0 18px 40px rgba(0,0,0,0.22)',
            border: `1px solid ${C.border}`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoSrc} width={380} height={475} alt="" style={{ objectFit: 'cover' }} />
          <div style={{ marginTop: 12, fontSize: 30, color: C.muted, fontStyle: 'italic' }}>Hobbemakade</div>
        </div>

        {/* Paspoort */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            background: C.card,
            border: `3px dashed ${C.border}`,
            borderRadius: 18,
            padding: '36px 40px 34px',
          }}
        >
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 4, color: C.primary, textTransform: 'uppercase' }}>
            {`Duivelseiland · ${t('paspoort.title')}`}
          </div>
          <div style={{ display: 'flex', fontSize: 92, lineHeight: 1, marginTop: 14, letterSpacing: -2 }}>Mimi</div>
          <div style={{ display: 'flex', fontSize: 30, marginTop: 10, color: C.text }}>{t('title')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 26, gap: 14, borderTop: `2px solid ${C.text}`, paddingTop: 22 }}>
            {getoond.map((r) => (
              <div key={r.label} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', fontSize: 17, letterSpacing: 2, color: C.muted, textTransform: 'uppercase' }}>{r.label}</div>
                <div style={{ display: 'flex', fontSize: 27, marginTop: 2 }}>{r.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stempel */}
        <div
          style={{
            position: 'absolute',
            right: 690,
            top: 392,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: `5px solid ${C.accent}`,
            borderRadius: 14,
            padding: '10px 18px',
            color: C.accent,
            transform: 'rotate(-14deg)',
            background: 'rgba(255,255,255,0.9)',
          }}
        >
          <div style={{ display: 'flex', fontSize: 24, letterSpacing: 3, textTransform: 'uppercase' }}>{t('og.stempelBoven')}</div>
          <div style={{ display: 'flex', fontSize: 30, letterSpacing: 3, textTransform: 'uppercase' }}>{t('og.stempelOnder')}</div>
        </div>
      </div>
    ),
    size,
  );
}
