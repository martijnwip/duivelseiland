import { readFile } from 'fs/promises';
import { join } from 'path';
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import sharp from 'sharp';
import { haalDeelinfo, type DeelCollectie } from '@/lib/deelinfo';

/**
 * Deelafbeelding (1200×630) voor een nieuws- of agenda-item: links de afbeelding van het item,
 * rechts titel, datum en voor de agenda tijd en plek, voor het nieuws de eerste zinnen.
 * Het resultaat is een JPEG, zodat het ruim onder de grens van WhatsApp (~600 kB) blijft.
 */
const deelSize = { width: 1200, height: 630 };
const deelContentType = 'image/jpeg';

const C = { bg: '#f3eee4', card: '#ffffff', text: '#202020', muted: '#5f5f5f', border: '#c9c2b4', primary: '#00893c' };
const FOTO = { width: 460, height: 630 };

async function fotoDataUrl(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(FOTO.width, FOTO.height, { fit: 'cover' })
      .jpeg({ quality: 72 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  } catch {
    return null;
  }
}

export async function deelAfbeelding(collectie: DeelCollectie, slug: string, locale: 'nl' | 'en') {
  const [info, t, badge] = await Promise.all([
    haalDeelinfo(collectie, slug, locale),
    getTranslations({ locale, namespace: 'content.deel' }),
    readFile(join(process.cwd(), 'public/logo/mail-badge.png')),
  ]);
  const foto = await fotoDataUrl(info?.imageUrl ?? null);
  const badgeSrc = `data:image/png;base64,${badge.toString('base64')}`;
  const title = info?.title ?? 'Duivelseiland';
  const lang = title.length > 60;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const siteHost = serverUrl && URL.canParse(serverUrl) ? new URL(serverUrl).host : 'duivelseiland.amsterdam';

  const png = new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: C.bg, color: C.text }}>
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} width={FOTO.width} height={FOTO.height} alt="" style={{ objectFit: 'cover' }} />
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '48px 56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={badgeSrc} width={52} height={52} alt="" />
            <div style={{ display: 'flex', fontSize: 24, letterSpacing: 4, color: C.primary, textTransform: 'uppercase' }}>
              {`Duivelseiland · ${t(collectie)}`}
            </div>
          </div>

          <div style={{ display: 'flex', fontSize: lang ? 48 : 58, lineHeight: 1.1, marginTop: 28, letterSpacing: -1 }}>{title}</div>

          {/* Agenda: wanneer en waar. Nieuws: de eerste zinnen (de publicatiedatum doet er voor een deellink weinig toe). */}
          {collectie === 'agenda' && (info?.datum || info?.wanneerWaar) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 28, borderTop: `2px solid ${C.text}`, paddingTop: 20 }}>
              {info.datum ? <div style={{ display: 'flex', fontSize: 34 }}>{info.datum}</div> : null}
              {info.wanneerWaar ? <div style={{ display: 'flex', fontSize: 30 }}>{info.wanneerWaar}</div> : null}
            </div>
          ) : null}

          {collectie === 'nieuws' && info?.description ? (
            <div style={{ display: 'flex', marginTop: 28, borderTop: `2px solid ${C.text}`, paddingTop: 20 }}>
              <div style={{ display: 'block', fontSize: 27, lineHeight: 1.35, color: C.muted, lineClamp: 4 }}>{info.description}</div>
            </div>
          ) : null}

          <div style={{ display: 'flex', marginTop: 'auto', fontSize: 22, color: C.muted }}>{siteHost}</div>
        </div>
      </div>
    ),
    deelSize,
  );

  // Een foto als PNG is al snel ~600 kB, de grens van WhatsApp; als JPEG is het een fractie daarvan.
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      'Content-Type': deelContentType,
      'Cache-Control': png.headers.get('Cache-Control') ?? 'public, max-age=0, must-revalidate',
    },
  });
}
