import type { AuthUser } from '@/api/types';

/**
 * true si l'utilisateur a un prénom et un nom renseignés.
 * Les comptes créés avant l'ajout de ces champs doivent les compléter
 * (modale bloquante CompleteProfileModal) pour garantir l'intégrité des
 * données et l'affichage correct des noms dans les parties.
 */
export function hasCompleteIdentity(user?: Pick<AuthUser, 'firstName' | 'lastName'> | null): boolean {
  return Boolean(user?.firstName?.trim() && user?.lastName?.trim());
}
