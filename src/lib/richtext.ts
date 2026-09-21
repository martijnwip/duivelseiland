function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** True als de Lexical-knoop (of een van zijn kinderen) niet-lege tekst bevat. */
export function hasLexicalText(node: unknown): boolean {
  if (!isRecord(node)) return false;
  if (typeof node.text === 'string' && node.text.trim() !== '') return true;
  return Array.isArray(node.children) && node.children.some(hasLexicalText);
}

/**
 * Type guard voor een richText-waarde met echte tekst. Een leeggemaakt veld
 * laat een lege alinea achter, dus "niet null" is niet genoeg om te renderen.
 */
export function hasRichTextContent<T extends { root: unknown }>(value: T | null | undefined): value is T {
  return value != null && hasLexicalText(value.root);
}
