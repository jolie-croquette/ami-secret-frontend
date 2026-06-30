import { api } from './client';

export type PrivacyRequestType =
  | 'access'
  | 'rectification'
  | 'deletion'
  | 'portability'
  | 'deindexation'
  | 'consent_withdrawal';

export type PrivacyRequestStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export interface PrivacyRequest {
  _id: string;
  type: PrivacyRequestType;
  message?: string;
  status: PrivacyRequestStatus;
  adminNote?: string;
  resolvedAt?: string;
  createdAt: string;
  user?: { _id: string; name: string; email: string };
}

export const TYPE_LABELS: Record<PrivacyRequestType, string> = {
  access: 'Accès à mes données',
  rectification: 'Rectification',
  deletion: 'Suppression',
  portability: 'Portabilité',
  deindexation: 'Déindexation',
  consent_withdrawal: 'Retrait du consentement',
};

export const STATUS_LABELS: Record<PrivacyRequestStatus, string> = {
  pending: 'En attente',
  in_progress: 'En cours',
  resolved: 'Résolu',
  rejected: 'Refusé',
};

export const privacyRequestApi = {
  create: (body: { type: PrivacyRequestType; message?: string }) =>
    api.post<PrivacyRequest>('/privacy-requests', body),
  mine: () => api.get<PrivacyRequest[]>('/privacy-requests/mine'),
  adminList: (status: string = 'all', page: number = 1) =>
    api.get<{ items: PrivacyRequest[]; total: number; page: number; pages: number }>(
      `/admin/privacy-requests?status=${status}&page=${page}`
    ),
  adminUpdate: (id: string, body: { status: PrivacyRequestStatus; adminNote?: string }) =>
    api.patch<PrivacyRequest>(`/admin/privacy-requests/${id}`, body),
};
