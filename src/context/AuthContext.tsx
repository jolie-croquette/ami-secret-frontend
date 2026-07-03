import { createContext, useState, useEffect, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { authApi, type SignupPayload } from '@/api/auth';
import type { AuthUser } from '@/api/types';
import { CampLoader } from '@/components/CampLoader';
import { MOBILE_TUTORIAL_SEEN_KEY } from '@/components/MobileTutorial';

/**
 * Utilisateur exposé par le contexte. `id` est conservé en alias de `_id`
 * pour compatibilité avec les pages existantes.
 */
export interface User extends AuthUser {
  id: string;
  gameId?: string;
  isAdmin?: boolean;
}

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  signup: (payload: SignupPayload) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: Dispatch<SetStateAction<User | null>>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await authApi.me();
      setUser({ ...data, id: data._id });
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    void (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  /** Une connexion explicite réaffiche le tutoriel mobile (voir MobileTutorial). */
  const markFreshLogin = () => {
    try {
      sessionStorage.removeItem(MOBILE_TUTORIAL_SEEN_KEY);
    } catch {
      /* stockage indisponible : non bloquant */
    }
  };

  const signup = async (payload: SignupPayload) => {
    await authApi.signup(payload);
    markFreshLogin();
    await refresh();
  };

  const login = async (email: string, password: string) => {
    await authApi.login(email, password);
    markFreshLogin();
    await refresh();
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAdmin: user?.role === 'admin', signup, login, logout, refresh, setUser }}
    >
      {loading ? <CampLoader /> : children}
    </AuthContext.Provider>
  );
};
