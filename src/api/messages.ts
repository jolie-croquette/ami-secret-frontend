import { api } from './client';
import type { InboxThreads } from './types';

/** Destinataire d'un message anonyme : ma cible ou la personne qui me gâte. */
export type MessageRecipient = 'target' | 'gifter';

export const messagesApi = {
  send: (code: string, body: string, to: MessageRecipient = 'target') =>
    api.post<{ _id: string; createdAt: string }>(
      to === 'gifter' ? `/game/${code}/messages/gifter` : `/game/${code}/messages`,
      { body }
    ),

  inbox: (code: string) => api.get<InboxThreads>(`/game/${code}/messages`),
};
