import type { Access } from 'payload';
import { hasRoleAtLeast } from './roles';

/**
 * Redacteur/admin: unrestricted. Anyone else: only their own documents,
 * via a query constraint on `ownerField` (e.g. `author`, `uploadedBy`).
 */
export const isOwnerOrRedacteur =
  (ownerField: string): Access =>
  ({ req }) => {
    if (!req.user) return false;
    if (hasRoleAtLeast(req.user.role, 'redacteur')) return true;
    return { [ownerField]: { equals: req.user.id } };
  };
