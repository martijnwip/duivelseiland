import { VIEW } from './constants';

export type Pt = [number, number];

/**
 * WGS84 (lat/lon) naar RD (EPSG:28992) met de polynomiale benadering van
 * Schreutelkamp & Strang van Hees; nauwkeurig tot circa een meter binnen Nederland.
 */
export function wgs84ToRd(lat: number, lon: number): Pt {
  const dP = 0.36 * (lat - 52.1551744);
  const dL = 0.36 * (lon - 5.38720621);
  const x =
    155000 +
    190094.945 * dL -
    11832.228 * dP * dL -
    114.221 * dP * dP * dL -
    32.391 * dL ** 3 -
    0.705 * dP -
    2.34 * dP ** 3 * dL -
    0.608 * dP * dL ** 3 -
    0.008 * dL * dL +
    0.148 * dP * dP * dL ** 3;
  const y =
    463000 +
    309056.544 * dP +
    3638.893 * dL * dL +
    73.077 * dP * dP -
    157.984 * dP * dL * dL +
    59.788 * dP ** 3 +
    0.433 * dL -
    6.439 * dP * dP * dL * dL -
    0.032 * dP * dL +
    0.092 * dL ** 4 -
    0.054 * dP * dL ** 4;
  return [x, y];
}

/** RD naar SVG-coördinaten van de basiskaart (meters vanaf linksboven). */
export const toView = ([x, y]: Pt): Pt => [x - VIEW.minX, VIEW.maxY - y];

export const inView = ([x, y]: Pt): boolean => x >= VIEW.minX && x <= VIEW.maxX && y >= VIEW.minY && y <= VIEW.maxY;

/** Midden van de buurt in RD, voor afstanden tot recyclepunten. */
export const BUURT_MIDDEN: Pt = [120730, 485190];

export const distanceM = (a: Pt, b: Pt): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
