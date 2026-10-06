import type { CollectionConfig } from 'payload';
import { isAdmin, isAuthorOrAbove, isRedacteurOrAdmin } from './isAdmin';
import { hasRoleAtLeast } from './roles';
import { publishedOrOwn, publishedOrRedacteur } from './contentReadAccess';
import { isOwnerOrRedacteur } from './isOwnerOrRedacteur';

type ContentAccess = NonNullable<CollectionConfig['access']>;

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

/** Admin only; bezoekers zien gepubliceerde items, redacteur en auteur zien de collection niet (bv. Interviews). */
export const adminOnlyContentAccess: ContentAccess = {
  read: ({ req }) => {
    if (!req.user) return { status: { equals: 'published' } };
    return hasRoleAtLeast(req.user.role, 'admin');
  },
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
};
