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
};
