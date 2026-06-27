import { api } from './client';
import type { AuthUser, TargetPreferences, WishlistItem } from './types';

export interface OnboardPayload {
  likes: string[];
  dislikes: string[];
  allergies: string[];
  color: string;
  animal: string;
  wishlist?: WishlistItem[];
}

export const userApi = {
  onboard: (payload: OnboardPayload) => api.post<AuthUser>('/user/onboard', payload),
  preferences: (id: string) =>
    api.get<TargetPreferences & { email?: string }>(`/user/preferences/${id}`),
};
