/**
 * Client HTTP centralisé de l'API Ami Secret.
 * Gère l'URL de base, le jeton d'auth, la sérialisation JSON et la
 * normalisation des erreurs en `ApiError`.
 */

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  details?: ApiErrorDetail[];

  constructor(message: string, status: number, details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = json?.message ?? 'Une erreur est survenue.';
    throw new ApiError(message, res.status, json?.details);
  }

  return (json?.data ?? null) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
