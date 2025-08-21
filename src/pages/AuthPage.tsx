import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import background from '@/assets/camp-bg.jpg';
import { waveform } from 'ldrs';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const inputVariants = {
  focus: { scale: 1.02, transition: { duration: 0.2 } },
  blur: { scale: 1, transition: { duration: 0.2 } },
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [focusedField, setFocusedField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  // Enregistre le web component 1x
  useEffect(() => {
    waveform.register();
  }, []);

  // 🔒 Blocage: si déjà connecté → redirige
  useEffect(() => {
    if (auth?.user) {
      navigate('/dashboard', { replace: true });
    }
  }, [auth?.user, navigate]);

  const toggleForm = () => {
    if (isSubmitting) return;
    setIsLogin(!isLogin);
    setForm({ name: '', email: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return toast.error("Erreur interne : AuthContext indisponible");

    const { name, email, password } = form;
    if (!email || !password) return toast.warning("Courriel et mot de passe sont requis.");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    if (!emailRegex.test(email)) return toast.warning("Veuillez entrer une adresse courriel valide.");

    if (!isLogin && !name.trim()) return toast.warning("Le nom est requis.");
    if (password.length < 6) return toast.warning("Mot de passe trop court (min. 6 caractères).");

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await auth.login(email, password);
        toast.success("Connexion réussie !");
        navigate('/dashboard', { replace: true });
      } else {
        await auth.signup(name, email, password);
        toast.success("Compte créé avec succès !");
        navigate('/onboard', { replace: true });
      }
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('courriel') || msg.includes('mot de passe')) {
        toast.error("Courriel ou mot de passe incorrect");
      } else {
        toast.error(err?.message || "Erreur d'authentification.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-16 px-4 bg-cover bg-no-repeat bg-center relative overflow-hidden"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="absolute inset-0 bg-yellow-50/70 backdrop-blur-sm z-0" />

      <motion.div
        key={isLogin ? 'login' : 'signup'}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        className="relative z-10 w-full max-w-lg bg-white/90 rounded-3xl shadow-2xl border border-yellow-300 p-10 backdrop-blur-xl"
      >
        <h1 className="text-3xl font-extrabold text-center text-green-800 drop-shadow-sm mb-8">
          {isLogin ? '🌞 Connexion' : '🌻 Créer un compte'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  variants={inputVariants}
                  animate={focusedField === 'name' ? 'focus' : 'blur'}
                  className="transition-transform"
                >
                  <label htmlFor="name" className="block text-sm font-semibold text-green-900">Nom</label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    className="mt-1 w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-yellow-400 shadow-sm"
                    value={form.name}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField('')}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={inputVariants}
            animate={focusedField === 'email' ? 'focus' : 'blur'}
            className="transition-transform"
          >
            <label htmlFor="email" className="block text-sm font-semibold text-green-900">Courriel</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              className="mt-1 w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-yellow-400 shadow-sm"
              value={form.email}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </motion.div>

          <motion.div
            variants={inputVariants}
            animate={focusedField === 'password' ? 'focus' : 'blur'}
            className="transition-transform"
          >
            <label htmlFor="password" className="block text-sm font-semibold text-green-900">Mot de passe</label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="mt-1 w-full px-4 py-2 rounded-full border border-yellow-300 focus:ring-2 focus:ring-yellow-400 shadow-sm"
              value={form.password}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </motion.div>

          <motion.button
            type="submit"
            whileHover={!isSubmitting ? { scale: 1.03 } : {}}
            whileTap={!isSubmitting ? { scale: 0.97 } : {}}
            disabled={isSubmitting}
            className={`w-full py-2 rounded-full flex justify-center items-center ${
              isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            } text-white font-bold text-md tracking-wide shadow-md transition`}
          >
            {isSubmitting ? (
              // @ts-ignore – web component ldrs
              <l-waveform size="26" stroke="3" speed="1" color="white" />
            ) : (
              isLogin ? "Se connecter" : "Créer un compte"
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-green-800">
          {isLogin ? "Pas encore de compte ?" : 'Déjà inscrit ?'}{' '}
          <button onClick={toggleForm} disabled={isSubmitting} className="underline font-semibold disabled:opacity-50">
            {isLogin ? "Créer un compte" : 'Se connecter'}
          </button>
        </p>
      </motion.div>

      <ToastContainer position="top-center" autoClose={4000} theme="colored" />
    </div>
  );
}
