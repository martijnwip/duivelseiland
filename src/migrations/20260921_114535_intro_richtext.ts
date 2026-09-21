import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

// site-instellingen.intro gaat van textarea naar richText (Lexical). De kolom
// blijft `text`; alleen de inhoud verandert van platte tekst naar Lexical-JSON.

type Row = { id: number; intro: string | null }

const isLexicalJson = (value: string) => value.trimStart().startsWith('{"root"')

const paragraph = (children: unknown[]) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  textStyle: '',
  children,
})

const textNode = (text: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

/** Lege regel = nieuwe alinea, enkele regeleinde = linebreak binnen de alinea. */
function plainTextToLexical(text: string): string {
  const paragraphs = text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const children: unknown[] = [];
      block.split('\n').forEach((line, index) => {
        if (index > 0) children.push({ type: 'linebreak', version: 1 });
        if (line) children.push(textNode(line));
      });
      return paragraph(children);
    });

  return JSON.stringify({
    root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: paragraphs },
  });
}

type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] };

const nodeToPlainText = (node: LexicalNode): string => {
  if (node.type === 'linebreak') return '\n';
  if (node.type === 'text') return node.text ?? '';
  return (node.children ?? []).map(nodeToPlainText).join('');
};

function lexicalToPlainText(json: string): string {
  const root = (JSON.parse(json) as { root: LexicalNode }).root;
  return (root.children ?? []).map(nodeToPlainText).join('\n\n');
}

async function readRows(db: MigrateUpArgs['db']): Promise<Row[]> {
  return (await db.all(sql`SELECT id, intro FROM \`site_instellingen_locales\` WHERE intro IS NOT NULL`)) as Row[];
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const { id, intro } of await readRows(db)) {
    if (!intro || isLexicalJson(intro)) continue;
    await db.run(sql`UPDATE \`site_instellingen_locales\` SET intro = ${plainTextToLexical(intro)} WHERE id = ${id}`);
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const { id, intro } of await readRows(db)) {
    if (!intro || !isLexicalJson(intro)) continue;
    await db.run(sql`UPDATE \`site_instellingen_locales\` SET intro = ${lexicalToPlainText(intro)} WHERE id = ${id}`);
  }
}
