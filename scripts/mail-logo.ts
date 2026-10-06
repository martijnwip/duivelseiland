import path from 'path';
import sharp from 'sharp';

// Mailclients (Gmail, Outlook) tonen geen SVG. Dit zet de logo's om naar PNG voor de nieuwsbriefmail
// (src/lib/nieuwsbrief/editieMail.ts), op dubbele grootte voor scherpe weergave op retina.
// Opnieuw draaien na een wijziging aan het embleem: bun run scripts/mail-logo.ts

const dir = path.join(process.cwd(), 'public/logo');
const logos = [
  { bron: 'duivelseiland-badge.svg', doel: 'mail-badge.png', breedte: 112 },
  { bron: 'duivelseiland-embleem.svg', doel: 'mail-embleem.png', breedte: 192 },
];

for (const { bron, doel, breedte } of logos) {
  const info = await sharp(path.join(dir, bron), { density: 300 })
    .resize({ width: breedte })
    .png({ compressionLevel: 9 })
    .toFile(path.join(dir, doel));
  console.log(`[mail-logo] ${doel}: ${info.width}×${info.height}, ${info.size} bytes`);
}
