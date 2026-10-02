import type { Access, FieldAccess, Where } from 'payload';
import { PUBLIEKE_FASES } from '../lib/activiteiten/constants';
import { hasRoleAtLeast } from './roles';

/**
 * Bezoekers: alleen publieke fasen. Organisator: alleen de eigen activiteit(en), ook in /admin.
 * Auteur: publieke fasen plus eventueel eigen. Redacteur/admin: alles.
 */
export const readActiviteiten: Access = ({ req }): boolean | Where => {
  const publiek: Where = { fase: { in: PUBLIEKE_FASES } };
  if (!req.user) return publiek;
  if (hasRoleAtLeast(req.user.role, 'redacteur')) return true;
  const eigen: Where = { eigenaar: { equals: req.user.id } };
  if (req.user.role === 'organisator') return eigen;
  return { or: [publiek, eigen] };
};

/** Voor inschrijvingen en berichten: redacteur/admin alles, anders alleen bij een activiteit waarvan je eigenaar bent. */
export const viaEigenActiviteit: Access = ({ req }) => {
  if (!req.user) return false;
  if (hasRoleAtLeast(req.user.role, 'redacteur')) return true;
  return { 'activiteit.eigenaar': { equals: req.user.id } };
};

/** Gevoelige velden (e-mail aanvrager, afwijsreden): alleen de redactie en de eigenaar van het document. */
export const redactieOfEigenaarField: FieldAccess = ({ req, doc }) => {
  if (!req.user) return false;
  if (hasRoleAtLeast(req.user.role, 'redacteur')) return true;
  const eigenaar = doc?.eigenaar;
  const eigenaarId = typeof eigenaar === 'object' && eigenaar !== null ? eigenaar.id : eigenaar;
  return eigenaarId !== undefined && String(eigenaarId) === String(req.user.id);
};

export const isOrganisator = (user: { role?: string } | null | undefined) => user?.role === 'organisator';
