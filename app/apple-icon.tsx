import { readFile } from 'fs/promises';
import { join } from 'path';
import { ImageResponse } from 'next/og';

// Apple touch icon: het rode duivelskopje op wit (het embleem is op 180px niet leesbaar).
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), 'public/logo/duivel-rood.svg'), 'utf8');
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={140} height={140} alt="" />
      </div>
    ),
    size,
  );
}
