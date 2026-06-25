/** Types partagés des réponses de l'API Ami Secret. */

export type GameStatus = 'lobby' | 'drawn' | 'revealed';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  likes: string[];
  dislikes: string[];
  favoriteColor?: string;
  favoriteAnimal?: string;
  allergies: string[];
  onBoarded: boolean;
  isOnboarded?: boolean;
}

export interface AdminUser {
  _id: string;
  name: string;
}

export interface GameSummary {
  _id: string;
  name: string;
  code: string;
  numberOfWeeks: number;
  reminderDayBefore: number;
  status: GameStatus;
  adminUsers: AdminUser[];
  adminIds: string[];
}

export interface GamePlayer {
  _id: string;
  name: string;
  email?: string;
}

export interface GameDetails {
  _id: string;
  name: string;
  code: string;
  numberOfWeeks: number;
  reminderDayBefore: number;
  status: GameStatus;
  startDate?: string;
  adminUsers: GamePlayer[];
  adminIds: string[];
  isAdmin: boolean;
  players: GamePlayer[];
}

export interface TargetPreferences {
  _id: string;
  name: string;
  likes: string[];
  dislikes: string[];
  favoriteColor?: string;
  favoriteAnimal?: string;
  allergies: string[];
}

export interface InboxMessage {
  _id: string;
  body: string;
  createdAt: string;
  readAt?: string;
}

export interface ProgressMember {
  user: { _id: string; name: string };
  weeksGifted: number[];
  giftedCount: number;
}

export interface GameProgress {
  numberOfWeeks: number;
  status: GameStatus;
  members: ProgressMember[];
}
