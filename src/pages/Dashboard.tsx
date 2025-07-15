import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Game {
  _id: string;
  name: string;
  code: string;
  numberOfWeeks: number;
  reminderDayBefore: number;
  admin: { name: string };
}

export default function Dashboard() {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [isLoading, setIsLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const navigate = useNavigate();

  const handleLeaveGame = async (gameId: string) => {
    const token = localStorage.getItem('token');
    if (!window.confirm("Es-tu sûr de vouloir quitter cette partie ?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/${gameId}/leave`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      // Retirer la partie du tableau local sans refetch
      setGames(prev => prev.filter(g => g._id !== gameId));
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };


  useEffect(() => {
    const fetchGames = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/game/getmygames`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setGames(json.data);
      } catch (err: any) {
        console.error("Erreur lors du chargement des parties :", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchGames();
  }, [user]);

  if (isLoading) {
    return <div className="text-center mt-10 text-green-800">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="min-h-screen bg-yellow-50 px-6 py-12 text-green-900">
      <h1 className="mt-14 text-3xl font-extrabold text-center mb-8">Bienvenue, {user?.name} 👋</h1>

      <div className="flex justify-center gap-4 my-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/join')}
          className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg"
        >
          Rejoindre une partie
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/games/create')}
          className="px-6 py-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold shadow-lg"
        >
          Commencer une partie
        </motion.button>
      </div>

      <hr className='my-5 border border-black opacity-10 rounded mx-52'></hr>

      {games.length === 0 ? (
        <div className="text-center mb-10">
          <p className="mb-4">Tu ne participes à aucune partie pour l’instant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 mx-32">
          {games.map((game) => (
            <motion.div
              key={game._id}
              whileHover={{ scale: 1.03 }}
              className="bg-white border rounded-xl shadow-md p-5 cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(`/lobby/${game.code}`)}
            >
              <h2 className="text-xl font-bold mb-2">{game.name}</h2>
              <p className="text-sm text-gray-600">Code : <span className="font-mono">{game.code}</span></p>
              <p className="text-sm text-gray-600">Admin : {game.admin.name}</p>
              <p className="text-sm text-gray-600">Durée : {game.numberOfWeeks} semaines</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
