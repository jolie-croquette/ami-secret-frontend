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
};
