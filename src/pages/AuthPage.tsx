import { useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'motion/react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { Pennants, MeritBadge, PineTree, CampScene } from '@/components/visuals/CampVisuals';
import 'react-toastify/dist/ReactToastify.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleForm = () => {
    if (isSubmitting) return;
    setIsLogin((v) => !v);
    setForm({ name: '', email: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return toast.error('Erreur interne : contexte d’authentification indisponible');

    const { name, email, password } = form;
    if (!email || !password) return toast.warning('Courriel et mot de passe sont requis.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    if (!emailRegex.test(email)) return toast.warning('Adresse courriel invalide.');
    if (!isLogin && !name.trim()) return toast.warning('Le nom est requis.');
    if (password.length < 6) return toast.warning('Mot de passe trop court (min. 6 caractères).');

    setIsSubmitting(true);
    try {
      if (!isLogin) {
        await auth.signup(name, email, password);
        toast.success('Bienvenue au camp !');
        navigate('/onboard', { replace: true });
      } else {
        await auth.login(email, password);
        toast.success('Content de te revoir !');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('Ce courriel est déjà utilisé.');
      } else if (err instanceof ApiError && err.status === 401) {
        toast.error('Courriel ou mot de passe incorrect.');
      } else {
        toast.error(err instanceof Error ? err.message : 'Erreur d’authentification.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-camp-cream bg-topo flex items-center justify-center px-4 py-16">
      {/* Fanions en haut */}
      <Pennants className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(680px,95vw)] h-12" />

      {/* Sapins décoratifs */}
      <PineTree className="hidden md:block absolute bottom-24 left-10 w-20 opacity-80 animate-sway" />
      <PineTree className="hidden md:block absolute bottom-32 left-28 w-12 opacity-70 animate-sway" />
      <PineTree className="hidden md:block absolute bottom-24 right-10 w-24 opacity-80 animate-sway" />
      <PineTree className="hidden md:block absolute bottom-36 right-32 w-14 opacity-70 animate-sway" />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card-sign relative z-10 w-full max-w-md p-8 sm:p-10"
      >
        <div className="flex flex-col items-center -mt-20 mb-2">
          <MeritBadge
            label="AS"
            tone="#2f5d50"
            className="w-28 h-28 drop-shadow-md animate-stamp-in"
            title="Insigne Ami Secret"
          />
          <p className="label-hand text-2xl mt-1 -rotate-2">
            {isLogin ? 'ravis de te revoir' : 'rejoins le camp'}
          </p>
        </div>

        <h1 className="font-display text-4xl font-black text-center text-camp-pine-dark text-shadow-soft mb-7">
          {isLogin ? 'Connexion' : 'Créer un compte'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <AnimatePresence mode="popLayout" initial={false}>
            {!isLogin && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <label htmlFor="name" className="field-label">Nom de campeur</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className="field"
                  placeholder="Ton prénom"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={isSubmitting}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label htmlFor="email" className="field-label">Courriel</label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className="field"
              placeholder="campeur@exemple.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="password" className="field-label">Mot de passe</label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="field"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="btn-primary w-full text-lg" disabled={isSubmitting}>
            {isSubmitting ? 'Un instant…' : isLogin ? 'Entrer dans le camp' : 'Planter ma tente'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-camp-bark">
          {isLogin ? 'Pas encore de carnet ?' : 'Déjà campeur ?'}{' '}
          <button
            onClick={toggleForm}
            disabled={isSubmitting}
            className="font-bold text-camp-ember-dark underline underline-offset-2 disabled:opacity-50"
          >
            {isLogin ? 'Créer un compte' : 'Se connecter'}
          </button>
        </p>
      </motion.div>

      {/* Décor de bas de page : collines + sapins */}
      <CampScene className="absolute bottom-0 left-0 w-full h-32 pointer-events-none" />

      <ToastContainer position="top-center" autoClose={3500} theme="colored" />
    </div>
  );
}
