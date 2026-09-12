export type Role = 'admin' | 'redacteur' | 'auteur';

const roleRank: Record<Role, number> = {
  auteur: 0,
  redacteur: 1,
  admin: 2,
};

export const hasRoleAtLeast = (role: Role | undefined, minimum: Role): boolean => {
  if (!role) return false;
  return roleRank[role] >= roleRank[minimum];
};
