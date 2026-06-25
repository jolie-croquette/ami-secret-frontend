import { api } from './client';
import type { AuthUser } from './types';

export interface OnboardPayload {
  likes: string[];
  dislikes: string[];
  allergies: string[];
  color: string;
  animal: string;
}

export const userApi = {
  onboard: (payload: OnboardPayload) => api.post<AuthUser>('/user/onboard', payload),
};
