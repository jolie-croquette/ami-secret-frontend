import { api } from './client';
import type {
  AdminStats,
  AdminUserRow,
  AdminGameRow,
  AdminNotificationRow,
  Paginated,
  GameStatus,
  UserRole,
  NotificationType,
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
  status?: 'all' | GameStatus | 'deleted';
  page?: number;
  limit?: number;
}

export interface ListNotificationsParams {
  search?: string;
  type?: 'all' | NotificationType;
  status?: 'all' | 'read' | 'unread';
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
  isGameAdmin?: boolean;
  joinedAt?: string;
  weeksReceived?: number[];
  createdAt?: string;
}

export interface AdminUserNotification {
  _id: string;
  type: string;
  title: string;
  gameCode?: string;
  link?: string;
  readAt?: string;
  createdAt: string;
}

export interface AdminUserPhoto {
  _id: string;
  game?: { _id: string; name: string; code: string } | null;
  week: number;
  imageUrl: string;
  caption?: string;
  createdAt: string;
}

export interface AdminUserPrivacyRequest {
  _id: string;
  type: string;
  status: string;
  message?: string;
  adminNote?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AdminUserCounts {
  games: number;
  notifications: number;
  photos: number;
  messagesSent: number;
  messagesReceived: number;
  pushSubscriptions: number;
}

/** Dossier complet d'un utilisateur (GET /admin/users/:id). */
export interface AdminUserDetail {
  user: AdminUserRow;
  games: AdminUserGame[];
  notifications: { items: AdminUserNotification[]; total: number };
  photos: AdminUserPhoto[];
  privacyRequests: AdminUserPrivacyRequest[];
  counts: AdminUserCounts;
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
    weeksReceived: number[];
    secretFriend?: { _id: string; name: string; email?: string } | null;
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
  updateUser: (id: string, body: Record<string, unknown>) =>
    api.patch<AdminUserRow>(`/admin/users/${id}`, body),
  exportUser: (id: string) => api.get<Record<string, unknown>>(`/admin/users/${id}/export`),
  deleteUser: (id: string) => api.del<{ ok: boolean }>(`/admin/users/${id}`),
  resetPassword: (id: string) =>
    api.post<{ link: string; emailSent: boolean }>(`/admin/users/${id}/reset-password`),

  listGames: (p: ListGamesParams = {}) =>
    api.get<Paginated<AdminGameRow>>(`/admin/games${qs(p as Record<string, string | number | undefined>)}`),
  getGame: (id: string) => api.get<AdminGameDetail>(`/admin/games/${id}`),
  updateGame: (
    id: string,
    body: { name?: string; numberOfWeeks?: number; reminderDayBefore?: number }
  ) => api.patch<AdminGameRow>(`/admin/games/${id}`, body),
  removeGameMember: (gameId: string, userId: string) =>
    api.del<{ ok: boolean }>(`/admin/games/${gameId}/members/${userId}`),
  /** Suppression douce : la partie va dans la corbeille (restaurable). */
  deleteGame: (id: string) => api.del<{ ok: boolean }>(`/admin/games/${id}`),
  restoreGame: (id: string) => api.patch<{ ok: boolean }>(`/admin/games/${id}/restore`),
  /** Suppression définitive : messages et photos inclus. Irréversible. */
  hardDeleteGame: (id: string) => api.del<{ ok: boolean }>(`/admin/games/${id}/hard`),
  forceDraw: (id: string) => api.post<{ status: string }>(`/admin/games/${id}/force-draw`),
  forceReveal: (id: string) => api.post<{ status: string }>(`/admin/games/${id}/force-reveal`),

  listNotifications: (p: ListNotificationsParams = {}) =>
    api.get<Paginated<AdminNotificationRow>>(
      `/admin/notifications${qs(p as Record<string, string | number | undefined>)}`
    ),
};
