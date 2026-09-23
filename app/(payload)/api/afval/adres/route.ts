import { NextResponse, type NextRequest } from 'next/server';
import { getRegelsVoorAdres } from '@/lib/afval/api';

/** Afvalregels voor één adres: ?postcode=1071TS&huisnummer=23&toevoeging=H */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const postcode = (sp.get('postcode') ?? '').replace(/\s/g, '').toUpperCase();
  const huisnummer = Number(sp.get('huisnummer'));
  const toevoeging = (sp.get('toevoeging') ?? '').slice(0, 8);
  if (!/^[1-9]\d{3}[A-Z]{2}$/.test(postcode) || !Number.isInteger(huisnummer) || huisnummer < 1 || huisnummer > 99999) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  try {
    const regels = await getRegelsVoorAdres(postcode, huisnummer, toevoeging);
    return NextResponse.json({ regels }, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' } });
  } catch (e) {
    console.error('[afval] adrescheck mislukt:', e);
    return NextResponse.json({ error: 'unavailable' }, { status: 502 });
  }
}
