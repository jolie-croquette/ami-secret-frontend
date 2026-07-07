import { api } from './client';
import type { AuthUser, TargetPreferences, WishlistItem } from './types';

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  campName?: string;
}

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
  updateProfile: (payload: UpdateProfilePayload) => api.patch<AuthUser>('/user/profile', payload),
  preferences: (id: string) =>
    api.get<TargetPreferences & { email?: string }>(`/user/preferences/${id}`),
  seenUpdate: (version: string) =>
    api.patch<{ lastSeenUpdate: string }>('/user/seen-update', { version }),
};
