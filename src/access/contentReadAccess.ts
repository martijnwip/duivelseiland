import type { Access, Where } from 'payload';
import { hasRoleAtLeast } from './roles';

/**
 * Unauthenticated: published-only. The document's own author: also sees
 * their own non-published drafts. Redacteur/admin: unrestricted.
 */
export const publishedOrOwn =
  (ownerField = 'author'): Access =>
  ({ req }): boolean | Where => {
    if (!req.user) {
      return { status: { equals: 'published' } };
    }
    if (hasRoleAtLeast(req.user.role, 'redacteur')) {
      return true;
    }
    return {
      or: [{ status: { equals: 'published' } }, { [ownerField]: { equals: req.user.id } }],
    };
  };

/**
 * Unauthenticated: published-only. Redacteur/admin: unrestricted. Any other
 * authenticated user (auteur): no access at all.
 */
export const publishedOrRedacteur: Access = ({ req }): boolean | Where => {
  if (!req.user) {
    return { status: { equals: 'published' } };
  }
  return hasRoleAtLeast(req.user.role, 'redacteur');
};
