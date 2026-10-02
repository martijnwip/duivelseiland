export type Role = 'admin' | 'redacteur' | 'auteur' | 'organisator';

// Organisator staat onder auteur: die beheert alleen de eigen activiteit(en) en mag nergens anders iets
// aanmaken (zie docs/brief-activiteiten.md). Elke `hasRoleAtLeast(..., 'auteur')` sluit de organisator dus uit.
const roleRank: Record<Role, number> = {
  organisator: 0,
  auteur: 1,
  redacteur: 2,
  admin: 3,
};

export const hasRoleAtLeast = (role: Role | undefined, minimum: Role): boolean => {
  if (!role) return false;
  return roleRank[role] >= roleRank[minimum];
};
