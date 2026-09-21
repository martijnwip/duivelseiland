export type Formatters = ReturnType<typeof makeFormatters>;

/** Getalnotatie per locale (nl: 1.381 / 0,34; en: 1,381 / 0.34). */
export function makeFormatters(locale: string) {
  const cache = new Map<number, Intl.NumberFormat>();
  const nf = (dec: number) => {
    let f = cache.get(dec);
    if (!f) {
      f = new Intl.NumberFormat(locale, { minimumFractionDigits: dec, maximumFractionDigits: dec });
      cache.set(dec, f);
    }
    return f;
  };
  const num = (n: number, dec = 0) => nf(dec).format(n);
  /** Zo veel decimalen als nodig (max 1): 5 -> "5", 0,3 -> "0,3". */
  const auto = (n: number) => num(n, Number.isInteger(n) ? 0 : 1);
  return {
    num,
    auto,
    eur: (n: number) => `€\u00a0${num(n)}`,
    eurK: (n: number) => (n ? `€\u00a0${num(n / 1000)}k` : '€\u00a00'),
    pct: (n: number, dec = 0) => `${num(n, dec)}%`,
    km: (n: number) => `${num(n, 1)} km`,
    factor: (n: number) => `${n >= 10 ? num(n, 0) : num(n, 1)}×`,
  };
}
