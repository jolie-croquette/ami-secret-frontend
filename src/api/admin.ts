import { api } from './client';
import type {
  AdminStats,
  AdminUserRow,
  AdminGameRow,
  Paginated,
  GameStatus,
  UserRole,
} from './types';

const qs = (params: Record<string, string | number | undefined>): string => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export interface ListUsersParams {
  search?: string;
  status?: 'all' | 'active' | 'banned' | 'admin';
  page?: number;
  limit?: number;
}

export interface ListGamesParams {
  search?: string;
  status?: 'all' | GameStatus;
  page?: number;
  limit?: number;
}

export interface AdminUserGame {
  _id: string;
  name: string;
  code: string;
  status: GameStatus;
  numberOfWeeks: number;
  memberCount: number;
}

export interface AdminUserDetail {
  user: AdminUserRow;
  games: AdminUserGame[];
}

/** Détail brut d'une partie côté admin (membres + admins peuplés). */
export interface AdminGameDetail {
  _id: string;
  name: string;
  code: string;
  status: GameStatus;
  numberOfWeeks: number;
  startDate?: string;
  createdAt?: string;
  createdBy?: { _id: string; name: string; email?: string } | null;
  admin?: { _id: string; name: string; email?: string }[];
  members?: {
    user: { _id: string; name: string; email?: string };
    weeksGifted: number[];
    secretFriend?: string | null;
    joinedAt?: string;
  }[];
}

export const adminApi = {
  stats: () => api.get<AdminStats>('/admin/stats'),

  listUsers: (p: ListUsersParams = {}) =>
    api.get<Paginated<AdminUserRow>>(`/admin/users${qs(p as Record<string, string | number | undefined>)}`),
  getUser: (id: string) => api.get<AdminUserDetail>(`/admin/users/${id}`),
  banUser: (id: string, reason?: string) =>
    api.patch<AdminUserRow>(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id: string) => api.patch<AdminUserRow>(`/admin/users/${id}/unban`),
  setRole: (id: string, role: UserRole) =>
    api.patch<AdminUserRow>(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.del<{ ok: boolean }>(`/admin/users/${id}`),
  resetPassword: (id: string) =>
    api.post<{ link: string; emailSent: boolean }>(`/admin/users/${id}/reset-password`),

  listGames: (p: ListGamesParams = {}) =>
    api.get<Paginated<AdminGameRow>>(`/admin/games${qs(p as Record<string, string | number | undefined>)}`),
  getGame: (id: string) => api.get<AdminGameDetail>(`/admin/games/${id}`),
  deleteGame: (id: string) => api.del<{ ok: boolean }>(`/admin/games/${id}`),
  forceDraw: (id: string) => api.post<{ status: string }>(`/admin/games/${id}/force-draw`),
  forceReveal: (id: string) => api.post<{ status: string }>(`/admin/games/${id}/force-reveal`),
};
