import { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { Bouncy } from 'ldrs/react';
import 'ldrs/react/Bouncy.css';

export default function JoinGamePage() {
  const { user, logout } = useContext(AuthContext) ?? ({} as any);
  const navigate = useNavigate();
  const [search] = useSearchParams();

  const apiUrl = useMemo(() => import.meta.env.VITE_API_URL as string, []);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pré-remplir depuis l'URL ?code=ABC123
  useEffect(() => {
    const c = search.get('code');
    if (c) setCode(formatCode(c));
  }, [search]);

  const formatCode = (v: string) => v.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = formatCode(code);

    if (!cleaned || cleaned.length < 4) {
      toast.error('Le code doit contenir au moins 4 caractères.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Tu dois être connecté pour rejoindre une partie.');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/game/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: cleaned }), // displayName ignoré côté backend
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          logout?.();
          toast.error('Session expirée. Connecte-toi à nouveau.');
          navigate('/login');
          return;
        }
        const msg =
          json?.message ||
          (res.status === 404
            ? 'Code invalide ou partie introuvable.'
            : res.status === 409
            ? 'Tu es déjà inscrit à cette partie.'
            : 'Impossible de rejoindre la partie.');

        if (res.status === 409) {
          toast.info('Tu es déjà dans cette partie.');
          navigate(`/lobby/${cleaned}`);
          return;
        }
        throw new Error(msg);
      }

      toast.success('Bienvenue dans la partie!');
      navigate(`/lobby/${cleaned}`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Erreur inconnue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 px-6 py-12 text-green-900">
      <div className="max-w-xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-14 text-3xl font-extrabold text-center mb-8"
        >
          Rejoindre une partie
        </motion.h1>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="bg-white rounded-2xl shadow p-6 border"
        >
          <label className="block text-sm font-medium mb-1" htmlFor="code">
            Code de la partie
          </label>
          <input
            id="code"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            value={code}
            onChange={(e) => setCode(formatCode(e.target.value))}
            onPaste={(e) => {
              const text = e.clipboardData.getData('text');
              e.preventDefault();
              setCode(formatCode(text));
            }}
            placeholder="ABC123"
            className="w-full mb-4 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Le nom affiché n'est pas stocké côté backend; affichage read-only pour info */}
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Nom affiché
          </label>
          <input
            id="name"
            type="text"
            value={user?.name || ''}
            disabled
            className="w-full mb-6 px-4 py-3 rounded-xl border bg-gray-50 text-gray-600"
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Annuler
            </button>

            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.03 }}
              whileTap={{ scale: isLoading ? 1 : 0.97 }}
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Bouncy size="24" speed="1.5" color="white" />
                  Connexion à la partie…
                </span>
              ) : (
                'Rejoindre'
              )}
            </motion.button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Astuce : tu peux aussi ouvrir un lien d’invitation comme <code className="font-mono">/join?code=ABC123</code> — le code sera pré-rempli.
          </p>
        </motion.form>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/game/create')}
            className="text-sm underline underline-offset-4 hover:text-green-700"
          >
            Pas de code ? Crée une partie
          </button>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={4000} theme="colored" />
    </div>
  );
}
