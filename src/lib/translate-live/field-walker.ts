import type { Field } from 'payload';
import { hasLexicalText } from '../richtext';

export type TranslatableLeaf = {
  /** e.g. ['title'] or ['menu', 0, 'label'] */
  path: (string | number)[];
  kind: 'string' | 'lexical';
  nl: unknown;
};

/**
 * Een opgeslagen "leeg" richText-veld bevat nog één lege alinea, dus telt een
 * Lexical-boom pas als gevuld als er echt tekst in staat.
 */
const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'object' && 'root' in value) return !hasLexicalText(value.root);
  return false;
};

/**
 * Recursively walks a Payload field config against the matching slice of a
 * `locale: 'all'`-fetched document, collecting every `localized: true`
 * text/textarea/richText leaf that has Dutch text. An existing English value
 * is deliberately overwritten: the Dutch text is the single source of truth.
 */
export function findTranslatableLeaves(
  fields: Field[],
  data: Record<string, unknown> | undefined | null,
  basePath: (string | number)[] = [],
): TranslatableLeaf[] {
  const out: TranslatableLeaf[] = [];
  const sibling = (data ?? {}) as Record<string, unknown>;

  for (const field of fields) {
    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'richText': {
        if (!field.localized || !('name' in field)) break;
        const value = sibling[field.name] as { nl?: unknown; en?: unknown } | undefined;
        if (!value || typeof value !== 'object') break;
        if (!isEmptyValue(value.nl)) {
          out.push({
            path: [...basePath, field.name],
            kind: field.type === 'richText' ? 'lexical' : 'string',
            nl: value.nl,
          });
        }
        break;
      }

      case 'group': {
        const name = 'name' in field ? field.name : undefined;
        const nested = name ? (sibling[name] as Record<string, unknown>) : sibling;
        const nestedPath = name ? [...basePath, name] : basePath;
        out.push(...findTranslatableLeaves(field.fields, nested, nestedPath));
        break;
      }

      case 'array': {
        const items = Array.isArray(sibling[field.name]) ? (sibling[field.name] as unknown[]) : [];
        items.forEach((item, index) => {
          out.push(
            ...findTranslatableLeaves(field.fields, item as Record<string, unknown>, [...basePath, field.name, index]),
          );
        });
        break;
      }

      case 'blocks': {
        const items = Array.isArray(sibling[field.name]) ? (sibling[field.name] as any[]) : [];
        items.forEach((item, index) => {
          const blockDef = field.blocks.find((b) => b.slug === item?.blockType);
          if (!blockDef) return; // unknown/removed block type - skip defensively
          out.push(...findTranslatableLeaves(blockDef.fields, item, [...basePath, field.name, index]));
        });
        break;
      }

      case 'tabs': {
        for (const tab of field.tabs) {
          const name = 'name' in tab ? tab.name : undefined;
          const nested = name ? (sibling[name] as Record<string, unknown>) : sibling;
          const nestedPath = name ? [...basePath, name] : basePath;
          out.push(...findTranslatableLeaves(tab.fields, nested, nestedPath));
        }
        break;
      }

      case 'row':
      case 'collapsible':
        out.push(...findTranslatableLeaves(field.fields, sibling, basePath));
        break;

      default:
        // relationship, upload, select, checkbox, date, number, ui, etc. -
        // never translated in this schema.
        break;
    }
  }

  return out;
}

/**
 * Given the SAME field config + `locale: 'all'` document, produces the full
 * `en`-locale projection of it (every field, not just localized ones),
 * substituting `overrides` at matching paths. Used to build a write-back
 * `data` object per top-level field: because Payload replaces array/blocks
 * fields wholesale on update, we must always pass back the complete,
 * reconstructed value for any top-level field that changed - not a sparse
 * dot-path patch.
 */
export function projectDocumentForLocale(
  fields: Field[],
  data: Record<string, unknown> | undefined | null,
  overrides: Map<string, unknown>,
  basePath: (string | number)[] = [],
): Record<string, unknown> {
  const sibling = (data ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const field of fields) {
    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'richText': {
        if (!('name' in field)) break;
        const path = [...basePath, field.name];
        const key = path.join('.');
        if (field.localized) {
          const value = sibling[field.name] as { en?: unknown } | undefined;
          out[field.name] = overrides.has(key)
            ? overrides.get(key)
            : value && typeof value === 'object'
              ? value.en
              : value;
        } else {
          out[field.name] = sibling[field.name];
        }
        break;
      }

      case 'group': {
        const name = 'name' in field ? field.name : undefined;
        if (name) {
          out[name] = projectDocumentForLocale(field.fields, sibling[name] as Record<string, unknown>, overrides, [
            ...basePath,
            name,
          ]);
        } else {
          Object.assign(out, projectDocumentForLocale(field.fields, sibling, overrides, basePath));
        }
        break;
      }

      case 'array': {
        const items = Array.isArray(sibling[field.name]) ? (sibling[field.name] as unknown[]) : [];
        out[field.name] = items.map((item, index) =>
          projectDocumentForLocale(field.fields, item as Record<string, unknown>, overrides, [
            ...basePath,
            field.name,
            index,
          ]),
        );
        break;
      }

      case 'blocks': {
        const items = Array.isArray(sibling[field.name]) ? (sibling[field.name] as any[]) : [];
        out[field.name] = items.map((item, index) => {
          const blockDef = field.blocks.find((b) => b.slug === item?.blockType);
          if (!blockDef) return item; // unknown block type - pass through untouched
          return {
            ...projectDocumentForLocale(blockDef.fields, item, overrides, [...basePath, field.name, index]),
            blockType: item.blockType,
            id: item.id,
          };
        });
        break;
      }

      case 'tabs': {
        for (const tab of field.tabs) {
          const name = 'name' in tab ? tab.name : undefined;
          if (name) {
            out[name] = projectDocumentForLocale(tab.fields, sibling[name] as Record<string, unknown>, overrides, [
              ...basePath,
              name,
            ]);
          } else {
            Object.assign(out, projectDocumentForLocale(tab.fields, sibling, overrides, basePath));
          }
        }
        break;
      }

      case 'row':
      case 'collapsible':
        Object.assign(out, projectDocumentForLocale(field.fields, sibling, overrides, basePath));
        break;

      default:
        // relationship, upload, select, checkbox, date, number, etc. - copy
        // through untouched.
        if ('name' in field && field.name) out[field.name] = sibling[field.name];
        break;
    }
  }

  return out;
}
