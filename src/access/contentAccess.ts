import type { CollectionConfig } from 'payload';
import { isAuthorOrAbove, isRedacteurOrAdmin } from './isAdmin';
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
