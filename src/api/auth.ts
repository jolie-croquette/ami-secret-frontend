import { api } from './client';
import type { AuthUser } from './types';

export const authApi = {
  signup: async (name: string, email: string, password: string): Promise<void> => {
    await api.post<{ ok: boolean }>('/auth/signup', { name, email, password });
  },

  login: async (email: string, password: string): Promise<void> => {
    await api.post<{ ok: boolean }>('/auth/login', { email, password });
  },

  me: () => api.get<AuthUser>('/auth/me'),

  logout: () => api.post<{ ok: boolean }>('/auth/logout'),

  /** Déclenche l'envoi d'un lien de réinitialisation (réponse constante). */
  forgotPassword: (email: string) =>
    api.post<{ ok: boolean }>('/auth/forgot-password', { email }),

  /** Définit un nouveau mot de passe à partir d'un jeton de réinitialisation. */
  resetPassword: (token: string, password: string) =>
    api.post<{ ok: boolean }>('/auth/reset-password', { token, password }),
};
