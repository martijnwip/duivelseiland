import { DAG, json, safe } from '@/lib/afval/api';
import type { Result } from '@/lib/afval/types';

/**
 * Parkeertarieven uit RDW Open Data Parkeren (landelijk, per gemeente). RDW zegt niet welke straat in welke
 * zone ligt; Duivelseiland valt in tariefzone T12A (regeling BP12A, "ma-za 09-24 zo 12-24"). Dat klopt met
 * de tarievenkaart op amsterdam.nl. Verandert de zone, dan hier aanpassen.
 */
const RDW = 'https://opendata.rdw.nl/resource';
const GEMEENTE = '363';
const REGELING = 'BP12A';
const UURTARIEF = 'TC2';
/** Dagkaarten bij de parkeerautomaat die passen bij de betaaltijden van T12A. */
const KAARTEN = { dag: 'TC2_D0924', zondag: 'TC2_Z1224', avond: 'TC2_A1924' } as const;

/** Korting met de bezoekersvergunning in Zuid (amsterdam.nl, parkeervergunning voor uw bezoek). */
export const BEZOEK_KORTING = 0.65;

export type Betaaltijd = { dagen: 'ma-za' | 'zo'; van: string; tot: string };
export type Tarieven = { perUur: number; betaaltijden: Betaaltijd[]; kaarten: Record<keyof typeof KAARTEN, number>; sinds: string };

type Tariefdeel = { farecalculationcode: string; amountfarepart: string; stepsizefarepart: string; startdatefarepart: string };
type Tijdvak = { daytimeframe: string; starttimetimeframe: string; endtimetimeframe: string; farecalculationcode?: string };

const vandaag = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');
const soql = (dataset: string, where: string) => `${RDW}/${dataset}.json?${new URLSearchParams({ $where: where, $limit: '200' })}`;
const tijd = (hhmm: string) => `${hhmm.padStart(4, '0').slice(0, 2)}:${hhmm.padStart(4, '0').slice(2)}`;

export function getTarieven(): Promise<Result<Tarieven>> {
  return safe('parkeertarieven', async () => {
    const nu = vandaag();
    const codes = [UURTARIEF, ...Object.values(KAARTEN)].map((c) => `'${c}'`).join(',');
    const [delen, tijdvakken] = await Promise.all([
      json<Tariefdeel[]>(soql('534e-5vdg', `areamanagerid='${GEMEENTE}' AND farecalculationcode in(${codes}) AND startdatefarepart<='${nu}' AND enddatefarepart>'${nu}'`), DAG),
      json<Tijdvak[]>(soql('ixf8-gtwq', `areamanagerid='${GEMEENTE}' AND regulationid='${REGELING}' AND enddatetimeframe>'${nu}'`), DAG),
    ]);

    const deel = (code: string) => {
      const d = delen.find((x) => x.farecalculationcode === code);
      if (!d) throw new Error(`tariefcode ${code} ontbreekt`);
      return d;
    };
    // Het uurtarief staat per minuut (stap van 1 minuut); een dagkaart is één stap met een vast bedrag.
    const uur = deel(UURTARIEF);
    const perUur = Math.round((Number(uur.amountfarepart) * 60) / Number(uur.stepsizefarepart) * 100) / 100;

    const betaald = tijdvakken.filter((t) => t.farecalculationcode === UURTARIEF);
    const vak = (dag: string) => betaald.find((t) => t.daytimeframe === dag);
    const werkdag = vak('MAANDAG');
    const zondag = vak('ZONDAG');
    if (!werkdag) throw new Error(`geen betaaltijden voor ${REGELING}`);
    const betaaltijden: Betaaltijd[] = [{ dagen: 'ma-za', van: tijd(werkdag.starttimetimeframe), tot: tijd(werkdag.endtimetimeframe) }];
    if (zondag) betaaltijden.push({ dagen: 'zo', van: tijd(zondag.starttimetimeframe), tot: tijd(zondag.endtimetimeframe) });

    return {
      perUur,
      betaaltijden,
      kaarten: { dag: Number(deel(KAARTEN.dag).amountfarepart), zondag: Number(deel(KAARTEN.zondag).amountfarepart), avond: Number(deel(KAARTEN.avond).amountfarepart) },
      sinds: uur.startdatefarepart,
    };
  });
}
