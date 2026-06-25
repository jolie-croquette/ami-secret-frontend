import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast, ToastContainer } from 'react-toastify';
import { KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { gamesApi } from '@/api/games';
import { ApiError } from '@/api/client';
import { Compass } from '@/components/visuals/CampVisuals';
import 'react-toastify/dist/ReactToastify.css';

const formatCode = (v: string) => v.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();

export default function JoinGamePage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const c = search.get('code');
    if (c) setCode(formatCode(c));
  }, [search]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = formatCode(code);
    if (cleaned.length < 4) {
      toast.error('Le code doit contenir au moins 4 caractères.');
      return;
    }

    setLoading(true);
    try {
      await gamesApi.join(cleaned);
      toast.success('Tu as rejoint la partie.');
      navigate(`/lobby/${cleaned}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.info('Tu es déjà dans cette partie.');
        navigate(`/lobby/${cleaned}`);
        return;
      }
      if (err instanceof ApiError && err.status === 404) {
        toast.error('Code invalide ou partie introuvable.');
      } else {
        toast.error(err instanceof Error ? err.message : 'Impossible de rejoindre la partie.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-camp-cream bg-topo px-5 py-12 text-camp-ink">
      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-sign p-8"
        >
          <div className="mb-4 flex flex-col items-center">
            <Compass className="w-16 animate-float" title="Boussole" />
            <h1 className="mt-2 font-display text-3xl font-black text-camp-pine-dark">
              Rejoindre une partie
            </h1>
            <p className="label-hand text-xl">entre le code reçu</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="code" className="field-label">Code de la partie</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-camp-bark/45" />
                <input
                  id="code"
                  type="text"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  value={code}
                  onChange={(e) => setCode(formatCode(e.target.value))}
                  onPaste={(e) => {
                    e.preventDefault();
                    setCode(formatCode(e.clipboardData.getData('text')));
                  }}
                  placeholder="ABC123"
                  className="field pl-11 text-center text-lg font-bold tracking-[0.3em]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => navigate(-1)} className="btn-ghost">
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Rejoindre'}
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-camp-bark">
            Pas de code ?{' '}
            <button
              onClick={() => navigate('/game/create')}
              className="font-bold text-camp-ember-dark underline underline-offset-2"
            >
              Crée une partie
            </button>
          </p>
        </motion.div>
      </div>
      <ToastContainer position="top-center" autoClose={3500} theme="colored" />
    </div>
  );
}
