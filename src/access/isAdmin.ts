import type { Access, FieldAccess } from 'payload';
import { hasRoleAtLeast } from './roles';

export const isAdmin: Access = ({ req }) => hasRoleAtLeast(req.user?.role, 'admin');

export const isAdminField: FieldAccess = ({ req }) => hasRoleAtLeast(req.user?.role, 'admin');

export const isRedacteurOrAdmin: Access = ({ req }) => hasRoleAtLeast(req.user?.role, 'redacteur');

export const isRedacteurOrAdminField: FieldAccess = ({ req }) =>
  hasRoleAtLeast(req.user?.role, 'redacteur');

export const isAuthorOrAbove: Access = ({ req }) => hasRoleAtLeast(req.user?.role, 'auteur');

/** Bezoekers (publieke site) en admin; een ingelogde redacteur, auteur of organisator niet. Verbergt het item ook in /admin. */
export const publiekOfAdmin: Access = ({ req }) => !req.user || hasRoleAtLeast(req.user.role, 'admin');

/**
 * Contactgegevens die alleen bezoekers met een buurtpas zien. Via de REST- en GraphQL-API alleen voor
 * ingelogde gebruikers; de site leest ze via de Local API en toont ze pas na de buurtpascheck.
 */
export const alleenIngelogdField: FieldAccess = ({ req }) => Boolean(req.user);

/**
 * Telefoonnummer van een vakman: via de API voor ingelogde gebruikers, en voor iedereen als het nummer openbaar is.
 * Zonder `doc` (controle van where-queries) is het antwoord voor bezoekers nee: zoeken op nummers kan dus niet.
 */
export const telefoonLeesbaar: FieldAccess = ({ req, doc }) => Boolean(req.user) || doc?.telefoonPubliek === true;
