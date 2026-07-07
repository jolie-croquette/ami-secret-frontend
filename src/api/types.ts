/** Types partagés des réponses de l'API Ami Secret. */

export type GameStatus = 'lobby' | 'drawn' | 'revealed';

export type UserRole = 'user' | 'admin';

/** Une idée de cadeau de la liste de souhaits. */
export interface WishlistItem {
  title: string;
  url?: string;
  price?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  /** Prénom. */
  firstName?: string;
  /** Nom de famille. */
  lastName?: string;
  /** Nom de camp (surnom) — affiché dans les parties s'il est présent. */
  campName?: string;
  email: string;
  role?: UserRole;
  isBanned?: boolean;
  likes: string[];
  dislikes: string[];
  favoriteColor?: string;
  favoriteAnimal?: string;
  allergies: string[];
  wishlist?: WishlistItem[];
  onBoarded: boolean;
  isOnboarded?: boolean;
  /** Version de la dernière note de mise à jour vue par l'utilisateur. */
  lastSeenUpdate?: string;
}

export type NotificationType = 'message' | 'draw' | 'reveal' | 'removed' | 'gift-photo';

export interface AppNotification {
  _id: string;
  type: NotificationType;
  title: string;
  gameCode?: string;
  link?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationList {
  items: AppNotification[];
  unreadCount: number;
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
  notifications: AdminNotificationStats;
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
  likes?: string[];
  dislikes?: string[];
  allergies?: string[];
  favoriteColor?: string;
  favoriteAnimal?: string;
  wishlist?: WishlistItem[];
}

export interface AdminNotificationStats {
  total: number;
  unread: number;
}

export interface AdminNotificationRow {
  _id: string;
  type: NotificationType;
  title: string;
  gameCode?: string;
  link?: string;
  readAt?: string;
  createdAt: string;
  user?: { _id: string; name: string; email?: string } | null;
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
  /** true si le visiteur est un admin du site (vue modération, voit le tirage). */
  isSiteAdmin?: boolean;
  isMember: boolean;
  myWeeksReceived: number[];
  players: GamePlayer[];
  /** Résultat du tirage (qui offre à qui) — fourni uniquement aux admins du site. */
  assignments?: { from: { _id: string; name: string }; to: { _id: string; name: string | null } }[];
}

export interface TargetPreferences {
  _id: string;
  name: string;
  likes: string[];
  dislikes: string[];
  favoriteColor?: string;
  favoriteAnimal?: string;
  allergies: string[];
  wishlist?: WishlistItem[];
}

export interface InboxMessage {
  _id: string;
  body: string;
  createdAt: string;
  /** true = message envoyé par moi (« Moi »), false = reçu (« Ami secret »). */
  mine: boolean;
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
