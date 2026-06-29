import { api } from './client';

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const pushApi = {
  getPublicKey: () => api.get<{ publicKey: string | null }>('/push/public-key'),
  subscribe: (payload: PushSubscriptionPayload) =>
    api.post<{ ok: boolean }>('/push/subscribe', payload),
  unsubscribe: (endpoint: string) => api.del<{ ok: boolean }>('/push/subscribe', { endpoint }),
};
