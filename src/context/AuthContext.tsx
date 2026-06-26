import { createContext, useState, useEffect, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { authApi } from '@/api/auth';
import { tokenStore } from '@/api/client';
import type { AuthUser } from '@/api/types';
import { CampLoader } from '@/components/CampLoader';

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
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: Dispatch<SetStateAction<User | null>>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!tokenStore.get()) {
      setUser(null);
      return;
    }
    try {
      const data = await authApi.me();
      setUser({ ...data, id: data._id });
    } catch {
      tokenStore.clear();
      setUser(null);
    }
  };

  useEffect(() => {
    void (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    await authApi.signup(name, email, password);
    await refresh();
  };

  const login = async (email: string, password: string) => {
    await authApi.login(email, password);
    await refresh();
  };

  const logout = () => {
    authApi.logout();
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
