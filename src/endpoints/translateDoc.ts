import type { CollectionSlug, Endpoint, GlobalSlug } from 'payload';
import { hasRoleAtLeast } from '../access/roles';
import { translateText } from '../lib/translate-live/engines';
import { translateLexicalField } from '../lib/translate-live/lexical';
import { findTranslatableLeaves, projectDocumentForLocale } from '../lib/translate-live/field-walker';

// Onderdelen die alleen de admin beheert (zie de access op die collections/globals).
const ADMIN_ONLY = new Set([
  'site-instellingen',
  'over-de-naam',
  'geschiedenis-verhaal',
  'interviews',
  'geschiedenis',
  'duivelse-kunst',
]);

export const translateDocEndpoint: Endpoint = {
  path: '/translate-doc',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Niet ingelogd.' }, { status: 401 });

    const body = ((await req.json?.()) ?? {}) as {
      collection?: CollectionSlug;
      global?: GlobalSlug;
      id?: string | number;
    };
    const { collection, global, id } = body;

    if (!collection && !global) {
      return Response.json({ error: 'collection of global is verplicht.' }, { status: 400 });
    }
    if (collection && !id) {
      return Response.json({ error: 'id is verplicht voor een collection.' }, { status: 400 });
    }

    const minRole = ADMIN_ONLY.has(String(collection ?? global)) ? 'admin' : 'redacteur';
    if (!hasRoleAtLeast(req.user.role, minRole)) {
      return Response.json({ error: 'Onvoldoende rechten.' }, { status: 403 });
    }

    const fieldsDef = collection
      ? req.payload.config.collections.find((c) => c.slug === collection)?.fields
      : req.payload.config.globals.find((g) => g.slug === global)?.fields;
    if (!fieldsDef) {
      return Response.json({ error: 'Onbekende collection/global.' }, { status: 404 });
    }

    const doc = collection
      ? await req.payload.findByID({ collection, id: id!, locale: 'all', depth: 0, overrideAccess: true })
      : await req.payload.findGlobal({ slug: global!, locale: 'all', depth: 0, overrideAccess: true });

    const leaves = findTranslatableLeaves(fieldsDef, doc as unknown as Record<string, unknown>);

    const stats = { translated: 0, failed: 0 };
    const overrides = new Map<string, unknown>();

    for (const leaf of leaves) {
      if (leaf.kind === 'lexical') {
        const { value, ok } = await translateLexicalField(leaf.nl as any);
        if (ok) {
          overrides.set(leaf.path.join('.'), value);
          stats.translated++;
        } else {
          stats.failed++;
        }
      } else {
        const translated = await translateText(leaf.nl as string);
        if (translated !== null) {
          overrides.set(leaf.path.join('.'), translated);
          stats.translated++;
        } else {
          stats.failed++;
        }
      }
    }

    if (overrides.size > 0) {
      const fullProjection = projectDocumentForLocale(fieldsDef, doc as unknown as Record<string, unknown>, overrides);
      const dirtyTopNames = new Set(
        leaves.filter((l) => overrides.has(l.path.join('.'))).map((l) => String(l.path[0])),
      );
      const patch = Object.fromEntries(Array.from(dirtyTopNames).map((name) => [name, fullProjection[name]]));

      if (collection) {
        await req.payload.update({
          collection,
          id: id!,
          locale: 'en',
          data: patch,
          depth: 0,
          overrideAccess: true,
        });
      } else {
        await req.payload.updateGlobal({
          slug: global!,
          locale: 'en',
          data: patch,
          depth: 0,
          overrideAccess: true,
        });
      }
    }

    return Response.json(stats);
  },
};
