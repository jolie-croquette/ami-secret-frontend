import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bouncy } from 'ldrs/react';
import 'ldrs/react/Bouncy.css';
import { toast, ToastContainer } from 'react-toastify';

interface Game {
  _id: string;
  name: string;
  code: string;
  numberOfWeeks: number;
  reminderDayBefore: number;
  admin: { name: string } | null;
}

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext) ?? ({} as any);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const navigate = useNavigate();
  const abortRef = useRef<AbortController | null>(null);

  const apiUrl = useMemo(() => import.meta.env.VITE_API_URL as string, []);
  const token = useMemo(() => localStorage.getItem('token'), [user]);

  const leaveGame = async (gameId: string) => {
    if (!token) return toast.error('Non autorisé. Connecte-toi à nouveau.');
    if (!window.confirm('Es-tu sûr de vouloir quitter cette partie ?')) return;

    try {
      const res = await fetch(`${apiUrl}/game/${gameId}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err: any = new Error(json?.message || 'Échec de la sortie de la partie');
        err.status = res.status;
        throw err;
      }
      setGames((prev) => prev.filter((g) => g._id !== gameId));
      toast.success('Tu as quitté la partie.');
    } catch (err: any) {
      if (err?.status === 401) {
        logout?.();
        toast.error('Session expirée. Connecte-toi à nouveau.');
        navigate('/login');
        return;
      }
      toast.error(`Erreur lors de la sortie : ${err?.message ?? err}`);
    }
  };

  useEffect(() => {
    if (!user) return; // n'essaie pas de fetch tant que l'utilisateur n'est pas prêt

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const fetchGames = async () => {
      if (!token) {
        setGames([]);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`${apiUrl}/game/getmygames`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const err: any = new Error(json?.message || 'Impossible de charger les parties');
          err.status = res.status;
          throw err;
        }
        setGames(Array.isArray(json?.data) ? json.data : []);
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // navigation / re-render
        if (err?.status === 401) {
          logout?.();
          toast.error('Session expirée. Connecte-toi à nouveau.');
          navigate('/login');
          return;
        }
        setError(err?.message ?? 'Erreur inconnue');
        console.error('Erreur lors du chargement des parties :', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();

    return () => controller.abort();
  }, [user, apiUrl, token, logout, navigate]);

  // UI helpers
  const EmptyState = () => (
    <div className="text-center mb-10">
      <p className="mb-2">Tu ne participes à aucune partie pour l’instant.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-yellow-50 px-6 py-12 text-green-900">
      <h1 className="mt-14 text-3xl font-extrabold text-center mb-8">Bienvenue, {user?.name} 👋</h1>

      <div className="flex justify-center gap-4 my-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/game/join')}
          className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg"
        >
          Rejoindre une partie
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/game/create')}
          className="px-6 py-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold shadow-lg"
        >
          Commencer une partie
        </motion.button>
      </div>

      <hr className='my-5 border border-black/10 rounded mx-52' />

      {/* Loading */}
      {isLoading ? (
        <div className='min-h-[240px] flex items-start justify-center mt-20'>
          <Bouncy size="100" speed="1.5" color="green" />
        </div>
      ) : error ? (
        <div className="text-center text-red-700 font-medium mt-10">
          {error}
        </div>
      ) : games.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 mx-4 md:mx-16 lg:mx-32">
          {games.map((game) => (
            <motion.div
              key={game._id}
              whileHover={{ scale: 1.03 }} 
              className="bg-white border rounded-xl shadow-md p-5 cursor-pointer hover:shadow-lg transition relative"
              onClick={() => navigate(`/lobby/${game.code}`)}
              role="button"
              aria-label={`Ouvrir ${game.name}`}
            >
              <h2 className="text-xl font-bold mb-1 truncate">{game.name}</h2>
              <p className="text-sm text-gray-600">Code : <span className="font-mono">{game.code}</span></p>
              <p className="text-sm text-gray-600">Durée : {game.numberOfWeeks} semaines</p>

              {/* Quitter button (does not trigger card navigation) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  void leaveGame(game._id);
                }}
                className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                title="Quitter la partie"
              >
                Quitter
              </button>
            </motion.div>
          ))}
        </div>
      )}
      <ToastContainer position="top-center" autoClose={4000} theme="colored" />
    </div>
  );
}
