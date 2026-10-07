import type { CollectionConfig } from 'payload';
import { isAdmin, isAuthorOrAbove, isRedacteurOrAdmin } from './isAdmin';
import { hasRoleAtLeast } from './roles';
import type { Where } from 'payload';
import { publishedOrOwn, publishedOrRedacteur } from './contentReadAccess';
import { isOwnerOrRedacteur } from './isOwnerOrRedacteur';

type ContentAccess = NonNullable<CollectionConfig['access']>;

/**
 * Wat een niet-ingelogde aanroeper van de REST- of GraphQL-API ziet van een collection met contentFields():
 * gepubliceerd en niet "alleen voor de buurt". De site leest via de Local API en toont buurtitems pas na de
 * buurtpascheck (src/lib/buurtpas).
 */
export const publiekZichtbaar: Where = {
  and: [
    { status: { equals: 'published' } },
    { or: [{ alleenBuurt: { equals: false } }, { alleenBuurt: { exists: false } }] },
  ],
};

/** Dezelfde rechten, maar bezoekers zien geen buurtitems. Alleen voor collections met het veld `alleenBuurt`. */
export const zonderBuurtitems = (access: ContentAccess): ContentAccess => ({
  ...access,
  read: (args) => (args.req.user ? access.read!(args) : publiekZichtbaar),
});

/** Auteur (own items, draft-only), redacteur/admin (everything). */
export const authoredContentAccess: ContentAccess = {
  read: publishedOrOwn(),
  create: isAuthorOrAbove,
  update: isOwnerOrRedacteur('author'),
  delete: isOwnerOrRedacteur('author'),
};

/** Redacteur/admin only; auteur has no access at all (e.g. Praktische info). */
export const editorOnlyContentAccess: ContentAccess = {
  read: publishedOrRedacteur,
  create: isRedacteurOrAdmin,
  update: isRedacteurOrAdmin,
  delete: isRedacteurOrAdmin,
};

/** Admin only; bezoekers zien gepubliceerde items (geen buurtitems), redacteur en auteur zien de collection niet (bv. Interviews). */
export const adminOnlyContentAccess: ContentAccess = {
  read: ({ req }) => {
    if (!req.user) return publiekZichtbaar;
    return hasRoleAtLeast(req.user.role, 'admin');
  },
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
};
