import { api } from './client';
import type { NotificationList } from './types';

export const notificationsApi = {
  list: () => api.get<NotificationList>('/notifications'),
  markRead: () => api.patch<{ ok: boolean }>('/notifications/read'),
};
