import { translateText } from './engines';

type LexicalNode = {
  type?: string;
  text?: string;
  children?: LexicalNode[];
  [key: string]: unknown;
};
export type LexicalDocument = { root: LexicalNode };

async function translateLexicalNode(node: LexicalNode): Promise<boolean> {
  if (node.type === 'text' && typeof node.text === 'string') {
    // De engine geeft getrimde tekst terug; spaties aan de randen (bijv. "website by "
    // vóór een link) zijn betekenisvol en moeten blijven staan.
    const [, leading = '', content = '', trailing = ''] = /^(\s*)([\s\S]*?)(\s*)$/.exec(node.text) ?? [];
    const translated = await translateText(content);
    if (translated === null) return false;
    node.text = leading + translated + trailing;
    return true;
  }

  let ok = true;
  for (const child of node.children ?? []) {
    if (!(await translateLexicalNode(child))) ok = false;
  }
  return ok;
}

/**
 * Deep-clones and translates a Lexical richText value NL -> EN, mutating
 * only `text` on `type: 'text'` leaves. TS port of translate_lexical_field /
 * translate_lexical_node in translate/translate.py.
 */
export async function translateLexicalField(value: LexicalDocument): Promise<{ value: LexicalDocument; ok: boolean }> {
  const cloned: LexicalDocument = structuredClone(value);
  if (!cloned?.root) return { value: cloned, ok: false };
  const ok = await translateLexicalNode(cloned.root);
  return { value: cloned, ok };
}
