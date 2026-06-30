import { api } from './client';

export interface GiftPhoto {
  _id: string;
  user: { _id: string; name: string } | string;
  week: number;
  imageUrl: string;
  caption?: string;
  createdAt: string;
}

export interface UploadGiftPhotoPayload {
  week: number;
  photo: File;
  caption?: string;
}

export const giftPhotoApi = {
  upload: (code: string, { week, photo, caption }: UploadGiftPhotoPayload) => {
    const formData = new FormData();
    formData.append('week', String(week));
    formData.append('photo', photo);
    if (caption) formData.append('caption', caption);
    return api.postForm<{ _id: string; imageUrl: string; week: number; caption?: string; createdAt: string }>(
      `/game/${code}/photos`,
      formData
    );
  },
  list: (code: string) => api.get<GiftPhoto[]>(`/game/${code}/photos`),
  delete: (code: string, photoId: string) => api.delete(`/game/${code}/photos/${photoId}`),
  update: (code: string, photoId: string, payload: { caption?: string; photo?: File }) => {
    const formData = new FormData();
    if (payload.caption !== undefined) formData.append('caption', payload.caption);
    if (payload.photo) formData.append('photo', payload.photo);
    return api.patchForm<{ _id: string; imageUrl: string; week: number; caption?: string; createdAt: string }>(
      `/game/${code}/photos/${photoId}`,
      formData
    );
  },
  adminDelete: (photoId: string) => api.delete(`/admin/photos/${photoId}`),
};
