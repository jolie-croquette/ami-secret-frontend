import { api, tokenStore } from './client';
import type { AuthUser } from './types';

export const authApi = {
  signup: async (name: string, email: string, password: string): Promise<void> => {
    const data = await api.post<{ token: string }>('/auth/signup', { name, email, password });
    tokenStore.set(data.token);
  },

  login: async (email: string, password: string): Promise<void> => {
    const data = await api.post<{ token: string }>('/auth/login', { email, password });
    tokenStore.set(data.token);
  },

  me: () => api.get<AuthUser>('/auth/me'),

  logout: () => tokenStore.clear(),

  /** Déclenche l'envoi d'un lien de réinitialisation (réponse constante). */
  forgotPassword: (email: string) =>
    api.post<{ ok: boolean }>('/auth/forgot-password', { email }),

  /** Définit un nouveau mot de passe à partir d'un jeton de réinitialisation. */
  resetPassword: (token: string, password: string) =>
    api.post<{ ok: boolean }>('/auth/reset-password', { token, password }),
};
