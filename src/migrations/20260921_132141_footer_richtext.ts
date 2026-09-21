import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite';

// site-instellingen.footer gaat van textarea naar richText (Lexical). De kolom
// blijft `text`; alleen de inhoud verandert van platte tekst naar Lexical-JSON.
// Bestaande tekst kan letterlijke <a href="...">-tags bevatten (zo werd een link
// tot nu toe "ondersteund"); die worden echte links.

export type Row = { id: number; footer: string };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isRow = (value: unknown): value is Row =>
  isRecord(value) && typeof value.id === 'number' && typeof value.footer === 'string' && value.footer !== '';

export const isLexicalJson = (value: string) => value.trimStart().startsWith('{"root"');

const textNode = (text: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
});

const linkNode = (url: string, newTab: boolean, text: string) => ({
  type: 'link',
  id: crypto.randomUUID().replace(/-/g, '').slice(0, 24),
  fields: { linkType: 'custom', newTab, url },
  format: '',
  indent: 0,
  version: 3,
  direction: 'ltr',
  children: [textNode(text)],
});

const paragraph = (children: unknown[]) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  textStyle: '',
  children,
});

/** `martijnwip.nl` zonder schema zou als relatieve link eindigen; `/pad`, `#anker` en `mailto:` blijven staan. */
function normalizeUrl(href: string): string {
  const url = href.trim();
  if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url)) return url;
  return `https://${url}`;
}

function readAttribute(attributes: string, name: string): string | undefined {
  return new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i').exec(attributes)?.[1];
}

/** Zet één regel om naar tekst- en linkknopen; alleen <a>-tags worden herkend. */
function lineToNodes(line: string): unknown[] {
  const nodes: unknown[] = [];
  const anchor = /<a\s+([^>]*)>(.*?)<\/a>/gis;
  let last = 0;

  for (const match of line.matchAll(anchor)) {
    const before = line.slice(last, match.index);
    if (before) nodes.push(textNode(before));

    const href = readAttribute(match[1], 'href');
    const text = match[2].replace(/<[^>]*>/g, '');
    if (href && text) {
      nodes.push(linkNode(normalizeUrl(href), /_blank/i.test(readAttribute(match[1], 'target') ?? ''), text));
    } else if (text) {
      nodes.push(textNode(text));
    }
    last = match.index + match[0].length;
  }

  const rest = line.slice(last);
  if (rest) nodes.push(textNode(rest));
  return nodes;
}

/** Lege regel = nieuwe alinea, enkele regeleinde = linebreak binnen de alinea. */
export function plainTextToLexical(text: string): string {
  const paragraphs = text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const children: unknown[] = [];
      block.split('\n').forEach((line, index) => {
        if (index > 0) children.push({ type: 'linebreak', version: 1 });
        children.push(...lineToNodes(line));
      });
      return paragraph(children);
    });

  return JSON.stringify({
    root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: paragraphs },
  });
}

const escapeAttribute = (value: string) => value.replace(/"/g, '&quot;');

const nodeToPlainText = (node: unknown): string => {
  if (!isRecord(node)) return '';
  if (node.type === 'linebreak') return '\n';
  if (node.type === 'text') return typeof node.text === 'string' ? node.text : '';

  const inner = Array.isArray(node.children) ? node.children.map(nodeToPlainText).join('') : '';
  if (node.type === 'link' && isRecord(node.fields) && typeof node.fields.url === 'string') {
    const target = node.fields.newTab === true ? ' target="_blank"' : '';
    return `<a href="${escapeAttribute(node.fields.url)}"${target}>${inner}</a>`;
  }
  return inner;
};

function lexicalToPlainText(json: string): string {
  const parsed: unknown = JSON.parse(json);
  const children = isRecord(parsed) && isRecord(parsed.root) ? parsed.root.children : undefined;
  return Array.isArray(children) ? children.map(nodeToPlainText).join('\n\n') : '';
}

export async function readRows(db: MigrateUpArgs['db']): Promise<Row[]> {
  const rows: unknown[] = await db.all(
    sql`SELECT id, footer FROM \`site_instellingen_locales\` WHERE footer IS NOT NULL`,
  );
  return rows.filter(isRow);
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const { id, footer } of await readRows(db)) {
    if (isLexicalJson(footer)) continue;
    await db.run(sql`UPDATE \`site_instellingen_locales\` SET footer = ${plainTextToLexical(footer)} WHERE id = ${id}`);
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const { id, footer } of await readRows(db)) {
    if (!isLexicalJson(footer)) continue;
    await db.run(sql`UPDATE \`site_instellingen_locales\` SET footer = ${lexicalToPlainText(footer)} WHERE id = ${id}`);
  }
}
