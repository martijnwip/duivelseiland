/** "glazenwasser" → "Glazenwasser", "ijzerwerker" → "IJzerwerker" (de ij is in het Nederlands één letter). */
export function metHoofdletter(naam: string) {
  const t = naam.trim();
  if (/^ij/i.test(t)) return `IJ${t.slice(2)}`;
  return t.charAt(0).toLocaleUpperCase('nl') + t.slice(1);
}
