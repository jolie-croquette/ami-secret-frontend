import { api } from './client';
import type {
  GameSummary,
  GameDetails,
  GameProgress,
  TargetPreferences,
} from './types';

export interface CreateGamePayload {
  name: string;
  weeks: number;
  reminderDays: number;
  players: string[];
}

export const gamesApi = {
  create: (payload: CreateGamePayload) =>
    api.post<GameDetails>('/game/create', payload),

  myGames: () => api.get<GameSummary[]>('/game/getmygames'),

  byCode: (code: string) => api.get<GameDetails>(`/game/code/${code}`),

  updateGame: (
    gameId: string,
    body: { name?: string; numberOfWeeks?: number; reminderDayBefore?: number }
  ) =>
    api.patch<{ _id: string; name: string; numberOfWeeks: number; reminderDayBefore: number }>(
      `/game/${gameId}`,
      body
    ),

  removePlayer: (gameId: string, userId: string) =>
    api.post<{ _id: string; code: string }>(`/game/${gameId}/remove/${userId}`),

  addAdmin: (gameId: string, userId: string) =>
    api.post<{ adminIds: string[] }>(`/game/${gameId}/admin/add/${userId}`),

  removeAdmin: (gameId: string, userId: string) =>
    api.post<{ adminIds: string[] }>(`/game/${gameId}/admin/remove/${userId}`),

  join: (code: string) => api.post<{ _id: string; code: string }>('/game/join', { code }),

  leave: (gameId: string) => api.post<{ _id: string; code: string }>(`/game/${gameId}/leave`),

  /** Suppression douce par un organisateur : la partie disparaît mais reste restaurable par l'administration. */
  deleteGame: (gameId: string) => api.del<{ _id: string; code: string }>(`/game/${gameId}`),

  draw: (code: string, startDate?: string) =>
    api.post<{ status: string; startDate: string }>(`/game/${code}/draw`, { startDate }),

  reveal: (code: string) => api.post<{ status: string }>(`/game/${code}/reveal`),

  myTarget: (code: string) => api.get<TargetPreferences>(`/game/${code}/my-target`),

  markWeek: (code: string, week: number, received: boolean) =>
    api.patch<{ week: number; received: boolean; weeksReceived: number[] }>(
      `/game/${code}/weeks/${week}`,
      { received }
    ),

  progress: (code: string) => api.get<GameProgress>(`/game/${code}/progress`),
};
