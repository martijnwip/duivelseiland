import { cache } from 'react';
import { cookies } from 'next/headers';
import { getPayload } from 'payload';
import config from '@payload-config';
import { COOKIE_NAAM, leesCookieWaarde } from './cookie';

const DAG_MS = 24 * 60 * 60 * 1000;

/**
 * Heeft deze bezoeker een geldige buurtpas? Alleen in server components en server actions. De handtekening
 * alleen is niet genoeg: het adres moet nog in het adresboek staan, niet ingetrokken zijn en dezelfde
 * versie hebben (zo werken intrekken en "uit het adresboek verwijderen" meteen). Leest cookies, dus de
 * pagina wordt per request gerenderd.
 */
export const heeftBuurtpas = cache(async (): Promise<boolean> => {
  const inhoud = await leesCookieWaarde((await cookies()).get(COOKIE_NAAM)?.value);
  if (!inhoud) return false;

  const payload = await getPayload({ config });
  const adres = await payload.findByID({
    collection: 'email-adressen',
    id: inhoud.adresId,
    depth: 0,
    disableErrors: true,
    overrideAccess: true,
  });
  if (!adres || adres.buurtpasIngetrokken || (adres.buurtpasVersie ?? 1) !== inhoud.versie) return false;

  // Hooguit één keer per dag bijwerken, niet bij elke paginaweergave.
  const laatst = adres.buurtpasLaatstGebruikt ? new Date(adres.buurtpasLaatstGebruikt).getTime() : 0;
  if (Date.now() - laatst > DAG_MS) {
    try {
      await payload.update({
        collection: 'email-adressen',
        id: adres.id,
        data: { buurtpasLaatstGebruikt: new Date().toISOString() },
        overrideAccess: true,
        context: { geenPromotie: true },
      });
    } catch (error) {
      payload.logger.error(`[buurtpas] laatst gebruikt bijwerken mislukt: ${error}`);
    }
  }
  return true;
});

/** Alleen een lokaal pad (geen open redirect naar een andere site). */
export function veiligTerugpad(pad: unknown, standaard = '/') {
  return typeof pad === 'string' && pad.startsWith('/') && !pad.startsWith('//') && !pad.includes('\\') ? pad : standaard;
}
