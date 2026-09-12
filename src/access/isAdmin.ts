import type { Access, FieldAccess } from 'payload';
import { hasRoleAtLeast } from './roles';

export const isAdmin: Access = ({ req }) => hasRoleAtLeast(req.user?.role, 'admin');

export const isAdminField: FieldAccess = ({ req }) => hasRoleAtLeast(req.user?.role, 'admin');

export const isRedacteurOrAdmin: Access = ({ req }) => hasRoleAtLeast(req.user?.role, 'redacteur');

export const isRedacteurOrAdminField: FieldAccess = ({ req }) =>
  hasRoleAtLeast(req.user?.role, 'redacteur');

export const isAuthorOrAbove: Access = ({ req }) => hasRoleAtLeast(req.user?.role, 'auteur');
