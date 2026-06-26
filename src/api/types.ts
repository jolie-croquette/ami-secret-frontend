/** Types partagés des réponses de l'API Ami Secret. */

export type GameStatus = 'lobby' | 'drawn' | 'revealed';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role?: UserRole;
  isBanned?: boolean;
  likes: string[];
  dislikes: string[];
  favoriteColor?: string;
  favoriteAnimal?: string;
  allergies: string[];
  onBoarded: boolean;
  isOnboarded?: boolean;
}

/** Réponse paginée générique de l'API admin. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminStats {
  users: { total: number; banned: number; admins: number; onboarded: number };
  games: { total: number; lobby: number; drawn: number; revealed: number };
}

export interface AdminUserRow {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isBanned: boolean;
  bannedAt?: string;
  banReason?: string;
  onBoarded: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface AdminGameRow {
  _id: string;
  name: string;
  code: string;
  status: GameStatus;
  numberOfWeeks: number;
  reminderDayBefore?: number;
  startDate?: string;
  createdAt?: string;
  createdBy?: { _id: string; name: string; email?: string } | null;
  memberCount: number;
  adminCount: number;
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
  isMember: boolean;
  myWeeksReceived: number[];
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
  weeksReceived: number[];
  receivedCount: number;
}

export interface GameProgress {
  numberOfWeeks: number;
  status: GameStatus;
  members: ProgressMember[];
}
