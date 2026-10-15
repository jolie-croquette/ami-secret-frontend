import { api } from './client';
import type { AuthUser, TargetPreferences, WishlistItem } from './types';
import type { Lang } from '@/i18n/lang';

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
  /** Langue préférée : courriels, notifications push et rappels. */
  setLocale: (locale: Lang) => api.patch<{ locale: Lang }>('/user/locale', { locale }),
  seenUpdate: (version: string) =>
    api.patch<{ lastSeenUpdate: string }>('/user/seen-update', { version }),
};
