/** Zet platte tekst om naar een Lexical-document: één alinea per blok, enkele regeleinden blijven behouden. */
export function tekstNaarLexical(tekst: string) {
  const alineas = tekst
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((a) => a.trim())
    .filter(Boolean);

  const tekstNode = (text: string) => ({ type: 'text', version: 1, text, format: 0, style: '', mode: 'normal', detail: 0 });

  return {
    root: {
      type: 'root',
      version: 1,
      format: '' as const,
      indent: 0,
      direction: 'ltr' as const,
      children: alineas.map((alinea) => ({
        type: 'paragraph',
        version: 1,
        format: '',
        indent: 0,
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
        children: alinea
          .split('\n')
          .flatMap((regel, i) => (i === 0 ? [tekstNode(regel)] : [{ type: 'linebreak', version: 1 }, tekstNode(regel)])),
      })),
    },
  };
}

/** Platte tekst uit een Lexical-document, voor mails en de korte omschrijving op kaarten. */
export function lexicalNaarTekst(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as { text?: unknown; type?: unknown; children?: unknown; root?: unknown };
  if (n.root) return lexicalNaarTekst(n.root);
  if (typeof n.text === 'string') return n.text;
  if (n.type === 'linebreak') return '\n';
  if (!Array.isArray(n.children)) return '';
  const sep = n.type === 'root' ? '\n\n' : '';
  return n.children.map(lexicalNaarTekst).join(sep);
}
