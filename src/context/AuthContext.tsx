import { createContext, useState, ReactNode, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  id: string;
  name: string;
  email: string;
  gameId?: string;
  isAdmin?: boolean;
  onBoarded?: boolean; // ou isBoarded?: boolean
}

type AuthContextType = {
  user: User | null;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUserState(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        // selon ton backend: json.data ou json.data.user
        const u = json?.data?.user ?? json?.data ?? null;
        setUserState(u);
      } else {
        setUserState(null);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de l’utilisateur :', err);
      setUserState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleAuth = async (res: Response) => {
    const json = await res.json();
    const token = json?.data?.token ?? json?.token;
    if (!token) throw new Error("Token manquant dans la réponse.");
    localStorage.setItem('token', token);

    // si l’API renvoie déjà l’utilisateur, profite-en pour mettre à jour tout de suite
    const u = json?.data?.user ?? json?.user ?? null;
    if (u) {
      setUserState(u);
      setLoading(false);
    } else {
      await fetchUser();
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) return handleAuth(res);
    if (res.status === 409) throw new Error("Ce courriel est déjà utilisé.");
    throw new Error("Une erreur est survenue à l'inscription.");
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) return handleAuth(res);
    if (res.status === 401) throw new Error("Identifiants invalides.");
    throw new Error("Une erreur est survenue à la connexion.");
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signup,
        login,
        logout,
        setUser: setUserState, // ✅ on expose le setter réel
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
