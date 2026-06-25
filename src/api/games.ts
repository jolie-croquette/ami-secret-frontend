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

  join: (code: string) => api.post<{ _id: string; code: string }>('/game/join', { code }),

  leave: (gameId: string) => api.post<{ _id: string; code: string }>(`/game/${gameId}/leave`),

  draw: (code: string, startDate?: string) =>
    api.post<{ status: string; startDate: string }>(`/game/${code}/draw`, { startDate }),

  reveal: (code: string) => api.post<{ status: string }>(`/game/${code}/reveal`),

  myTarget: (code: string) => api.get<TargetPreferences>(`/game/${code}/my-target`),

  markWeek: (code: string, week: number, gifted: boolean) =>
    api.patch<{ week: number; gifted: boolean; weeksGifted: number[] }>(
      `/game/${code}/weeks/${week}`,
      { gifted }
    ),

  progress: (code: string) => api.get<GameProgress>(`/game/${code}/progress`),
};
