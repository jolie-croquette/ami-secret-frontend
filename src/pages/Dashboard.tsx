import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast, ToastContainer } from 'react-toastify';
import { Plus, LogIn, Loader2, LogOut, KeyRound, CalendarDays } from 'lucide-react';
import { gamesApi } from '@/api/games';
import { ApiError } from '@/api/client';
import type { GameSummary, GameStatus } from '@/api/types';
import { Tent, MeritBadge } from '@/components/visuals/CampVisuals';
import 'react-toastify/dist/ReactToastify.css';

const STATUS_META: Record<GameStatus, { label: string; classes: string }> = {
  lobby: { label: 'En attente', classes: 'bg-camp-sun/30 text-camp-bark' },
  drawn: { label: 'Tirage fait', classes: 'bg-camp-ember/20 text-camp-ember-dark' },
  revealed: { label: 'Révélé', classes: 'bg-camp-pine/15 text-camp-pine-dark' },
};

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext) ?? ({} as never);
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await gamesApi.myGames();
        if (active) setGames(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout?.();
          navigate('/', { replace: true });
          return;
        }
        if (active) setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, logout, navigate]);

  const leaveGame = async (gameId: string) => {
    if (!window.confirm('Quitter cette partie ?')) return;
    try {
      await gamesApi.leave(gameId);
      setGames((prev) => prev.filter((g) => g._id !== gameId));
      toast.success('Tu as quitté la partie.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sortie.');
    }
  };

  return (
    <div className="min-h-screen bg-camp-cream bg-topo px-5 py-10 text-camp-ink">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-1 text-center font-display text-4xl font-black text-camp-pine-dark">
          Bonjour, {user?.name}
        </h1>
        <p className="label-hand mb-8 text-center text-2xl">tes parties en cours</p>

        <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={() => navigate('/game/join')} className="btn-ghost">
            <LogIn className="h-5 w-5" /> Rejoindre une partie
          </button>
          <button onClick={() => navigate('/game/create')} className="btn-primary">
            <Plus className="h-5 w-5" /> Créer une partie
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-camp-pine" />
          </div>
        ) : error ? (
          <p className="py-10 text-center font-semibold text-camp-berry">{error}</p>
        ) : games.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Tent className="w-24 opacity-90" />
            <p className="font-display text-xl text-camp-pine-dark">Aucune partie pour l’instant</p>
            <p className="text-sm text-camp-bark">Crée ta première partie ou rejoins celle d’un ami.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game, i) => {
              const status = STATUS_META[game.status] ?? STATUS_META.lobby;
              const isAdmin = !!user && game.adminIds.includes(user.id);
              return (
                <motion.div
                  key={game._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(isAdmin ? `/lobby/${game.code}/admin` : `/lobby/${game.code}`)}
                  className="card-sign group cursor-pointer p-5"
                  role="button"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <MeritBadge label={game.name.charAt(0).toUpperCase()} className="h-12 w-12" />
                    <span className={`badge-merit ${status.classes}`}>{status.label}</span>
                  </div>
                  <h2 className="mb-2 truncate font-display text-xl font-bold text-camp-pine-dark">
                    {game.name}
                  </h2>
                  <p className="flex items-center gap-2 text-sm text-camp-bark">
                    <KeyRound className="h-4 w-4" /> Code&nbsp;: <span className="font-bold tracking-wider">{game.code}</span>
                  </p>
                  <p className="flex items-center gap-2 text-sm text-camp-bark">
                    <CalendarDays className="h-4 w-4" /> {game.numberOfWeeks} semaines
                  </p>

                  {!isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void leaveGame(game._id);
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-camp-berry/10 px-3 py-1 text-xs font-bold text-camp-berry hover:bg-camp-berry/20"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Quitter
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={3500} theme="colored" />
    </div>
  );
}
