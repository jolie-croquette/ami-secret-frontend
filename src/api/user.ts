import { api } from './client';
import type { AuthUser, TargetPreferences } from './types';

export interface OnboardPayload {
  likes: string[];
  dislikes: string[];
  allergies: string[];
  color: string;
  animal: string;
}

export const userApi = {
  onboard: (payload: OnboardPayload) => api.post<AuthUser>('/user/onboard', payload),
  preferences: (id: string) =>
    api.get<TargetPreferences & { email?: string }>(`/user/preferences/${id}`),
};
