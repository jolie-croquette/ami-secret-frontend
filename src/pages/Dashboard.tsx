import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    if (user.gameId && user.isAdmin) {
      navigate(`/admin/${user.gameId}`);
    } else if (user.gameId && !user.isAdmin) {
      navigate(`/game/${user.gameId}`);
    } else {
      setIsLoading(false); // l'utilisateur n'a pas de partie encore
    }
  }, [user, navigate]);

  if (isLoading) {
    return <div className="text-center mt-10 text-green-800">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 text-green-900 px-6">
      <h1 className="text-3xl font-extrabold mb-8">Bienvenue, {user?.name} 👋</h1>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/join')}
        className="mb-4 px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg"
      >
        Rejoindre une partie
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/start')}
        className="px-6 py-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold shadow-lg"
      >
        Commencer une partie
      </motion.button>
    </div>
  );
}
