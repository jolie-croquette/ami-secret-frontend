import { api } from './client';
import type { InboxMessage } from './types';

export const messagesApi = {
  send: (code: string, body: string) =>
    api.post<{ _id: string; createdAt: string }>(`/game/${code}/messages`, { body }),

  inbox: (code: string) => api.get<InboxMessage[]>(`/game/${code}/messages`),
};
